import { useContext } from 'react'
import { AuthContext } from '@/app/providers/authContext'
import type { AuthContextType } from '@/app/providers/authContext'

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { AuthContextType }
