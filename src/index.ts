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
    {
      tokenKV: ctx.env.CACHE_TOKEN,
      trackKV: ctx.env.TRACK_CACHE,
    },
  )
  const trackUrl = ctx.req.query('url')
  if (!trackUrl) {
    return ctx.text('No track url')
  }

  const trackInfo = await client.getTrackInfo(trackUrl)
  const nowPlayingLiteral = `#NowPlaying
${trackInfo.name} / ${trackInfo.artists.join(', ')} - ${trackInfo.album}
${trackUrl}
`

  return ctx.json({
    url: trackUrl,
    track_name: trackInfo.name,
    artists: trackInfo.artists,
    album: trackInfo.album,
    message: nowPlayingLiteral,
  })
})

export default app
