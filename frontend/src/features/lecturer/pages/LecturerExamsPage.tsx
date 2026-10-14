import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  PlusCircle,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileQuestion,
  Users,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { lecturerService } from '../services/lecturerService'
import type { ExamResponse, ExamStatus } from '@/types/exam'

export const LecturerExamsPage: React.FC = () => {
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
    return lecturerService.getExams({
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
          setError(err instanceof Error ? err.message : 'Failed to retrieve your examinations')
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
        setError(err instanceof Error ? err.message : 'Failed to retrieve your examinations')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const filteredExams = exams.filter((e) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return e.title.toLowerCase().includes(q) || e.courseName.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Exam Repository</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse, author questions, adjust schedules, and inspect results for your authored examinations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshExams}
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
          <Alert variant="error" title="Error Loading Examinations">
            {error}
          </Alert>
        )}

        {/* Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Search Examinations"
                placeholder="Search by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Lifecycle State</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Examinations ({totalElements})</option>
                  <option value="DRAFT">Drafts (In Preparation)</option>
                  <option value="PUBLISHED">Published (Active)</option>
                  <option value="ARCHIVED">Archived (Closed)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exams List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : filteredExams.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <EmptyState
                  icon={<BookOpen className="h-10 w-10 text-slate-400" />}
                  title="No examinations found"
                  description="You have not created any examinations matching your filters."
                  action={
                    <Link to="/lecturer/exams/new">
                      <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                        Draft New Examination
                      </Button>
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:border-slate-300 transition-all">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                        {exam.status === 'PUBLISHED' && (
                          <Badge variant="success" size="sm" dot>Published</Badge>
                        )}
                        {exam.status === 'DRAFT' && (
                          <Badge variant="warning" size="sm">Draft</Badge>
                        )}
                        {exam.status === 'ARCHIVED' && (
                          <Badge variant="neutral" size="sm">Archived</Badge>
                        )}
                        <Badge variant="primary" size="sm">{exam.courseName}</Badge>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {exam.description || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
                        <span>
                          <strong className="text-slate-900">{exam.questionCount}</strong> questions (
                          {exam.totalMarks} marks)
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-slate-900">{exam.durationMinutes}</strong> mins duration
                        </span>
                        <span>•</span>
                        <span>
                          Pass mark: <strong className="text-slate-900">{exam.passingMarks}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(exam.startTime).toLocaleDateString()} —{' '}
                          {new Date(exam.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <Link to={`/lecturer/exams/${exam.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                          Overview
                        </Button>
                      </Link>
                      <Link to={`/lecturer/exams/${exam.id}/questions`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<FileQuestion className="h-3.5 w-3.5" />}
                        >
                          Questions ({exam.questionCount})
                        </Button>
                      </Link>
                      <Link to={`/lecturer/exams/${exam.id}/attempts`}>
                        <Button variant="outline" size="sm" leftIcon={<Users className="h-3.5 w-3.5" />}>
                          Attempts
                        </Button>
                      </Link>
                      <Link to={`/lecturer/exams/${exam.id}/analytics`}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<BarChart3 className="h-3.5 w-3.5" />}
                        >
                          Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>
              Page {page + 1} of {totalPages} ({totalElements} total)
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
      </div>
    </DashboardLayout>
  )
}
