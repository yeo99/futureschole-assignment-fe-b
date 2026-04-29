import {
  ApiError,
  createNetworkError,
  createUnknownError,
  getFallbackMessageByStatus,
  isApiError,
  isErrorResponse,
} from './api-error'
import { API_ERROR_CODES, type ApiErrorCode } from './error-codes'

interface RequestConfig extends Omit<RequestInit, 'body' | 'method'> {
  body?: BodyInit | null
  json?: unknown
}

function createHeaders(headers: HeadersInit | undefined, hasJson: boolean) {
  const nextHeaders = new Headers(headers)

  if (!nextHeaders.has('Accept')) {
    nextHeaders.set('Accept', 'application/json')
  }

  if (hasJson && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json')
  }

  return nextHeaders
}

function toApiErrorCode(code: string): ApiErrorCode {
  if (Object.values(API_ERROR_CODES).includes(code as ApiErrorCode)) {
    return code as ApiErrorCode
  }

  return API_ERROR_CODES.UNKNOWN_ERROR
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('Content-Type')

  if (!contentType?.includes('application/json')) {
    return undefined
  }

  return response.json()
}

async function request<TResponse>(
  url: string,
  method: string,
  config: RequestConfig = {},
): Promise<TResponse> {
  const { json, headers, ...requestInit } = config
  const hasJson = json !== undefined

  // fetch 자체 실패와 HTTP 에러 응답은 복구 방식이 달라서 분리한다.
  const response = await fetch(url, {
    ...requestInit,
    method,
    body: hasJson ? JSON.stringify(json) : requestInit.body,
    headers: createHeaders(headers, hasJson),
  }).catch(() => {
    throw createNetworkError()
  })

  const responseBody = await readJson(response).catch(() => undefined)

  if (!response.ok) {
    if (isErrorResponse(responseBody)) {
      throw new ApiError({
        code: toApiErrorCode(responseBody.code),
        message: responseBody.message,
        status: response.status,
        response: responseBody,
      })
    }

    throw new ApiError({
      code:
        response.status >= 500
          ? API_ERROR_CODES.SERVER_ERROR
          : API_ERROR_CODES.UNKNOWN_ERROR,
      message: getFallbackMessageByStatus(response.status),
      status: response.status,
    })
  }

  return responseBody as TResponse
}

export const httpClient = {
  get<TResponse>(url: string, config?: RequestConfig) {
    return request<TResponse>(url, 'GET', config)
  },
  post<TResponse>(url: string, json?: unknown, config?: RequestConfig) {
    return request<TResponse>(url, 'POST', { ...config, json })
  },
  put<TResponse>(url: string, json?: unknown, config?: RequestConfig) {
    return request<TResponse>(url, 'PUT', { ...config, json })
  },
  delete<TResponse>(url: string, config?: RequestConfig) {
    return request<TResponse>(url, 'DELETE', config)
  },
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }

  return createUnknownError().message
}
