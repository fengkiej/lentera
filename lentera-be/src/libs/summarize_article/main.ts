import { queryArticleSummary } from './query_article';
import { fetchArticleChunks } from './fetch_article';
import { preprocessContent } from './preprocess_content';
import { paraphraseAndTranslate } from './paraphrase_and_translate';
import { storeArticleSummary } from './store_data';

/**
 * Input interface for the summarize article function
 */
interface SummarizeArticleInput {
  targetLanguage: string;
  articleUrl: string;
}

/**
 * Output interface for the summarize article function
 */
interface SummarizeArticleOutput {
  summary: string;
}

/**
 * Main function to summarize an article based on URL and target language
 * Following the process flow:
 * 1. Query DB to check if article exists
 * 2. If found, return existing summary
 * 3. If not found, fetch, preprocess, paraphrase/translate, and store
 * 4. Return the final summary
 * 
 * @param input Object containing targetLanguage and articleUrl
 * @returns Object with the summary
 */
export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  const { targetLanguage, articleUrl } = input;
  
  try {
    // Query DB to check if article already exists
    const queryResult = await queryArticleSummary(articleUrl, targetLanguage);
    
    let summary: string;
    
    // Check if article exists in DB
    if (queryResult.rows && queryResult.rows.length > 0) {
      // Found branch: Return existing summary
      summary = queryResult.rows[0].summary;
    } else {
      // Default branch: Process article
      
      // Fetch article content
      const articleChunks = await fetchArticleChunks(articleUrl);
      
      // Preprocess content
      const processedContent = await preprocessContent(articleChunks);
      
      // Paraphrase and translate
      summary = await paraphraseAndTranslate(processedContent, targetLanguage);
      
      // Store to DB
      await storeArticleSummary(articleUrl, summary, targetLanguage);
    }
    
    // Return result in required format
    return { summary };
    
  } catch (error) {
    console.error('Error in summarizeArticle:', error);
    return { summary: `Error summarizing article: ${(error as Error).message}` };
  }
}