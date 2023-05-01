type accessTokenPayload = {
  access_token: string
  token_type: string
  expires_in: number
}

type clientCredential = {
  clientId: string
  clientSecret: string
}

type cacheKVNamespace = {
  tokenKV: KVNamespace
  trackKV: KVNamespace
}

type trackInfo = {
  name: string
  artists: string[]
  album: string
  rawData: SpotifyApi.TrackObjectFull
}

type spotifyElementData = {
  id: string
  type: 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'episode' | 'user'
}
