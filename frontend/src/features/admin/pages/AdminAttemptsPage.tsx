import React, { useEffect, useState, useCallback } from 'react'
import {
  Clock,
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
import { adminService } from '../services/adminService'
import type { ExamAttemptResponse, AttemptStatus } from '@/types/attempt'

export const AdminAttemptsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<ExamAttemptResponse[]>([])
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [page, setPage] = useState<number>(0)
  const [pageSize] = useState<number>(10)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAttempts = useCallback(async () => {
    const statusParam = statusFilter ? (statusFilter as AttemptStatus) : undefined
    return adminService.getAllAttempts({
      status: statusParam,
      page,
      size: pageSize,
    })
  }, [page, pageSize, statusFilter])

  useEffect(() => {
    let isMounted = true
    fetchAttempts()
      .then((response) => {
        if (!isMounted) return
        setAttempts(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve examination attempts')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [fetchAttempts])

  const refreshAttempts = () => {
    setIsLoading(true)
    setError(null)
    fetchAttempts()
      .then((response) => {
        setAttempts(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to retrieve examination attempts')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Live Attempts Monitoring</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time audit of student exam sessions, ongoing timers, and submitted evaluations.
            </p>
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

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Attempt State Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(0)
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All States (Global)</option>
                <option value="IN_PROGRESS">In Progress (Active Session)</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="EVALUATED">Evaluated</option>
                <option value="TIMED_OUT">Timed Out</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Attempts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Examination Attempts ({totalElements} total records)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : attempts.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Clock className="h-8 w-8 text-slate-400" />}
                  title="No examination attempts found"
                  description="No student attempts currently match your selected status filter."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Exam Title</th>
                      <th className="py-3 px-4">Student ID / Token</th>
                      <th className="py-3 px-4">Attempt #</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4">Session Started</th>
                      <th className="py-3 px-4">Submission / Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {attempt.examTitle}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                          {attempt.studentId}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                          Attempt #{attempt.attemptNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          {attempt.status === 'IN_PROGRESS' && (
                            <Badge variant="warning" size="sm" dot>In Progress</Badge>
                          )}
                          {attempt.status === 'SUBMITTED' && (
                            <Badge variant="primary" size="sm">Submitted</Badge>
                          )}
                          {attempt.status === 'EVALUATED' && (
                            <Badge variant="success" size="sm">Evaluated</Badge>
                          )}
                          {attempt.status === 'TIMED_OUT' && (
                            <Badge variant="danger" size="sm">Timed Out</Badge>
                          )}
                          {attempt.status === 'CANCELLED' && (
                            <Badge variant="neutral" size="sm">Cancelled</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {new Date(attempt.startTime).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {attempt.submittedTime ? (
                            <span className="text-emerald-700 font-medium">
                              {new Date(attempt.submittedTime).toLocaleString()}
                            </span>
                          ) : attempt.expiryTime ? (
                            <span className="text-amber-700">
                              Expires: {new Date(attempt.expiryTime).toLocaleTimeString()}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {page + 1} of {totalPages}
                </span>
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
