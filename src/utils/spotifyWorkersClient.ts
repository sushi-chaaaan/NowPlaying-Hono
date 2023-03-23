import { doFetch, handleResponse } from '@/utils/fetch'

class spotifyWorkersClient {
  constructor() {
    // pass
  }

  public async requestToken({
    clientId,
    clientSecret,
  }: clientCredential): Promise<string> {
    console.debug('Generating token...')
    const requestUrl = 'https://accounts.spotify.com/api/token'
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
    })
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    }
    const response = await doFetch(requestUrl, {
      method: 'POST',
      headers: headers,
      body: params,
    })
    console.log(response.status)
    console.log(response.statusText)
    console.log(await response.text())
    const payload = await handleResponse(response)

    if (!payload.ok) {
      throw new Error(payload.message)
    }
    const { access_token } = payload.data as accessTokenPayload
    console.debug('Token generated')
    console.debug(access_token)

    return access_token
  }
}

export default spotifyWorkersClient
