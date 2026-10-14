import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Trash2,
  UserCheck,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/feedback/Modal'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { adminService } from '../services/adminService'
import type { UserSummaryResponse } from '@/types/admin'
import type { Role } from '@/types/user'

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth()
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [users, setUsers] = useState<UserSummaryResponse[]>([])
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [page, setPage] = useState<number>(0)
  const [pageSize] = useState<number>(10)

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Status toggle confirmation modal
  const [selectedUser, setSelectedUser] = useState<UserSummaryResponse | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  // Delete confirmation modal
  const [userToDelete, setUserToDelete] = useState<UserSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  // Approving user state
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    const activeParam =
      statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
    const roleParam = roleFilter ? (roleFilter as Role) : undefined

    return adminService.getUsers({
      role: roleParam,
      active: activeParam,
      page,
      size: pageSize,
      sortBy: 'createdAt',
      direction: 'desc',
    })
  }, [page, pageSize, roleFilter, statusFilter])

  useEffect(() => {
    let isMounted = true
    fetchUsers()
      .then((response) => {
        if (!isMounted) return
        setUsers(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve platform users')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [fetchUsers])

  const refreshUsers = () => {
    setIsLoading(true)
    setError(null)
    fetchUsers()
      .then((response) => {
        setUsers(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to retrieve platform users')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleStatus = async () => {
    if (!selectedUser) return

    // Prevent disabling self
    if (selectedUser.id === currentUser?.id) {
      showToastError('Security restriction: You cannot deactivate your own administrative account.')
      setSelectedUser(null)
      return
    }

    setIsUpdatingStatus(true)
    try {
      const updated = await adminService.updateUserStatus(selectedUser.id, !selectedUser.active)
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, active: updated.active } : u))
      )
      showToastSuccess(
        `User ${updated.fullName} has been ${updated.active ? 'activated' : 'deactivated'}.`
      )
      setSelectedUser(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user status'
      showToastError(msg)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleApproveUser = async (userToApprove: UserSummaryResponse) => {
    setApprovingUserId(userToApprove.id)
    try {
      const updated = await adminService.approveUser(userToApprove.id)
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, active: true, approved: true } : u))
      )
      showToastSuccess(
        `Faculty account for ${updated.fullName} has been approved and activated.`,
        'Lecturer Approved'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve lecturer account'
      showToastError(msg)
    } finally {
      setApprovingUserId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    if (userToDelete.id === currentUser?.id) {
      showToastError('Security restriction: You cannot delete your own administrative account.')
      setUserToDelete(null)
      return
    }

    setIsDeleting(true)
    try {
      await adminService.deleteUser(userToDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setTotalElements((prev) => Math.max(0, prev - 1))
      showToastSuccess(`Account for ${userToDelete.fullName} has been permanently deleted.`, 'User Deleted')
      setUserToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete user account'
      showToastError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter users client-side by search query and pending status if selected
  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'pending') {
      const isPending = u.role === 'LECTURER' && (!u.approved || !u.active)
      if (!isPending) return false
    }

    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  // Count pending lecturer approvals
  const pendingApprovalsCount = users.filter(
    (u) => u.role === 'LECTURER' && (!u.approved || !u.active)
  ).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage student accounts, review and approve faculty registrations, and control platform access permissions.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshUsers}
            isLoading={isLoading}
            leftIcon={<RotateCw className="h-4 w-4" />}
          >
            Refresh Directory
          </Button>
        </div>

        {/* Pending Approvals Notice Banner */}
        {pendingApprovalsCount > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {pendingApprovalsCount} Lecturer Registration{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Review
                </p>
                <p className="text-xs text-amber-700">
                  New faculty registrations remain inactive until an administrator approves their credentials.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter('pending')
                setRoleFilter('LECTURER')
              }}
              className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100/50 shrink-0"
            >
              Filter Pending Approvals
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="error" title="Error Loading Users">
            {error}
          </Alert>
        )}

        {/* Filter Controls Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Search Directory"
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Role Filter</label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value)
                    setPage(0)
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles (Global)</option>
                  <option value="ADMIN">Administrators</option>
                  <option value="LECTURER">Lecturers (Faculty)</option>
                  <option value="STUDENT">Students</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending Approval (Lecturers)</option>
                  <option value="active">Active Accounts Only</option>
                  <option value="inactive">Deactivated Accounts</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Users Database ({totalElements} accounts registered)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Users className="h-8 w-8 text-slate-400" />}
                  title="No users match the criteria"
                  description="Adjust your search filters or clear your selection to view all platform accounts."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Email Verified</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === currentUser?.id
                      const isPendingLecturer = u.role === 'LECTURER' && (!u.approved || !u.active)
                      const isPrimaryAdmin = u.role === 'ADMIN' && u.email === 'admin@drishti.com'

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.fullName} size="sm" />
                              <div>
                                <p className="font-medium text-slate-900">{u.fullName}</p>
                                <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.role === 'ADMIN' && <Badge variant="danger" size="sm">ADMIN</Badge>}
                            {u.role === 'LECTURER' && <Badge variant="primary" size="sm">LECTURER</Badge>}
                            {u.role === 'STUDENT' && <Badge variant="neutral" size="sm">STUDENT</Badge>}
                          </td>
                          <td className="py-3.5 px-4">
                            {isPendingLecturer ? (
                              <Badge variant="warning" size="sm" dot>Pending Approval</Badge>
                            ) : u.active ? (
                              <Badge variant="success" size="sm" dot>Active</Badge>
                            ) : (
                              <Badge variant="danger" size="sm">Disabled</Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.emailVerified ? (
                              <span className="flex items-center gap-1.5 text-xs text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <XCircle className="h-3.5 w-3.5 text-slate-400" />
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* One-click Approve button for pending lecturers */}
                              {isPendingLecturer && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  isLoading={approvingUserId === u.id}
                                  onClick={() => handleApproveUser(u)}
                                  leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                                >
                                  Approve
                                </Button>
                              )}

                              {/* Toggle active status */}
                              <Button
                                variant={u.active ? 'outline' : 'primary'}
                                size="sm"
                                disabled={isSelf}
                                onClick={() => setSelectedUser(u)}
                              >
                                {isSelf ? 'Self' : u.active ? 'Deactivate' : 'Activate'}
                              </Button>

                              {/* Delete account */}
                              {!isSelf && !isPrimaryAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setUserToDelete(u)}
                                  title="Delete User Account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {page + 1} of {totalPages} ({totalElements} total)
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

        {/* Status Confirmation Modal */}
        {selectedUser && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedUser(null)}
            title={selectedUser.active ? 'Deactivate User Account?' : 'Activate User Account?'}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold">Security Action Confirmation</p>
                  <p className="mt-0.5">
                    {selectedUser.active
                      ? `Deactivating ${selectedUser.fullName} (${selectedUser.email}) will immediately prevent them from signing in and accessing examinations.`
                      : `Activating ${selectedUser.fullName} (${selectedUser.email}) will restore full platform access.`}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button
                  variant={selectedUser.active ? 'destructive' : 'primary'}
                  size="sm"
                  isLoading={isUpdatingStatus}
                  onClick={handleToggleStatus}
                >
                  Confirm {selectedUser.active ? 'Deactivation' : 'Activation'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <Modal
            isOpen={true}
            onClose={() => setUserToDelete(null)}
            title={`Delete ${userToDelete.role} Account?`}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg text-red-800 text-xs">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold">Permanent Account Removal</p>
                  <p className="mt-0.5">
                    Are you sure you want to permanently delete the account for <strong>{userToDelete.fullName}</strong> ({userToDelete.email})? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setUserToDelete(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={isDeleting}
                  onClick={handleDeleteUser}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
