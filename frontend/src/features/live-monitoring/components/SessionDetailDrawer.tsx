import React, { useEffect, useState } from 'react'
import { X, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProctoringStatusBadge, CameraStreamBadge } from '@/features/proctoring/components/ProctoringStatusBadge'
import { ViolationTimeline } from '@/features/proctoring/components/ViolationTimeline'
import { lecturerMonitoringService } from '@/features/proctoring/services/lecturerMonitoringService'
import type { ProctoringSessionResponse, ProctoringEventResponse } from '@/types/proctoring'

interface SessionDetailDrawerProps {
  session: ProctoringSessionResponse | null
  isOpen: boolean
  onClose: () => void
}

export const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [events, setEvents] = useState<ProctoringEventResponse[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [eventError, setEventError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !session) return

    let isMounted = true
    queueMicrotask(() => {
      if (isMounted) {
        setIsLoadingEvents(true)
        setEventError(null)
      }
    })

    lecturerMonitoringService
      .getSessionEvents(session.id, { page: 0, size: 50 })
      .then((res) => {
        if (isMounted) {
          setEvents(res.content)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch session event history'
          setEventError(msg)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingEvents(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, session])

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Proctoring Telemetry Audit
                </span>
                <ProctoringStatusBadge status={session.status} size="sm" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {session.studentName || 'Student Session'}
              </h3>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Close session details"
              className="p-1.5 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Student & Session Overview Strip */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Candidate Email</span>
                <p className="font-semibold text-slate-800 break-all">{session.studentEmail}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Camera Feed Status</span>
                <div>
                  <CameraStreamBadge status={session.cameraStatus} size="sm" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Session Started</span>
                <p className="font-semibold text-slate-800">
                  {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Last Keepalive Heartbeat</span>
                <p className="font-semibold text-slate-800">
                  {new Date(session.lastHeartbeatTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Metrics Counter */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex-1">
                <span className="text-xs text-slate-500 block">Total Logged Signals</span>
                <span className="text-xl font-bold text-slate-900">{session.eventCount}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex-1">
                <span className="text-xs text-slate-500 block">Flagged Incidents</span>
                <span className={`text-xl font-bold ${session.violationCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {session.violationCount}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex-1">
                <span className="text-xs text-slate-500 block">AI Engine</span>
                <span className="text-xs font-semibold text-slate-700 truncate block">
                  {session.aiDetectionProvider || 'Standard Telemetry'}
                </span>
              </div>
            </div>

            {/* Chronological Event History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Telemetry Event Timeline
                </h4>
                <span className="text-xs text-slate-500">{events.length} recorded</span>
              </div>

              {eventError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {eventError}
                </div>
              )}

              <ViolationTimeline
                events={events}
                isLoading={isLoadingEvents}
                emptyMessage="No incidents or anomalies recorded for this student session."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Audit Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
