#!/usr/bin/env node

import { main } from "./init-search-summaries";

/**
 * Main function to run the search summaries initialization
 */
async function runInitialization() {
  try {
    console.log("🚀 Starting search summaries database initialization...");
    await main();
    console.log("✨ Search summaries database initialization completed successfully");
  } catch (error) {
    console.error("❌ Failed to initialize search summaries database:", error);
    process.exit(1);
  }
}

// Execute the initialization
runInitialization();