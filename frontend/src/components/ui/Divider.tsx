import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

export const Divider: React.FC<DividerProps> = ({
  label,
  orientation = 'horizontal',
  className,
  ...props
}) => {
  if (orientation === 'vertical') {
    return <div className={cn('w-px h-full bg-slate-200', className)} role="separator" {...props} />
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center w-full my-4', className)} role="separator" {...props}>
        <div className="grow border-t border-slate-200" />
        <span className="shrink-0 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className="grow border-t border-slate-200" />
      </div>
    )
  }

  return <hr className={cn('w-full border-t border-slate-200 my-4', className)} {...props} />
}
