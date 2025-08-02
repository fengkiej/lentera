#!/usr/bin/env node

import { main } from "./init-flashquiz";

/**
 * Main function to run the flashquiz initialization
 */
async function runInitialization() {
  try {
    console.log("🚀 Starting flashquiz database initialization...");
    await main();
    console.log("✨ Flashquiz database initialization completed successfully");
  } catch (error) {
    console.error("❌ Failed to initialize flashquiz database:", error);
    process.exit(1);
  }
}

// Execute the initialization
runInitialization();