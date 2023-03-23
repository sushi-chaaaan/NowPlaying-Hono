type FetchResponse<T> = FetchSuccessResponse<T> | FetchErrorResponse

type FetchSuccessResponse<T> = {
  data: T
  message: string
  ok: true
  status: number
}

type FetchErrorResponse = {
  data: null
  message: string
  ok: false
  status: number
}
