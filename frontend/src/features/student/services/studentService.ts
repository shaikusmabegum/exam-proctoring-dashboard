import { apiClient } from '@/lib/api/apiClient'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { StudentExamResponse } from '@/types/exam'
import type {
  ExamAttemptResponse,
  SaveAnswerRequest,
  StudentResultResponse,
} from '@/types/attempt'
import type { StudentDashboardResponse } from '@/types/admin'

export const studentService = {
  getDashboard: async (): Promise<StudentDashboardResponse> => {
    const response = await apiClient.get<ApiResponse<StudentDashboardResponse>>('/student/dashboard')
    return response.data.data
  },

  getAvailableExams: async (params?: {
    page?: number
    size?: number
  }): Promise<PageResponse<StudentExamResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<StudentExamResponse>>>(
      '/student/exams/available',
      { params }
    )
    return response.data.data
  },

  getExamById: async (examId: string): Promise<StudentExamResponse> => {
    const response = await apiClient.get<ApiResponse<StudentExamResponse>>(`/student/exams/${examId}`)
    return response.data.data
  },

  startOrResumeAttempt: async (examId: string): Promise<ExamAttemptResponse> => {
    const response = await apiClient.post<ApiResponse<ExamAttemptResponse>>(
      `/student/exams/${examId}/attempts`
    )
    return response.data.data
  },

  getAttempt: async (attemptId: string): Promise<ExamAttemptResponse> => {
    const response = await apiClient.get<ApiResponse<ExamAttemptResponse>>(
      `/student/attempts/${attemptId}`
    )
    return response.data.data
  },

  saveAnswer: async (
    attemptId: string,
    answer: SaveAnswerRequest
  ): Promise<ExamAttemptResponse> => {
    const response = await apiClient.put<ApiResponse<ExamAttemptResponse>>(
      `/student/attempts/${attemptId}/answers`,
      answer
    )
    return response.data.data
  },

  saveBatchAnswers: async (
    attemptId: string,
    answers: SaveAnswerRequest[]
  ): Promise<ExamAttemptResponse> => {
    const response = await apiClient.put<ApiResponse<ExamAttemptResponse>>(
      `/student/attempts/${attemptId}/answers/batch`,
      { answers }
    )
    return response.data.data
  },

  submitAttempt: async (
    attemptId: string,
    reason: string = 'MANUAL_SUBMISSION'
  ): Promise<StudentResultResponse> => {
    const response = await apiClient.post<ApiResponse<StudentResultResponse>>(
      `/student/attempts/${attemptId}/submit`,
      { reason }
    )
    return response.data.data
  },

  getAttemptResult: async (attemptId: string): Promise<StudentResultResponse> => {
    const response = await apiClient.get<ApiResponse<StudentResultResponse>>(
      `/student/attempts/${attemptId}/result`
    )
    return response.data.data
  },

  getResults: async (params?: {
    page?: number
    size?: number
  }): Promise<PageResponse<StudentResultResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<StudentResultResponse>>>(
      '/student/results',
      { params }
    )
    return response.data.data
  },
}
