import { Hono } from 'hono'
import spotifyWorkersClient from '@/utils/spotifyWorkersClient'
import { StatusCode } from 'hono/utils/http-status'

const api = new Hono<{ Bindings: Bindings }>()
const app = new Hono<{ Bindings: Bindings }>()

api.get('/track', async (ctx) => {
  const trackUrl = ctx.req.query('url')
  if (!trackUrl) {
    ctx.status(400)
    return ctx.json({ message: 'Missing track url parameter' })
  }

  const client = new spotifyWorkersClient(
    {
      clientId: ctx.env.SPOTIFY_CLIENT_ID,
      clientSecret: ctx.env.SPOTIFY_CLIENT_SECRET,
    },
    {
      tokenKV: ctx.env.CACHE_TOKEN,
      trackKV: ctx.env.TRACK_CACHE,
    },
  )

  const { track, rawResponse } = await client.getTrack(trackUrl)
  if (!track) {
    ctx.status(rawResponse.status as StatusCode)
    return ctx.json({ message: rawResponse.statusText })
  }

  return ctx.json({ message: rawResponse.statusText, track: track })
})

app.route('/api', api)

export default app
