import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  onClose?: () => void
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className,
  ...props
}) => {
  const configs = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="h-5 w-5 text-blue-600 shrink-0" aria-hidden="true" />,
      closeHover: 'hover:bg-blue-100 text-blue-600',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />,
      closeHover: 'hover:bg-emerald-100 text-emerald-600',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />,
      closeHover: 'hover:bg-amber-100 text-amber-600',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />,
      closeHover: 'hover:bg-red-100 text-red-600',
    },
  }

  const config = configs[variant]

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 text-sm',
        config.container,
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{config.icon}</div>
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div className="text-sm opacity-95 leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className={cn('rounded-md p-1 transition-colors', config.closeHover)}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
