type FetchResponse<T> = FetchSuccessResponse<T> | FetchErrorResponse

type FetchSuccessResponse<T> = {
  data: T
  message: string
  ok: true
  status: import('hono/utils/http-status').StatusCode
}

type FetchErrorResponse = {
  data: null
  message: string
  ok: false
  status: import('hono/utils/http-status').StatusCode
}
