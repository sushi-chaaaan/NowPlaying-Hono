import { Hono } from 'hono'
import { spotifyRoute } from '@/spotify'

const app = new Hono()
app.route('/spotify', spotifyRoute)

app.get('/', (c) => c.text('Hello Hono!'))

export default app
