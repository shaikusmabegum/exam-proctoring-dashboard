import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  RotateCw,
  Award,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { lecturerService } from '../services/lecturerService'
import type { LecturerExamAnalyticsResponse } from '@/types/admin'

const PIE_COLORS = ['#10b981', '#ef4444']

export const LecturerExamAnalyticsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const [analytics, setAnalytics] = useState<LecturerExamAnalyticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!examId) return
    let isMounted = true
    lecturerService
      .getExamAnalytics(examId)
      .then((data) => {
        if (isMounted) setAnalytics(data)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve examination analytics')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [examId])

  const refreshAnalytics = () => {
    if (!examId) return
    setIsLoading(true)
    setError(null)
    lecturerService
      .getExamAnalytics(examId)
      .then(setAnalytics)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to retrieve examination analytics')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const distributionData = analytics?.scoreDistribution
    ? Object.entries(analytics.scoreDistribution).map(([bracket, count]) => ({
        bracket,
        count,
      }))
    : []

  const passFailData = analytics
    ? [
        { name: 'Passed', value: analytics.passCount },
        { name: 'Failed', value: analytics.failCount },
      ].filter((d) => d.value > 0)
    : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/lecturer/exams/${examId}`}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Exam
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Examination Performance Analytics
              </h1>
              <p className="text-xs text-slate-500">{analytics?.examTitle || 'Analytics Overview'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Analytics">
            {error}
          </Alert>
        )}

        {/* Top Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Average Score
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics ? `${analytics.averagePercentage.toFixed(1)}%` : '0%'}
                </h3>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Avg: {analytics?.averageScore.toFixed(1) ?? 0} marks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Pass Rate
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {analytics ? `${analytics.passRate.toFixed(1)}%` : '0%'}
                </h3>
              )}
              <p className="text-xs text-slate-500 mt-1">
                {analytics?.passCount ?? 0} pass / {analytics?.failCount ?? 0} fail
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Score Range
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics?.lowestScore ?? 0} – {analytics?.highestScore ?? 0}
                </h3>
              )}
              <p className="text-xs text-slate-500 mt-1">Min and max marks recorded</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Submissions
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-blue-600 mt-1">
                  {analytics?.completedAttempts ?? 0}
                </h3>
              )}
              <p className="text-xs text-slate-500 mt-1">
                {analytics?.inProgressAttempts ?? 0} sessions currently in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Distribution Histogram */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Score Distribution (% Brackets)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : distributionData.length === 0 || analytics?.completedAttempts === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No completed student submissions to plot score distribution.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pass vs Fail Ratio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                Outcome Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : passFailData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No outcomes recorded yet.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passFailData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {passFailData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name === 'Passed' ? PIE_COLORS[0] : PIE_COLORS[1]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
