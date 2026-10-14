import React from 'react'
import { AuthProvider } from './AuthProvider'
import { ToastProvider } from './ToastProvider'
import { IntroProvider } from '@/features/intro/IntroContext'
import { IntroAnimation } from '@/components/ui/IntroAnimation'

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <IntroProvider>
          {children}
          <IntroAnimation />
        </IntroProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
