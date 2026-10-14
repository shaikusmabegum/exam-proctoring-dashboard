import { useContext } from 'react'
import { ToastContext } from '@/app/providers/toastContext'
import type { ToastContextType, ToastType, ToastItem } from '@/app/providers/toastContext'

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export type { ToastType, ToastItem, ToastContextType }
