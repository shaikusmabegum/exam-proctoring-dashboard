import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  size = 'lg',
  className,
  ...props
}) => {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8', sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  )
}
