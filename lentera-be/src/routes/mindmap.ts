import { Hono } from 'hono'
import { queryMindmap } from '../libs/mindmap'

const mindmapRoute = new Hono()

mindmapRoute.get('/lentera/mindmap', async (c) => {
  // Extract query parameters
  const id = c.req.query('id')
  const language = c.req.query('language')
  
  // Validate required parameters
  if (!id || !language) {
    return c.json({ 
      status: 'error', 
      message: 'Both id and language parameters are required' 
    }, 400)
  }
  
  try {
    // Call the queryMindmap function with the provided parameters
    const result = await queryMindmap({
      id,
      language
    })
    
    return c.json({
      status: 'success',
      id: result.id,
      mindmap: result.mindmap
    })
  } catch (error) {
    console.error('Error generating mindmap:', error)
    return c.json({ 
      status: 'error', 
      message: `Failed to process the mindmap request: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

export default mindmapRoute