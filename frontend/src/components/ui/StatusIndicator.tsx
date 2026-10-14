import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'online' | 'offline' | 'warning' | 'busy'
  label?: string
  pulse?: boolean
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false,
  className,
  ...props
}) => {
  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    warning: 'bg-amber-500',
    busy: 'bg-red-500',
  }

  return (
    <div className={cn('inline-flex items-center gap-2 text-xs font-medium text-slate-700', className)} {...props}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              statusColors[status]
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', statusColors[status])} />
      </span>
      {label && <span>{label}</span>}
    </div>
  )
}
