import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.js";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const dbPath = "../database/lentera.db";
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// Run migrations to create tables
const runMigrations = async () => {
  console.log("📋 Running database migrations...");
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });
    console.log("✅ Database migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Initialize database and seed data
async function initializeDatabase() {
  try {
    console.log("🚀 Initializing database...");

    // Run migrations to create tables
    await runMigrations();

    // Import and run seed function
    const { seedLenteraData } = await import("./seed-lentera.js");

    // Seed Lentera data
    console.log("📖 Seeding Lentera data...");
    await seedLenteraData();

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };
