import { createClient } from "@libsql/client";

/**
 * Queries the database for flashquiz data by ID
 * @param id The ID of the flashquiz to retrieve
 * @returns The flashquiz data
 */
export async function queryFlashquizById(id: string) {
  try {
    const client = createClient({
      url: process.env.LIBSQL_URL || "http://127.0.0.1:30000",
    });

    const result = await client.execute({
      sql: `SELECT
          ss.*
        FROM flashquiz ss
        WHERE id = ?`,
      args: [id]
    });

    return {
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    console.error("Error querying flashquiz data:", error);
    throw new Error(`Failed to query flashquiz data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Legacy function for backward compatibility
 * @param id The ID of the flashquiz to retrieve
 * @returns The flashquiz data
 */
export async function main(id: string) {
  return queryFlashquizById(id);
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
 * Retrieves a flashquiz by its ID
 * @param id The ID of the flashquiz to retrieve
 * @returns The flashquiz data
 */
export async function getFlashquizById(id: string) {
  return queryFlashquizById(id);
}

/**
 * Retrieves content by its ID
 * @param id The ID of the content to retrieve
 * @returns The content data
 */
export async function getContentById(id: string) {
  return queryContentById(id);
}