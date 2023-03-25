import { Hono } from 'hono'
import spotifyWorkersClient from '@/utils/spotifyWorkersClient'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (ctx) => {
  console.log(ctx.env.SPOTIFY_CLIENT_ID)
  const client = new spotifyWorkersClient(
    {
      clientId: ctx.env.SPOTIFY_CLIENT_ID,
      clientSecret: ctx.env.SPOTIFY_CLIENT_SECRET,
    },
    ctx.env.CACHE_TOKEN,
  )
  const trackUrl = ctx.req.query('url')
  if (!trackUrl) {
    return ctx.text('No track url')
  }

  const accessToken = await client.requestToken()

  const trackInfo = await client.getTrackInfo(trackUrl)

  const nowPlayingLiteral = `
#NowPlaying
${trackInfo.name}/ ${trackInfo.artists.join(', ')} - ${trackInfo.album}`

  return ctx.text(nowPlayingLiteral)
})

export default app
