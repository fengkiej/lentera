import { createClient } from "@libsql/client";
import { LIBSQL_URL } from "../../config";

/**
 * Stores search query data in the database
 * @param query The original search query text
 * @param queryEmbedding The embedding vector for the query
 * @param result The search results to store
 * @returns Object with operation details and status
 */
export async function storeSearchData(query: string, queryEmbedding: number[], result: any) {
  const client = createClient({
    url: LIBSQL_URL,
  });

  // Convert array to JSON string for vector32 function
  const embeddingJson = JSON.stringify(queryEmbedding);

  try {
    // Upsert operation with RETURNING clause
    const upsertResult = await client.execute({
      sql: `INSERT INTO content (query, query_embedding, search_result, created_at, updated_at)
            VALUES (?, vector32(?), ?, datetime('now'), datetime('now'))
            ON CONFLICT(query_embedding) DO UPDATE SET
              search_result = excluded.search_result,
              updated_at = datetime('now')
            RETURNING id, 
              CASE WHEN created_at = updated_at THEN 'inserted' ELSE 'updated' END as operation`,
      args: [
        query,
        embeddingJson,
        JSON.stringify(result) || null
      ]
    });

    const row = upsertResult.rows[0];

    return {
      success: true,
      operation: row.operation,
      id: row.id,
      rowsAffected: upsertResult.changes,
      result: upsertResult
    };

  } catch (error: any) {
    console.error("Error storing search data:", error);
    return {
      success: false,
      error: error.message,
      result: null
    };
  } finally {
    client.close();
  }
}