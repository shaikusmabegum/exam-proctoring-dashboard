import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Award,
  PlusCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { Alert } from '@/components/feedback/Alert'
import { useToast } from '@/hooks/useToast'
import { lecturerService } from '../services/lecturerService'

const examCreateSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Exam title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    courseName: z
      .string()
      .min(2, 'Course/Subject name must be at least 2 characters')
      .max(100, 'Course name cannot exceed 100 characters'),
    description: z.string().optional(),
    instructions: z.string().optional(),
    durationMinutes: z
      .number({ message: 'Duration is required' })
      .min(5, 'Duration must be at least 5 minutes')
      .max(600, 'Duration cannot exceed 600 minutes (10 hours)'),
    passingMarks: z
      .number({ message: 'Passing marks are required' })
      .min(0, 'Passing marks cannot be negative'),
    startTime: z.string().min(1, 'Scheduled start time is required'),
    endTime: z.string().min(1, 'Scheduled end time is required'),
    randomizeQuestions: z.boolean(),
    negativeMarking: z.boolean(),
    negativeMarksPerQuestion: z.number().min(0, 'Negative marks cannot be negative'),
    maxAttempts: z.number().min(1, 'Minimum 1 attempt'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime)
      const end = new Date(data.endTime)
      return end > start
    },
    {
      message: 'Scheduled end time must be after the start time',
      path: ['endTime'],
    }
  )

type ExamCreateFormData = z.infer<typeof examCreateSchema>

function getDefaultScheduleDates() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0]
  return {
    startTime: `${dateStr}T09:00`,
    endTime: `${dateStr}T17:00`,
  }
}

export const LecturerExamCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const { success: showToastSuccess, error: showToastError } = useToast()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultSchedule] = useState(getDefaultScheduleDates)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExamCreateFormData>({
    resolver: zodResolver(examCreateSchema),
    defaultValues: {
      title: '',
      courseName: '',
      description: '',
      instructions:
        'Ensure a stable internet connection. Webcams and screen activities are monitored. No external browsing or unauthorized devices are permitted.',
      durationMinutes: 60,
      passingMarks: 40,
      startTime: defaultSchedule.startTime,
      endTime: defaultSchedule.endTime,
      randomizeQuestions: false,
      negativeMarking: false,
      negativeMarksPerQuestion: 0,
      maxAttempts: 1,
    },
  })

  const watchNegativeMarking = useWatch({ control, name: 'negativeMarking' })

  const onSubmit = async (data: ExamCreateFormData) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      const payload = {
        title: data.title,
        courseName: data.courseName,
        description: data.description,
        instructions: data.instructions,
        durationMinutes: data.durationMinutes,
        passingMarks: data.passingMarks,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        randomizeQuestions: data.randomizeQuestions,
        negativeMarking: data.negativeMarking,
        negativeMarksPerQuestion: data.negativeMarking ? data.negativeMarksPerQuestion : 0,
        maxAttempts: data.maxAttempts,
      }

      const created = await lecturerService.createExam(payload)
      showToastSuccess(`Exam draft "${created.title}" created successfully!`)
      navigate(`/lecturer/exams/${created.id}/questions`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save examination draft'
      setApiError(msg)
      showToastError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back and Title */}
        <div className="flex items-center gap-4">
          <Link to="/lecturer/exams">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Exams
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Examination</h1>
            <p className="text-xs text-slate-500">
              Step 1: Configure examination metadata, scheduling, and grading parameters.
            </p>
          </div>
        </div>

        {apiError && (
          <Alert variant="error" title="Submission Error">
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                1. Basic Examination Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Exam Title"
                  placeholder="e.g. Midterm Examination: Data Structures & Algorithms"
                  error={errors.title?.message}
                  {...register('title')}
                />
                <Input
                  label="Course / Subject Code"
                  placeholder="e.g. CS201: Data Structures"
                  error={errors.courseName?.message}
                  {...register('courseName')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Exam Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide an overview of examination topics or coverage..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  {...register('description')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Student Instructions & Academic Honor Code
                </label>
                <textarea
                  rows={3}
                  placeholder="Instructions displayed to students before starting..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  {...register('instructions')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Timing & Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                2. Timing & Examination Schedule Window
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Duration (Minutes)"
                  placeholder="60"
                  error={errors.durationMinutes?.message}
                  {...register('durationMinutes', { valueAsNumber: true })}
                />
                <Input
                  type="datetime-local"
                  label="Scheduled Start Time"
                  error={errors.startTime?.message}
                  {...register('startTime')}
                />
                <Input
                  type="datetime-local"
                  label="Scheduled End Time"
                  error={errors.endTime?.message}
                  {...register('endTime')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Marking & Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                3. Marking, Passing Criteria & Security Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.5"
                  label="Passing Marks Threshold"
                  placeholder="40"
                  error={errors.passingMarks?.message}
                  {...register('passingMarks', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  label="Maximum Allowed Attempts"
                  placeholder="1"
                  error={errors.maxAttempts?.message}
                  {...register('maxAttempts', { valueAsNumber: true })}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <Checkbox
                  label="Randomize Question Order for Each Student"
                  helperText="Scrambles the display order of questions to deter peer collaboration."
                  {...register('randomizeQuestions')}
                />

                <Checkbox
                  label="Enable Negative Marking for Incorrect Answers"
                  helperText="Deducts penalty marks for wrong choices on objective questions."
                  {...register('negativeMarking')}
                />

                {watchNegativeMarking && (
                  <div className="max-w-xs pl-6">
                    <Input
                      type="number"
                      step="0.25"
                      label="Penalty Marks per Incorrect Answer"
                      placeholder="0.25"
                      error={errors.negativeMarksPerQuestion?.message}
                      {...register('negativeMarksPerQuestion', { valueAsNumber: true })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-slate-50 border-t border-slate-200">
              <Link to="/lecturer/exams">
                <Button variant="outline" size="sm" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle className="h-4 w-4" />}
              >
                Create Draft & Proceed to Questions →
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
