import { lazy, type ComponentType } from 'react'

/**
 * Robust lazy import with automatic retry to prevent chunk-loading crashes on Vercel deployments.
 */
function retryLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2
) {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (left: number) => {
        factory()
          .then(resolve)
          .catch((error) => {
            if (left <= 0) {
              reject(error)
              return
            }
            setTimeout(() => attempt(left - 1), 600)
          })
      }
      attempt(retries)
    })
  )
}

// Public & Auth Pages
export const LandingPage = retryLazy(() =>
  import('@/routes/LandingPage').then((m) => ({ default: m.LandingPage }))
)
export const LoginPage = retryLazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
)
export const RegisterPage = retryLazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
export const ForgotPasswordPage = retryLazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
)
export const ResetPasswordPage = retryLazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
)
export const UnauthorizedPage = retryLazy(() =>
  import('@/routes/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
)
export const NotFoundPage = retryLazy(() =>
  import('@/routes/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

// Admin Pages
export const AdminDashboardPage = retryLazy(() =>
  import('@/features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
export const AdminUsersPage = retryLazy(() =>
  import('@/features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
)
export const AdminExamsPage = retryLazy(() =>
  import('@/features/admin/pages/AdminExamsPage').then((m) => ({ default: m.AdminExamsPage }))
)
export const AdminAttemptsPage = retryLazy(() =>
  import('@/features/admin/pages/AdminAttemptsPage').then((m) => ({ default: m.AdminAttemptsPage }))
)
export const AdminReportsPage = retryLazy(() =>
  import('@/features/admin/pages/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage }))
)

// Lecturer Pages
export const LecturerDashboardPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerDashboardPage').then((m) => ({
    default: m.LecturerDashboardPage,
  }))
)
export const LecturerExamsPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerExamsPage').then((m) => ({ default: m.LecturerExamsPage }))
)
export const LecturerExamCreatePage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerExamCreatePage').then((m) => ({
    default: m.LecturerExamCreatePage,
  }))
)
export const LecturerExamDetailPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerExamDetailPage').then((m) => ({
    default: m.LecturerExamDetailPage,
  }))
)
export const LecturerQuestionsPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerQuestionsPage').then((m) => ({
    default: m.LecturerQuestionsPage,
  }))
)
export const LecturerExamAttemptsPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerExamAttemptsPage').then((m) => ({
    default: m.LecturerExamAttemptsPage,
  }))
)
export const LecturerExamResultsPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerExamResultsPage').then((m) => ({
    default: m.LecturerExamResultsPage,
  }))
)
export const LecturerExamAnalyticsPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerExamAnalyticsPage').then((m) => ({
    default: m.LecturerExamAnalyticsPage,
  }))
)
export const LecturerMonitoringOverviewPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerMonitoringOverviewPage').then((m) => ({
    default: m.LecturerMonitoringOverviewPage,
  }))
)
export const LecturerLiveMonitoringPage = retryLazy(() =>
  import('@/features/lecturer/pages/LecturerLiveMonitoringPage').then((m) => ({
    default: m.LecturerLiveMonitoringPage,
  }))
)

// Student Pages
export const StudentDashboardPage = retryLazy(() =>
  import('@/features/student/pages/StudentDashboardPage').then((m) => ({
    default: m.StudentDashboardPage,
  }))
)
export const StudentExamsPage = retryLazy(() =>
  import('@/features/student/pages/StudentExamsPage').then((m) => ({ default: m.StudentExamsPage }))
)
export const StudentExamDetailPage = retryLazy(() =>
  import('@/features/student/pages/StudentExamDetailPage').then((m) => ({
    default: m.StudentExamDetailPage,
  }))
)
export const StudentPreCheckPage = retryLazy(() =>
  import('@/features/student/pages/StudentPreCheckPage').then((m) => ({
    default: m.StudentPreCheckPage,
  }))
)
export const StudentExamInterfacePage = retryLazy(() =>
  import('@/features/student/pages/StudentExamInterfacePage').then((m) => ({
    default: m.StudentExamInterfacePage,
  }))
)
export const StudentAttemptResultPage = retryLazy(() =>
  import('@/features/student/pages/StudentAttemptResultPage').then((m) => ({
    default: m.StudentAttemptResultPage,
  }))
)
export const StudentResultsHistoryPage = retryLazy(() =>
  import('@/features/student/pages/StudentResultsHistoryPage').then((m) => ({
    default: m.StudentResultsHistoryPage,
  }))
)
export const StudentProfilePage = retryLazy(() =>
  import('@/features/student/pages/StudentProfilePage').then((m) => ({
    default: m.StudentProfilePage,
  }))
)
