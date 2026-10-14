import React, { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PageLoader } from '@/components/feedback/PageLoader'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'
import { PublicRoute } from '@/routes/PublicRoute'
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  UnauthorizedPage,
  NotFoundPage,
  // Admin
  AdminDashboardPage,
  AdminUsersPage,
  AdminExamsPage,
  AdminAttemptsPage,
  AdminReportsPage,
  // Lecturer
  LecturerDashboardPage,
  LecturerExamsPage,
  LecturerExamCreatePage,
  LecturerExamDetailPage,
  LecturerQuestionsPage,
  LecturerExamAttemptsPage,
  LecturerExamResultsPage,
  LecturerExamAnalyticsPage,
  LecturerMonitoringOverviewPage,
  LecturerLiveMonitoringPage,
  // Student
  StudentDashboardPage,
  StudentExamsPage,
  StudentExamDetailPage,
  StudentPreCheckPage,
  StudentExamInterfacePage,
  StudentAttemptResultPage,
  StudentResultsHistoryPage,
  StudentProfilePage,
} from './lazyPages'

const withSuspense = (component: React.ReactNode) => (
  <Suspense fallback={<PageLoader message="Loading application module..." />}>{component}</Suspense>
)

export const router = createBrowserRouter([
  // Public Landing Page
  {
    path: '/',
    element: withSuspense(<LandingPage />),
  },

  // Public Auth Pages
  {
    path: '/login',
    element: (
      <PublicRoute>
        {withSuspense(<LoginPage />)}
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        {withSuspense(<RegisterPage />)}
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        {withSuspense(<ForgotPasswordPage />)}
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        {withSuspense(<ResetPasswordPage />)}
      </PublicRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: withSuspense(<UnauthorizedPage />),
  },

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          {withSuspense(<AdminDashboardPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          {withSuspense(<AdminUsersPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/exams',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          {withSuspense(<AdminExamsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/attempts',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          {withSuspense(<AdminAttemptsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/reports',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          {withSuspense(<AdminReportsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },

  // ============================================================================
  // LECTURER ROUTES
  // ============================================================================
  {
    path: '/lecturer',
    element: <Navigate to="/lecturer/dashboard" replace />,
  },
  {
    path: '/lecturer/dashboard',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerDashboardPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/exams',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerExamsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/exams/new',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerExamCreatePage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/exams/:examId',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerExamDetailPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/exams/:examId/questions',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerQuestionsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/exams/:examId/attempts',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerExamAttemptsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/exams/:examId/results',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerExamResultsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/exams/:examId/analytics',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerExamAnalyticsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/monitoring',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerMonitoringOverviewPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer/monitoring/:examId',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['LECTURER']}>
          {withSuspense(<LecturerLiveMonitoringPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },

  // ============================================================================
  // STUDENT ROUTES
  // ============================================================================
  {
    path: '/student',
    element: <Navigate to="/student/dashboard" replace />,
  },
  {
    path: '/student/dashboard',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentDashboardPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/exams',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentExamsPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/exams/:examId',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentExamDetailPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/exams/:examId/pre-check',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentPreCheckPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/attempts/:attemptId',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentExamInterfacePage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/attempts/:attemptId/result',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentAttemptResultPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/results',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentResultsHistoryPage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/profile',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          {withSuspense(<StudentProfilePage />)}
        </RoleRoute>
      </ProtectedRoute>
    ),
  },

  // 404 Catch-All
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
])
