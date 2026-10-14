import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Activity,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
  WifiOff,
  Search,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConnectionStatusIndicator } from '@/features/live-monitoring/components/ConnectionStatusIndicator'
import { LiveSessionTable } from '@/features/live-monitoring/components/LiveSessionTable'
import { SessionDetailDrawer } from '@/features/live-monitoring/components/SessionDetailDrawer'
import { ReviewDecisionDialog } from '@/features/live-monitoring/components/ReviewDecisionDialog'
import { ViolationSeverityBadge, ReviewStatusBadge } from '@/features/proctoring/components/ViolationSeverityBadge'
import { useLiveMonitoring } from '@/features/live-monitoring/hooks/useLiveMonitoring'
import type {
  ProctoringSessionResponse,
  ProctoringReviewResponse,
  ProctoringSessionStatus,
  ProctoringReviewStatus,
} from '@/types/proctoring'

export const LecturerLiveMonitoringPage: React.FC = () => {
  const { examId = '' } = useParams<{ examId: string }>()

  // Active view tab: 'sessions' | 'reviews'
  const [activeTab, setActiveTab] = useState<'sessions' | 'reviews'>('sessions')

  // Filters
  const [sessionStatusFilter, setSessionStatusFilter] = useState<ProctoringSessionStatus | undefined>(undefined)
  const [reviewStatusFilter, setReviewStatusFilter] = useState<ProctoringReviewStatus | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // Selected session for detail drawer
  const [selectedSession, setSelectedSession] = useState<ProctoringSessionResponse | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Selected review for adjudication dialog
  const [selectedReview, setSelectedReview] = useState<ProctoringReviewResponse | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  const {
    summary,
    sessions,
    reviews,
    isLoading,
    error,
    connectionStatus,
    lastUpdated,
    refreshData,
  } = useLiveMonitoring({
    examId,
    sessionStatusFilter,
    reviewStatusFilter,
    pollingIntervalMs: 10000,
  })

  const handleOpenSessionDrawer = (session: ProctoringSessionResponse) => {
    setSelectedSession(session)
    setIsDrawerOpen(true)
  }

  const handleOpenReviewDialog = (review: ProctoringReviewResponse) => {
    setSelectedReview(review)
    setIsReviewDialogOpen(true)
  }

  const handleReviewSuccess = () => {
    void refreshData()
  }

  // Filter sessions locally by student search
  const filteredSessions = (sessions?.content || []).filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return s.studentName.toLowerCase().includes(q) || s.studentEmail.toLowerCase().includes(q)
  })

  // Filter reviews locally by student search
  const filteredReviews = (reviews?.content || []).filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q) ||
      r.violationCategory.toLowerCase().includes(q)
    )
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Live Connection Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/lecturer/monitoring">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                All Proctoring Feeds
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Examination Live Monitoring Console
              </h1>
              <p className="text-xs text-slate-500 font-mono">Exam ID: {examId}</p>
            </div>
          </div>

          <ConnectionStatusIndicator
            status={connectionStatus}
            lastUpdated={lastUpdated}
            onRefresh={() => void refreshData()}
            isRefreshing={isLoading}
          />
        </div>

        {error && (
          <Alert variant="error" title="Telemetry Feed Interrupted">
            {error}
          </Alert>
        )}

        {/* 6 Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Total Candidates
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {summary?.totalSessions ?? 0}
                    </h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Active Telemetry
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl font-extrabold text-emerald-600 mt-0.5">
                      {summary?.activeSessions ?? 0}
                    </h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Interrupted Feeds
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl font-extrabold text-amber-600 mt-0.5">
                      {summary?.connectionInterruptedSessions ?? 0}
                    </h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <WifiOff className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Signals Ingested
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
                      {summary?.totalEvents ?? 0}
                    </h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FileCheck2 className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={summary && summary.openReviews > 0 ? 'border-rose-300 bg-rose-50/20' : ''}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Open Reviews
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl font-extrabold text-rose-600 mt-0.5">
                      {summary?.openReviews ?? 0}
                    </h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Confirmed
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {summary?.confirmedViolations ?? 0}
                    </h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Selection Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Live Candidate Sessions ({sessions?.totalElements ?? 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Flagged Incidents & Review ({reviews?.totalElements ?? 0})</span>
              {summary && summary.openReviews > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                  {summary.openReviews}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Live Sessions Grid */}
        {activeTab === 'sessions' && (
          <Card>
            <CardHeader className="py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Active & Completed Candidate Feeds
              </CardTitle>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSessionStatusFilter(undefined)}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    sessionStatusFilter === undefined
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Feeds
                </button>
                <button
                  type="button"
                  onClick={() => setSessionStatusFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    sessionStatusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Active Only
                </button>
                <button
                  type="button"
                  onClick={() => setSessionStatusFilter('CONNECTION_INTERRUPTED')}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    sessionStatusFilter === 'CONNECTION_INTERRUPTED'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Interrupted
                </button>
                <button
                  type="button"
                  onClick={() => setSessionStatusFilter('COMPLETED')}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    sessionStatusFilter === 'COMPLETED'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Finished
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <LiveSessionTable
                sessions={filteredSessions}
                isLoading={isLoading}
                onSelectSession={handleOpenSessionDrawer}
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Flagged Incidents & Review Grid */}
        {activeTab === 'reviews' && (
          <Card>
            <CardHeader className="py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Flagged Telemetry Incidents Requiring Human Adjudication
              </CardTitle>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter(undefined)}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    reviewStatusFilter === undefined
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Incidents
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter('OPEN')}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    reviewStatusFilter === 'OPEN'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Open Only
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter('UNDER_REVIEW')}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    reviewStatusFilter === 'UNDER_REVIEW'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Under Review
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter('CONFIRMED')}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    reviewStatusFilter === 'CONFIRMED'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter('DISMISSED')}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold cursor-pointer ${
                    reviewStatusFilter === 'DISMISSED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dismissed
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<CheckCircle2 className="h-8 w-8 text-emerald-500" />}
                    title="No flagged incidents recorded"
                    description="No proctoring anomalies matching the current filter require instructor review."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Violation Category</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">Review State</th>
                        <th className="py-3 px-4">Flagged Timestamp</th>
                        <th className="py-3 px-4">Notes / Reason</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-semibold text-xs text-slate-900">{rev.studentName}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{rev.studentEmail}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-xs text-slate-800">
                            {rev.violationCategory}
                          </td>

                          <td className="py-3.5 px-4">
                            <ViolationSeverityBadge severity={rev.severity} size="sm" />
                          </td>

                          <td className="py-3.5 px-4">
                            <ReviewStatusBadge status={rev.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                            {new Date(rev.createdAt).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                            {rev.resolutionReason || rev.reviewerNotes || '—'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReviewDialog(rev)}
                            >
                              Adjudicate
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Telemetry Audit Drawer */}
        <SessionDetailDrawer
          session={selectedSession}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        {/* Human Adjudication Decision Dialog */}
        <ReviewDecisionDialog
          review={selectedReview}
          isOpen={isReviewDialogOpen}
          onClose={() => setIsReviewDialogOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      </div>
    </DashboardLayout>
  )
}
