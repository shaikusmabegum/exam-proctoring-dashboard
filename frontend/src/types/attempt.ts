import type { StudentQuestionResponse } from './exam'

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED' | 'TIMED_OUT' | 'CANCELLED'

export type EvaluationStatus = 'PENDING' | 'AUTO_EVALUATED' | 'REQUIRES_MANUAL_GRADING' | 'MANUALLY_EVALUATED'

export interface StudentAnswer {
  questionId: string
  selectedOptionIds?: string[]
  textAnswer?: string
  lastSavedAt?: string
}

export interface ExamAttemptResponse {
  id: string
  examId: string
  examTitle: string
  studentId: string
  attemptNumber: number
  status: AttemptStatus
  startTime: string
  expiryTime: string
  remainingSeconds: number
  lastSavedTime?: string
  submittedTime?: string
  questions?: StudentQuestionResponse[]
  answers?: Record<string, StudentAnswer>
}

export interface SaveAnswerRequest {
  questionId: string
  selectedOptionIds?: string[]
  textAnswer?: string
}

export interface BatchSaveAnswerRequest {
  answers: SaveAnswerRequest[]
}

export interface SubmitAttemptRequest {
  reason?: string
}

export interface QuestionResultDetail {
  questionId: string
  questionText: string
  type: string
  selectedOptionIds?: string[]
  submittedTextAnswer?: string
  correctOptionIds?: string[]
  correctAnswerText?: string
  awardedMarks: number
  maxMarks: number
  isCorrect?: boolean
  explanation?: string
}

export interface StudentResultResponse {
  attemptId: string
  examId: string
  examTitle: string
  studentId: string
  attemptNumber: number
  status: AttemptStatus
  evaluationStatus: EvaluationStatus
  score: number
  totalMarks: number
  percentage: number
  passingMarks: number
  passed: boolean
  submittedTime: string
  resultsPublished: boolean
  resultMessage?: string
  questionDetails?: QuestionResultDetail[]
}
