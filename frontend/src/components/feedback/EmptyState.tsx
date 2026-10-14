import React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto rounded-xl border border-dashed border-slate-200 bg-slate-50/50',
        className
      )}
    >
      <div className="p-3 bg-white rounded-full shadow-xs text-slate-400 mb-4 border border-slate-200">
        {icon || <Inbox className="h-8 w-8" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      {description && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
