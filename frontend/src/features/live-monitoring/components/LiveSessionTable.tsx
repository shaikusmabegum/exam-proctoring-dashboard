import React from 'react'
import { Eye, ShieldAlert, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProctoringStatusBadge, CameraStreamBadge } from '@/features/proctoring/components/ProctoringStatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import type { ProctoringSessionResponse } from '@/types/proctoring'

interface LiveSessionTableProps {
  sessions: ProctoringSessionResponse[]
  isLoading?: boolean
  onSelectSession: (session: ProctoringSessionResponse) => void
}

export const LiveSessionTable: React.FC<LiveSessionTableProps> = ({
  sessions,
  isLoading = false,
  onSelectSession,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<Clock className="h-8 w-8 text-slate-400" />}
          title="No student proctoring sessions found"
          description="Candidates entering the examination will automatically establish telemetry feeds here."
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Student Candidate</th>
            <th className="py-3 px-4">Session Status</th>
            <th className="py-3 px-4">Camera Feed</th>
            <th className="py-3 px-4">Last Keepalive</th>
            <th className="py-3 px-4">Signals</th>
            <th className="py-3 px-4">Incidents</th>
            <th className="py-3 px-4 text-right">Audit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sessions.map((session) => (
            <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3.5 px-4">
                <div>
                  <p className="font-semibold text-xs text-slate-900">{session.studentName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{session.studentEmail}</p>
                </div>
              </td>

              <td className="py-3.5 px-4">
                <ProctoringStatusBadge status={session.status} size="sm" />
              </td>

              <td className="py-3.5 px-4">
                <CameraStreamBadge status={session.cameraStatus} size="sm" />
              </td>

              <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                {new Date(session.lastHeartbeatTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </td>

              <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                {session.eventCount}
              </td>

              <td className="py-3.5 px-4">
                {session.violationCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <ShieldAlert className="h-3 w-3" />
                    {session.violationCount}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Clean
                  </span>
                )}
              </td>

              <td className="py-3.5 px-4 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectSession(session)}
                  leftIcon={<Eye className="h-3.5 w-3.5" />}
                >
                  View Feed
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
