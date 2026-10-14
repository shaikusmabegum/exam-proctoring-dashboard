import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

export interface ToastContextType {
  toasts: ToastItem[]
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)
