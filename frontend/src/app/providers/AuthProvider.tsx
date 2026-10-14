import React, { useState, useEffect, useCallback } from 'react'
import { authService } from '@/features/auth/services/authService'
import {
  getStoredToken,
  getStoredUser,
  setStoredUser,
  clearStoredToken,
  clearStoredUser,
} from '@/lib/api/apiClient'
import type { User, Role } from '@/types/user'
import type { LoginCredentials, RegisterData } from '@/features/auth/types/authTypes'
import { AuthContext } from './authContext'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  // Only block render if we have a token but NO cached user data to prevent reload wait times
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = getStoredToken()
    const storedUser = getStoredUser()
    return Boolean(token && !storedUser)
  })

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser)
          const isRemembered = Boolean(localStorage.getItem('drishti_auth_token'))
          setStoredUser(currentUser, isRemembered)
        }
      })
      .catch((err: unknown) => {
        // If the token is invalid or expired (401), clear the session
        const status = (err as { status?: number; response?: { status?: number } })?.status ??
                       (err as { response?: { status?: number } })?.response?.status
        if (status === 401) {
          if (isMounted) {
            setUser(null)
            clearStoredToken()
            clearStoredUser()
          }
        }
        // If it's a temporary network error or offline state, retain the cached user session
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true)
    try {
      const authData = await authService.login(credentials)
      setUser(authData.user)
      return authData.user
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<User> => {
    setIsLoading(true)
    try {
      const newUser = await authService.register(data)
      return newUser
    } finally {
      setIsLoading(false)
    }
  }

  const registerLecturer = async (data: RegisterData): Promise<User> => {
    setIsLoading(true)
    try {
      const newUser = await authService.registerLecturer(data)
      return newUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      clearStoredToken()
      clearStoredUser()
      setIsLoading(false)
    }
  }

  const getRoleRedirectPath = (targetRole?: Role): string => {
    const activeRole = targetRole || user?.role
    switch (activeRole) {
      case 'ADMIN':
        return '/admin/dashboard'
      case 'LECTURER':
        return '/lecturer/dashboard'
      case 'STUDENT':
        return '/student/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        registerLecturer,
        logout,
        refreshUser,
        getRoleRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
