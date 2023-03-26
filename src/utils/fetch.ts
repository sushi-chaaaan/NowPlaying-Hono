export const doFetch = async (url: string, options?: RequestInit) => {
  return await fetch(url, options)
}

export const handleResponse = async (
  response: Response,
): Promise<FetchResponse<unknown>> => {
  const isJson = response.headers.get('content-type')?.includes('json')
  const resp = response.clone()

  const data = isJson ? await resp.json() : null
  if (!response.ok) {
    let message
    if (data === null) {
      message = resp.statusText
    } else if (typeof data === 'string') {
      message = data
    } else if (
      typeof data === 'object' &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      message = data.message
    } else {
      message = 'Unknown error'
    }

    return {
      data: null,
      message: message,
      ok: false,
      status: resp.status,
    }
  }

  return {
    data: data,
    message: resp.statusText,
    ok: true,
    status: resp.status,
  }
}
