import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className, ...props }) => {
  const [imgError, setImgError] = React.useState(false)

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  const initials = getInitials(name)

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold bg-slate-200 text-slate-700 overflow-hidden select-none border border-slate-300',
        sizes[size],
        className
      )}
      title={name}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
