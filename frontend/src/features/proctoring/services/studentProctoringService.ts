import { apiClient } from '@/lib/api/apiClient'
import type { ApiResponse } from '@/types/api'
import type {
  CameraStreamStatus,
  CameraStatusUpdateRequest,
  ProctoringEventRequest,
  ProctoringEventResponse,
  ProctoringSessionResponse,
} from '@/types/proctoring'

export const studentProctoringService = {
  startOrGetSession: async (attemptId: string): Promise<ProctoringSessionResponse> => {
    const response = await apiClient.post<ApiResponse<ProctoringSessionResponse>>(
      `/student/proctoring/session/${attemptId}`
    )
    return response.data.data
  },

  getSession: async (attemptId: string): Promise<ProctoringSessionResponse> => {
    const response = await apiClient.get<ApiResponse<ProctoringSessionResponse>>(
      `/student/proctoring/session/${attemptId}`
    )
    return response.data.data
  },

  sendHeartbeat: async (sessionId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(
      `/student/proctoring/session/${sessionId}/heartbeat`
    )
  },

  updateCameraStatus: async (
    sessionId: string,
    status: CameraStreamStatus
  ): Promise<ProctoringSessionResponse> => {
    const payload: CameraStatusUpdateRequest = { status }
    const response = await apiClient.put<ApiResponse<ProctoringSessionResponse>>(
      `/student/proctoring/session/${sessionId}/camera-status`,
      payload
    )
    return response.data.data
  },

  ingestEvents: async (
    sessionId: string,
    events: ProctoringEventRequest[]
  ): Promise<ProctoringEventResponse[]> => {
    const response = await apiClient.post<ApiResponse<ProctoringEventResponse[]>>(
      `/student/proctoring/session/${sessionId}/events`,
      events
    )
    return response.data.data
  },

  completeSession: async (sessionId: string): Promise<ProctoringSessionResponse> => {
    const response = await apiClient.post<ApiResponse<ProctoringSessionResponse>>(
      `/student/proctoring/session/${sessionId}/complete`
    )
    return response.data.data
  },
}
