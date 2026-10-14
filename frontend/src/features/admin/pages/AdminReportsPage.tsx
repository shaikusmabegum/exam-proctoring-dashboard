import React, { useEffect, useState, useCallback } from 'react'
import {
  ShieldAlert,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { adminService } from '../services/adminService'
import type { AuditLogResponse } from '@/types/admin'

export const AdminReportsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponse[]>([])
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [page, setPage] = useState<number>(0)
  const [pageSize] = useState<number>(15)

  const [actorEmail, setActorEmail] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditLogs = useCallback(async () => {
    return adminService.getAuditLogs({
      actorEmail: actorEmail.trim() || undefined,
      action: actionFilter.trim() || undefined,
      resourceType: resourceTypeFilter.trim() || undefined,
      page,
      size: pageSize,
    })
  }, [actorEmail, actionFilter, resourceTypeFilter, page, pageSize])

  useEffect(() => {
    let isMounted = true
    fetchAuditLogs()
      .then((response) => {
        if (!isMounted) return
        setLogs(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve platform audit trail')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [fetchAuditLogs])

  const refreshAuditLogs = () => {
    setIsLoading(true)
    setError(null)
    fetchAuditLogs()
      .then((response) => {
        setLogs(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to retrieve platform audit trail')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security Audit Trail</h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable logging of administrative operations, security authorization changes, and academic activities.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAuditLogs}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error Loading Audit Trail">
            {error}
          </Alert>
        )}

        {/* Filter Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Actor Email"
                placeholder="Filter by actor email..."
                value={actorEmail}
                onChange={(e) => setActorEmail(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              />
              <Input
                label="Action Filter"
                placeholder="e.g. LOGIN, EXAM_PUBLISH..."
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                leftIcon={<Filter className="h-4 w-4 text-slate-400" />}
              />
              <Input
                label="Resource Type"
                placeholder="e.g. USER, EXAM, ATTEMPT..."
                value={resourceTypeFilter}
                onChange={(e) => setResourceTypeFilter(e.target.value)}
                leftIcon={<Filter className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Recorded Audit Events ({totalElements} total entries)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<ShieldAlert className="h-8 w-8 text-slate-400" />}
                  title="No audit events recorded"
                  description="No audit trail events match the current search criteria."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 text-xs">{log.actorEmail}</p>
                          <Badge variant="neutral" size="sm" className="mt-0.5">{log.actorRole}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="primary" size="sm" className="font-mono">{log.action}</Badge>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-600">
                          {log.resourceType} {log.resourceId ? `(${log.resourceId.substring(0, 8)}...)` : ''}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-500">
                          {log.ipAddress || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={log.details}>
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {page + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
