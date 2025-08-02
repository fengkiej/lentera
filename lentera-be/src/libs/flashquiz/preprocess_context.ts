import { Ollama } from 'ollama';
import { cosineSimilarity } from 'fast-cosine-similarity';

const ollama = new Ollama({ host: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434' });
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'all-minilm:l12-v2';

/**
 * Processes and summarizes a collection of texts by extracting representative sentences
 * @param texts Array of text content to process
 * @param maxSentences Maximum number of sentences to include in the summary (default: 7)
 * @returns A bullet-point summary of representative sentences or error message
 */
export async function preprocessContext(texts: string[], maxSentences: number = 7): Promise<string> {
  const sentences = extractSentences(texts);

  if (sentences.length === 0) return "No meaningful content to summarize.";

  const { embeddings } = await ollama.embed({
    model: EMBEDDING_MODEL,
    input: sentences,
  });

  const selectedSentences = selectRepresentativeSentences(sentences, embeddings, maxSentences);

  return selectedSentences
    .map(sentence => `• ${sentence.trim()}`)
    .join('\n');
}

/**
 * Extracts valid sentences from an array of texts
 * @param texts Array of text content
 * @returns Array of valid sentences
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
 * Cleans text by removing unwanted content and formatting
 * @param text Text to clean
 * @returns Cleaned text
 */
function cleanText(text: string): string {
  return text
    .split('\n')
    .filter(line =>
      !/cheatography|download|fatbuttluver|comment|post your comment|related cheat sheets/i.test(line)
    )
    .join(' ')
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
 * Determines if a sentence is valid for inclusion in the summary
 * @param text Sentence to validate
 * @returns Boolean indicating if the sentence is valid
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
    /^passage:/i,
    /cheatography|download|comment|post your comment|related cheat sheets/i,
    /\b(Springer-Verlag|Nature|Elsevier|Wiley|Cambridge University Press)\b/,
    /by [a-z0-9_-]{3,}/i,
    /\b(fatbuttluver|hlewsey7|user\d+)\b/i,
    /\b(cheat sheet|unit \d+|chapter \d+|ap biology)\b/i,
    /^page \d+/i,
    /^\s*(click|read|view|login|register|terms|about|privacy)\b/i,
  ];

  return !nonContentPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Selects representative sentences from a collection based on embedding similarity
 * @param sentences Array of sentences
 * @param embeddings Array of sentence embeddings
 * @param targetCount Target number of sentences to select
 * @returns Array of selected representative sentences
 */
function selectRepresentativeSentences(sentences: string[], embeddings: number[][], targetCount: number): string[] {
  if (sentences.length <= targetCount) return sentences;

  const centroid = calculateCentroid(embeddings);

  const scoredSentences = sentences.map((sentence, i) => ({
    sentence,
    embedding: embeddings[i],
    score: cosineSimilarity(embeddings[i], centroid),
    index: i,
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