import { createClient } from "@libsql/client";

/**
 * Queries the database for search summary data by ID
 * @param id The ID of the search summary to retrieve
 * @returns The search summary data
 */
export async function querySearchSummaryById(id: string) {
  try {
    const client = createClient({
      url: process.env.LIBSQL_URL || "http://127.0.0.1:30000",
    });

    const result = await client.execute({
      sql: `SELECT
          ss.*
        FROM search_summaries ss
        WHERE id = ?`,
      args: [id]
    });

    return {
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    console.error("Error querying search summary data:", error);
    throw new Error(`Failed to query search summary data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Queries the database for content data by ID
 * @param id The ID of the content to retrieve
 * @returns The content data
 */
export async function queryContentById(id: string) {
  try {
    const client = createClient({
      url: process.env.LIBSQL_URL || "http://127.0.0.1:30000",
    });

    const result = await client.execute({
      sql: `SELECT
          c.*
        FROM content c
        WHERE id = ?`,
      args: [id]
    });

    return {
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    console.error("Error querying content data:", error);
    throw new Error(`Failed to query content data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves a search summary by its ID
 * @param id The ID of the search summary to retrieve
 * @returns The search summary data
 */
export async function getSearchSummaryById(id: string) {
  return querySearchSummaryById(id);
}

/**
 * Retrieves content by its ID
 * @param id The ID of the content to retrieve
 * @returns The content data
 */
export async function getContentById(id: string) {
  return queryContentById(id);
}