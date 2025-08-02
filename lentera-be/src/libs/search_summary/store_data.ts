import { createClient } from "@libsql/client";
import { LIBSQL_URL } from "../../config";

/**
 * Stores a search summary in the database, creating a new record or updating an existing one
 * @param id The ID of the search summary to store
 * @param summary The search summary data to store
 * @returns Object containing operation result information
 */
export async function storeSearchSummary(id: string, summary: any) {
  const client = createClient({
    url: LIBSQL_URL,
  });

  try {
    // Upsert operation with RETURNING clause
    const upsertResult = await client.execute({
      sql: `INSERT INTO search_summaries (id, search_summary, created_at, updated_at)
            VALUES (?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
              search_summary = excluded.search_summary,
              updated_at = datetime('now')
            RETURNING id, 
              CASE WHEN created_at = updated_at THEN 'inserted' ELSE 'updated' END as operation`,
      args: [
        id,
        JSON.stringify(summary) || null
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

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      result: null
    };
  } finally {
    client.close();
  }
}