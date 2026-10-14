import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { DeviceCheckStatus } from '@/types/proctoring'

interface DeviceCheckCardProps {
  title: string
  description: string
  status: DeviceCheckStatus
  icon: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  errorMessage?: string | null
  troubleshootingTip?: string
  isOptional?: boolean
}

export const DeviceCheckCard: React.FC<DeviceCheckCardProps> = ({
  title,
  description,
  status,
  icon,
  actionLabel,
  onAction,
  errorMessage,
  troubleshootingTip,
  isOptional = false,
}) => {
  const renderBadge = () => {
    switch (status) {
      case 'granted':
        return (
          <Badge variant="success" size="sm" dot>
            Passed
          </Badge>
        )
      case 'checking':
        return (
          <Badge variant="warning" size="sm" dot>
            Testing...
          </Badge>
        )
      case 'denied':
        return (
          <Badge variant="danger" size="sm">
            Denied
          </Badge>
        )
      case 'unsupported':
      case 'error':
        return (
          <Badge variant="danger" size="sm">
            Failed
          </Badge>
        )
      case 'idle':
      default:
        return (
          <Badge variant="neutral" size="sm">
            {isOptional ? 'Optional' : 'Action Required'}
          </Badge>
        )
    }
  }

  const renderStatusIcon = () => {
    switch (status) {
      case 'granted':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case 'denied':
      case 'error':
      case 'unsupported':
        return <XCircle className="h-5 w-5 text-rose-600" />
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-amber-600 animate-spin" />
      case 'idle':
      default:
        return <AlertTriangle className="h-5 w-5 text-slate-400" />
    }
  }

  return (
    <Card
      className={`transition-all duration-200 ${
        status === 'granted'
          ? 'border-emerald-200 bg-emerald-50/20'
          : status === 'denied' || status === 'error'
          ? 'border-rose-200 bg-rose-50/30'
          : 'hover:border-slate-300'
      }`}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                status === 'granted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'denied' || status === 'error'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-slate-900">{title}</h4>
                {renderBadge()}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>

          <div className="shrink-0">{renderStatusIcon()}</div>
        </div>

        {errorMessage && (status === 'denied' || status === 'error') && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 space-y-1">
            <p className="font-medium">{errorMessage}</p>
            {troubleshootingTip && (
              <p className="text-rose-600/90 text-[11px] flex items-center gap-1 mt-1">
                <HelpCircle className="h-3 w-3 shrink-0" />
                <span>{troubleshootingTip}</span>
              </p>
            )}
          </div>
        )}

        {actionLabel && onAction && status !== 'granted' && (
          <div className="pt-1">
            <Button
              variant={status === 'denied' || status === 'error' ? 'outline' : 'primary'}
              size="sm"
              onClick={onAction}
              isLoading={status === 'checking'}
              className="w-full sm:w-auto"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
