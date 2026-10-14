import React from 'react'
import { Activity, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react'
import type { StreamConnectionStatus } from '@/types/proctoring'

interface ConnectionStatusIndicatorProps {
  status: StreamConnectionStatus
  lastUpdated?: Date | null
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  status,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}) => {
  const renderBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>Streaming Live</span>
          </div>
        )
      case 'polling':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <Wifi className="h-3.5 w-3.5 text-blue-600" />
            <span>Live Polling (10s)</span>
          </div>
        )
      case 'reconnecting':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            <RefreshCw className="h-3.5 w-3.5 text-amber-600 animate-spin" />
            <span>Reconnecting...</span>
          </div>
        )
      case 'offline':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            <WifiOff className="h-3.5 w-3.5 text-rose-600" />
            <span>Connection Interrupted</span>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {renderBadge()}

      {lastUpdated && (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      )}
    </div>
  )
}
