import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Play,
  Lock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Modal } from '@/components/feedback/Modal'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/hooks/useToast'
import { studentService } from '../services/studentService'
import type { StudentExamResponse } from '@/types/exam'

export const StudentExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [exam, setExam] = useState<StudentExamResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Start exam confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isStartingAttempt, setIsStartingAttempt] = useState(false)

  useEffect(() => {
    if (!examId) return
    studentService
      .getExamById(examId)
      .then((data) => setExam(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination instructions'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [examId])

  const handleStartAttempt = async () => {
    if (!examId) return
    setIsStartingAttempt(true)
    try {
      const attempt = await studentService.startOrResumeAttempt(examId)
      showToastSuccess('Examination session initialized! Timer is running.')
      setShowConfirmModal(false)
      navigate(`/student/attempts/${attempt.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate examination attempt'
      showToastError(msg)
    } finally {
      setIsStartingAttempt(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link to="/student/exams">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Available Exams
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoading ? <Skeleton className="h-8 w-48" /> : exam?.title}
            </h1>
            <p className="text-xs text-slate-500">{exam?.courseName}</p>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Exam Instructions">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : exam ? (
          <div className="space-y-6">
            {/* Eligibility Banner if cannot attempt */}
            {!exam.canAttempt && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Examination Window Closed or Ineligible</h4>
                  <p className="text-xs mt-1">
                    {exam.attemptStatusMessage ||
                      'This examination cannot be entered currently. Please check the scheduled window.'}
                  </p>
                </div>
              </div>
            )}

            {/* Exam Parameters Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Examination Structure & Parameters</span>
                  <Badge variant={exam.canAttempt ? 'success' : 'neutral'} size="sm" dot={exam.canAttempt}>
                    {exam.canAttempt ? 'Active Session Window' : 'Scheduled'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">Duration</span>
                    <strong className="text-slate-900 text-base">{exam.durationMinutes} mins</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">Total Marks</span>
                    <strong className="text-slate-900 text-base">{exam.totalMarks} points</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">Pass Threshold</span>
                    <strong className="text-slate-900 text-base">{exam.passingMarks} points</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">Questions</span>
                    <strong className="text-slate-900 text-base">{exam.questionCount} items</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-slate-500 block">Testing Schedule Window</span>
                    <strong className="text-slate-800">
                      {new Date(exam.startTime).toLocaleString()} —{' '}
                      {new Date(exam.endTime).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Maximum Allowed Attempts</span>
                    <strong className="text-slate-800">{exam.maxAttempts} attempt limit</strong>
                  </div>
                </div>

                {exam.negativeMarking && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                    <strong>Negative Marking Enabled:</strong> An incorrect answer carries a penalty of{' '}
                    <strong>-{exam.negativeMarksPerQuestion} marks</strong>. Unanswered questions do not
                    incur penalties.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Candidate Instructions & Academic Integrity Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-line text-xs font-mono">
                  {exam.instructions || 'Standard academic examination guidelines apply.'}
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <p className="font-semibold text-slate-900">Security & Proctoring Environment Rules:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Once you initiate this examination, the authoritative server countdown begins immediately.</li>
                    <li>Answers are autosaved continuously in real-time.</li>
                    <li>Tab switching, window resizing, and background applications are monitored.</li>
                    <li>Ensure you click "Submit Examination" prior to timer expiry.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-slate-50 border-t border-slate-200">
                <Link to="/student/exams">
                  <Button variant="outline" size="sm">
                    Return to Exam List
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  size="md"
                  disabled={!exam.canAttempt}
                  onClick={() => navigate(`/student/exams/${exam.id}/pre-check`)}
                  leftIcon={<Play className="h-4 w-4" />}
                >
                  Proceed to Device Readiness Check →
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : null}

        {/* Start Attempt Confirmation Modal */}
        {showConfirmModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowConfirmModal(false)}
            title="Confirm Examination Start"
          >
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs">
                <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Authoritative Server Countdown</p>
                  <p className="mt-1">
                    You have <strong>{exam?.durationMinutes} minutes</strong> to complete{' '}
                    <strong>{exam?.questionCount} questions</strong>. Closing the window or refreshing
                    will NOT pause the server timer.
                  </p>
                </div>
              </div>

              <p className="text-xs">
                Ensure you have verified your webcam feed and reviewed the academic integrity code
                before starting your timer.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/student/exams/${exam?.id}/pre-check`)}
                >
                  Verify Devices First
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isStartingAttempt}
                  onClick={handleStartAttempt}
                  leftIcon={<Play className="h-3.5 w-3.5" />}
                >
                  Begin Examination Now
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
