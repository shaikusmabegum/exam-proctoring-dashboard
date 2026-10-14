import { useState, useEffect, useRef, useCallback } from 'react'
import { lecturerMonitoringService } from '@/features/proctoring/services/lecturerMonitoringService'
import type {
  ProctoringSummaryResponse,
  ProctoringSessionResponse,
  ProctoringReviewResponse,
  ProctoringSessionStatus,
  ProctoringReviewStatus,
  StreamConnectionStatus,
} from '@/types/proctoring'
import type { PageResponse } from '@/types/api'

interface UseLiveMonitoringProps {
  examId: string
  sessionStatusFilter?: ProctoringSessionStatus
  reviewStatusFilter?: ProctoringReviewStatus
  pollingIntervalMs?: number
}

export interface UseLiveMonitoringReturn {
  summary: ProctoringSummaryResponse | null
  sessions: PageResponse<ProctoringSessionResponse> | null
  reviews: PageResponse<ProctoringReviewResponse> | null
  isLoading: boolean
  error: string | null
  connectionStatus: StreamConnectionStatus
  lastUpdated: Date | null
  refreshData: () => Promise<void>
}

export const useLiveMonitoring = ({
  examId,
  sessionStatusFilter,
  reviewStatusFilter,
  pollingIntervalMs = 10000,
}: UseLiveMonitoringProps): UseLiveMonitoringReturn => {
  const [summary, setSummary] = useState<ProctoringSummaryResponse | null>(null)
  const [sessions, setSessions] = useState<PageResponse<ProctoringSessionResponse>>({
    content: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })
  const [reviews, setReviews] = useState<PageResponse<ProctoringReviewResponse>>({
    content: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<StreamConnectionStatus>('polling')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const isMountedRef = useRef(true)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isFetchingRef = useRef(false)

  const fetchMonitoringData = useCallback(async () => {
    if (!examId || isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const [summaryData, sessionsData, reviewsData] = await Promise.all([
        lecturerMonitoringService.getExamSummary(examId),
        lecturerMonitoringService.getExamSessions(examId, {
          status: sessionStatusFilter,
          page: 0,
          size: 50,
        }),
        lecturerMonitoringService.getExamReviews(examId, {
          status: reviewStatusFilter,
          page: 0,
          size: 50,
        }),
      ])

      if (isMountedRef.current) {
        setSummary(summaryData)
        setSessions(sessionsData)
        setReviews(reviewsData)
        setError(null)
        setLastUpdated(new Date())
        setConnectionStatus('polling')
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch monitoring telemetry'
        setError(msg)
        setConnectionStatus('offline')
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      isFetchingRef.current = false
    }
  }, [examId, sessionStatusFilter, reviewStatusFilter])

  // Initial fetch and periodic polling
  useEffect(() => {
    isMountedRef.current = true

    // Execute initial fetch asynchronously
    const initialTimer = setTimeout(() => {
      void fetchMonitoringData()
    }, 0)

    // Setup periodic polling
    pollTimerRef.current = setInterval(() => {
      void fetchMonitoringData()
    }, pollingIntervalMs)

    return () => {
      isMountedRef.current = false
      clearTimeout(initialTimer)
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [fetchMonitoringData, pollingIntervalMs])

  return {
    summary,
    sessions,
    reviews,
    isLoading,
    error,
    connectionStatus,
    lastUpdated,
    refreshData: fetchMonitoringData,
  }
}
