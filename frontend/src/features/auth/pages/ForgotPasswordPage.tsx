import React from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      heading="Reset your password"
      subheading="We will assist you in restoring access to your DRISHTI account."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
