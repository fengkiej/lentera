import OpenAI from 'openai';
import { getQueryEmbedding } from './get_embedding';
import { queryDatabase, semanticDatabaseSearch } from './query_data';
import { extractKeywords } from './extract_keyword';
import { searchKiwix, semanticKiwixSearch } from './do_search';
import { removeDuplicates, filterEmptyDescriptions, cleanSearchResults } from './clean_search_results';
import { rerankDocuments } from './rerank';
import { storeSearchData } from './store_data';

/**
 * Generates embeddings for a given text
 * @param text The text to generate embeddings for
 * @returns An array of embedding values
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  const openai = new OpenAI({
    baseURL: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/v1',
    apiKey: 'ollama', // required but unused
  });

  const response = await openai.embeddings.create({
    model: 'hf.co/openchat/openchat-3.5-0106',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Performs semantic search against the database using text query
 * @param query The search query text
 * @param similarityThreshold Minimum similarity percentage (0-100) to include in results (default: 90)
 * @param limit Maximum number of results to return (default: 5)
 * @returns Array of content items with similarity scores
 */
export async function searchDatabase(
  query: string,
  similarityThreshold: number = 90,
  limit: number = 5
) {
  // Generate query embedding
  const queryEmbedding = await getQueryEmbedding(query);
  
  // Query the database with the embedding
  return queryDatabase(queryEmbedding, similarityThreshold, limit);
}

/**
 * Calculates cosine similarity between two embedding vectors
 * @param embeddingA First embedding vector
 * @param embeddingB Second embedding vector
 * @returns Similarity score between 0 and 1
 */
export function calculateSimilarity(embeddingA: number[], embeddingB: number[]): number {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embedding vectors must be of the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    normA += Math.pow(embeddingA[i], 2);
    normB += Math.pow(embeddingB[i], 2);
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  return dotProduct / (normA * normB);
}

/**
 * Performs a semantic search against a collection of documents
 * @param query The search query
 * @param documents Array of documents to search against
 * @param topK Number of top results to return
 * @returns Array of {document, score} sorted by similarity score
 */
export async function semanticSearch(
  query: string, 
  documents: string[], 
  topK: number = 5
): Promise<Array<{document: string, score: number}>> {
  // Generate query embedding
  const queryEmbedding = await generateEmbeddings(query);
  
  // Calculate similarity scores for each document
  const results = await Promise.all(
    documents.map(async (document) => {
      const docEmbedding = await generateEmbeddings(document);
      const score = calculateSimilarity(queryEmbedding, docEmbedding);
      return { document, score };
    })
  );
  
  // Sort by score (descending) and return top K results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Export additional functions
export {
  extractKeywords,
  searchKiwix,
  semanticKiwixSearch,
  removeDuplicates,
  filterEmptyDescriptions,
  cleanSearchResults,
  rerankDocuments,
  storeSearchData
};

// Export main semantic search flow functions
export { mainSemanticSearch, inlineRun } from './main';