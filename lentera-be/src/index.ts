import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import elixRoute from './routes/elix'
import searchRoute from './routes/search'
import articleSummaryRoute from './routes/article_summary'
import mindmapRoute from './routes/mindmap'
import flashquizRoute from './routes/flashquiz'
import searchSummaryRoute from './routes/search_summary'

const app = new Hono()

app.use(logger())
app.use(cors())

app.get('/', (c) => {
  return c.text('lentera@0.0.1')
})

app.route('/', elixRoute)
app.route('/', searchRoute)
app.route('/', articleSummaryRoute)
app.route('/', mindmapRoute)
app.route('/', flashquizRoute)
app.route('/', searchSummaryRoute)

export default {
  fetch: app.fetch,
  port: 3000,
  idleTimeout: 0
}
