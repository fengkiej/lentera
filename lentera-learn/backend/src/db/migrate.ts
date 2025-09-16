import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, sqlite } from "./connection.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log("🚀 Starting database migrations...");

    const migrationsFolder = path.join(__dirname, "migrations");

    await migrate(db, {
      migrationsFolder,
    });

    console.log("✅ Database migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
