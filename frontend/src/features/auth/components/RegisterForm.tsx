import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { User as UserIcon, Mail, Lock, ArrowRight, ShieldCheck, GraduationCap, BookOpen, Clock } from 'lucide-react'
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Alert } from '@/components/feedback/Alert'
import { AppApiError } from '@/lib/api/apiErrors'

export const RegisterForm: React.FC = () => {
  const { register: registerStudent, registerLecturer } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialRoleParam = searchParams.get('role')?.toUpperCase() === 'LECTURER' ? 'LECTURER' : 'STUDENT'
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'LECTURER'>(initialRoleParam)

  const [apiError, setApiError] = useState<string | null>(null)
  const [registeredSuccess, setRegisteredSuccess] = useState<boolean>(false)

  useEffect(() => {
    const roleParam = searchParams.get('role')?.toUpperCase()
    if (roleParam === 'LECTURER') {
      setSelectedRole('LECTURER')
    } else if (roleParam === 'STUDENT') {
      setSelectedRole('STUDENT')
    }
  }, [searchParams])

  const handleRoleChange = (role: 'STUDENT' | 'LECTURER') => {
    setSelectedRole(role)
    setSearchParams({ role: role.toLowerCase() })
    setApiError(null)
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false as unknown as true,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null)
    try {
      if (selectedRole === 'LECTURER') {
        const newLecturer = await registerLecturer({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        })
        success(`Lecturer application submitted for ${newLecturer.fullName}!`, 'Application Received')
      } else {
        const newStudent = await registerStudent({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        })
        success(`Student account for ${newStudent.fullName} registered successfully!`, 'Account Created')
      }

      setRegisteredSuccess(true)
    } catch (err) {
      if (err instanceof AppApiError) {
        if (err.errorCode === 'DUPLICATE_RESOURCE') {
          setApiError('An account with this email address already exists. Please sign in instead.')
        } else {
          setApiError(err.message)
        }
      } else {
        setApiError('Unable to complete registration. Please try again later.')
      }
    }
  }

  if (registeredSuccess) {
    if (selectedRole === 'LECTURER') {
      return (
        <div className="space-y-6 text-center py-4">
          <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Application Submitted</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your lecturer account has been registered and is <strong>pending administrator approval</strong>. Once verified by the platform Administrator (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-indigo-700">admin@drishti.com</code>), you will be able to log in to create and manage examinations.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/login')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Return to Sign in
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-6 text-center py-4">
        <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Registration Complete</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Your DRISHTI student profile has been created and activated. You can now sign in with your credentials to access examinations and review results.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/login')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Proceed to Sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleRoleChange('STUDENT')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedRole === 'STUDENT'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Student Account
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange('LECTURER')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedRole === 'LECTURER'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Lecturer (Faculty)
        </button>
      </div>

      {apiError && (
        <Alert variant="error" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      {selectedRole === 'STUDENT' ? (
        <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200/80 text-xs text-blue-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Student accounts are activated immediately for taking verified examinations.</span>
        </div>
      ) : (
        <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Faculty accounts require platform Administrator approval before examination management access is activated.</span>
        </div>
      )}

      <Input
        label="Full Legal Name"
        type="text"
        placeholder={selectedRole === 'LECTURER' ? 'e.g. Dr. John Doe' : 'e.g. Jane Doe'}
        leftIcon={<UserIcon className="h-4 w-4" />}
        required
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="Institutional / University Email"
        type="email"
        placeholder={selectedRole === 'LECTURER' ? 'professor@university.edu' : 'student@university.edu'}
        leftIcon={<Mail className="h-4 w-4" />}
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Min. 8 chars (letters and numbers)"
        leftIcon={<Lock className="h-4 w-4" />}
        required
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter password"
        leftIcon={<Lock className="h-4 w-4" />}
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="pt-1">
        <Checkbox
          label={
            <span className="text-xs text-slate-600 leading-normal">
              I acknowledge the{' '}
              <span className="font-semibold text-slate-800">Academic Integrity & Proctoring Policy</span> and agree to adhere to platform regulations.
            </span>
          }
          error={errors.agreeToTerms?.message}
          {...register('agreeToTerms')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full mt-3"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        {selectedRole === 'LECTURER' ? 'Submit Lecturer Registration (Approval Required)' : 'Create Student Account'}
      </Button>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  )
}
