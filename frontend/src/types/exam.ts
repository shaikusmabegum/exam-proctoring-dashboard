export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'

export interface QuestionOptionResponse {
  id: string
  text: string
  isCorrect?: boolean
  correct?: boolean
}

export interface QuestionResponse {
  id: string
  questionText: string
  type: QuestionType
  options: QuestionOptionResponse[]
  correctAnswerText?: string
  marks: number
  negativeMarks: number
  explanation?: string
  order: number
  createdAt?: string
}

export interface ExamResponse {
  id: string
  title: string
  description?: string
  instructions?: string
  courseName: string
  lecturerId?: string
  lecturerName?: string
  durationMinutes: number
  totalMarks: number
  passingMarks: number
  startTime: string
  endTime: string
  status: ExamStatus
  questionCount: number
  questions?: QuestionResponse[]
  randomizeQuestions: boolean
  negativeMarking: boolean
  negativeMarksPerQuestion: number
  maxAttempts: number
  resultsPublished: boolean
  createdAt?: string
  updatedAt?: string
}

export interface StudentQuestionOptionResponse {
  id: string
  text: string
}

export interface StudentQuestionResponse {
  id: string
  questionText: string
  type: QuestionType
  options: StudentQuestionOptionResponse[]
  marks: number
  negativeMarks: number
  order: number
}

export interface StudentExamResponse {
  id: string
  title: string
  description?: string
  instructions?: string
  courseName: string
  lecturerName?: string
  durationMinutes: number
  totalMarks: number
  passingMarks: number
  startTime: string
  endTime: string
  questionCount: number
  maxAttempts: number
  negativeMarking: boolean
  negativeMarksPerQuestion: number
  canAttempt: boolean
  attemptStatusMessage?: string
}

export interface ExamCreateRequest {
  title: string
  description?: string
  instructions?: string
  courseName: string
  durationMinutes: number
  passingMarks: number
  startTime: string
  endTime: string
  randomizeQuestions?: boolean
  negativeMarking?: boolean
  negativeMarksPerQuestion?: number
  maxAttempts?: number
}

export interface ExamUpdateRequest {
  title?: string
  description?: string
  instructions?: string
  courseName?: string
  durationMinutes?: number
  passingMarks?: number
  startTime?: string
  endTime?: string
  randomizeQuestions?: boolean
  negativeMarking?: boolean
  negativeMarksPerQuestion?: number
  maxAttempts?: number
}

export interface QuestionOptionRequest {
  id?: string
  text: string
  isCorrect: boolean
  correct?: boolean
}

export interface QuestionCreateRequest {
  questionText: string
  type: QuestionType
  options?: QuestionOptionRequest[]
  correctAnswerText?: string
  marks: number
  negativeMarks?: number
  explanation?: string
  order?: number
}

export interface QuestionUpdateRequest {
  questionText?: string
  type?: QuestionType
  options?: QuestionOptionRequest[]
  correctAnswerText?: string
  marks?: number
  negativeMarks?: number
  explanation?: string
  order?: number
}
