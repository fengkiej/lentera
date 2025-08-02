import { createClient } from "@libsql/client";

/**
 * Queries the database for similar content based on embedding vector similarity
 * @param queryEmbedding The embedding vector for the query
 * @param similarityThreshold Minimum similarity percentage (0-100) to include in results (default: 90)
 * @param limit Maximum number of results to return (default: 5)
 * @returns Array of content items with similarity scores
 */
export async function queryDatabase(
  queryEmbedding: number[],
  similarityThreshold: number = 90,
  limit: number = 5
) {
  try {
    const client = createClient({
      url: process.env.LIBSQL_URL || "http://127.0.0.1:30000",
    });

    // Convert array to JSON string for vector32 function
    const embeddingJson = JSON.stringify(queryEmbedding);

    const result = await client.execute({
      sql: `SELECT 
          c.*,
          vector_distance_cos(c.query_embedding, vector32(?)) as distance,
          (1 - vector_distance_cos(c.query_embedding, vector32(?))) * 100 as similarity_percentage
        FROM content c
        WHERE (1 - vector_distance_cos(c.query_embedding, vector32(?))) * 100 >= ?
        ORDER BY distance ASC
        LIMIT ?`,
      args: [embeddingJson, embeddingJson, embeddingJson, similarityThreshold, limit]
    });

    // Transform the result rows to a more usable format
    return {
      data: result.rows.map((row: any) => ({
        ...row,
        similarity_percentage: Number(row.similarity_percentage).toFixed(2)
      })),
      count: result.rows.length
    };
  } catch (error) {
    console.error("Error querying database:", error);
    throw new Error(`Failed to query database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Performs a semantic search using the database
 * @param query The text query to search for
 * @param similarityThreshold Minimum similarity percentage (0-100) to include in results
 * @param limit Maximum number of results to return
 * @returns Array of content items with similarity scores
 */
export async function semanticDatabaseSearch(
  queryEmbedding: number[],
  similarityThreshold: number = 90,
  limit: number = 5
) {
  return queryDatabase(queryEmbedding, similarityThreshold, limit);
}