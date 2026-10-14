import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Shield, Sparkles } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Alert } from '@/components/feedback/Alert'
import { AppApiError } from '@/lib/api/apiErrors'

export const LoginForm: React.FC = () => {
  const { login, getRoleRedirectPath } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [apiError, setApiError] = useState<string | null>(null)

  // Extract returnUrl if user was redirected from a protected route
  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const fillAdminCredentials = () => {
    setValue('email', 'admin@drishti.com', { shouldValidate: true })
    setValue('password', 'password123', { shouldValidate: true })
  }

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null)
    try {
      const loggedInUser = await login(values)
      success(`Welcome back, ${loggedInUser.fullName}!`, 'Authenticated')

      const redirectPath = fromLocation || getRoleRedirectPath(loggedInUser.role)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      if (err instanceof AppApiError) {
        setApiError(err.message)
      } else {
        setApiError('Unable to sign in. Please check your credentials and try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Demo Administrator Credentials Helper */}
      <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            Default Admin: <strong className="font-mono text-indigo-900">admin@drishti.com</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={fillAdminCredentials}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 hover:border-indigo-300 px-2 py-1 rounded shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="h-3 w-3" />
          Auto-fill
        </button>
      </div>

      {apiError && (
        <Alert variant={apiError.includes('approval') || apiError.includes('deactivated') ? 'warning' : 'error'} onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <Input
        label="Institutional / Academic Email"
        type="email"
        placeholder="e.g. admin@drishti.com or user@university.edu"
        leftIcon={<Mail className="h-4 w-4" />}
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type="password"
          placeholder="••••••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          required
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <Checkbox
          label="Remember my session"
          {...register('rememberMe')}
        />
        <Link
          to="/forgot-password"
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full mt-2"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Sign in to DRISHTI
      </Button>

      <div className="pt-4 border-t border-slate-100 text-center text-xs space-y-2">
        <div className="text-slate-500">
          Need an account?{' '}
          <Link
            to="/register?role=student"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Register as Student
          </Link>
          <span className="mx-2 text-slate-300">|</span>
          <Link
            to="/register?role=lecturer"
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Register as Lecturer
          </Link>
        </div>
        <p className="text-[11px] text-slate-400">
          Administrator accounts are provisioned via system security bootstrap.
        </p>
      </div>
    </form>
  )
}
