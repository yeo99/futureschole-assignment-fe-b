import { COMMON_MESSAGES } from '@/shared/constants/messages'
import { API_ERROR_CODES, type ApiErrorCode } from './error-codes'

export interface ErrorResponse {
  code: string
  message: string
}

interface ApiErrorParams {
  code: ApiErrorCode
  message: string
  status?: number
  response?: ErrorResponse
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number
  readonly response?: ErrorResponse

  constructor({ code, message, status, response }: ApiErrorParams) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.response = response
  }
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<Record<keyof ErrorResponse, unknown>>

  return (
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string'
  )
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getFallbackMessageByStatus(status: number): string {
  if (status >= 500) {
    return COMMON_MESSAGES.SERVER_ERROR
  }

  return COMMON_MESSAGES.UNKNOWN_ERROR
}

export function createNetworkError(): ApiError {
  return new ApiError({
    code: API_ERROR_CODES.NETWORK_ERROR,
    message: COMMON_MESSAGES.NETWORK_ERROR,
  })
}

export function createUnknownError(): ApiError {
  return new ApiError({
    code: API_ERROR_CODES.UNKNOWN_ERROR,
    message: COMMON_MESSAGES.UNKNOWN_ERROR,
  })
}
