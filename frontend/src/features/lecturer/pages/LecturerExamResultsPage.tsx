import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  RotateCw,
  Share2,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useToast } from '@/hooks/useToast'
import { lecturerService } from '../services/lecturerService'
import type { ExamResponse } from '@/types/exam'
import type { ExamAttemptResponse } from '@/types/attempt'

export const LecturerExamResultsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [exam, setExam] = useState<ExamResponse | null>(null)
  const [attempts, setAttempts] = useState<ExamAttemptResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTogglingRelease, setIsTogglingRelease] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!examId) return
    Promise.all([
      lecturerService.getExamById(examId),
      lecturerService.getExamAttempts(examId, { page: 0, size: 50 }),
    ])
      .then(([examData, attemptsData]) => {
        setExam(examData)
        setAttempts(attemptsData.content)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination results'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [examId])

  const refreshData = () => {
    if (!examId) return
    setIsLoading(true)
    setError(null)
    Promise.all([
      lecturerService.getExamById(examId),
      lecturerService.getExamAttempts(examId, { page: 0, size: 50 }),
    ])
      .then(([examData, attemptsData]) => {
        setExam(examData)
        setAttempts(attemptsData.content)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination results'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }

  const handleToggleRelease = async () => {
    if (!examId || !exam) return
    setIsTogglingRelease(true)
    try {
      const target = !exam.resultsPublished
      const updated = await lecturerService.toggleResultsRelease(examId, target)
      setExam(updated)
      showToastSuccess(
        target
          ? 'Examination results & answer breakdown released to students!'
          : 'Examination results are now hidden from students.'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle results release'
      showToastError(msg)
    } finally {
      setIsTogglingRelease(false)
    }
  }

  const completedAttempts = attempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'EVALUATED')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/lecturer/exams/${examId}`}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Exam
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Results</h1>
              <p className="text-xs text-slate-500">{exam?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              isLoading={isLoading}
              leftIcon={<RotateCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
            {exam && (
              <Button
                variant={exam.resultsPublished ? 'outline' : 'primary'}
                size="sm"
                onClick={handleToggleRelease}
                isLoading={isTogglingRelease}
                leftIcon={exam.resultsPublished ? <Lock className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              >
                {exam.resultsPublished ? 'Hide Student Results' : 'Release Results to Students'}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Results">
            {error}
          </Alert>
        )}

        {/* Release Status Banner */}
        {exam && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
              exam.resultsPublished
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {exam.resultsPublished ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <Lock className="h-5 w-5 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {exam.resultsPublished ? 'Results are Publicly Released' : 'Results are Private'}
                </p>
                <p className="opacity-90">
                  {exam.resultsPublished
                    ? 'Students can now review their scores, individual question responses, and correct answer rationales.'
                    : 'Students currently see that their submission is under instructor review. Click "Release Results to Students" to publish.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              Submitted Examinations ({completedAttempts.length} completed)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : completedAttempts.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Award className="h-8 w-8 text-slate-400" />}
                  title="No completed submissions"
                  description="When students submit their examinations, their evaluation states will appear here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Attempt #</th>
                      <th className="py-3 px-4">Submission Status</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Pass / Fail Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-900">
                          {att.studentId}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                          Attempt #{att.attemptNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="success" size="sm">
                            {att.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {att.submittedTime ? new Date(att.submittedTime).toLocaleString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          Pass criteria: {exam?.passingMarks} / {exam?.totalMarks} marks
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
