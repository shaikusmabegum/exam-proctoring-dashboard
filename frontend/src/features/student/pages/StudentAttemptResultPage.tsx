import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCw,
  FileCheck2,
  Lock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { studentService } from '../services/studentService'
import type { StudentResultResponse } from '@/types/attempt'

export const StudentAttemptResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [result, setResult] = useState<StudentResultResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!attemptId) return
    studentService
      .getAttemptResult(attemptId)
      .then((data) => setResult(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination results'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [attemptId])

  const refreshResult = () => {
    if (!attemptId) return
    setIsLoading(true)
    setError(null)
    studentService
      .getAttemptResult(attemptId)
      .then((data) => setResult(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination results'
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/student/results">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                All Results
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Examination Evaluation Report
              </h1>
              <p className="text-xs text-slate-500">{result?.examTitle || 'Attempt Outcome'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshResult}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Result">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Scorecard Hero */}
            <Card className="border-t-4 border-t-blue-600">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{result.examTitle}</h2>
                      <Badge variant="neutral" size="sm">Attempt #{result.attemptNumber}</Badge>
                    </div>

                    <p className="text-xs text-slate-500">
                      Submitted on {new Date(result.submittedTime).toLocaleString()}
                    </p>

                    <div className="pt-2">
                      {result.passed ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Passed Examination
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Did Not Meet Passing Mark
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score KPI Circle */}
                  <div className="flex items-center gap-6 text-center">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {result.score}
                        <span className="text-base font-normal text-slate-500"> / {result.totalMarks}</span>
                      </span>
                      <p className="text-xs text-slate-500 mt-1">Raw Marks</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <span className="text-3xl font-extrabold text-blue-700">
                        {result.percentage.toFixed(1)}%
                      </span>
                      <p className="text-xs text-blue-600 mt-1">
                        Pass Mark: {result.passingMarks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Message from Server */}
                {result.resultMessage && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong>Evaluation Status:</strong> {result.resultMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* If Results Not Released */}
            {!result.resultsPublished && (
              <Card>
                <CardContent className="p-8 text-center space-y-3">
                  <Lock className="h-10 w-10 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-base text-slate-900">
                    Detailed Answers Under Instructor Moderation
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The course lecturer has configured detailed question breakdowns, option rationales,
                    and model answers to release once all cohorts have completed testing.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* If Results are Released: Question-by-Question Breakdown */}
            {result.resultsPublished && result.questionDetails && result.questionDetails.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-blue-600" />
                  Question-by-Question Review ({result.questionDetails.length} items)
                </h3>

                {result.questionDetails.map((q, idx) => (
                  <Card key={q.questionId} className="hover:border-slate-300 transition-all">
                    <CardContent className="pt-5 space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Question {idx + 1}</span>
                          <Badge variant={q.isCorrect ? 'success' : 'danger'} size="sm">
                            {q.isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </div>
                        <span className="font-semibold text-slate-800">
                          {q.awardedMarks} / {q.maxMarks} marks
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-900 whitespace-pre-line">
                        {q.questionText}
                      </p>

                      {/* Display Submitted vs Correct */}
                      {q.submittedTextAnswer && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <p className="text-slate-600">
                            <strong>Your Written Answer:</strong> {q.submittedTextAnswer}
                          </p>
                          {q.correctAnswerText && (
                            <p className="text-emerald-700 font-semibold">
                              <strong>Model / Accepted Answer:</strong> {q.correctAnswerText}
                            </p>
                          )}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-slate-700 leading-relaxed">
                          <strong className="text-blue-900 block mb-0.5">Instructor Explanation:</strong>
                          {q.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
