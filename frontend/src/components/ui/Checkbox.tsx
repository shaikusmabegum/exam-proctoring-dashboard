import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  helperText?: string
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, name, label, helperText, error, className, disabled, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || name || generatedId

    return (
      <div className="flex items-start gap-2.5 text-left">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-colors',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-400 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {(label || helperText || error) && (
          <div className="text-sm">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'font-medium text-slate-700 select-none cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {helperText && !error && (
              <p className="text-xs text-slate-500">{helperText}</p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
