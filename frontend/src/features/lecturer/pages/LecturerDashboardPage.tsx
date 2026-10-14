import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  PlusCircle,
  FileEdit,
  Clock,
  Award,
  RotateCw,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { lecturerService } from '../services/lecturerService'
import type { LecturerDashboardStatsResponse } from '@/types/admin'

export const LecturerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<LecturerDashboardStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    lecturerService
      .getDashboardStats()
      .then((data) => {
        if (isMounted) setStats(data)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve instructor dashboard statistics')
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
    lecturerService
      .getDashboardStats()
      .then(setStats)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to retrieve instructor dashboard statistics')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lecturer Workspace</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, configure, publish, and monitor your academic examinations and student scores.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              isLoading={isLoading}
              leftIcon={<RotateCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Link to="/lecturer/exams/new">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                Create New Exam
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Overview">
            {error}
          </Alert>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Exams</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalExams ?? 0}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.publishedExams ?? 0} active & published
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Draft Exams</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.draftExams ?? 0}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Pending publication</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileEdit className="h-6 w-6" />
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
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalAttempts ?? 0}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.completedAttempts ?? 0} completed evaluations
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Overall Pass Rate</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {stats ? `${stats.overallPassRate.toFixed(1)}%` : '0%'}
                    </h3>
                  )}
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Average completion
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Launch Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/lecturer/exams/new" className="block group">
            <Card className="h-full hover:border-blue-400 hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-semibold text-slate-900 text-base">Create New Examination</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Draft a new examination with duration, passing criteria, schedule windows, and custom questions.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/lecturer/exams" className="block group">
            <Card className="h-full hover:border-emerald-400 hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-semibold text-slate-900 text-base">Manage Exam Repository</h4>
                <p className="text-xs text-slate-500 mt-1">
                  View, edit, build questions, publish drafts, inspect student attempts, and analyze exam scores.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Exams Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Recently Authored Examinations
            </CardTitle>
            <Link to="/lecturer/exams" className="text-xs font-semibold text-blue-600 hover:underline">
              View All Exams →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !stats?.recentExams || stats.recentExams.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<BookOpen className="h-8 w-8 text-slate-400" />}
                  title="No examinations authored yet"
                  description="Begin by creating your first examination draft for your students."
                  action={
                    <Link to="/lecturer/exams/new">
                      <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                        Create Exam Draft
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Exam Title</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Questions</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{exam.title}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">{exam.courseName}</td>
                        <td className="py-3.5 px-4">
                          {exam.status === 'PUBLISHED' && (
                            <Badge variant="success" size="sm" dot>Published</Badge>
                          )}
                          {exam.status === 'DRAFT' && (
                            <Badge variant="warning" size="sm">Draft</Badge>
                          )}
                          {exam.status === 'ARCHIVED' && (
                            <Badge variant="neutral" size="sm">Archived</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {exam.questionCount} items ({exam.totalMarks} marks)
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {exam.durationMinutes} min
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/lecturer/exams/${exam.id}`}>
                            <Button variant="outline" size="sm">
                              Manage Exam
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
