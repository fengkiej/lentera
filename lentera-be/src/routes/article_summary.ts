import { Hono } from 'hono'
import { summarizeArticle } from '../libs/summarize_article'

const articleSummaryRoute = new Hono()

articleSummaryRoute.get('/lentera/get_article_summary', async (c) => {
  // Extract query parameters
  const targetLanguage = c.req.query('language')
  const articleUrl = c.req.query('articleUrl')
  
  // Validate required parameters
  if (!targetLanguage || !articleUrl) {
    return c.json({ 
      status: 'error', 
      message: 'Both targetLanguage and articleUrl parameters are required' 
    }, 400)
  }
  
  try {
    // Call the summarizeArticle function with the provided parameters
    const result = await summarizeArticle({
      targetLanguage,
      articleUrl
    })
    
    return c.json({
      status: 'success',
      summary: result.summary
    })
  } catch (error) {
    console.error('Error summarizing article:', error)
    return c.json({ 
      status: 'error', 
      message: 'Failed to process the article summary request' 
    }, 500)
  }
})

export default articleSummaryRoute