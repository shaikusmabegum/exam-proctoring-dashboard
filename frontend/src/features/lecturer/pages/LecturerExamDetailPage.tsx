import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileQuestion,
  Users,
  BarChart3,
  CheckCircle2,
  Archive,
  Share2,
  Lock,
  RotateCw,
  Award,
  AlertTriangle,
  Clock,
  Sliders,
  RotateCcw,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Modal } from '@/components/feedback/Modal'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/lib/api/apiErrors'
import { lecturerService } from '../services/lecturerService'
import type { ExamResponse, ExamUpdateRequest } from '@/types/exam'

export const LecturerExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [exam, setExam] = useState<ExamResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals for lifecycle actions
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showUnpublishModal, setShowUnpublishModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showEditSettingsModal, setShowEditSettingsModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Edit Settings form state
  const [editForm, setEditForm] = useState({
    title: '',
    courseName: '',
    description: '',
    instructions: '',
    durationMinutes: 60,
    passingMarks: 40,
    startTime: '',
    endTime: '',
    randomizeQuestions: false,
    negativeMarking: false,
    negativeMarksPerQuestion: 0,
    maxAttempts: 1,
  })

  useEffect(() => {
    if (!examId) return
    let isMounted = true
    lecturerService
      .getExamById(examId)
      .then((data) => {
        if (isMounted) setExam(data)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(getErrorMessage(err, 'Failed to retrieve examination details'))
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [examId])

  const refreshExam = () => {
    if (!examId) return
    setIsLoading(true)
    setError(null)
    lecturerService
      .getExamById(examId)
      .then(setExam)
      .catch((err: unknown) => {
        setError(getErrorMessage(err, 'Failed to retrieve examination details'))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const openEditSettingsModal = () => {
    if (!exam) return
    const formatToLocalDatetime = (isoStr: string) => {
      try {
        const d = new Date(isoStr)
        const offset = d.getTimezoneOffset() * 60000
        return new Date(d.getTime() - offset).toISOString().slice(0, 16)
      } catch {
        return ''
      }
    }

    setEditForm({
      title: exam.title || '',
      courseName: exam.courseName || '',
      description: exam.description || '',
      instructions: exam.instructions || '',
      durationMinutes: exam.durationMinutes || 60,
      passingMarks: exam.passingMarks || 0,
      startTime: formatToLocalDatetime(exam.startTime),
      endTime: formatToLocalDatetime(exam.endTime),
      randomizeQuestions: !!exam.randomizeQuestions,
      negativeMarking: !!exam.negativeMarking,
      negativeMarksPerQuestion: exam.negativeMarksPerQuestion || 0,
      maxAttempts: exam.maxAttempts || 1,
    })
    setShowEditSettingsModal(true)
  }

  const handleSaveSettings = async () => {
    if (!examId) return
    if (!editForm.title.trim()) {
      showToastError('Exam title is required.')
      return
    }
    if (!editForm.courseName.trim()) {
      showToastError('Course name is required.')
      return
    }
    if (editForm.durationMinutes < 5) {
      showToastError('Duration must be at least 5 minutes.')
      return
    }
    if (editForm.passingMarks < 0) {
      showToastError('Passing marks cannot be negative.')
      return
    }
    if (!editForm.startTime || !editForm.endTime) {
      showToastError('Start time and end time are required.')
      return
    }
    const start = new Date(editForm.startTime)
    const end = new Date(editForm.endTime)
    if (start >= end) {
      showToastError('Scheduled end time must be after start time.')
      return
    }

    if (exam && exam.status === 'PUBLISHED' && exam.totalMarks > 0 && editForm.passingMarks > exam.totalMarks) {
      showToastError(
        `Passing marks (${editForm.passingMarks}) cannot exceed total exam marks (${exam.totalMarks}) for an active published examination.`
      )
      return
    }

    setIsProcessing(true)
    try {
      const payload: ExamUpdateRequest = {
        title: editForm.title.trim(),
        courseName: editForm.courseName.trim(),
        description: editForm.description.trim() || undefined,
        instructions: editForm.instructions.trim() || undefined,
        durationMinutes: editForm.durationMinutes,
        passingMarks: editForm.passingMarks,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        randomizeQuestions: editForm.randomizeQuestions,
        negativeMarking: editForm.negativeMarking,
        negativeMarksPerQuestion: editForm.negativeMarking ? editForm.negativeMarksPerQuestion : 0,
        maxAttempts: editForm.maxAttempts,
      }
      const updated = await lecturerService.updateExam(examId, payload)
      setExam(updated)
      showToastSuccess('Examination settings updated successfully!')
      setShowEditSettingsModal(false)
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to update examination settings')
      showToastError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!examId) return
    setIsProcessing(true)
    try {
      const updated = await lecturerService.unpublishExam(examId)
      setExam(updated)
      showToastSuccess('Examination reverted to Draft mode successfully!')
      setShowUnpublishModal(false)
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to unpublish examination')
      showToastError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublish = async () => {
    if (!examId || !exam) return

    if (!exam.questionCount || exam.questionCount === 0) {
      showToastError('Cannot publish an examination with no questions.')
      return
    }

    if (exam.passingMarks > exam.totalMarks) {
      showToastError(
        `Passing marks threshold (${exam.passingMarks} marks) cannot exceed total exam marks (${exam.totalMarks} marks). Please adjust passing marks or add more questions.`
      )
      return
    }

    setIsProcessing(true)
    try {
      const updated = await lecturerService.publishExam(examId)
      setExam(updated)
      showToastSuccess('Examination published! Students can now see and attempt it during schedule window.')
      setShowPublishModal(false)
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to publish examination')
      showToastError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleArchive = async () => {
    if (!examId) return
    setIsProcessing(true)
    try {
      const updated = await lecturerService.archiveExam(examId)
      setExam(updated)
      showToastSuccess('Examination archived and closed to further attempts.')
      setShowArchiveModal(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to archive examination'
      showToastError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleResults = async () => {
    if (!examId || !exam) return
    setIsProcessing(true)
    try {
      const targetState = !exam.resultsPublished
      const updated = await lecturerService.toggleResultsRelease(examId, targetState)
      setExam(updated)
      showToastSuccess(
        targetState
          ? 'Results and detailed answer breakdown released to students!'
          : 'Results hidden from students.'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update result release state'
      showToastError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/lecturer/exams">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                All Exams
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {isLoading ? <Skeleton className="h-8 w-48" /> : exam?.title}
              </h1>
              <p className="text-xs text-slate-500">{exam?.courseName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshExam}
              isLoading={isLoading}
              leftIcon={<RotateCw className="h-4 w-4" />}
            >
              Refresh
            </Button>

            {exam?.status !== 'ARCHIVED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={openEditSettingsModal}
                leftIcon={<Sliders className="h-4 w-4" />}
              >
                Edit Settings
              </Button>
            )}

            {exam?.status === 'DRAFT' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowPublishModal(true)}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Publish Exam
              </Button>
            )}

            {exam?.status === 'PUBLISHED' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUnpublishModal(true)}
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                >
                  Revert to Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleResults}
                  isLoading={isProcessing}
                  leftIcon={exam.resultsPublished ? <Lock className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                >
                  {exam.resultsPublished ? 'Hide Results' : 'Release Results to Students'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchiveModal(true)}
                  leftIcon={<Archive className="h-4 w-4" />}
                >
                  Archive Exam
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Examination">
            {error}
          </Alert>
        )}

        {/* Quick Tabs Hub */}
        {exam && (
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <Link to={`/lecturer/exams/${exam.id}`}>
              <Button variant="primary" size="sm">
                Overview & Settings
              </Button>
            </Link>
            <Link to={`/lecturer/exams/${exam.id}/questions`}>
              <Button variant="outline" size="sm" leftIcon={<FileQuestion className="h-4 w-4" />}>
                Question Builder ({exam.questionCount})
              </Button>
            </Link>
            <Link to={`/lecturer/exams/${exam.id}/attempts`}>
              <Button variant="outline" size="sm" leftIcon={<Users className="h-4 w-4" />}>
                Student Attempts
              </Button>
            </Link>
            <Link to={`/lecturer/exams/${exam.id}/results`}>
              <Button variant="outline" size="sm" leftIcon={<Award className="h-4 w-4" />}>
                Student Results
              </Button>
            </Link>
            <Link to={`/lecturer/exams/${exam.id}/analytics`}>
              <Button variant="outline" size="sm" leftIcon={<BarChart3 className="h-4 w-4" />}>
                Performance Analytics
              </Button>
            </Link>
          </div>
        )}

        {/* Exam Overview Information */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : exam ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details & Instructions */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Examination Details</span>
                    <div className="flex items-center gap-2">
                      {exam.status === 'PUBLISHED' && (
                        <Badge variant="success" size="sm" dot>Published & Active</Badge>
                      )}
                      {exam.status === 'DRAFT' && (
                        <Badge variant="warning" size="sm">Draft Mode</Badge>
                      )}
                      {exam.status === 'ARCHIVED' && (
                        <Badge variant="neutral" size="sm">Archived (Closed)</Badge>
                      )}
                      {exam.status !== 'ARCHIVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={openEditSettingsModal}
                          leftIcon={<Sliders className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Description
                    </h4>
                    <p className="text-sm text-slate-700 mt-1">
                      {exam.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Student Instructions & Honor Code
                    </h4>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {exam.instructions || 'Standard examination rules apply.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500 block">Total Marks:</span>
                      <strong className="text-slate-900 text-base">{exam.totalMarks}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Passing Marks:</span>
                      <strong className="text-slate-900 text-base">{exam.passingMarks}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Questions:</span>
                      <strong className="text-slate-900 text-base">{exam.questionCount} items</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duration:</span>
                      <strong className="text-slate-900 text-base">{exam.durationMinutes} mins</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Quick Preview Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-blue-600" />
                    Question Bank Overview
                  </CardTitle>
                  <Link to={`/lecturer/exams/${exam.id}/questions`}>
                    <Button variant="secondary" size="sm">
                      Open Question Builder →
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">
                    This examination currently contains <strong>{exam.questionCount}</strong> questions worth{' '}
                    <strong>{exam.totalMarks}</strong> points total.
                  </p>
                  {exam.questionCount === 0 && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg text-amber-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        An exam must have at least 1 question before it can be published to students.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Timing & Settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Schedule Window
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Starts:</span>
                    <strong className="text-slate-900">
                      {new Date(exam.startTime).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ends:</span>
                    <strong className="text-slate-900">
                      {new Date(exam.endTime).toLocaleString()}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block">Maximum Attempts:</span>
                    <strong className="text-slate-900">{exam.maxAttempts} per student</strong>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Examination Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Question Randomization:</span>
                    <strong>{exam.randomizeQuestions ? 'Enabled' : 'Disabled'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Negative Marking:</span>
                    <strong>
                      {exam.negativeMarking ? `-${exam.negativeMarksPerQuestion} marks` : 'None'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Results Release Status:</span>
                    <strong className={exam.resultsPublished ? 'text-emerald-600' : 'text-slate-500'}>
                      {exam.resultsPublished ? 'Released to Students' : 'Hidden'}
                    </strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {/* Publish Confirmation Modal */}
        {/* Publish Confirmation Modal */}
        {showPublishModal && exam && (
          <Modal
            isOpen={true}
            onClose={() => setShowPublishModal(false)}
            title="Publish Examination?"
          >
            <div className="space-y-4 text-sm text-slate-600">
              <p>
                Publishing will validate that your examination contains questions and make it discoverable
                to enrolled students during its scheduled window:
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div>• Questions: {exam.questionCount} items</div>
                <div>• Total Marks: {exam.totalMarks} marks</div>
                <div
                  className={
                    exam.passingMarks > exam.totalMarks ? 'text-red-600 font-semibold' : ''
                  }
                >
                  • Passing Score Threshold: {exam.passingMarks} marks
                </div>
                <div>• Duration: {exam.durationMinutes} minutes</div>
              </div>

              {exam.questionCount === 0 && (
                <Alert variant="warning" title="No Questions">
                  An examination must have at least 1 question before it can be published.
                </Alert>
              )}

              {exam.passingMarks > exam.totalMarks && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>Passing Score Exceeds Total Marks</span>
                  </div>
                  <p>
                    Passing score ({exam.passingMarks} marks) exceeds total questions marks (
                    {exam.totalMarks} marks). Spring Boot requires passing marks to be &le; total marks
                    to publish.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs bg-white text-red-700 border-red-300 hover:bg-red-50"
                    onClick={() => {
                      setShowPublishModal(false)
                      openEditSettingsModal()
                    }}
                  >
                    Adjust Passing Marks to {exam.totalMarks} or Lower →
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowPublishModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isProcessing}
                  disabled={exam.questionCount === 0 || exam.passingMarks > exam.totalMarks}
                  onClick={handlePublish}
                >
                  Confirm Publication
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Settings Modal */}
        {showEditSettingsModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowEditSettingsModal(false)}
            title={
              exam?.status === 'PUBLISHED'
                ? 'Edit Published Examination Settings'
                : 'Edit Examination Settings & Passing Threshold'
            }
          >
            <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
              {exam?.status === 'PUBLISHED' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Active Published Examination</span>
                  </div>
                  <p>
                    This examination is currently visible to students. Live updates to schedule window,
                    duration, passing threshold, and instructions take effect immediately.
                  </p>
                </div>
              )}

              <Input
                label="Exam Title"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Midterm Examination"
              />

              <Input
                label="Course / Subject Code"
                value={editForm.courseName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, courseName: e.target.value }))}
                placeholder="e.g. CS201"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.5"
                  label="Passing Score Threshold (Marks)"
                  helperText={`Current question total: ${exam?.totalMarks ?? 0} marks`}
                  value={editForm.passingMarks}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, passingMarks: Number(e.target.value) }))
                  }
                />
                <Input
                  type="number"
                  label="Duration (Minutes)"
                  value={editForm.durationMinutes}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  label="Start Window"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, startTime: e.target.value }))}
                />
                <Input
                  type="datetime-local"
                  label="End Window"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Student Instructions
                </label>
                <textarea
                  rows={2}
                  value={editForm.instructions}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Security & Marking Rules */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-semibold text-slate-700">Security & Marking Rules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Maximum Allowed Attempts"
                    value={editForm.maxAttempts}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, maxAttempts: Number(e.target.value) }))
                    }
                  />
                  {editForm.negativeMarking && (
                    <Input
                      type="number"
                      step="0.25"
                      label="Negative Penalty per Question"
                      value={editForm.negativeMarksPerQuestion}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          negativeMarksPerQuestion: Number(e.target.value),
                        }))
                      }
                    />
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <Checkbox
                    label="Randomize Question Order"
                    helperText="Presents questions in randomized sequence for each examinee."
                    checked={editForm.randomizeQuestions}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, randomizeQuestions: e.target.checked }))
                    }
                  />
                  <Checkbox
                    label="Enable Negative Marking"
                    helperText="Applies penalty score for incorrect answers."
                    checked={editForm.negativeMarking}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, negativeMarking: e.target.checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setShowEditSettingsModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Unpublish Confirmation Modal */}
        {showUnpublishModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowUnpublishModal(false)}
            title="Revert to Draft Mode?"
          >
            <div className="space-y-4 text-sm text-slate-600">
              <p>
                Reverting this examination to <strong>Draft Mode</strong> will immediately make it hidden
                from enrolled students, allowing you to freely add, delete, or reorder questions.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>An examination can be reverted to Draft only if no student attempts have been submitted.</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowUnpublishModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={handleUnpublish}
                >
                  Confirm Revert to Draft
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Archive Confirmation Modal */}
        {showArchiveModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowArchiveModal(false)}
            title="Archive Examination?"
          >
            <div className="space-y-4 text-sm text-slate-600">
              <p>
                Archiving closes the examination to all students. No new attempts will be permitted. Past
                results and analytics will remain permanently accessible in your repository.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowArchiveModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={handleArchive}
                >
                  Confirm Archive
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
