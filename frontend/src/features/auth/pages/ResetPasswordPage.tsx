import React from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ResetPasswordForm } from '../components/ResetPasswordForm'

export const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      heading="Set a new password"
      subheading="Ensure your new password meets academic complexity standards."
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
