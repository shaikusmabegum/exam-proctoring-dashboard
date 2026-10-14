import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { lecturerService } from '../services/lecturerService'
import type { ExamAttemptResponse } from '@/types/attempt'

export const LecturerExamAttemptsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const [attempts, setAttempts] = useState<ExamAttemptResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!examId) return
    lecturerService
      .getExamAttempts(examId, { page, size: pageSize })
      .then((response) => {
        setAttempts(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve student examination attempts'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [examId, page, pageSize])

  const refreshAttempts = () => {
    if (!examId) return
    setIsLoading(true)
    setError(null)
    lecturerService
      .getExamAttempts(examId, { page, size: pageSize })
      .then((response) => {
        setAttempts(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve student examination attempts'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/lecturer/exams/${examId}`}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Exam
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Attempts</h1>
              <p className="text-xs text-slate-500">
                Audit student submissions, active sessions, and timestamps for this examination.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAttempts}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Attempts">
            {error}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Recorded Attempts ({totalElements} total)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : attempts.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Users className="h-8 w-8 text-slate-400" />}
                  title="No student attempts recorded"
                  description="No students have initiated or submitted attempts for this examination yet."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Attempt #</th>
                      <th className="py-3 px-4">Session Status</th>
                      <th className="py-3 px-4">Started At</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Remaining / Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-900 font-medium">
                          {att.studentId}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                          #{att.attemptNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          {att.status === 'IN_PROGRESS' && (
                            <Badge variant="warning" size="sm" dot>In Progress</Badge>
                          )}
                          {att.status === 'SUBMITTED' && (
                            <Badge variant="primary" size="sm">Submitted</Badge>
                          )}
                          {att.status === 'EVALUATED' && (
                            <Badge variant="success" size="sm">Evaluated</Badge>
                          )}
                          {att.status === 'TIMED_OUT' && (
                            <Badge variant="danger" size="sm">Timed Out</Badge>
                          )}
                          {att.status === 'CANCELLED' && (
                            <Badge variant="neutral" size="sm">Cancelled</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {new Date(att.startTime).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {att.submittedTime ? new Date(att.submittedTime).toLocaleString() : 'In Session'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {att.status === 'IN_PROGRESS'
                            ? `${Math.floor(att.remainingSeconds / 60)}m left`
                            : 'Finished'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Page {page + 1} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
