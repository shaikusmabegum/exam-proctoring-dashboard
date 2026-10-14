/**
 * Standard backend response envelope matching com.drishti.dto.response.ApiResponse
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

/**
 * Standard backend error response envelope matching com.drishti.dto.response.ErrorResponse
 */
export interface ApiErrorResponse {
  message: string
  errorCode: string
  timestamp: string
  path?: string
  fieldErrors?: Record<string, string>
}

/**
 * Paginated response structure matching com.drishti.dto.common.PageResponse
 */
export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}
