import axios from 'axios'
import type { ApiErrorResponse } from '@/types/api'

export class AppApiError extends Error {
  errorCode: string
  status?: number
  fieldErrors?: Record<string, string>

  constructor(message: string, errorCode: string = 'UNKNOWN_ERROR', status?: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'AppApiError'
    this.errorCode = errorCode
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/**
 * Normalizes any caught error into a user-friendly AppApiError without leaking stack traces.
 */
export function normalizeApiError(error: unknown): AppApiError {
  if (error instanceof AppApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as ApiErrorResponse | undefined

    if (data && typeof data === 'object' && 'message' in data) {
      let message = data.message || 'An unexpected server error occurred'
      if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
        const details = Object.values(data.fieldErrors).join(', ')
        message = `${message}: ${details}`
      }
      return new AppApiError(
        message,
        data.errorCode || `HTTP_${status || 'ERROR'}`,
        status,
        data.fieldErrors
      )
    }

    if (status === 401) {
      return new AppApiError('Invalid credentials or session expired. Please log in again.', 'UNAUTHORIZED', 401)
    }

    if (status === 403) {
      return new AppApiError('You do not have permission to perform this action.', 'FORBIDDEN', 403)
    }

    if (status === 404) {
      return new AppApiError('The requested resource was not found.', 'NOT_FOUND', 404)
    }

    if (status === 429) {
      return new AppApiError('Too many requests. Please wait before retrying.', 'RATE_LIMIT_EXCEEDED', 429)
    }

    if (error.code === 'ERR_NETWORK') {
      return new AppApiError(
        'Unable to connect to the DRISHTI server. Please verify your internet connection or backend server status.',
        'NETWORK_ERROR',
        0
      )
    }

    return new AppApiError(
      error.message || 'Network request failed',
      error.code || 'REQUEST_FAILED',
      status
    )
  }

  if (error instanceof Error) {
    return new AppApiError(error.message, 'CLIENT_ERROR')
  }

  return new AppApiError('An unknown error occurred. Please try again.', 'UNKNOWN_ERROR')
}

export function getErrorMessage(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (error instanceof AppApiError) {
    if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
      return Object.values(error.fieldErrors).join(', ')
    }
    return error.message || fallback
  }
  if (error instanceof Error) {
    return error.message || fallback
  }
  return fallback
}

