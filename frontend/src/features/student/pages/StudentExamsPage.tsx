import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  RotateCw,
  Search,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { studentService } from '../services/studentService'
import type { StudentExamResponse } from '@/types/exam'

export const StudentExamsPage: React.FC = () => {
  const [exams, setExams] = useState<StudentExamResponse[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    studentService
      .getAvailableExams({ page, size: pageSize })
      .then((response) => {
        setExams(response.content)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve available examinations'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [page, pageSize])

  const refreshExams = () => {
    setIsLoading(true)
    setError(null)
    studentService
      .getAvailableExams({ page, size: pageSize })
      .then((response) => {
        setExams(response.content)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve available examinations'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Available Examinations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Active and upcoming academic testing sessions within your scheduled enrollment windows.
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
          <Alert variant="error" title="Error Loading Examinations">
            {error}
          </Alert>
        )}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <Input
              label="Search Available Exams"
              placeholder="Filter by subject or exam title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </CardContent>
        </Card>

        {/* Exams Grid */}
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
                  title="No examinations currently available"
                  description="There are currently no active testing sessions scheduled for your account."
                />
              </CardContent>
            </Card>
          ) : (
            filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:border-blue-300 transition-all">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="primary" size="sm">{exam.courseName}</Badge>
                        <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                        {exam.canAttempt ? (
                          <Badge variant="success" size="sm" dot>Open Now</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Scheduled</Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {exam.description || 'Standard examination parameters configured by the instructor.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
                        <span><strong>{exam.questionCount}</strong> questions</span>
                        <span>•</span>
                        <span><strong>{exam.totalMarks}</strong> marks</span>
                        <span>•</span>
                        <span><strong>{exam.durationMinutes}</strong> mins duration</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          Closes: {new Date(exam.endTime).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link to={`/student/exams/${exam.id}`}>
                        <Button
                          variant={exam.canAttempt ? 'primary' : 'outline'}
                          size="md"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          {exam.canAttempt ? 'Enter Exam Portal' : 'View Instructions'}
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
      </div>
    </DashboardLayout>
  )
}
