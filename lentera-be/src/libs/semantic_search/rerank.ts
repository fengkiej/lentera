import { Ollama } from 'ollama';
import { cosineSimilarity } from 'fast-cosine-similarity';

  const ollama = new Ollama({ host: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434' });

const MODEL_NAME = 'all-minilm:l12-v2';

export async function rerankDocuments(query: string, documents: any[]) {
  const docTexts = documents.map(doc =>
    `passage: ${doc.title ?? ''} - ${doc.description["#text"] ?? ''}`
  );

  // Prefix for the query embedding
  const prefixedQuery = `query: ${query}`;

  // Prepare batch input (query + documents)
  const allTexts = [prefixedQuery, ...docTexts];

  // Batch embedding
  const { embeddings } = await ollama.embed({
    model: MODEL_NAME,
    input: allTexts,
  });

  // Extract query and document embeddings
  const queryEmbedding = embeddings[0];
  const docEmbeddings = embeddings.slice(1);

  // Score and sort
  const scoredDocs = documents.map((doc, i) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, docEmbeddings[i]),
  }));

  return scoredDocs.sort((a, b) => b.score - a.score);
}