import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'slate'
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  ...props
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  const colors = {
    primary: 'text-blue-600',
    white: 'text-white',
    slate: 'text-slate-400',
  }

  return (
    <div role="status" aria-label="Loading" className={cn('inline-flex items-center justify-center', className)} {...props}>
      <Loader2 className={cn('animate-spin', sizes[size], colors[color])} aria-hidden="true" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
