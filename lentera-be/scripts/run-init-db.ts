#!/usr/bin/env node

import { initializeDatabase } from "./init-db";

/**
 * Main function to run the database initialization
 */
async function main() {
  try {
    console.log("🚀 Starting database initialization...");
    await initializeDatabase();
    console.log("✨ Database initialization completed successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

// Execute the main function
main();