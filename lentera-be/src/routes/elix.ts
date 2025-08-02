import { Hono } from 'hono'
import { elix } from '../libs/elix'

const elixRoute = new Hono()

elixRoute.get('/lentera/elix', async (c) => {
  // Check if simplification parameters are provided
  const text = c.req.query('text')
  const language = c.req.query('language')
  const ageRange = c.req.query('ageRange')
  
  // If all simplification parameters are provided, perform text simplification
  if (text && language && ageRange) {
    try {
      const elixText = await elix(text, language, ageRange)
      
      return c.json({
        status: 'success',
        text: elixText
      })
    } catch (error) {
      console.error('Error simplifying text:', error)
      return c.json({ 
        status: 'error', 
        message: 'Failed to process the request' 
      }, 500)
    }
  }
})

export default elixRoute