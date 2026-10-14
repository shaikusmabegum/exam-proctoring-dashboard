import React, { useState, useCallback, useId } from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ToastContext } from './toastContext'
import type { ToastType, ToastItem } from './toastContext'

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const baseId = useId()

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration: number = 4000) => {
      const id = `${baseId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      const newToast: ToastItem = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [baseId, removeToast]
  )

  const success = useCallback((message: string, title?: string) => showToast('success', message, title), [showToast])
  const error = useCallback((message: string, title?: string) => showToast('error', message, title), [showToast])
  const info = useCallback((message: string, title?: string) => showToast('info', message, title), [showToast])
  const warning = useCallback((message: string, title?: string) => showToast('warning', message, title), [showToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, info, warning }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
            info: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
          }

          const borders = {
            success: 'border-emerald-200 bg-white text-slate-800',
            error: 'border-red-200 bg-white text-slate-800',
            info: 'border-blue-200 bg-white text-slate-800',
            warning: 'border-amber-200 bg-white text-slate-800',
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2',
                borders[toast.type]
              )}
            >
              {icons[toast.type]}
              <div className="flex-1 text-sm">
                {toast.title && <h5 className="font-semibold text-slate-900 mb-0.5">{toast.title}</h5>}
                <p className="text-slate-600 text-xs leading-relaxed">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                className="text-slate-400 hover:text-slate-600 rounded p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
