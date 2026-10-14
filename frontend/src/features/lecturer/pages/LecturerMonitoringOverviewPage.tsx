import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Video, Calendar, ArrowRight, RotateCw, Activity, Search } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { lecturerService } from '@/features/lecturer/services/lecturerService'
import type { ExamResponse } from '@/types/exam'

export const LecturerMonitoringOverviewPage: React.FC = () => {
  const [exams, setExams] = useState<ExamResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime] = useState(() => Date.now())

  useEffect(() => {
    lecturerService
      .getExams({ page: 0, size: 50 })
      .then((res) => {
        setExams(res.content)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examinations'
        setError(msg)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const refreshExams = () => {
    setIsLoading(true)
    setError(null)
    lecturerService
      .getExams({ page: 0, size: 50 })
      .then((res) => {
        setExams(res.content)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examinations'
        setError(msg)
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-600" />
              Live Proctoring & Telemetry Console
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select an ongoing or scheduled examination to monitor live candidate feeds, track browser events, and audit flagged incidents.
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

        {/* Filter / Search Card */}
        <Card>
          <CardContent className="pt-6">
            <Input
              label="Search Examination Registry"
              placeholder="Filter by subject or exam title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </CardContent>
        </Card>

        {/* Exam Sessions List */}
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
                  icon={<Video className="h-10 w-10 text-slate-400" />}
                  title="No examinations available for proctoring"
                  description="When you create and publish examinations, live monitoring consoles will appear here."
                />
              </CardContent>
            </Card>
          ) : (
            filteredExams.map((exam) => {
              const now = currentTime
              const start = new Date(exam.startTime).getTime()
              const end = new Date(exam.endTime).getTime()
              const isLiveWindow = now >= start && now <= end && exam.status === 'PUBLISHED'

              return (
                <Card
                  key={exam.id}
                  className={`transition-all hover:border-blue-300 ${
                    isLiveWindow ? 'border-emerald-300 bg-emerald-50/10' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="primary" size="sm">
                            {exam.courseName}
                          </Badge>
                          <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                          {isLiveWindow ? (
                            <Badge variant="success" size="sm" dot>
                              Testing Window Live
                            </Badge>
                          ) : exam.status === 'PUBLISHED' ? (
                            <Badge variant="neutral" size="sm">
                              Scheduled
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              {exam.status}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(exam.startTime).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            Window: {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —{' '}
                            {new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>
                            Duration: <strong>{exam.durationMinutes}</strong> mins
                          </span>
                          <span>•</span>
                          <span>
                            Questions: <strong>{exam.questionCount}</strong> items
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <Link to={`/lecturer/monitoring/${exam.id}`}>
                          <Button
                            variant={isLiveWindow ? 'primary' : 'outline'}
                            size="md"
                            leftIcon={<Activity className="h-4 w-4" />}
                            rightIcon={<ArrowRight className="h-4 w-4" />}
                          >
                            Open Live Console
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
