import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export interface PublicRouteProps {
  children: React.ReactNode
}

/**
 * PublicRoute redirects authenticated users to their corresponding dashboard
 * so they do not see login/register pages unnecessarily.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, role, getRoleRedirectPath, isLoading } = useAuth()

  if (isLoading) {
    return <>{children}</>
  }

  if (isAuthenticated && role) {
    return <Navigate to={getRoleRedirectPath(role)} replace />
  }

  return <>{children}</>
}
