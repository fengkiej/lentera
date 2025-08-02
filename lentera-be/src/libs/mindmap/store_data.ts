import { createClient } from "@libsql/client";
import { LIBSQL_URL } from "../../config";

/**
 * Stores a mindmap in the database, creating a new record or updating an existing one
 * @param id The ID of the mindmap to store
 * @param mindmap The mindmap data to store
 * @returns Object containing operation result information
 */
export async function storeMindmap(id: string, mindmap: any) {
  const client = createClient({
    url: LIBSQL_URL,
  });

  try {
    // Upsert operation with RETURNING clause
    const upsertResult = await client.execute({
      sql: `INSERT INTO mindmap (id, mindmap, created_at, updated_at)
            VALUES (?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
              mindmap = excluded.mindmap,
              updated_at = datetime('now')
            RETURNING id, 
              CASE WHEN created_at = updated_at THEN 'inserted' ELSE 'updated' END as operation`,
      args: [
        id,
        JSON.stringify(mindmap) || null
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