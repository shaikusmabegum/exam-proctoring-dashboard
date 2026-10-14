import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  PlusCircle,
  FileQuestion,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  RotateCw,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Modal } from '@/components/feedback/Modal'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/lib/api/apiErrors'
import { lecturerService } from '../services/lecturerService'
import type {
  ExamResponse,
  QuestionResponse,
  QuestionType,
  QuestionOptionRequest,
  QuestionCreateRequest,
} from '@/types/exam'

export const LecturerQuestionsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [exam, setExam] = useState<ExamResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Question Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Question Form State
  const [qText, setQText] = useState('')
  const [qType, setQType] = useState<QuestionType>('SINGLE_CHOICE')
  const [qMarks, setQMarks] = useState<number>(1)
  const [qNegativeMarks, setQNegativeMarks] = useState<number>(0)
  const [qExplanation, setQExplanation] = useState('')
  const [qShortAnswer, setQShortAnswer] = useState('')

  // Options state for single/multiple choice
  const [options, setOptions] = useState<Array<{ id?: string; text: string; isCorrect: boolean }>>([
    { id: '1', text: 'Option A', isCorrect: true },
    { id: '2', text: 'Option B', isCorrect: false },
    { id: '3', text: 'Option C', isCorrect: false },
    { id: '4', text: 'Option D', isCorrect: false },
  ])

  // Delete modal state
  const [questionToDelete, setQuestionToDelete] = useState<QuestionResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
          setError(err instanceof Error ? err.message : 'Failed to retrieve examination questions')
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
        setError(err instanceof Error ? err.message : 'Failed to retrieve examination questions')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const openAddModal = () => {
    setEditingQuestionId(null)
    setQText('')
    setQType('SINGLE_CHOICE')
    setQMarks(1)
    setQNegativeMarks(0)
    setQExplanation('')
    setQShortAnswer('')
    setOptions([
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false },
    ])
    setIsModalOpen(true)
  }

  const openEditModal = (q: QuestionResponse) => {
    setEditingQuestionId(q.id)
    setQText(q.questionText)
    setQType(q.type)
    setQMarks(q.marks)
    setQNegativeMarks(q.negativeMarks)
    setQExplanation(q.explanation || '')
    setQShortAnswer(q.correctAnswerText || '')
    if (q.options && q.options.length > 0) {
      setOptions(
        q.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: !!(o.isCorrect ?? o.correct),
        }))
      )
    } else {
      setOptions([
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
      ])
    }
    setIsModalOpen(true)
  }

  const handleSaveQuestion = async () => {
    if (!examId) return

    const trimmedQuestionText = qText.trim()
    if (!trimmedQuestionText) {
      showToastError('Question text cannot be blank.')
      return
    }

    if (trimmedQuestionText.length < 3) {
      showToastError(
        `Question prompt must be at least 3 characters long (currently ${trimmedQuestionText.length} character${
          trimmedQuestionText.length === 1 ? '' : 's'
        }).`
      )
      return
    }

    if (trimmedQuestionText.length > 5000) {
      showToastError('Question prompt cannot exceed 5000 characters.')
      return
    }

    if (qMarks < 0.5) {
      showToastError('Question marks must be at least 0.5 points.')
      return
    }

    if (qNegativeMarks < 0) {
      showToastError('Negative penalty cannot be less than 0.')
      return
    }

    let payloadOptions: QuestionOptionRequest[] = []

    if (qType === 'SINGLE_CHOICE' || qType === 'MULTIPLE_CHOICE') {
      const validOptions = options.filter((o) => o.text.trim())
      if (validOptions.length < 2) {
        showToastError('Objective questions must contain at least 2 non-empty options.')
        return
      }
      const hasEmpty = options.some((o) => !o.text.trim())
      if (hasEmpty) {
        showToastError('All options must have non-blank text. Please fill or remove unused options.')
        return
      }
      const hasCorrect = validOptions.some((o) => o.isCorrect)
      if (!hasCorrect) {
        showToastError('Please select at least one correct option.')
        return
      }
      if (qType === 'SINGLE_CHOICE') {
        const correctCount = validOptions.filter((o) => o.isCorrect).length
        if (correctCount !== 1) {
          showToastError('Single choice questions must have exactly one correct option selected.')
          return
        }
      }
      payloadOptions = validOptions.map((o, idx) => ({
        id: o.id || `opt-${idx + 1}`,
        text: o.text.trim(),
        isCorrect: !!o.isCorrect,
        correct: !!o.isCorrect,
      }))
    } else if (qType === 'TRUE_FALSE') {
      if (!qShortAnswer) {
        showToastError('Please select whether True or False is the correct answer.')
        return
      }
      payloadOptions = [
        { id: 'true-opt', text: 'True', isCorrect: qShortAnswer === 'TRUE', correct: qShortAnswer === 'TRUE' },
        { id: 'false-opt', text: 'False', isCorrect: qShortAnswer === 'FALSE', correct: qShortAnswer === 'FALSE' },
      ]
    } else if (qType === 'SHORT_ANSWER') {
      if (!qShortAnswer.trim()) {
        showToastError('Please provide the accepted answer key or grading keyword.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const req: QuestionCreateRequest = {
        questionText: trimmedQuestionText,
        type: qType,
        marks: qMarks,
        negativeMarks: qNegativeMarks,
        explanation: qExplanation.trim() || undefined,
        options: payloadOptions,
        correctAnswerText:
          qType === 'SHORT_ANSWER' ? qShortAnswer.trim() : qType === 'TRUE_FALSE' ? qShortAnswer : undefined,
      }

      let updatedExam: ExamResponse
      if (editingQuestionId) {
        updatedExam = await lecturerService.updateQuestion(examId, editingQuestionId, req)
        showToastSuccess('Question updated successfully!')
      } else {
        updatedExam = await lecturerService.addQuestion(examId, req)
        showToastSuccess('Question added to exam successfully!')
      }

      setExam(updatedExam)
      setIsModalOpen(false)
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to save question')
      showToastError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!examId || !questionToDelete) return
    setIsDeleting(true)
    try {
      const updatedExam = await lecturerService.deleteQuestion(examId, questionToDelete.id)
      setExam(updatedExam)
      showToastSuccess('Question deleted successfully!')
      setQuestionToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete question'
      showToastError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReorder = async (direction: 'up' | 'down', index: number) => {
    if (!exam || !exam.questions || !examId) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= exam.questions.length) return

    const reordered = [...exam.questions]
    const temp = reordered[index]
    reordered[index] = reordered[newIndex]
    reordered[newIndex] = temp

    const questionIds = reordered.map((q) => q.id)
    try {
      const updatedExam = await lecturerService.reorderQuestions(examId, questionIds)
      setExam(updatedExam)
      showToastSuccess('Question sequence updated.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reorder questions'
      showToastError(msg)
    }
  }

  const questionTypeLabels: Record<QuestionType, string> = {
    SINGLE_CHOICE: 'Single Choice',
    MULTIPLE_CHOICE: 'Multiple Choice',
    TRUE_FALSE: 'True / False',
    SHORT_ANSWER: 'Short Answer',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={examId ? `/lecturer/exams/${examId}` : '/lecturer/exams'}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Exam
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Question Builder: {isLoading ? '...' : exam?.title}
              </h1>
              <p className="text-xs text-slate-500">
                Author and reorder questions. Answer keys are strictly protected and never exposed to students.
              </p>
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
            <Button
              variant="primary"
              size="sm"
              onClick={openAddModal}
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              Add New Question
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Questions">
            {error}
          </Alert>
        )}

        {/* Stats Strip */}
        {exam && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <span className="text-xs text-slate-500 block">Total Questions</span>
                <span className="text-xl font-bold text-slate-900">{exam.questionCount}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <span className="text-xs text-slate-500 block">Total Marks</span>
                <span className="text-xl font-bold text-blue-600">{exam.totalMarks} points</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <span className="text-xs text-slate-500 block">Passing Marks Threshold</span>
                <span className="text-xl font-bold text-slate-900">{exam.passingMarks} points</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : !exam?.questions || exam.questions.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <EmptyState
                  icon={<FileQuestion className="h-10 w-10 text-slate-400" />}
                  title="No questions created yet"
                  description="Your examination currently has zero questions. Add questions before publishing."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={openAddModal}
                      leftIcon={<PlusCircle className="h-4 w-4" />}
                    >
                      Add First Question
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            exam.questions.map((q, idx) => (
              <Card key={q.id} className="hover:border-slate-300 transition-all">
                <CardContent className="pt-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="h-6 w-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <Badge variant="primary" size="sm">
                          {questionTypeLabels[q.type]}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                        </Badge>
                        {q.negativeMarks > 0 && (
                          <Badge variant="danger" size="sm">
                            -{q.negativeMarks} penalty
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                        {q.questionText}
                      </h4>

                      {/* Display Options for Choice Types */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-lg border flex items-center gap-2 ${
                                opt.isCorrect || opt.correct
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-medium'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {opt.isCorrect || opt.correct ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0 ml-1 mr-1" />
                              )}
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Short Answer / True False display */}
                      {q.type === 'SHORT_ANSWER' && q.correctAnswerText && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                          <strong>Accepted Answer Key:</strong> {q.correctAnswerText}
                        </div>
                      )}

                      {q.type === 'TRUE_FALSE' && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                          <strong>Correct Statement:</strong> {q.correctAnswerText || (q.options?.find(o => o.isCorrect || o.correct)?.text)}
                        </div>
                      )}

                      {q.explanation && (
                        <p className="text-2xs text-slate-500 italic pt-1">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>

                    {/* Actions and Reorder */}
                    <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => handleReorder('up', idx)}
                          aria-label="Move question up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === (exam.questions?.length ?? 0) - 1}
                          onClick={() => handleReorder('down', idx)}
                          aria-label="Move question down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(q)}
                          leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setQuestionToDelete(q)}
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Question Modal */}
        {isModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsModalOpen(false)}
            title={editingQuestionId ? 'Edit Question' : 'Add New Question'}
          >
            <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Question Type</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SINGLE_CHOICE">Single Choice (Objective)</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice (Multiple Correct)</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer / Subjective</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">Question Prompt Text</label>
                  <span
                    className={`text-2xs ${
                      qText.trim().length === 0
                        ? 'text-slate-400'
                        : qText.trim().length < 3
                        ? 'text-red-500 font-medium'
                        : 'text-emerald-600 font-medium'
                    }`}
                  >
                    {qText.trim().length} / 5000 chars (min 3)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the question text or problem statement (minimum 3 characters)..."
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 ${
                    qText.trim().length > 0 && qText.trim().length < 3
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {qText.trim().length > 0 && qText.trim().length < 3 && (
                  <p className="text-2xs text-red-500 mt-1">
                    Question prompt must be at least 3 characters long.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.5"
                  label="Marks (Points)"
                  value={qMarks}
                  onChange={(e) => setQMarks(Number(e.target.value))}
                />
                <Input
                  type="number"
                  step="0.25"
                  label="Negative Penalty"
                  value={qNegativeMarks}
                  onChange={(e) => setQNegativeMarks(Number(e.target.value))}
                />
              </div>

              {/* Options Builder for Single/Multiple Choice */}
              {(qType === 'SINGLE_CHOICE' || qType === 'MULTIPLE_CHOICE') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Answer Options (Select correct answer(s))
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setOptions((prev) => [
                          ...prev,
                          { id: `opt-${prev.length + 1}`, text: '', isCorrect: false },
                        ])
                      }
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      + Add Option
                    </button>
                  </div>

                  {options.map((opt, oIdx) => (
                    <div key={opt.id || oIdx} className="flex items-center gap-2">
                      <input
                        type={qType === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                        name="correct-option-group"
                        checked={opt.isCorrect}
                        onChange={() => {
                          if (qType === 'SINGLE_CHOICE') {
                            setOptions((prev) =>
                              prev.map((o, i) => ({ ...o, isCorrect: i === oIdx }))
                            )
                          } else {
                            setOptions((prev) =>
                              prev.map((o, i) => (i === oIdx ? { ...o, isCorrect: !o.isCorrect } : o))
                            )
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value
                          setOptions((prev) =>
                            prev.map((o, i) => (i === oIdx ? { ...o, text: val } : o))
                          )
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)} text...`}
                        className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setOptions((prev) => prev.filter((_, i) => i !== oIdx))}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* True / False Selector */}
              {qType === 'TRUE_FALSE' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-medium text-slate-700">Correct Answer</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="tf-answer"
                        value="TRUE"
                        checked={qShortAnswer === 'TRUE'}
                        onChange={(e) => setQShortAnswer(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="tf-answer"
                        value="FALSE"
                        checked={qShortAnswer === 'FALSE'}
                        onChange={(e) => setQShortAnswer(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              {/* Short Answer text */}
              {qType === 'SHORT_ANSWER' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-medium text-slate-700">
                    Deterministic Accepted Answer Key / Grading Rubric
                  </label>
                  <input
                    type="text"
                    value={qShortAnswer}
                    onChange={(e) => setQShortAnswer(e.target.value)}
                    placeholder="Exact accepted answer string or grading keyword..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Explanation (Shown to students when results are released)
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Rationale or derivation for the correct answer..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleSaveQuestion}
                >
                  {editingQuestionId ? 'Update Question' : 'Save Question to Bank'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {questionToDelete && (
          <Modal
            isOpen={true}
            onClose={() => setQuestionToDelete(null)}
            title="Delete Question?"
          >
            <div className="space-y-4 text-sm text-slate-600">
              <p>
                Are you sure you want to delete this question? Total exam marks will be automatically
                recalculated.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs italic">
                "{questionToDelete.questionText}"
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setQuestionToDelete(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={isDeleting}
                  onClick={handleDeleteQuestion}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
