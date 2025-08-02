import { createClient } from "@libsql/client";
import { hashUrl } from "./query_article";
import { LIBSQL_URL } from "../../config";

/**
 * Stores an article summary in the database
 * @param contentUrl The URL of the article
 * @param summary The generated summary text
 * @param language The language code
 * @returns Object with operation result details
 */
export async function storeArticleSummary(contentUrl: string, summary: string, language: string) {
  const client = createClient({
    url: LIBSQL_URL,
  });

  const contentUrlHash = hashUrl(contentUrl, language);

  try {
    const upsertResult = await client.execute({
      sql: `
        INSERT INTO content_library_summary (
          content_url,
          content_url_hash,
          summary,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(content_url_hash) DO UPDATE SET
          summary = excluded.summary,
          updated_at = datetime('now')
      `,
      args: [
        contentUrl,
        contentUrlHash,
        summary
      ]
    });

    return {
      success: true,
      operation: upsertResult.changes > 0 ? (upsertResult.changes === 1 ? 'inserted' : 'updated') : 'no_change',
      rowsAffected: upsertResult.changes,
      insertId: upsertResult.lastInsertRowid,
      result: upsertResult
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      result: null
    };
  } finally {
    client.close();
  }
}