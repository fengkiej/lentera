import { createDbClient } from "./db-utils";

/**
 * Initializes the database by creating all required tables and indexes
 */
export async function initializeDatabase() {
  console.log("🔧 Initializing database tables and indexes...");
  const client = createDbClient();

  try {
    // Create content_library_summary table
    // Initialize content_library_summary table
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
    console.log("✅ Successfully created content_library_summary table and indexes");

    // Initialize search_summaries table
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
      "write"
    );
    console.log("✅ Successfully created search_summaries table and indexes");

    // Initialize flashquiz table
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS flashquiz (
          id TEXT PRIMARY KEY,
          flashquiz TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS idx_content_created_at ON flashquiz(created_at)`,
      ],
      "write"
    );
    console.log("✅ Successfully created flashquiz table and indexes");

    // Initialize mindmap table
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS mindmap (
          id TEXT PRIMARY KEY,
          mindmap TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS idx_content_created_at ON mindmap(created_at)`,
      ],
      "write"
    );
    console.log("✅ Successfully created mindmap table and indexes");

    // Initialize content table for semantic search
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS content (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT NOT NULL,
          query_embedding VECTOR32 UNIQUE,
          search_result TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS idx_content_embedding ON content(query_embedding)`,
        `CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at)`,
      ],
      "write"
    );
    console.log("✅ Successfully created content table and indexes");

    // Add more table initializations here as needed

    console.log("✅ Database initialization completed successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

/**
 * Main function to run the database initialization
 */
async function main() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  main();
}