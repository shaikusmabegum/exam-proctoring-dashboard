import React from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '../components/LoginForm'

export const LoginPage: React.FC = () => {

  return (
    <AuthLayout
      heading="Sign in to your account"
      subheading="Enter your academic credentials to access assessments, live proctoring, and grade reports."
    >
      <LoginForm />
    </AuthLayout>
  )
}
