import { apiClient } from '@/lib/api/apiClient'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { Role } from '@/types/user'
import type { ExamStatus } from '@/types/exam'
import type { AttemptStatus, ExamAttemptResponse } from '@/types/attempt'
import type { ExamResponse } from '@/types/exam'
import type {
  AdminDashboardStatsResponse,
  UserSummaryResponse,
  UserStatusUpdateRequest,
  AuditLogResponse,
} from '@/types/admin'
import type { ProctoringSummaryResponse } from '@/types/proctoring'

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStatsResponse> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardStatsResponse>>('/admin/dashboard/stats')
    return response.data.data
  },

  getProctoringSummary: async (): Promise<ProctoringSummaryResponse> => {
    const response = await apiClient.get<ApiResponse<ProctoringSummaryResponse>>('/admin/proctoring/summary')
    return response.data.data
  },

  getUsers: async (params?: {
    role?: Role
    active?: boolean
    page?: number
    size?: number
    sortBy?: string
    direction?: string
  }): Promise<PageResponse<UserSummaryResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<UserSummaryResponse>>>('/admin/users', {
      params,
    })
    return response.data.data
  },

  getUserById: async (userId: string): Promise<UserSummaryResponse> => {
    const response = await apiClient.get<ApiResponse<UserSummaryResponse>>(`/admin/users/${userId}`)
    return response.data.data
  },

  updateUserStatus: async (userId: string, active: boolean): Promise<UserSummaryResponse> => {
    const payload: UserStatusUpdateRequest = { active }
    const response = await apiClient.patch<ApiResponse<UserSummaryResponse>>(
      `/admin/users/${userId}/status`,
      payload
    )
    return response.data.data
  },

  approveUser: async (userId: string): Promise<UserSummaryResponse> => {
    const response = await apiClient.patch<ApiResponse<UserSummaryResponse>>(
      `/admin/users/${userId}/approve`
    )
    return response.data.data
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`)
  },

  getAllExams: async (params?: {
    status?: ExamStatus
    page?: number
    size?: number
  }): Promise<PageResponse<ExamResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ExamResponse>>>('/admin/exams', {
      params,
    })
    return response.data.data
  },

  getAllAttempts: async (params?: {
    status?: AttemptStatus
    page?: number
    size?: number
  }): Promise<PageResponse<ExamAttemptResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ExamAttemptResponse>>>('/admin/attempts', {
      params,
    })
    return response.data.data
  },

  getAuditLogs: async (params?: {
    actorEmail?: string
    action?: string
    resourceType?: string
    page?: number
    size?: number
  }): Promise<PageResponse<AuditLogResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<AuditLogResponse>>>('/admin/audit-logs', {
      params,
    })
    return response.data.data
  },
}
