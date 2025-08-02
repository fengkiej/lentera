import { createClient } from "@libsql/client";
import * as crypto from "crypto";
import { LIBSQL_URL } from "../src/config";

/**
 * Creates a hash of a URL for database indexing
 * @param url The URL to hash
 * @returns A SHA-256 hash of the URL as a hex string
 */
export function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex");
}

/**
 * Creates a database client with the configured connection
 * @returns A libSQL client instance
 */
export function createDbClient() {
  return createClient({
    url: LIBSQL_URL,
  });
}