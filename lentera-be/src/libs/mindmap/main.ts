import { MindMap, generateMindMap } from './generate_mindmap';
import { queryMindmapById } from './query_data';
import { storeMindmap } from './store_data';
import { getContentById } from './query_data';
import { prepareContext } from './prepare_context';
import { preprocessContext } from './preprocess_context';

/**
 * Queries or generates a mindmap based on the provided ID and language
 * This function implements the complete flow shown in the diagram:
 * 1. Query the mindmap by ID
 * 2. If found, return the mindmap data
 * 3. If not found, follow the default path:
 *    a. Query content data
 *    b. Generate mindmap
 *    c. Store result to DB
 * 
 * @param params Object containing language and id
 * @returns Object containing id and mindmap data
 */
export async function queryMindmap(params: {
  language: string;
  id: string;
}): Promise<{ id: string; mindmap: MindMap }> {
  const { language, id } = params;

  // Try to find the mindmap in the database (Found path)
  const result = await queryMindmapById(id);
  
  // If found, return the mindmap data
  if (result.count > 0) {
    const row = result.data[0];
    return {
      id: row.id as string,
      mindmap: JSON.parse(row.mindmap as string) as MindMap
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

  const mindmap = await generateMindMap(query, language, processedContext, topResults);

  await storeMindmap(id, mindmap);
  
  // 6. Return the result
  return {
    id,
    mindmap
  };
}