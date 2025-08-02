import OpenAI from 'openai';
import { Ollama } from 'ollama';
import { OLLAMA_BASE_URL, EMBEDDING_MODEL } from '../../config';

/**
 * Gets embedding for a specific query using the all-minilm model
 * @param query The query text to generate embedding for
 * @returns An array of embedding values
 */
export async function getQueryEmbedding(query: string): Promise<number[]> {
  const ollama = new Ollama({ host: OLLAMA_BASE_URL });
  const MODEL_NAME = EMBEDDING_MODEL;

  const prefixedQuery = `query: ${query}`;

  // Prepare batch input (query + documents)
  const allTexts = [prefixedQuery];

  // Batch embedding
  const { embeddings } = await ollama.embed({
    model: MODEL_NAME,
    input: allTexts,
  });

  // Extract query and document embeddings
  const queryEmbedding = embeddings[0];

  return queryEmbedding
}