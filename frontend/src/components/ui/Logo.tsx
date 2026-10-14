import React from 'react'
import logoImg from '@/assets/logo.jpeg'
import { cn } from '@/lib/utils/cn'

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  subtitle?: string
  variant?: 'light' | 'dark'
  className?: string
  imageClassName?: string
}

const sizeMap = {
  xs: {
    container: 'h-6 w-6',
    image: 'h-6 w-6',
    text: 'text-sm font-bold tracking-tight',
    subtitle: 'text-[10px]',
  },
  sm: {
    container: 'h-8 w-8',
    image: 'h-8 w-8',
    text: 'text-base font-bold tracking-tight',
    subtitle: 'text-[11px]',
  },
  md: {
    container: 'h-9 w-9',
    image: 'h-9 w-9',
    text: 'text-lg font-bold tracking-tight',
    subtitle: 'text-xs',
  },
  lg: {
    container: 'h-10 w-10',
    image: 'h-10 w-10',
    text: 'text-xl font-bold tracking-tight',
    subtitle: 'text-xs',
  },
  xl: {
    container: 'h-14 w-14',
    image: 'h-14 w-14',
    text: 'text-2xl font-extrabold tracking-tight',
    subtitle: 'text-xs',
  },
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  variant = 'light',
  className,
  imageClassName,
}) => {
  const currentSize = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Brand Icon Mark */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700/50 shadow-sm flex items-center justify-center',
          currentSize.container,
          imageClassName
        )}
      >
        <img
          src={logoImg}
          alt="Drishti Logo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span
              className={cn(
                currentSize.text,
                variant === 'dark' ? 'text-white' : 'text-slate-900'
              )}
            >
              DRISHTI
            </span>
            {subtitle && (
              <span
                className={cn(
                  'hidden sm:inline-block ml-2 pl-2 border-l font-medium',
                  currentSize.subtitle,
                  variant === 'dark'
                    ? 'text-slate-400 border-slate-700'
                    : 'text-slate-500 border-slate-300'
                )}
              >
                {subtitle}
              </span>
            )}
          </div>
          {/* If on mobile or subtitle is dedicated below (like in sidebar) */}
          {subtitle && (
            <span
              className={cn(
                'sm:hidden block -mt-0.5 font-medium',
                currentSize.subtitle,
                variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
