import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.join(__dirname, "../../database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(dbDir, "lentera.db");

// Create SQLite database connection
const sqlite = new Database(dbPath);

// Enable basic SQLite settings
try {
  sqlite.pragma("foreign_keys = ON");
} catch (error) {
  console.warn("Could not set foreign_keys pragma:", error);
}

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export raw sqlite instance for advanced operations
export { sqlite };

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Closing database connection...");
  sqlite.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Closing database connection...");
  sqlite.close();
  process.exit(0);
});
