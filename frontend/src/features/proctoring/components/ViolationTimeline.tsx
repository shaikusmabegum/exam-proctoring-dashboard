import React from 'react'
import {
  AlertTriangle,
  Eye,
  Maximize2,
  VideoOff,
  WifiOff,
  UserX,
  Users,
  ShieldAlert,
  Info,
  Clock,
  Layers,
} from 'lucide-react'
import { ViolationSeverityBadge } from './ViolationSeverityBadge'
import type { ProctoringEventResponse, ProctoringEventType } from '@/types/proctoring'

interface ViolationTimelineProps {
  events: ProctoringEventResponse[]
  isLoading?: boolean
  emptyMessage?: string
}

export const ViolationTimeline: React.FC<ViolationTimelineProps> = ({
  events,
  isLoading = false,
  emptyMessage = 'No proctoring incidents or telemetry anomalies recorded.',
}) => {
  const getEventMeta = (type: ProctoringEventType) => {
    switch (type) {
      case 'TAB_VISIBILITY_CHANGED':
        return {
          label: 'Tab Focus Shift',
          description: 'Candidate switched away from the examination browser tab or window.',
          icon: <Eye className="h-4 w-4 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        }
      case 'FULLSCREEN_EXITED':
        return {
          label: 'Fullscreen Exited',
          description: 'Candidate exited the locked fullscreen testing interface.',
          icon: <Maximize2 className="h-4 w-4 text-rose-600" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
        }
      case 'CAMERA_STREAM_INTERRUPTED':
      case 'CAMERA_PERMISSION_DENIED':
        return {
          label: 'Camera Interrupted',
          description: 'Webcam feed was disconnected or stream access was revoked.',
          icon: <VideoOff className="h-4 w-4 text-rose-600" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
        }
      case 'NETWORK_INTERRUPTED':
        return {
          label: 'Network Connectivity Lost',
          description: 'Client lost connection to testing server.',
          icon: <WifiOff className="h-4 w-4 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        }
      case 'NETWORK_RESTORED':
        return {
          label: 'Network Restored',
          description: 'Telemetry connection re-established with server.',
          icon: <Info className="h-4 w-4 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
        }
      case 'FACE_NOT_DETECTED':
        return {
          label: 'Face Not Detected in Frame',
          description: 'No candidate face detected in video feed.',
          icon: <UserX className="h-4 w-4 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        }
      case 'MULTIPLE_FACES_DETECTED':
        return {
          label: 'Multiple Faces in Frame',
          description: 'More than one individual detected in webcam view.',
          icon: <Users className="h-4 w-4 text-rose-600" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
        }
      case 'MANUAL_REVIEW_REQUIRED':
        return {
          label: 'Incident Marked for Review',
          description: 'Telemetry triggered rule threshold requiring instructor audit.',
          icon: <ShieldAlert className="h-4 w-4 text-rose-600" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
        }
      case 'EXAM_STARTED':
      case 'EXAM_SUBMITTED':
      default:
        return {
          label: type.replace(/_/g, ' '),
          description: 'Lifecycle telemetry signal.',
          icon: <Info className="h-4 w-4 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        }
    }
  }

  const formatSource = (src: string) => {
    switch (src) {
      case 'BROWSER_REPORTED':
        return 'Browser Telemetry'
      case 'AI_PROVIDER_VERIFIED':
        return 'Model Verified'
      case 'SERVER_LIFECYCLE':
        return 'Server Rule'
      default:
        return src
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-start gap-4">
            <div className="h-8 w-8 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-1/3" />
              <div className="h-3 bg-slate-100 rounded-md w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
        <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium text-slate-700">{emptyMessage}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Any telemetry anomalies or browser events will appear here chronologically.
        </p>
      </div>
    )
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event) => {
        const meta = getEventMeta(event.eventType)
        return (
          <div key={event.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6.5 top-0.5 h-7 w-7 rounded-full border ${meta.borderColor} ${meta.bgColor} flex items-center justify-center shrink-0 shadow-xs`}
            >
              {meta.icon}
            </div>

            {/* Event details card */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">{meta.label}</span>
                  <ViolationSeverityBadge severity={event.severity} size="sm" />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {new Date(event.eventTimestamp || event.serverReceivedTimestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    <Layers className="h-2.5 w-2.5" />
                    {formatSource(event.source)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{meta.description}</p>

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(event.metadata).map(([k, v]) => (
                    <span key={k}>
                      <strong className="text-slate-700">{k}:</strong> {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
