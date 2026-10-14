import type { Role } from './user'
import type { ExamResponse } from './exam'
import type { StudentExamResponse } from './exam'
import type { StudentResultResponse } from './attempt'

export interface AdminDashboardStatsResponse {
  totalUsers: number
  totalStudents: number
  totalLecturers: number
  totalAdmins: number
  activeUsers: number
  totalExams: number
  activeExams: number
  totalAttempts: number
  completedAttempts: number
  userRoleBreakdown: Record<string, number>
  examStatusBreakdown: Record<string, number>
}

export interface UserSummaryResponse {
  id: string
  fullName: string
  email: string
  role: Role
  active: boolean
  approved?: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface UserStatusUpdateRequest {
  active: boolean
}

export interface AuditLogResponse {
  id: string
  actorEmail: string
  actorRole: string
  action: string
  resourceType: string
  resourceId?: string
  details?: string
  ipAddress?: string
  timestamp: string
}

export interface LecturerDashboardStatsResponse {
  totalExams: number
  draftExams: number
  publishedExams: number
  archivedExams: number
  totalAttempts: number
  completedAttempts: number
  overallPassRate: number
  recentExams: ExamResponse[]
}

export interface LecturerExamAnalyticsResponse {
  examId: string
  examTitle: string
  totalAttempts: number
  completedAttempts: number
  inProgressAttempts: number
  averageScore: number
  averagePercentage: number
  highestScore: number
  lowestScore: number
  passCount: number
  failCount: number
  passRate: number
  scoreDistribution: Record<string, number>
}

export interface StudentDashboardResponse {
  availableExamsCount: number
  activeAttemptsCount: number
  completedAttemptsCount: number
  averageScorePercentage: number
  upcomingOrAvailableExams: StudentExamResponse[]
  recentResults: StudentResultResponse[]
}
