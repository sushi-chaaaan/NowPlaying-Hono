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

type trackResponse = {
  track: SpotifyApi.TrackObjectFull | undefined
  rawResponse: Response
}

type spotifyElementData = {
  id: string
  type: 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'episode' | 'user'
}
