import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/user'
import { PageLoader } from '@/components/feedback/PageLoader'

export interface RoleRouteProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { role, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <PageLoader message="Verifying user credentials & permissions..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
