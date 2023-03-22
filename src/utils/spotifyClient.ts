import axios, { AxiosResponse } from 'axios'

type tokenAuth = {
  clientId: string
  clientSecret: string
}

class spotifyClient {
  constructor() {
    // pass
  }

  public async requestToken({
    clientId,
    clientSecret,
  }: tokenAuth): Promise<string> {
    const token = btoa(`${clientId}:${clientSecret}`)
    console.debug('Generating token...')

    const requestUrl = 'https://accounts.spotify.com/api/token'
    const data = {
      grant_type: 'client_credentials',
    }
    const headers = {
      Authorization: `Basic ${btoa(token)}`,
    }

    try {
      const response: AxiosResponse<string> = await axios.post(
        requestUrl,
        data,
        {
          headers: headers,
        },
      )
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default spotifyClient
