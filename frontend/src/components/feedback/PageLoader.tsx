import React from 'react'
import { Spinner } from './Spinner'
import { cn } from '@/lib/utils/cn'

export interface PageLoaderProps {
  message?: string
  className?: string
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading platform resources...',
  className,
}) => {
  return (
    <div
      className={cn(
        'min-h-[400px] flex flex-col items-center justify-center p-8 gap-4 text-center',
        className
      )}
    >
      <Spinner size="lg" color="primary" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  )
}
