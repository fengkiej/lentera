import { createClient } from "@libsql/client";
import * as crypto from "crypto";
import { LIBSQL_URL } from "../../config";

/**
 * Generates a hash for a URL and language combination
 * @param url The article URL to hash
 * @param language The language code
 * @returns A SHA-256 hash string
 */
export function hashUrl(url: string, language: string): string {
  return crypto.createHash("sha256").update(language + ":" + url).digest("hex");
}

/**
 * Queries the database for an article summary by URL and language
 * @param url The article URL to query
 * @param language The language code
 * @returns The query result containing the summary if found
 */
export async function queryArticleSummary(url: string, language: string) {
  const client = createClient({
    url: LIBSQL_URL,
  });

  const urlHash = hashUrl(url, language);

  const result = await client.execute({
    sql: `
      SELECT summary
      FROM content_library_summary
      WHERE content_url_hash = ?
      LIMIT 1
    `,
    args: [urlHash],
  });

  return result;
}