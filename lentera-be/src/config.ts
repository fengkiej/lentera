/**
 * Centralized configuration module for the application
 * Loads environment variables and provides default values
 */

// API Endpoints and URLs
export const CONTENT_FETCH_BASE = process.env.CONTENT_FETCH_BASE || 'http://127.0.0.1:8090';
export const LIBSQL_URL = process.env.LIBSQL_URL || 'http://127.0.0.1:30000';
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434/v1';

// AI Model Names
export const DEFAULT_LLM_MODEL = process.env.DEFAULT_LLM_MODEL || 'hf.co/second-state/gemma-3n-E2B-it-GGUF:Q5_K_S';
export const MINDMAP_MODEL = process.env.MINDMAP_MODEL || 'hf.co/second-state/gemma-3n-E2B-it-GGUF:Q5_K_S';
export const FLASHQUIZ_MODEL = process.env.FLASHQUIZ_MODEL || 'hf.co/second-state/gemma-3n-E2B-it-GGUF:Q5_K_S';
export const SUMMARY_MODEL = process.env.SUMMARY_MODEL || 'hf.co/second-state/gemma-3n-E2B-it-GGUF:Q5_K_S';
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'all-minilm:l12-v2';

// Configuration Parameters
export const DEFAULT_CHUNK_SIZE = parseInt(process.env.DEFAULT_CHUNK_SIZE || '300', 10);
export const MAX_WORDS = parseInt(process.env.MAX_WORDS || '1000', 10);
export const DEFAULT_SIMILARITY_THRESHOLD = parseInt(process.env.DEFAULT_SIMILARITY_THRESHOLD || '90', 10);
export const DEFAULT_QUESTION_COUNT = parseInt(process.env.DEFAULT_QUESTION_COUNT || '5', 10);

// LLM Parameters
export const MINDMAP_TEMPERATURE = parseFloat(process.env.MINDMAP_TEMPERATURE || '0.5');
export const FLASHQUIZ_TEMPERATURE = parseFloat(process.env.FLASHQUIZ_TEMPERATURE || '0.2');
export const SUMMARY_TEMPERATURE = parseFloat(process.env.SUMMARY_TEMPERATURE || '0.2');
export const MINDMAP_MAX_TOKENS = parseInt(process.env.MINDMAP_MAX_TOKENS || '1024', 10);
export const FLASHQUIZ_MAX_TOKENS = parseInt(process.env.FLASHQUIZ_MAX_TOKENS || '1024', 10);
export const SUMMARY_MAX_TOKENS = parseInt(process.env.SUMMARY_MAX_TOKENS || '512', 10);
export const TRANSLATE_MAX_TOKENS = parseInt(process.env.TRANSLATE_MAX_TOKENS || '128', 10);
export const PARAPHRASE_MAX_TOKENS = parseInt(process.env.PARAPHRASE_MAX_TOKENS || '256', 10);

// HTTP and API Configuration
export const KIWIX_CONCURRENCY_LIMIT = parseInt(process.env.KIWIX_CONCURRENCY_LIMIT || '4', 10);
export const HTTP_TIMEOUT_MS = parseInt(process.env.HTTP_TIMEOUT_MS || '5000', 10);
export const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || 'ollama';