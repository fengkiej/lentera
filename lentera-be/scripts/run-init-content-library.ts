#!/usr/bin/env node

import { main } from "./init-content-library";

/**
 * Main function to run the content library initialization
 */
async function runInitialization() {
  try {
    console.log("🚀 Starting content library database initialization...");
    await main();
    console.log("✨ Content library database initialization completed successfully");
  } catch (error) {
    console.error("❌ Failed to initialize content library database:", error);
    process.exit(1);
  }
}

// Execute the initialization
runInitialization();