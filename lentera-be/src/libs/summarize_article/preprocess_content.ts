import { Ollama } from 'ollama';
import { cosineSimilarity } from 'fast-cosine-similarity';

const ollama = new Ollama({ host: process.env.OLLAMA_BASE_URL });
const EMBEDDING_MODEL = 'all-minilm:l12-v2';

/**
 * Processes text content to extract representative sentences
 * @param texts Array of text chunks to process
 * @returns A bullet-point summary of representative sentences
 */
export async function preprocessContent(texts: string[]) {
  const sentences = extractSentences(texts);

  if (sentences.length === 0) return "No meaningful content to summarize.";

  const { embeddings } = await ollama.embed({
    model: EMBEDDING_MODEL,
    input: sentences,
  });

  const selectedSentences = selectRepresentativeSentences(sentences, embeddings, 7);

  return selectedSentences
    .map(sentence => `• ${sentence.trim()}`)
    .join('\n');
}

/**
 * Extracts and cleans sentences from text chunks
 * @param texts Array of text chunks
 * @returns Array of cleaned sentences
 */
function extractSentences(texts: string[]): string[] {
  return texts
    .map(cleanText)
    .join(' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(isValidSentence);
}

/**
 * Cleans text by removing HTML, markdown, and other non-content elements
 * @param text Text to clean
 * @returns Cleaned text
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\*\*[^*]*\*\*/g, match => match.replace(/\*\*/g, ''))
    .replace(/\*[^*]*\*/g, match => match.replace(/\*/g, ''))
    .replace(/\d{1,2}:\d{2}:\d{2}(?:\.\d{3})?(?:\s*-->\s*\d{1,2}:\d{2}:\d{2}(?:\.\d{3})?)?/g, ' ')
    .replace(/^\d+\s*$/gm, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\d{4}[^)]*\)/g, ' ')
    .replace(/https?:\/\/[^\s]+/g, ' ')
    .replace(/www\.[^\s]+/g, ' ')
    .replace(/[^\s]+@[^\s]+\.[^\s]+/g, ' ')
    .replace(/[a-zA-Z]:\\[^\s]+/g, ' ')
    .replace(/\/[^\s]*\/[^\s]*/g, ' ')
    .replace(/^(WEBVTT|Kind:|Language:|NOTE:|STYLE:|REGION:|DOCTYPE|xmlns|charset|encoding|version)/gmi, ' ')
    .replace(/^-\s*\[[^\]]+\]\s*/gm, '')
    .replace(/(ID|Class|Style|Width|Height|Color|Font|Size):\s*[^\s;]+/gi, ' ')
    .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a sentence is valid for inclusion in summary
 * @param text Sentence to validate
 * @returns Boolean indicating if sentence is valid
 */
function isValidSentence(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 15 || trimmed.length > 500) return false;
  if (!/[a-zA-Z]{3,}/.test(trimmed)) return false;
  if (trimmed.split(/\s+/).length < 4) return false;
  if (/^[\d\s.,%-]+$/.test(trimmed)) return false;
  if (/^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/.test(trimmed)) return false;
  if (/^[A-Z0-9_-]{3,}$/.test(trimmed)) return false;

  const nonContentPatterns = [
    /^(click|read|learn|see|view|download|continue|next|previous|back|home|menu|nav|search|filter|login|register|contact|about|privacy|terms|cookie)/i,
    /^(loading|error|success|warning|info|alert|notice)/i,
    /^(page \d+|chapter \d+|section \d+|figure \d+|table \d+)/i,
    /^(copyright|all rights reserved|\(c\))/i,
    /^\w+\.(com|org|net|edu|gov)/i
  ];

  return !nonContentPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Selects representative sentences based on embedding similarity
 * @param sentences Array of sentences
 * @param embeddings Array of sentence embeddings
 * @param targetCount Number of sentences to select
 * @returns Array of selected representative sentences
 */
function selectRepresentativeSentences(sentences: string[], embeddings: number[][], targetCount: number): string[] {
  if (sentences.length <= targetCount) {
    return sentences;
  }

  const centroid = calculateCentroid(embeddings);

  const scoredSentences = sentences.map((sentence, i) => ({
    sentence,
    embedding: embeddings[i],
    score: cosineSimilarity(embeddings[i], centroid),
    index: i
  }));

  scoredSentences.sort((a, b) => b.score - a.score);

  const selected: typeof scoredSentences = [];
  const candidates = [...scoredSentences];
  selected.push(candidates.shift()!);

  while (selected.length < targetCount && candidates.length > 0) {
    let bestCandidate = candidates[0];
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const minSimilarity = Math.min(
        ...selected.map(s => cosineSimilarity(candidate.embedding, s.embedding))
      );

      const combinedScore = candidate.score * 0.7 + (1 - minSimilarity) * 0.3;

      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestCandidate = candidate;
      }
    }

    selected.push(bestCandidate);
    candidates.splice(candidates.indexOf(bestCandidate), 1);
  }

  selected.sort((a, b) => a.index - b.index);
  return selected.map(s => s.sentence);
}

/**
 * Calculates the centroid of a set of embeddings
 * @param embeddings Array of embeddings
 * @returns Centroid embedding
 */
function calculateCentroid(embeddings: number[][]): number[] {
  const dimensions = embeddings[0].length;
  const centroid = new Array(dimensions).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      centroid[i] += embedding[i];
    }
  }

  for (let i = 0; i < dimensions; i++) {
    centroid[i] /= embeddings.length;
  }

  return centroid;
}

/**
 * Alternative implementation using centroid-based importance scoring
 * @param texts Array of text chunks to process
 * @returns A bullet-point summary of important sentences
 */
export async function preprocessContentWithCentroidScoring(texts: string[]) {
  const sentences = extractSentences(texts);

  if (sentences.length === 0) return "No meaningful content to summarize.";

  const { embeddings } = await ollama.embed({
    model: EMBEDDING_MODEL,
    input: sentences,
  });

  const centroid = calculateCentroid(embeddings);

  const importanceScores = embeddings.map((embedding, i) => ({
    sentence: sentences[i],
    score: cosineSimilarity(embedding, centroid),
    index: i,
  }));

  const topSentences = importanceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .sort((a, b) => a.index - b.index);

  return topSentences
    .map(item => `• ${item.sentence.trim()}`)
    .join('\n');
}