import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/authSchemas'
import { authService } from '../services/authService'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/feedback/Alert'
import { AppApiError } from '@/lib/api/apiErrors'

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [apiError, setApiError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  if (!token) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Missing Reset Token</h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            This password reset link is invalid or incomplete. Please request a new link from the forgot password page.
          </p>
        </div>
        <Link to="/forgot-password" className="block w-full">
          <Button variant="primary" size="md" className="w-full">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    )
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setApiError(null)
    try {
      await authService.resetPassword({
        token,
        newPassword: values.newPassword,
      })
      setCompleted(true)
    } catch (err) {
      if (err instanceof AppApiError) {
        setApiError(err.message)
      } else {
        setApiError('Unable to reset password. Please check if your token expired.')
      }
    }
  }

  if (completed) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Password Updated</h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your password has been changed. You may now sign in using your new credentials.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/login')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign in Now
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {apiError && (
        <Alert variant="error" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <Input
        label="New Password"
        type="password"
        placeholder="Min. 8 chars (letters and numbers)"
        leftIcon={<Lock className="h-4 w-4" />}
        required
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />

      <Input
        label="Confirm New Password"
        type="password"
        placeholder="Re-enter new password"
        leftIcon={<Lock className="h-4 w-4" />}
        required
        error={errors.confirmNewPassword?.message}
        {...register('confirmNewPassword')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Set New Password
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
