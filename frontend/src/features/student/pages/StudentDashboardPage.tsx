import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Award,
  RotateCw,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { studentService } from '../services/studentService'
import type { StudentDashboardResponse } from '@/types/admin'

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<StudentDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    studentService
      .getDashboard()
      .then((data) => setDashboard(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve student dashboard overview'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const refreshDashboard = () => {
    setIsLoading(true)
    setError(null)
    studentService
      .getDashboard()
      .then((data) => setDashboard(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve student dashboard overview'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.fullName || 'Student'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your assessment portal. Track upcoming examinations, active testing windows, and academic results.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboard}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Dashboard">
            {error}
          </Alert>
        )}

        {/* Top Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Available Exams
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboard?.availableExamsCount ?? 0}
                    </h3>
                  )}
                  <p className="text-xs text-blue-600 font-medium mt-1">Ready to attempt</p>
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
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    In-Progress Sessions
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-amber-600 mt-1">
                      {dashboard?.activeAttemptsCount ?? 0}
                    </h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Active examination timers</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Completed Exams
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboard?.completedAttemptsCount ?? 0}
                    </h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Submitted for evaluation</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Average Score
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboard ? `${dashboard.averageScorePercentage.toFixed(1)}%` : '0%'}
                    </h3>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Across released results</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section: Available & Upcoming Exams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Available & Scheduled Examinations
            </h3>
            <Link to="/student/exams" className="text-xs font-semibold text-blue-600 hover:underline">
              View All Available Exams →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : !dashboard?.upcomingOrAvailableExams || dashboard.upcomingOrAvailableExams.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={<BookOpen className="h-8 w-8 text-slate-400" />}
                  title="No examinations scheduled"
                  description="You have no active examination windows currently open."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dashboard.upcomingOrAvailableExams.map((exam) => (
                <Card key={exam.id} className="hover:border-blue-300 hover:shadow-xs transition-all">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="primary" size="sm" className="mb-1">{exam.courseName}</Badge>
                        <h4 className="font-bold text-base text-slate-900">{exam.title}</h4>
                      </div>
                      {exam.canAttempt ? (
                        <Badge variant="success" size="sm" dot>Open Now</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Scheduled</Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {exam.description || 'No additional instructions provided.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <span><strong>{exam.durationMinutes}</strong> mins</span>
                      <span>•</span>
                      <span><strong>{exam.totalMarks}</strong> marks</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        Ends {new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="pt-2">
                      <Link to={`/student/exams/${exam.id}`}>
                        <Button
                          variant={exam.canAttempt ? 'primary' : 'outline'}
                          size="sm"
                          className="w-full"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          {exam.canAttempt ? 'Enter Exam Portal' : 'View Schedule & Instructions'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section: Recent Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              Recent Academic Results
            </h3>
            <Link to="/student/results" className="text-xs font-semibold text-blue-600 hover:underline">
              View Complete History →
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : !dashboard?.recentResults || dashboard.recentResults.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<Award className="h-8 w-8 text-slate-400" />}
                    title="No completed examinations"
                    description="When you complete examinations and results are released, they will be listed here."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Examination</th>
                        <th className="py-3 px-4">Submitted Date</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Percentage</th>
                        <th className="py-3 px-4">Outcome</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dashboard.recentResults.map((res) => (
                        <tr key={res.attemptId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{res.examTitle}</td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {new Date(res.submittedTime).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-900">
                            {res.score} / {res.totalMarks}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-blue-600">
                            {res.percentage.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4">
                            {res.passed ? (
                              <Badge variant="success" size="sm">Passed</Badge>
                            ) : (
                              <Badge variant="danger" size="sm">Did Not Pass</Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link to={`/student/attempts/${res.attemptId}/result`}>
                              <Button variant="outline" size="sm">
                                View Result
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
      </div>
    </DashboardLayout>
  )
}
