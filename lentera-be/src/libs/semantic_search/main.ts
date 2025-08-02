import { translate } from './translate';
import { getQueryEmbedding } from './get_embedding';
import { queryDatabase } from './query_data';
import { extractKeywords } from './extract_keyword';
import { semanticKiwixSearch } from './do_search';
import { cleanSearchResults, removeDuplicates } from './clean_search_results';
import { rerankDocuments } from './rerank';
import { storeSearchData } from './store_data';
import { DEFAULT_SIMILARITY_THRESHOLD } from '../../config';

/**
 * Main semantic search function that implements the complete search flow
 * @param query The original search query (can be in any language)
 * @param language The language of the query (default: 'auto')
 * @param similarityThreshold Minimum similarity threshold for database results (default: 90)
 * @returns Combined search results from database and/or Kiwix
 */
export async function mainSemanticSearch(
  query: string,
  language: string = 'auto',
  similarityThreshold: number = DEFAULT_SIMILARITY_THRESHOLD
) {
  try {
    console.log(`🔍 Starting semantic search for: "${query}"`);
    
    // Step 1: Translate query to English if needed
    let englishQuery = query;
    if (language !== 'english' && language !== 'en') {
      console.log(`🌐 Translating query from ${language}`);
      englishQuery = await translate(query, language);
      console.log(`🌐 Translated query: "${englishQuery}"`);
    }

    // Step 2: Get query embedding
    console.log(`📊 Generating embedding for query`);
    const queryEmbedding = await getQueryEmbedding(englishQuery);
    
    // Step 3: Query database with embedding
    console.log(`🔍 Querying database for similar content`);
    const dbResults = await queryDatabase(queryEmbedding, similarityThreshold);
    
    // Step 4: Run one branch - check if we found results in database
    if (dbResults.count > 0) {
      // Found branch - use database results
      console.log(`✅ Found ${dbResults.count} results in database`);
      
      return {
        stored: dbResults,
        rankedResults: JSON.parse(dbResults.data[0].search_result)
      }
    } else {
      // Default branch - need to perform search
      console.log(`⚠️ No database results, performing full search`);
      
      // Step 5a: Extract keywords
      console.log(`🔑 Extracting keywords from query`);
      const keywords = await extractKeywords(englishQuery);
      
      // Step 5b: Do search with keywords
      console.log(`🔍 Searching with keywords: ${keywords.join(', ')}`);
      const searchResults = await semanticKiwixSearch(englishQuery);
      
      if (searchResults.count === 0 || !searchResults.results.length) {
        console.log(`❌ No search results found`);
        return [];
      }
      
      // Step 5c: Remove duplicates and clean results
      console.log(`🧹 Cleaning search results`);
      const cleanedResults = await cleanSearchResults(searchResults.results);
      
      // Step 5e: Rerank results
      console.log(`📊 Reranking search results`);
      const rankedResults = await rerankDocuments(englishQuery, cleanedResults);
      
      // Step 5f: Store result to DB
      console.log(`💾 Storing search results in database`);
      const stored = await storeSearchData(englishQuery, queryEmbedding, rankedResults);
      
      return {
        stored,
        rankedResults
      }
    }
  } catch (error: any) {
    console.error(`❌ Error in semantic search: ${error.message}`);
    return []
  }
}

/**
 * Inline execution function for running the semantic search
 * This function is used when you want to execute the search directly
 * @param query The search query
 * @param language The language of the query
 * @returns Search results
 */
export async function inlineRun(query: string, language: string = 'auto') {
  return mainSemanticSearch(query, language);
}