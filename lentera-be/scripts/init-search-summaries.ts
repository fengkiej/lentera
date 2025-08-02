import { createClient } from "@libsql/client";
import { LIBSQL_URL } from "../src/config";

export async function main() {
  const client = createClient({
    url: LIBSQL_URL,
  });

  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS search_summaries (
        id TEXT PRIMARY KEY,
        search_summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_content_created_at ON search_summaries(created_at)`,
    ],
    "write",
  );
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error initializing search summaries:", error);
    process.exit(1);
  });
}