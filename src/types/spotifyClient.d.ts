type accessTokenPayload = {
  access_token: string
  token_type: string
  expires_in: number
}

type clientCredential = {
  clientId: string
  clientSecret: string
}

type trackInfo = {
  name: string
  artists: string[]
  album: string
}
