import { Hono } from 'hono'
import spotifyWorkersClient from '@/utils/spotifyWorkersClient'
import { StatusCode } from 'hono/utils/http-status'
import { doFetch, handleResponse } from './utils/fetch'

const api = new Hono<{ Bindings: Bindings }>()
const app = new Hono<{ Bindings: Bindings }>()

api.get('/track', async (ctx) => {
  const trackUrl = ctx.req.query('url')
  if (!trackUrl) {
    ctx.status(400)
    return ctx.json({ message: 'Missing track url parameter' })
  }

  const youtubeRegex = /^(http[s]?:\/\/)?(music\.)?youtube\.com\/watch(\?.*)?$/
  const shortYoutubeRegex = /^(http[s]?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)$/

  if (youtubeRegex.test(trackUrl) || shortYoutubeRegex.test(trackUrl)) {
    const res = await doFetch(
      `https://www.youtube.com/oembed?url=${trackUrl}&format=json`,
    )
    const { data } = await handleResponse<YoutubeTrack>(res)
    if (!data) {
      ctx.status(res.status as StatusCode)
      return ctx.json({ message: res.statusText })
    }

    const track: SpotifyCompatibleTrack = {
      name: data.title,
      artists: [{ name: data.author_name }],
      album: {
        name: '',
        images: [
          {
            url: data.thumbnail_url.replace('hqdefault', 'maxresdefault'),
            width: 960,
            height: 540,
          },
        ],
      },
    }

    return ctx.json({ message: res.statusText, track: track })
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
