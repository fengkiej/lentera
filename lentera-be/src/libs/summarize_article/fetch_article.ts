/**
 * Functions for fetching and processing article text from URLs
 */

import { CONTENT_FETCH_BASE, DEFAULT_CHUNK_SIZE, MAX_WORDS } from '../../config';

const BASE_URL = CONTENT_FETCH_BASE;

/**
 * Splits text into chunks of specified size (by word count)
 * @param text The text to split
 * @param chunkSize Number of words per chunk
 * @returns Array of text chunks
 */
export function splitText(text: string, chunkSize = DEFAULT_CHUNK_SIZE): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

/**
 * Truncates text to a maximum number of words
 * @param text The text to truncate
 * @param maxWords Maximum number of words to keep
 * @returns Truncated text
 */
export function truncateText(text: string, maxWords = MAX_WORDS): string {
  return text.split(/\s+/).slice(0, maxWords).join(' ');
}

/**
 * Cleans HTML text by removing tags, scripts, styles, and decoding entities
 * @param raw Raw HTML text
 * @returns Cleaned text
 */
export function cleanText(raw: string): string {
  raw = raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  raw = raw.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
  const noTags = raw.replace(/<\/?[^>]+(>|$)/g, '');

  const htmlEntities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  const decoded = noTags.replace(/&[^;]+;/g, (entity) => htmlEntities[entity] || '');
  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Fetches content from a URL and cleans the HTML
 * @param url The URL path to fetch (will be appended to BASE_URL)
 * @returns Cleaned and truncated text
 */
export async function fetchCleanText(url: string): Promise<string> {
  const response = await fetch(BASE_URL + url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to fetch content: ${response.statusText}`);
  const rawHtml = await response.text();
  const cleaned = cleanText(rawHtml);
  return truncateText(cleaned);
}

/**
 * Main function to fetch and process article text
 * @param url The URL path to fetch (will be appended to BASE_URL)
 * @param chunkSize Number of words per chunk
 * @returns Array of text chunks
 */
export async function fetchArticleChunks(url: string, chunkSize = DEFAULT_CHUNK_SIZE): Promise<string[]> {
  const cleanedText = await fetchCleanText(url);
  return splitText(cleanedText, chunkSize);
}