import { apiClient } from '@/lib/api/apiClient'
import type { ApiResponse, PageResponse } from '@/types/api'
import type {
  ProctoringEventResponse,
  ProctoringReviewResponse,
  ProctoringReviewStatus,
  ProctoringSessionResponse,
  ProctoringSessionStatus,
  ProctoringSummaryResponse,
  ReviewUpdateRequest,
} from '@/types/proctoring'

export const lecturerMonitoringService = {
  getExamSessions: async (
    examId: string,
    params?: {
      status?: ProctoringSessionStatus
      page?: number
      size?: number
    }
  ): Promise<PageResponse<ProctoringSessionResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ProctoringSessionResponse>>>(
      `/lecturer/proctoring/exams/${examId}/sessions`,
      { params }
    )
    return response.data.data
  },

  getSessionDetails: async (sessionId: string): Promise<ProctoringSessionResponse> => {
    const response = await apiClient.get<ApiResponse<ProctoringSessionResponse>>(
      `/lecturer/proctoring/sessions/${sessionId}`
    )
    return response.data.data
  },

  getSessionEvents: async (
    sessionId: string,
    params?: {
      page?: number
      size?: number
    }
  ): Promise<PageResponse<ProctoringEventResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ProctoringEventResponse>>>(
      `/lecturer/proctoring/sessions/${sessionId}/events`,
      { params }
    )
    return response.data.data
  },

  getExamSummary: async (examId: string): Promise<ProctoringSummaryResponse> => {
    const response = await apiClient.get<ApiResponse<ProctoringSummaryResponse>>(
      `/lecturer/proctoring/exams/${examId}/summary`
    )
    return response.data.data
  },

  getExamReviews: async (
    examId: string,
    params?: {
      status?: ProctoringReviewStatus
      page?: number
      size?: number
    }
  ): Promise<PageResponse<ProctoringReviewResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ProctoringReviewResponse>>>(
      `/lecturer/proctoring/exams/${examId}/reviews`,
      { params }
    )
    return response.data.data
  },

  updateReview: async (
    reviewId: string,
    data: ReviewUpdateRequest
  ): Promise<ProctoringReviewResponse> => {
    const response = await apiClient.put<ApiResponse<ProctoringReviewResponse>>(
      `/lecturer/proctoring/reviews/${reviewId}`,
      data
    )
    return response.data.data
  },
}
