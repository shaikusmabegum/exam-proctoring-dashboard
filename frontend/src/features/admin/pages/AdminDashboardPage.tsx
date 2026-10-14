import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  ShieldCheck,
  RotateCw,
  ArrowRight,
  Layers,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Alert } from '@/components/feedback/Alert'
import { adminService } from '../services/adminService'
import type { AdminDashboardStatsResponse } from '@/types/admin'
import type { ProctoringSummaryResponse } from '@/types/proctoring'
import { Video } from 'lucide-react'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStatsResponse | null>(null)
  const [proctoringSummary, setProctoringSummary] = useState<ProctoringSummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getProctoringSummary().catch(() => null),
    ])
      .then(([statsData, proctoringData]) => {
        if (isMounted) {
          setStats(statsData)
          setProctoringSummary(proctoringData)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve administrative statistics')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const refreshStats = () => {
    setIsLoading(true)
    setError(null)
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getProctoringSummary().catch(() => null),
    ])
      .then(([statsData, proctoringData]) => {
        setStats(statsData)
        setProctoringSummary(proctoringData)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to retrieve administrative statistics')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // Prepare chart data from server maps
  const roleChartData = stats?.userRoleBreakdown
    ? Object.entries(stats.userRoleBreakdown).map(([name, value]) => ({ name, value }))
    : []

  const examChartData = stats?.examStatusBreakdown
    ? Object.entries(stats.examStatusBreakdown).map(([status, count]) => ({ status, count }))
    : []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Live operational metrics, role distribution, and system-wide examination activity.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh Data
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Failed to Load Overview">
            {error}
          </Alert>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Users</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalUsers ?? 0}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.activeUsers ?? 0} active accounts
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Students</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalStudents ?? 0}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.totalLecturers ?? 0} teaching staff
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Platform Exams</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalExams ?? 0}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.activeExams ?? 0} currently active
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Attempts</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalAttempts ?? 0}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.completedAttempts ?? 0} completed submissions
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Proctoring Telemetry Overview */}
        {proctoringSummary && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-600" />
              Platform Remote Proctoring & AI Telemetry Health
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                  Active Video Feeds
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                  {proctoringSummary.activeSessions}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {proctoringSummary.totalSessions} total sessions
                </span>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                  Telemetry Signals Ingested
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {proctoringSummary.totalEvents}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">Tab & window events</span>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                  Open Incident Reviews
                </span>
                <span className="text-2xl font-extrabold text-rose-600 mt-1 block">
                  {proctoringSummary.openReviews}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {proctoringSummary.totalReviews} total incidents
                </span>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                  Confirmed Violations
                </span>
                <span className="text-2xl font-extrabold text-purple-600 mt-1 block">
                  {proctoringSummary.confirmedViolations}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {proctoringSummary.dismissedViolations} dismissed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Visualizations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                User Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : roleChartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {roleChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                  No role data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exam Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                Examination Lifecycle Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : examChartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                  No exam status data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/users" className="block group">
            <Card className="h-full hover:border-blue-400 hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                    <Users className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-semibold text-slate-900 text-base">User Directory</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Manage platform users, roles, email verification status, and toggle account activation.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/exams" className="block group">
            <Card className="h-full hover:border-emerald-400 hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-semibold text-slate-900 text-base">Exams Overview</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Audit all published, draft, and archived examinations across all academic instructors.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/reports" className="block group">
            <Card className="h-full hover:border-amber-400 hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-semibold text-slate-900 text-base">Security Audit Trail</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect immutable audit logs, login events, permission modifications, and exam operations.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
