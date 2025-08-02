import { createClient } from "@libsql/client";
import * as crypto from "crypto";
import { LIBSQL_URL } from "../src/config";

export function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export async function main() {
  const client = createClient({
    url: LIBSQL_URL,
  });

  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS content_library_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_url TEXT NOT NULL,
        content_url_hash TEXT NOT NULL UNIQUE,
        summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_content_url_hash ON content_library_summary(content_url_hash)`,
      `CREATE INDEX IF NOT EXISTS idx_content_created_at ON content_library_summary(created_at)`
    ],
    "write"
  );
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error initializing content library:", error);
    process.exit(1);
  });
}