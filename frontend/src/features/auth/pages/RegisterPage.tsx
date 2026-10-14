import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { RegisterForm } from '../components/RegisterForm'
import { useAuth } from '@/hooks/useAuth'

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, role, getRoleRedirectPath } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getRoleRedirectPath(role), { replace: true })
    }
  }, [isAuthenticated, role, navigate, getRoleRedirectPath])

  return (
    <AuthLayout
      heading="Create your DRISHTI account"
      subheading="Register with your institutional credentials as a student or faculty member."
    >
      <RegisterForm />
    </AuthLayout>
  )
}
