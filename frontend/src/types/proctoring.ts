/**
 * Drishti Online Examination & Remote Proctoring Platform
 * Proctoring & Live Monitoring Type Definitions
 * Matches Java Spring Boot Backend contracts (StudentProctoringController, LecturerProctoringController, AdminController)
 */

export type ProctoringSessionStatus =
  | 'INITIALIZING'
  | 'ACTIVE'
  | 'CONNECTION_INTERRUPTED'
  | 'COMPLETED'
  | 'TERMINATED'

export type CameraStreamStatus =
  | 'UNKNOWN'
  | 'PERMISSION_GRANTED'
  | 'PERMISSION_DENIED'
  | 'STREAM_ACTIVE'
  | 'STREAM_INTERRUPTED'
  | 'STREAM_STOPPED'

export type ProctoringEventType =
  | 'CAMERA_PERMISSION_GRANTED'
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_STREAM_INTERRUPTED'
  | 'CAMERA_STREAM_RESTORED'
  | 'FACE_NOT_DETECTED'
  | 'MULTIPLE_FACES_DETECTED'
  | 'FACE_DETECTION_UNAVAILABLE'
  | 'TAB_VISIBILITY_CHANGED'
  | 'FULLSCREEN_EXITED'
  | 'NETWORK_INTERRUPTED'
  | 'NETWORK_RESTORED'
  | 'EXAM_STARTED'
  | 'EXAM_SUBMITTED'
  | 'MANUAL_REVIEW_REQUIRED'

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type EventSource = 'BROWSER_REPORTED' | 'AI_PROVIDER_VERIFIED' | 'SERVER_LIFECYCLE'

export type ProctoringReviewStatus = 'OPEN' | 'UNDER_REVIEW' | 'DISMISSED' | 'CONFIRMED'

export interface ProctoringSessionResponse {
  id: string
  attemptId: string
  studentId: string
  studentName: string
  studentEmail: string
  examId: string
  examTitle: string
  status: ProctoringSessionStatus
  startTime: string
  endTime?: string | null
  lastHeartbeatTime: string
  cameraStatus: CameraStreamStatus
  aiDetectionProvider: string
  aiCapabilities: string[]
  eventCount: number
  violationCount: number
}

export interface ProctoringEventResponse {
  id: string
  sessionId: string
  attemptId: string
  studentId: string
  examId: string
  eventType: ProctoringEventType
  source: EventSource
  eventTimestamp: string
  serverReceivedTimestamp: string
  severity: EventSeverity
  metadata?: Record<string, unknown> | null
}

export interface ProctoringSummaryResponse {
  examId: string
  totalSessions: number
  activeSessions: number
  completedSessions: number
  connectionInterruptedSessions: number
  totalEvents: number
  totalReviews: number
  openReviews: number
  confirmedViolations: number
  dismissedViolations: number
  eventsByType: Record<string, number>
  reviewsByCategory: Record<string, number>
}

export interface ProctoringReviewResponse {
  id: string
  sessionId: string
  attemptId: string
  examId: string
  examTitle: string
  studentId: string
  studentName: string
  studentEmail: string
  violationCategory: string
  severity: EventSeverity
  status: ProctoringReviewStatus
  reviewerEmail?: string | null
  reviewerNotes?: string | null
  resolutionReason?: string | null
  reviewedAt?: string | null
  createdAt: string
}

export interface CameraStatusUpdateRequest {
  status: CameraStreamStatus
}

export interface ProctoringEventRequest {
  eventType: ProctoringEventType
  eventTimestamp?: string
  idempotencyKey?: string
  metadata?: Record<string, unknown>
}

export interface ReviewUpdateRequest {
  status: ProctoringReviewStatus
  reviewerNotes?: string
  resolutionReason?: string
}

// Client-side Device Readiness Check States
export type DeviceCheckStatus =
  | 'idle'
  | 'checking'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error'

export type ReadinessState =
  | 'checking'
  | 'ready'
  | 'blocked'
  | 'permission-denied'
  | 'unsupported'
  | 'error'

export type StreamConnectionStatus = 'connected' | 'reconnecting' | 'offline' | 'polling'
