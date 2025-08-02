import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import pLimit from 'p-limit';
import { extractKeywords } from './extract_keyword';
import { CONTENT_FETCH_BASE, KIWIX_CONCURRENCY_LIMIT, HTTP_TIMEOUT_MS } from '../../config';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

// Axios instance with keep-alive and timeout
const http = axios.create({
  timeout: HTTP_TIMEOUT_MS,
  httpAgent: new (require('http').Agent)({ keepAlive: true }),
  httpsAgent: new (require('https').Agent)({ keepAlive: true }),
});

// Limit concurrent Kiwix queries
const limit = pLimit(KIWIX_CONCURRENCY_LIMIT);

/**
 * Performs multiple Kiwix searches in parallel with concurrency control
 * @param queries Array of search queries to execute
 * @returns Combined array of search results from all queries
 */
export async function searchKiwix(queries: string[]) {
  const results = await Promise.all(
    queries.map((q: string) => limit(() => kiwixSearch(q)))
  );

  return results.flat();
}

/**
 * Performs a semantic search using Kiwix by extracting keywords from the query
 * and searching for each keyword
 * @param query The natural language query to search for
 * @returns Combined array of search results from all extracted keywords
 */
export async function semanticKiwixSearch(query: string) {
  try {
    // Extract keywords from the query
    const keywords = await extractKeywords(query);
    console.log(`🔍 Extracted keywords for "${query}": ${keywords.join(', ')}`);
    
    // Search Kiwix for each keyword
    const results = await searchKiwix(keywords);
    
    return {
      query,
      keywords,
      results,
      count: results.length
    };
  } catch (error: any) {
    console.error(`❌ Error in semantic Kiwix search: ${error.message}`);
    return {
      query,
      keywords: [],
      results: [],
      count: 0,
      error: error.message
    };
  }
}

/**
 * Performs a search against the Kiwix server
 * @param keyword The keyword to search for
 * @returns Array of search results with title, link, description, etc.
 */
async function kiwixSearch(keyword: string): Promise<any[]> {
  const url = `${CONTENT_FETCH_BASE}/search?pattern=${encodeURIComponent(keyword)}&format=xml&pageLength=140`;

  try {
    const { data: xml } = await http.get(url);
    const parsed = parser.parse(xml);

    const items = parsed.rss?.channel?.item || [];
    const results = Array.isArray(items) ? items : [items];

    return results.map(item => ({
      title: item.title,
      link: item.link,
      description: item.description,
      wordCount: item.wordCount,
      bookTitle: item.book?.title,
    }));
  } catch (error: any) {
    console.error(`❌ Error for "${keyword}": ${error.message}`);
    return [];
  }
}