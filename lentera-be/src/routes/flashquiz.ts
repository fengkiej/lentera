import { Hono } from 'hono'
import { queryFlashquiz } from '../libs/flashquiz'

const flashquizRoute = new Hono()

flashquizRoute.get('/lentera/flashquiz', async (c) => {
  // Extract query parameters
  const id = c.req.query('id')
  const language = c.req.query('language')
  const questionCountParam = c.req.query('questionCount')
  const questionCount = questionCountParam ? parseInt(questionCountParam) : undefined
  
  // Validate required parameters
  if (!id || !language) {
    return c.json({ 
      status: 'error', 
      message: 'Both id and language parameters are required' 
    }, 400)
  }
  
  try {
    // Call the queryFlashquiz function with the provided parameters
    const result = await queryFlashquiz({
      id,
      language,
      questionCount
    })
    
    return c.json({
      status: 'success',
      id: result.id,
      flashquiz: result.flashquiz
    })
  } catch (error) {
    console.error('Error generating flashquiz:', error)
    return c.json({ 
      status: 'error', 
      message: `Failed to process the flashquiz request: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

export default flashquizRoute