import { Ollama } from 'ollama';
import { cosineSimilarity } from 'fast-cosine-similarity';

const ollama = new Ollama({ host: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434' });
const MODEL_NAME = process.env.EMBEDDING_MODEL || 'all-minilm:l12-v2';
const CONTENT_FETCH_BASE = process.env.CONTENT_FETCH_BASE || 'http://127.0.0.1:8090';

export interface SearchResult {
  link: string;
  score: number;
  title: string;
  bookTitle: string;
  wordCount: number;
  description: {
    b: string[];
    "#text": string;
  };
}

/**
 * Splits text into chunks of specified size with overlap
 * @param text Text to split
 * @param chunkSize Maximum number of words per chunk
 * @param overlap Number of words to overlap between chunks
 * @returns Array of text chunks
 */
function splitText(text: string, chunkSize = 300, overlap = 30): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

/**
 * Truncates text to a maximum number of words
 * @param text Text to truncate
 * @param maxWords Maximum number of words to keep
 * @returns Truncated text
 */
function truncateText(text: string, maxWords = 1000): string {
  return text.split(/\s+/).slice(0, maxWords).join(' ');
}

/**
 * Cleans HTML content by removing tags and decoding entities
 * @param raw Raw HTML content
 * @returns Cleaned text
 */
function cleanText(raw: string): string {
  raw = raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  raw = raw.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
  const noTags = raw.replace(/<\/?[^>]+(>|$)/g, '');
  const htmlEntities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  const decoded = noTags.replace(/&[^;]+;/g, (entity) => htmlEntities[entity] || '');
  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Fetches content from a URL or falls back to description
 * @param result Search result containing link and description
 * @returns Cleaned and truncated content or null if failed
 */
async function fetchContent(result: SearchResult): Promise<string | null> {
  const originalUrl = `${CONTENT_FETCH_BASE}${result.link}`;

  try {
    const response = await fetch(originalUrl);
    const rawContent = await response.text();

    // Skip entries with <meta http-equiv="refresh">
    if (/<meta[^>]+http-equiv=["']?refresh["']?[^>]*>/i.test(rawContent)) {
      console.warn(`Skipping meta redirect: ${result.link}`);
      return null;
    }

    return truncateText(cleanText(rawContent));
  } catch (error) {
    console.warn(`Failed to fetch ${result.link}, using fallback.`);
    const fallback = truncateText(cleanText(result.description["#text"]));
    return fallback || null;
  }
}

/**
 * Prepares context for a query by finding relevant passages from search results
 * @param query User query
 * @param searchResults Array of search results
 * @returns Object containing context passages and top results
 */
export async function prepareContext(query: string, searchResults: SearchResult[]): Promise<{
  context: string[];
  topResults: SearchResult[];
}> {
  const topResults = searchResults.slice(0, 25);

  // Fetch all content
  const contents = await Promise.all(topResults.map(fetchContent));

  // Create chunks with document references
  const allChunks: { chunk: string; doc: SearchResult }[] = [];
  topResults.forEach((doc, i) => {
    const content = contents[i];
    if (!content) return;

    const chunks = splitText(content);
    chunks.forEach(chunk => allChunks.push({ chunk, doc }));
  });

  // Prepare all texts for batch embedding (query + all chunks)
  const prefixedQuery = `query: ${query}`;
  const prefixedChunks = allChunks.map(({ chunk }) => `passage: ${chunk}`);
  const allTexts = [prefixedQuery, ...prefixedChunks];

  // Batch embedding using Ollama
  const { embeddings } = await ollama.embed({
    model: MODEL_NAME,
    input: allTexts,
  });

  // Extract query embedding and chunk embeddings
  const queryEmbedding = embeddings[0];
  const chunkEmbeddings = embeddings.slice(1);

  // Score chunks against query
  const scoredChunks = allChunks.map(({ chunk, doc }, idx) => ({
    text: chunk,
    doc,
    score: cosineSimilarity(queryEmbedding, chunkEmbeddings[idx]),
  }));

  // Filter and sort chunks
  const topChunks = scoredChunks
    .filter(({ text }) => {
      const words = text.split(/\s+/);
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      return words.length > 20 && uniqueWords.size > 10;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  const context = topChunks.map(({ text }) => `passage: ${text}`);
  const topDocs = Array.from(new Set(topChunks.map(({ doc }) => doc)));

  return {
    context,
    topResults: topDocs,
  };
}