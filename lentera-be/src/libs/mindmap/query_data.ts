import { createClient } from "@libsql/client";

/**
 * Queries the database for mindmap data by ID
 * @param id The ID of the mindmap to retrieve
 * @returns The mindmap data
 */
export async function queryMindmapById(id: string) {
  try {
    const client = createClient({
      url: process.env.LIBSQL_URL || "http://127.0.0.1:30000",
    });

    const result = await client.execute({
      sql: `SELECT
          ss.*
        FROM mindmap ss
        WHERE id = ?`,
      args: [id]
    });

    return {
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    console.error("Error querying mindmap data:", error);
    throw new Error(`Failed to query mindmap data: ${error instanceof Error ? error.message : String(error)}`);
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
 * Retrieves a mindmap by its ID
 * @param id The ID of the mindmap to retrieve
 * @returns The mindmap data
 */
export async function getMindmapById(id: string) {
  return queryMindmapById(id);
}

/**
 * Retrieves content by its ID
 * @param id The ID of the content to retrieve
 * @returns The content data
 */
export async function getContentById(id: string) {
  return queryContentById(id);
}