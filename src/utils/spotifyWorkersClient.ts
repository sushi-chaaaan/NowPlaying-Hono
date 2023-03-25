import { doFetch, handleResponse } from '@/utils/fetch'

class spotifyWorkersClient {
  private CACHE_TOKEN: KVNamespace
  private clientId: string
  private clientSecret: string
  private accessToken: string = ''

  constructor(
    { clientId, clientSecret }: clientCredential,
    KVNamespace: KVNamespace,
  ) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.CACHE_TOKEN = KVNamespace
  }

  private async requestToken(): Promise<void> {
    console.debug('Generating token...')
    // look below for the client credentials flow
    // https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
    const requestUrl = 'https://accounts.spotify.com/api/token'
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
    })
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
    }
    const response = await doFetch(requestUrl, {
      method: 'POST',
      headers: headers,
      body: params,
    })
    console.debug(response.status)
    console.debug(response.statusText)
    console.debug(await response.clone().text())

    const payload = await handleResponse(response)
    if (!payload.ok) {
      throw new Error(payload.message)
    }
    const { access_token, token_type, expires_in } =
      payload.data as accessTokenPayload

    this.accessToken = access_token
    await this.CACHE_TOKEN.put('token', access_token, {
      expirationTtl: expires_in,
    })
  }

  private extractTrackId(trackUrl: string): string {
    const regexp =
      /^(http[s]?:\/\/)s?open.spotify.com\/(?<type>track|artist|album|playlist|show|episode|user)\/(?<id>[0-9A-Za-z]+)(\?.*)?$/
    const match = trackUrl.match(regexp)
    if (!match) {
      throw new Error('Invalid track url')
    }
    return match.groups?.id || ''
  }

  private async getAccessToken(): Promise<string> {
    let token = this.accessToken
    if (!token) {
      token = (await this.CACHE_TOKEN.get('token', 'text')) ?? ''
      if (!token) {
        await this.requestToken()
        token = this.accessToken
      }
    }
    return token
  }

  public async getTrackInfo(trackUrl: string): Promise<trackInfo> {
    const trackId = this.extractTrackId(trackUrl)
    const accessToken = await this.getAccessToken()

    const query = new URLSearchParams({
      locale: 'ja_JP',
      market: 'JP',
    })
    const requestUrl = `https://api.spotify.com/v1/tracks/${trackId}?${query}`
    const response = await doFetch(requestUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const payload = await handleResponse(response)
    if (!payload.ok) {
      throw new Error(payload.message)
    }

    return {
      //@ts-expect-error
      name: payload.data.name,
      //@ts-expect-error
      artists: payload.data.artists.map((artist: any) => artist.name),
      //@ts-expect-error
      album: payload.data.album.name,
    }
  }
}

export default spotifyWorkersClient
