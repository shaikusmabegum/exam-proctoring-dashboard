import React, { useEffect, useState, useCallback } from 'react'
import {
  BookOpen,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { adminService } from '../services/adminService'
import type { ExamResponse, ExamStatus } from '@/types/exam'

export const AdminExamsPage: React.FC = () => {
  const [exams, setExams] = useState<ExamResponse[]>([])
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [page, setPage] = useState<number>(0)
  const [pageSize] = useState<number>(10)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExams = useCallback(async () => {
    const statusParam = statusFilter ? (statusFilter as ExamStatus) : undefined
    return adminService.getAllExams({
      status: statusParam,
      page,
      size: pageSize,
    })
  }, [page, pageSize, statusFilter])

  useEffect(() => {
    let isMounted = true
    fetchExams()
      .then((response) => {
        if (!isMounted) return
        setExams(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve system examinations')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [fetchExams])

  const refreshExams = () => {
    setIsLoading(true)
    setError(null)
    fetchExams()
      .then((response) => {
        setExams(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to retrieve system examinations')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const filteredExams = exams.filter((e) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      e.title.toLowerCase().includes(q) ||
      e.courseName.toLowerCase().includes(q) ||
      (e.lecturerName && e.lecturerName.toLowerCase().includes(q))
    )
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Exams Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit all examination configurations, schedules, and active publication states across departments.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshExams}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Exams">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Search Examination"
                placeholder="Filter by title, course, or lecturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Lifecycle Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses (Global)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              All Examinations ({totalElements} total records)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<BookOpen className="h-8 w-8 text-slate-400" />}
                  title="No examinations found"
                  description="No examinations match the applied filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Exam & Course</th>
                      <th className="py-3 px-4">Lecturer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Questions / Marks</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Schedule Window</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-semibold text-slate-900">{exam.title}</p>
                            <p className="text-xs text-slate-500">{exam.courseName}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                          {exam.lecturerName || 'Unknown Instructor'}
                        </td>
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
                          <span className="font-semibold text-slate-900">{exam.questionCount}</span> items ({exam.totalMarks} marks)
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {exam.durationMinutes} minutes
                        </td>
                        <td className="py-3.5 px-4 text-2xs text-slate-500 font-mono">
                          <div>Starts: {new Date(exam.startTime).toLocaleString()}</div>
                          <div>Ends: {new Date(exam.endTime).toLocaleString()}</div>
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
