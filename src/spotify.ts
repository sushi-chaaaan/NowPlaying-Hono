import { Hono } from 'hono'

import spotifyClient from '@/utils/spotifyClient'

// https://hono.dev/getting-started/cloudflare-workers#bindings
export const spotifyRoute = new Hono<{ Bindings: Bindings }>()

spotifyRoute.get('/', (ctx) => {
  const client = new spotifyClient()

  // FIXME: ここをなんとか非同期実行にしないといけない
  client
    .requestToken({
      clientId: ctx.env.SPOTIFY_CLIENT_ID,
      clientSecret: ctx.env.SPOTIFY_CLIENT_SECRET,
    })
    .then((token) => {
      console.log('token generated')
      console.log(token)
    })
    .catch((error) => {
      console.error(error)
    })

  return ctx.text('Hello Hono!')
})
