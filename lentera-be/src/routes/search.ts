import { Hono } from 'hono'
import { mainSemanticSearch } from '../libs/semantic_search/main'

const searchRoute = new Hono()

searchRoute.get('/lentera/search', async (c) => {
  // Extract query parameters
  const query = c.req.query('query')
  const language = c.req.query('language') || 'auto'
  
  if (!query) {
    return c.json({ 
      status: 'error', 
      message: 'Query parameter is required' 
    }, 400)
  }
  
  try {
    // Perform semantic search
    const searchResult = await mainSemanticSearch(query, language)

    return c.json({
      status: 'success',
      id: searchResult.stored?.id || searchResult.stored?.data?.[0]?.id,
      search_result: searchResult["rankedResults"]
    })
  } catch (error) {
    console.error('Error performing semantic search:', error)
    return c.json({ 
      status: 'error', 
      message: 'Failed to process the search request' 
    }, 500)
  }
})

export default searchRoute