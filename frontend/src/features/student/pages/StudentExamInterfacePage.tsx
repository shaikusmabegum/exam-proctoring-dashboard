import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/feedback/Modal'
import { Spinner } from '@/components/feedback/Spinner'
import { PageLoader } from '@/components/feedback/PageLoader'
import { useToast } from '@/hooks/useToast'
import { studentService } from '../services/studentService'
import { useProctoringSession } from '@/features/proctoring/hooks/useProctoringSession'
import type { ExamAttemptResponse, StudentAnswer } from '@/types/attempt'
import type { StudentQuestionResponse } from '@/types/exam'
import { cn } from '@/lib/utils/cn'

export const StudentExamInterfacePage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [attempt, setAttempt] = useState<ExamAttemptResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Current question index in array (0-indexed)
  const [currentIndex, setCurrentIndex] = useState(0)

  // In-memory answer state map: questionId -> StudentAnswer
  const [localAnswers, setLocalAnswers] = useState<Record<string, StudentAnswer>>({})

  // Save status: 'saved' | 'saving' | 'error'
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  // Authoritative countdown timer (seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mobile navigation drawer
  const [navDrawerOpen, setNavDrawerOpen] = useState(false)

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Automated Proctoring Session Management & Heartbeat
  const { session, heartbeatHealthy, reportEvent, completeSession } = useProctoringSession({
    attemptId,
    autoStart: true,
  })

  // Telemetry Event Listeners: Tab visibility, Fullscreen changes, Network status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void reportEvent('TAB_VISIBILITY_CHANGED', { state: 'hidden' })
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        void reportEvent('FULLSCREEN_EXITED', { timestamp: Date.now() })
      }
    }

    const handleOnline = () => {
      void reportEvent('NETWORK_RESTORED')
    }

    const handleOffline = () => {
      void reportEvent('NETWORK_INTERRUPTED')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [reportEvent])

  // Declare auto-submit before effects to prevent immutability access warnings
  const handleAutoSubmitTimeout = useCallback(async () => {
    if (!attemptId || isSubmitting) return
    setIsSubmitting(true)
    try {
      void completeSession()
      await studentService.submitAttempt(attemptId, 'TIMER_EXPIRY')
      showToastSuccess('Examination time expired. Your answers have been automatically submitted.')
      navigate(`/student/attempts/${attemptId}/result`, { replace: true })
    } catch {
      showToastError('Time expired. Redirecting to submission status...')
      navigate(`/student/attempts/${attemptId}/result`, { replace: true })
    }
  }, [attemptId, isSubmitting, completeSession, navigate, showToastSuccess, showToastError])

  // Load attempt on mount without synchronous setState in effect
  useEffect(() => {
    if (!attemptId) return
    let isMounted = true

    studentService
      .getAttempt(attemptId)
      .then((data) => {
        if (!isMounted) return
        setAttempt(data)

        if (data.answers) {
          setLocalAnswers(data.answers)
        }

        if (data.expiryTime) {
          const expiry = new Date(data.expiryTime).getTime()
          const now = Date.now()
          const diffSeconds = Math.max(0, Math.floor((expiry - now) / 1000))
          setSecondsRemaining(diffSeconds)
        } else {
          setSecondsRemaining(data.remainingSeconds || 0)
        }

        if (data.status !== 'IN_PROGRESS') {
          navigate(`/student/attempts/${attemptId}/result`, { replace: true })
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve examination attempt')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [attemptId, navigate])

  // Countdown timer tick effect
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0) return

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          void handleAutoSubmitTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [secondsRemaining, handleAutoSubmitTimeout])

  // Persist an answer to backend with debouncing
  const persistAnswer = useCallback(
    async (qId: string, answer: Partial<StudentAnswer>) => {
      if (!attemptId) return
      setSaveStatus('saving')
      try {
        const payload = {
          questionId: qId,
          selectedOptionIds: answer.selectedOptionIds || [],
          textAnswer: answer.textAnswer || '',
        }
        await studentService.saveAnswer(attemptId, payload)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    },
    [attemptId]
  )

  const handleUpdateAnswer = useCallback(
    (qId: string, update: { selectedOptionIds?: string[]; textAnswer?: string }) => {
      const savedTimestamp = new Date().toISOString()
      setLocalAnswers((prev) => {
        const current = prev[qId] || { questionId: qId }
        const updated: StudentAnswer = {
          ...current,
          ...update,
          lastSavedAt: savedTimestamp,
        }

        if (autosaveTimeoutRef.current) {
          clearTimeout(autosaveTimeoutRef.current)
        }

        setSaveStatus('saving')
        autosaveTimeoutRef.current = setTimeout(() => {
          void persistAnswer(qId, updated)
        }, 600)

        return {
          ...prev,
          [qId]: updated,
        }
      })
    },
    [persistAnswer]
  )

  const handleManualSubmit = async () => {
    if (!attemptId || isSubmitting) return
    setIsSubmitting(true)
    try {
      void completeSession()
      await studentService.submitAttempt(attemptId, 'MANUAL_SUBMISSION')
      showToastSuccess('Examination submitted successfully! Evaluating answers...')
      navigate(`/student/attempts/${attemptId}/result`, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.'
      showToastError(msg)
      setIsSubmitting(false)
    }
  }

  // Format seconds into HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const questions: StudentQuestionResponse[] = attempt?.questions || []
  const currentQuestion: StudentQuestionResponse | undefined = questions[currentIndex]

  // Answered questions check
  const isQuestionAnswered = (qId: string) => {
    const ans = localAnswers[qId]
    if (!ans) return false
    if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) return true
    if (ans.textAnswer && ans.textAnswer.trim().length > 0) return true
    return false
  }

  const answeredCount = questions.filter((q) => isQuestionAnswered(q.id)).length
  const unansweredCount = questions.length - answeredCount

  if (isLoading) {
    return <PageLoader message="Loading examination environment and authoritative timer..." />
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Failed to Launch Examination</h2>
          <p className="text-xs text-slate-300">{error || 'Attempt session could not be established.'}</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/dashboard')}>
            Return to Student Portal
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 select-none">
      {/* Top Authoritative Exam Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg"
              onClick={() => setNavDrawerOpen(true)}
              aria-label="Open question navigator"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {attempt.examTitle}
              </h1>
              <p className="text-2xs text-slate-400 font-mono">Attempt #{attempt.attemptNumber}</p>
            </div>
          </div>

          {/* Center / Right: Live Countdown Timer, Proctoring Pill & Save Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Proctoring Status Pill */}
            {session && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    heartbeatHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  )}
                />
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden lg:inline">Proctored Session</span>
              </div>
            )}
            {/* Save Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-amber-400 animate-pulse">
                  <Spinner size="sm" className="h-3 w-3 text-amber-400" />
                  Saving...
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Save error
                </span>
              )}
            </div>

            {/* Authoritative Countdown Clock */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm tracking-wider shadow-inner',
                (secondsRemaining ?? 0) < 300
                  ? 'bg-red-950/80 text-red-400 border border-red-800 animate-pulse'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              )}
            >
              <Clock className="h-4 w-4 shrink-0 text-blue-400" />
              <span>{secondsRemaining !== null ? formatTimer(secondsRemaining) : '--:--'}</span>
            </div>

            {/* Direct Submit CTA */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSubmitModal(true)}
              leftIcon={<Send className="h-3.5 w-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-700 border-none"
            >
              <span className="hidden sm:inline">Finish &</span> Submit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6 overflow-hidden">
        {/* Left: Question Navigation Sidebar (Desktop & Mobile Drawer) */}
        {navDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 lg:hidden"
            onClick={() => setNavDrawerOpen(false)}
          />
        )}

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-4 flex flex-col transition-transform lg:static lg:w-72 lg:rounded-2xl lg:border lg:shadow-xs lg:translate-x-0',
            navDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Question Navigator</h3>
            <button
              type="button"
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
              onClick={() => setNavDrawerOpen(false)}
              aria-label="Close question navigator"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-500 flex justify-between border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {answeredCount} Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              {unansweredCount} Unanswered
            </span>
          </div>

          {/* Grid of question buttons */}
          <div className="flex-1 overflow-y-auto py-4 grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const answered = isQuestionAnswered(q.id)
              const isCurrent = idx === currentIndex

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx)
                    setNavDrawerOpen(false)
                  }}
                  className={cn(
                    'h-10 w-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center border',
                    isCurrent
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs scale-105'
                      : answered
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                  aria-label={`Jump to question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowSubmitModal(true)}
            >
              Review & Submit
            </Button>
          </div>
        </aside>

        {/* Center: Current Question Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {currentQuestion ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col p-6 sm:p-8">
              {/* Question Metadata Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    Question {currentIndex + 1} of {questions.length}
                  </Badge>
                  <span className="text-slate-500">
                    Worth <strong>{currentQuestion.marks}</strong> {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                  </span>
                  {currentQuestion.negativeMarks > 0 && (
                    <Badge variant="danger" size="sm">
                      -{currentQuestion.negativeMarks} penalty
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  {isQuestionAnswered(currentQuestion.id) ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Answered
                    </span>
                  ) : (
                    'Not yet answered'
                  )}
                </div>
              </div>

              {/* Question Prompt */}
              <div className="py-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Answer Controls based on Type */}
              <div className="flex-1 space-y-3">
                {/* Single Choice / True False: Radio Options */}
                {(currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE') && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((opt) => {
                      const selected =
                        localAnswers[currentQuestion.id]?.selectedOptionIds?.includes(opt.id) || false

                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                            selected
                              ? 'border-blue-500 bg-blue-50/70 text-slate-900 font-medium ring-1 ring-blue-500 shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                          )}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            checked={selected}
                            onChange={() =>
                              handleUpdateAnswer(currentQuestion.id, {
                                selectedOptionIds: [opt.id],
                              })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span className="text-sm leading-relaxed">{opt.text}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* Multiple Choice: Checkboxes */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 italic">Select all options that apply.</p>
                    {currentQuestion.options.map((opt) => {
                      const selectedIds = localAnswers[currentQuestion.id]?.selectedOptionIds || []
                      const selected = selectedIds.includes(opt.id)

                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                            selected
                              ? 'border-blue-500 bg-blue-50/70 text-slate-900 font-medium ring-1 ring-blue-500 shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              const nextIds = selected
                                ? selectedIds.filter((id) => id !== opt.id)
                                : [...selectedIds, opt.id]
                              handleUpdateAnswer(currentQuestion.id, {
                                selectedOptionIds: nextIds,
                              })
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <span className="text-sm leading-relaxed">{opt.text}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* Short Answer: Textarea */}
                {currentQuestion.type === 'SHORT_ANSWER' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Your Written Response:
                    </label>
                    <textarea
                      rows={5}
                      value={localAnswers[currentQuestion.id]?.textAnswer || ''}
                      onChange={(e) =>
                        handleUpdateAnswer(currentQuestion.id, {
                          textAnswer: e.target.value,
                        })
                      }
                      placeholder="Type your complete written answer here..."
                      className="w-full p-4 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
                <Button
                  variant="outline"
                  size="md"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous Question
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowSubmitModal(true)}
                    leftIcon={<Send className="h-4 w-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Review & Final Submission
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No questions available in this attempt.</div>
          )}
        </main>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowSubmitModal(false)}
          title="Submit Final Examination?"
        >
          <div className="space-y-4 text-sm text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Total Questions:</span>
                <strong>{questions.length}</strong>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Answered Questions:</span>
                <span>{answeredCount}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-700 font-semibold">
                <span>Unanswered Questions:</span>
                <span>{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You still have <strong>{unansweredCount} unanswered questions</strong>. You can return
                  to review them or proceed to finalize.
                </span>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Once submitted, your responses are finalized and evaluated by the server. You will not be
              able to re-enter this examination attempt.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowSubmitModal(false)}>
                Return to Exam
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleManualSubmit}
                leftIcon={<Send className="h-3.5 w-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm Final Submission
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
