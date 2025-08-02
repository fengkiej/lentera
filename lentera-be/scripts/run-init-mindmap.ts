#!/usr/bin/env node

import { main } from "./init-mindmap";

/**
 * Main function to run the mindmap initialization
 */
async function runInitialization() {
  try {
    console.log("🚀 Starting mindmap database initialization...");
    await main();
    console.log("✨ Mindmap database initialization completed successfully");
  } catch (error) {
    console.error("❌ Failed to initialize mindmap database:", error);
    process.exit(1);
  }
}

// Execute the initialization
runInitialization();