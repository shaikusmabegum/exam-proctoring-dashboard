import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/authSchemas'
import { authService } from '../services/authService'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/feedback/Alert'
import { AppApiError } from '@/lib/api/apiErrors'

export const ForgotPasswordForm: React.FC = () => {
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError(null)
    try {
      await authService.requestPasswordReset(values)
      setSubmitted(true)
    } catch (err) {
      if (err instanceof AppApiError) {
        setApiError(err.message)
      } else {
        setApiError('Unable to process password reset request. Please contact your instructor or administrator.')
      }
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Request Submitted</h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            If an active account exists for that email address, password recovery instructions have been dispatched.
          </p>
        </div>
        <Link to="/login" className="block w-full">
          <Button variant="outline" size="md" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Sign in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {apiError && (
        <Alert variant="warning" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Enter your registered institutional email. In institutions with centralized directory federation, password resets may be handled by your IT department.
        </span>
      </div>

      <Input
        label="Registered Email Address"
        type="email"
        placeholder="user@university.edu"
        leftIcon={<Mail className="h-4 w-4" />}
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Send Recovery Instructions
      </Button>

      <div className="pt-4 border-t border-slate-100 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </form>
  )
}
