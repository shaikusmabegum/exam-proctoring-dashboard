import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { studentService } from '../services/studentService'
import type { StudentResultResponse } from '@/types/attempt'

export const StudentResultsHistoryPage: React.FC = () => {
  const [results, setResults] = useState<StudentResultResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    studentService
      .getResults({ page, size: pageSize })
      .then((response) => {
        setResults(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination history'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [page, pageSize])

  const refreshResults = () => {
    setIsLoading(true)
    setError(null)
    studentService
      .getResults({ page, size: pageSize })
      .then((response) => {
        setResults(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination history'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Result History</h1>
            <p className="text-sm text-slate-500 mt-1">
              All completed examination submissions, marks awarded, pass/fail status, and score breakdowns.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshResults}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading History">
            {error}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Completed Examinations ({totalElements} recorded)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Award className="h-8 w-8 text-slate-400" />}
                  title="No examination records found"
                  description="You have not completed any examinations yet."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Examination</th>
                      <th className="py-3 px-4">Attempt #</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Raw Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Pass Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((res) => (
                      <tr key={res.attemptId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{res.examTitle}</td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          #{res.attemptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {new Date(res.submittedTime).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
                          {res.score} / {res.totalMarks}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-blue-600">
                          {res.percentage.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4">
                          {res.passed ? (
                            <Badge variant="success" size="sm">Passed</Badge>
                          ) : (
                            <Badge variant="danger" size="sm">Failed</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/student/attempts/${res.attemptId}/result`}>
                            <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                              View Report
                            </Button>
                          </Link>
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
