import { useState, useEffect, useRef, useCallback } from 'react'
import { studentProctoringService } from '../services/studentProctoringService'
import type {
  ProctoringSessionResponse,
  ProctoringEventType,
  CameraStreamStatus,
  ProctoringEventRequest,
} from '@/types/proctoring'

interface UseProctoringSessionProps {
  attemptId?: string
  autoStart?: boolean
  onSessionTerminated?: () => void
}

export interface UseProctoringSessionReturn {
  session: ProctoringSessionResponse | null
  isLoading: boolean
  error: string | null
  heartbeatHealthy: boolean
  startSession: () => Promise<ProctoringSessionResponse | null>
  reportEvent: (
    eventType: ProctoringEventType,
    metadata?: Record<string, unknown>
  ) => Promise<void>
  updateCameraStreamStatus: (status: CameraStreamStatus) => Promise<void>
  completeSession: () => Promise<void>
}

export const useProctoringSession = ({
  attemptId,
  autoStart = false,
  onSessionTerminated,
}: UseProctoringSessionProps): UseProctoringSessionReturn => {
  const [session, setSession] = useState<ProctoringSessionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [heartbeatHealthy, setHeartbeatHealthy] = useState(true)

  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isStartingRef = useRef(false)
  const activeSessionIdRef = useRef<string | null>(null)

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(
    (sessionId: string) => {
      stopHeartbeat()
      // Send keepalive heartbeat every 30 seconds
      heartbeatIntervalRef.current = setInterval(() => {
        studentProctoringService
          .sendHeartbeat(sessionId)
          .then(() => {
            setHeartbeatHealthy(true)
          })
          .catch(() => {
            // Heartbeat failure indicates connection interruption
            setHeartbeatHealthy(false)
          })
      }, 30000)
    },
    [stopHeartbeat]
  )

  const startSession = useCallback(async (): Promise<ProctoringSessionResponse | null> => {
    if (!attemptId || isStartingRef.current) return null
    isStartingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const data = await studentProctoringService.startOrGetSession(attemptId)
      setSession(data)
      activeSessionIdRef.current = data.id

      if (data.status === 'TERMINATED') {
        onSessionTerminated?.()
      } else {
        startHeartbeat(data.id)
      }

      return data
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize proctoring session'
      setError(msg)
      return null
    } finally {
      setIsLoading(false)
      isStartingRef.current = false
    }
  }, [attemptId, startHeartbeat, onSessionTerminated])

  const reportEvent = useCallback(
    async (eventType: ProctoringEventType, metadata?: Record<string, unknown>) => {
      const sId = activeSessionIdRef.current
      if (!sId) return

      const request: ProctoringEventRequest = {
        eventType,
        eventTimestamp: new Date().toISOString(),
        idempotencyKey: `${eventType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        metadata,
      }

      try {
        await studentProctoringService.ingestEvents(sId, [request])
      } catch {
        // Event telemetry reporting failures should not crash exam execution
      }
    },
    []
  )

  const updateCameraStreamStatus = useCallback(
    async (status: CameraStreamStatus) => {
      const sId = activeSessionIdRef.current
      if (!sId) return

      try {
        const updated = await studentProctoringService.updateCameraStatus(sId, status)
        setSession(updated)
      } catch {
        // ignore
      }
    },
    []
  )

  const completeSession = useCallback(async () => {
    const sId = activeSessionIdRef.current
    stopHeartbeat()
    if (!sId) return

    try {
      await studentProctoringService.completeSession(sId)
    } catch {
      // ignore
    }
  }, [stopHeartbeat])

  // Automatically start if attemptId provided and autoStart enabled
  useEffect(() => {
    if (autoStart && attemptId) {
      studentProctoringService
        .startOrGetSession(attemptId)
        .then((data) => {
          setSession(data)
          activeSessionIdRef.current = data.id
          if (data.status === 'TERMINATED') {
            onSessionTerminated?.()
          } else {
            startHeartbeat(data.id)
          }
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Failed to initialize proctoring session'
          setError(msg)
        })
    }

    return () => {
      stopHeartbeat()
    }
  }, [autoStart, attemptId, startHeartbeat, stopHeartbeat, onSessionTerminated])

  return {
    session,
    isLoading,
    error,
    heartbeatHealthy,
    startSession,
    reportEvent,
    updateCameraStreamStatus,
    completeSession,
  }
}
