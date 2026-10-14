import { apiClient } from '@/lib/api/apiClient'
import type { ApiResponse, PageResponse } from '@/types/api'
import type {
  ExamResponse,
  ExamStatus,
  ExamCreateRequest,
  ExamUpdateRequest,
  QuestionCreateRequest,
  QuestionUpdateRequest,
} from '@/types/exam'
import type { ExamAttemptResponse } from '@/types/attempt'
import type {
  LecturerDashboardStatsResponse,
  LecturerExamAnalyticsResponse,
} from '@/types/admin'

export const lecturerService = {
  getDashboardStats: async (): Promise<LecturerDashboardStatsResponse> => {
    const response = await apiClient.get<ApiResponse<LecturerDashboardStatsResponse>>('/lecturer/dashboard/stats')
    return response.data.data
  },

  getExams: async (params?: {
    status?: ExamStatus
    page?: number
    size?: number
    sortBy?: string
    direction?: string
  }): Promise<PageResponse<ExamResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ExamResponse>>>('/lecturer/exams', {
      params,
    })
    return response.data.data
  },

  getExamById: async (examId: string): Promise<ExamResponse> => {
    const response = await apiClient.get<ApiResponse<ExamResponse>>(`/lecturer/exams/${examId}`)
    return response.data.data
  },

  createExam: async (data: ExamCreateRequest): Promise<ExamResponse> => {
    const response = await apiClient.post<ApiResponse<ExamResponse>>('/lecturer/exams', data)
    return response.data.data
  },

  updateExam: async (examId: string, data: ExamUpdateRequest): Promise<ExamResponse> => {
    const response = await apiClient.put<ApiResponse<ExamResponse>>(`/lecturer/exams/${examId}`, data)
    return response.data.data
  },

  addQuestion: async (examId: string, data: QuestionCreateRequest): Promise<ExamResponse> => {
    const response = await apiClient.post<ApiResponse<ExamResponse>>(`/lecturer/exams/${examId}/questions`, data)
    return response.data.data
  },

  updateQuestion: async (
    examId: string,
    questionId: string,
    data: QuestionUpdateRequest
  ): Promise<ExamResponse> => {
    const response = await apiClient.put<ApiResponse<ExamResponse>>(
      `/lecturer/exams/${examId}/questions/${questionId}`,
      data
    )
    return response.data.data
  },

  deleteQuestion: async (examId: string, questionId: string): Promise<ExamResponse> => {
    const response = await apiClient.delete<ApiResponse<ExamResponse>>(
      `/lecturer/exams/${examId}/questions/${questionId}`
    )
    return response.data.data
  },

  reorderQuestions: async (examId: string, questionIds: string[]): Promise<ExamResponse> => {
    const response = await apiClient.put<ApiResponse<ExamResponse>>(
      `/lecturer/exams/${examId}/questions/reorder`,
      { questionIds }
    )
    return response.data.data
  },

  publishExam: async (examId: string): Promise<ExamResponse> => {
    const response = await apiClient.post<ApiResponse<ExamResponse>>(`/lecturer/exams/${examId}/publish`)
    return response.data.data
  },

  unpublishExam: async (examId: string): Promise<ExamResponse> => {
    const response = await apiClient.post<ApiResponse<ExamResponse>>(`/lecturer/exams/${examId}/unpublish`)
    return response.data.data
  },

  archiveExam: async (examId: string): Promise<ExamResponse> => {
    const response = await apiClient.post<ApiResponse<ExamResponse>>(`/lecturer/exams/${examId}/archive`)
    return response.data.data
  },

  getExamAttempts: async (
    examId: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<ExamAttemptResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ExamAttemptResponse>>>(
      `/lecturer/exams/${examId}/attempts`,
      { params }
    )
    return response.data.data
  },

  getExamAnalytics: async (examId: string): Promise<LecturerExamAnalyticsResponse> => {
    const response = await apiClient.get<ApiResponse<LecturerExamAnalyticsResponse>>(
      `/lecturer/exams/${examId}/analytics`
    )
    return response.data.data
  },

  toggleResultsRelease: async (examId: string, release: boolean): Promise<ExamResponse> => {
    const response = await apiClient.post<ApiResponse<ExamResponse>>(
      `/lecturer/exams/${examId}/results/release`,
      null,
      { params: { release } }
    )
    return response.data.data
  },
}
