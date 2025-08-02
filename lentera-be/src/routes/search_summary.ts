import { Hono } from 'hono';
import { querySearchSummary } from '../libs/search_summary';

/**
 * Route handler for search summary functionality
 * Endpoint: /lentera/search_summary
 */
const searchSummaryRoute = new Hono();

searchSummaryRoute.get('/lentera/search_summary', async (c) => {
  try {
    // Extract query parameters
    const language = c.req.query('language');
    const id = c.req.query('id');
    
    // Validate required parameters
    if (!language || !id) {
      return c.json({
        status: 'error',
        message: 'Both language and id parameters are required'
      }, 400);
    }
    
    const result = await querySearchSummary({ language, id });
    return c.json(result);
  } catch (error) {
    console.error('Error in search summary route:', error);
    return c.json({
      error: error instanceof Error ? error.message : String(error),
      status: 500
    }, 500);
  }
});

export default searchSummaryRoute;