export const doFetch = async (url: string, options?: RequestInit) => {
  return await fetch(url, options)
}

export const handleResponse = async (
  response: Response,
): Promise<FetchResponse<unknown>> => {
  const isJson = response.headers.get('content-type')?.includes('json')
  const data = isJson ? await response.clone().json() : null
  if (!response.ok) {
    let message
    if (data === null) {
      message = response.statusText
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
      status: response.status,
    }
  }

  return {
    data: data,
    message: response.statusText,
    ok: true,
    status: response.status,
  }
}
