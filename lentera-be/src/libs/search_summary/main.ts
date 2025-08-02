import { GroundedResponse, SearchResult, generateSearchSummary } from './generate_search_summary';
import { getSearchSummaryById, getContentById } from './query_data';
import { storeSearchSummary } from './store_data';
import { prepareContext } from '../mindmap/prepare_context';
import { preprocessContext } from '../mindmap/preprocess_context';

/**
 * Queries or generates a search summary based on the provided ID and language
 * This function implements the complete flow:
 * 1. Query the search summary by ID
 * 2. If found, return the search summary data
 * 3. If not found, follow the default path:
 *    a. Query content data
 *    b. Generate search summary
 *    c. Store result to DB
 * 
 * @param params Object containing language and id
 * @returns Object containing id and search summary data
 */
export async function querySearchSummary(params: {
  language: string;
  id: string;
}): Promise<{ id: string; search_summary: GroundedResponse }> {
  const { language, id } = params;

    // Try to find the search summary in the database (Found path)
    const result = await getSearchSummaryById(id);
    
    // If found, return the search summary data
    if (result.count > 0) {
      const row = result.data[0];
      return {
        id: row.id as string,
        search_summary: JSON.parse(row.search_summary as string) as GroundedResponse
      };
    }
    
    // If not found, follow the Default path
    
    const contentResult = await getContentById(id);
    if (contentResult.count === 0) {
      throw new Error(`Content with ID ${id} not found`);
    }
    
    const searchResults = JSON.parse(contentResult.data[0].search_result);
    const query = contentResult.data[0].query

    const { context, topResults } = await prepareContext(query, searchResults);

    const processedContext = await preprocessContext(context);

    const searchSummary = await generateSearchSummary(query, language, processedContext, topResults);

    await storeSearchSummary(id, searchSummary);
    
    // 6. Return the result
    return {
      id,
      search_summary: searchSummary
    };

}