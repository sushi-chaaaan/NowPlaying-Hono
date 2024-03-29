import { doFetch, handleResponse } from '@/utils/fetch'

class spotifyWorkersClient {
  private AccessTokenCache: KVNamespace
  private TrackCache: KVNamespace
  private clientId: string
  private clientSecret: string

  constructor(
    { clientId, clientSecret }: clientCredential,
    { tokenKV, trackKV }: cacheKVNamespace,
  ) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.AccessTokenCache = tokenKV
    this.TrackCache = trackKV
  }

  private async requestToken(): Promise<string> {
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

    const payload = await handleResponse(response)
    if (!payload.ok) {
      console.debug(await response.clone().text())
      throw new Error(payload.message)
    }

    const { access_token, token_type, expires_in } =
      payload.data as accessTokenPayload
    await this.AccessTokenCache.put('spotify_access_token', access_token, {
      expirationTtl: expires_in,
    })
    return access_token
  }

  private extractElementData(trackUrl: string): spotifyElementData {
    const regexp =
      /^(http[s]?:\/\/)s?open.spotify.com\/((?<region>[0-9A-Za-z\-]+)\/)?(?<type>track|artist|album|playlist|show|episode|user)\/(?<id>[0-9A-Za-z]+)(\?.*)?$/
    const match = trackUrl.match(regexp)
    if (!match) {
      throw new Error('Invalid track url')
    }
    return {
      id: match.groups?.id ?? '',
      type: match.groups?.type as spotifyElementData['type'],
    }
  }

  private async getAccessToken(): Promise<string> {
    let token: string = ''
    if (!token) {
      token =
        (await this.AccessTokenCache.get('spotify_access_token', 'text')) || ''
      if (!token) {
        console.debug("fetching token from spotify's api")
        token = await this.requestToken()
      } else {
        console.debug('fetched token from kv cache')
      }
    }
    return token
  }

  public async getTrack(trackUrl: string): Promise<trackResponse> {
    const trackData = this.extractElementData(trackUrl)
    const cachedTrack = await this.getTrackFromCache(trackData.id)
    if (cachedTrack) {
      return {
        track: cachedTrack,
        rawResponse: new Response('Fetch from cache', {
          status: 200,
          statusText: 'Fetch from cache',
        }),
      }
    }

    const accessToken = await this.getAccessToken()
    const query = new URLSearchParams({
      locale: 'ja_JP',
      market: 'JP',
    })
    const requestUrl = `https://api.spotify.com/v1/tracks/${trackData.id}?${query}`
    const response = await doFetch(requestUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const payload = await handleResponse(response)
    if (!payload.ok) {
      return {
        track: undefined,
        rawResponse: response,
      }
    }

    const trackResponse = payload.data as SpotifyApi.TrackObjectFull
    await this.writeTrackInfoToCache(trackResponse)
    return {
      track: trackResponse,
      rawResponse: response,
    }
  }

  private async writeTrackInfoToCache(
    track: SpotifyApi.SingleTrackResponse,
  ): Promise<void> {
    await this.TrackCache.put(track.id, JSON.stringify(track), {
      expirationTtl: 60 * 60 * 24 * 7,
    })
  }

  private async getTrackFromCache(
    trackId: string,
  ): Promise<SpotifyApi.SingleTrackResponse | undefined> {
    const track = (await this.TrackCache.get(
      trackId,
      'json',
    )) as SpotifyApi.SingleTrackResponse
    if (!track) {
      console.debug('track not found in cache')
      return
    }
    return track
  }
}

export default spotifyWorkersClient
