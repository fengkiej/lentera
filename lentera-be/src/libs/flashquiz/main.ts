import { GroundedQuizSet, generateFlashquiz } from './generate_flashquiz';
import { queryFlashquizById } from './query_data';
import { storeFlashquiz } from './store_data';
import { getContentById } from './query_data';
import { prepareContext } from './prepare_context';
import { preprocessContext } from './preprocess_context';

/**
 * Queries or generates a flashquiz based on the provided ID and language
 * This function implements the complete flow:
 * 1. Query the flashquiz by ID
 * 2. If found, return the flashquiz data
 * 3. If not found, follow the default path:
 *    a. Query content data
 *    b. Generate flashquiz
 *    c. Store result to DB
 * 
 * @param params Object containing language, id, and optional questionCount
 * @returns Object containing id and flashquiz data
 */
export async function queryFlashquiz(params: {
  language: string;
  id: string;
  questionCount?: number;
}): Promise<{ id: string; flashquiz: GroundedQuizSet }> {
  const { language, id, questionCount = 5 } = params;
  
  try {
    // Try to find the flashquiz in the database (Found path)
    const result = await queryFlashquizById(id);
    
    // If found, return the flashquiz data
    if (result.count > 0) {
      const row = result.data[0];
      return {
        id: row.id as string,
        flashquiz: JSON.parse(row.flashquiz as string) as GroundedQuizSet
      };
    }
    
    // If not found, follow the Default path
      
    const contentResult = await getContentById(id);
    if (contentResult.count === 0) {
      throw new Error(`Content with ID ${id} not found`);
    }
    
    const searchResults = JSON.parse(contentResult.data[0].search_result);
    const query = contentResult.data[0].query
    

    // 2. Prepare context
    const { context, topResults } = await prepareContext(query, searchResults);

    // 3. Preprocess context
    const processedContext = await preprocessContext(context);

    // 4. Generate flashquiz
    const flashquiz = await generateFlashquiz(
      query,
      language,
      processedContext,
      topResults,
      questionCount
    );
    
    // 4. Store Result to DB
    await storeFlashquiz(id, flashquiz);
    
    // 5. Return the result
    return {
      id,
      flashquiz
    };
  } catch (error) {
    console.error("Error in queryFlashquiz:", error);
    throw new Error(`Failed to query flashquiz: ${error instanceof Error ? error.message : String(error)}`);
  }
}