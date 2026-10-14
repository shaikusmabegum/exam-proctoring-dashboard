import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { normalizeApiError } from './apiErrors'
import type { User } from '@/types/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Storage keys
const TOKEN_STORAGE_KEY = 'drishti_auth_token'
const USER_STORAGE_KEY = 'drishti_auth_user'

/**
 * In-memory active bearer token & user reference
 */
let inMemoryToken: string | null = null
let inMemoryUser: User | null = null

export function getStoredToken(): string | null {
  if (inMemoryToken) {
    return inMemoryToken
  }
  // Fallback to sessionStorage/localStorage if session was restored
  try {
    const sessionToken = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    if (sessionToken) {
      inMemoryToken = sessionToken
      return sessionToken
    }
    const localToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (localToken) {
      inMemoryToken = localToken
      return localToken
    }
  } catch {
    // Handle environments where storage access is restricted
  }
  return null
}

export function setStoredToken(token: string | null, rememberMe: boolean = false): void {
  inMemoryToken = token
  try {
    if (token) {
      if (rememberMe) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token)
        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      } else {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    // Storage access restricted
  }
}

export function clearStoredToken(): void {
  inMemoryToken = null
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Storage access restricted
  }
}

export function getStoredUser(): User | null {
  if (inMemoryUser) {
    return inMemoryUser
  }
  try {
    const sessionUser = sessionStorage.getItem(USER_STORAGE_KEY)
    if (sessionUser) {
      inMemoryUser = JSON.parse(sessionUser)
      return inMemoryUser
    }
    const localUser = localStorage.getItem(USER_STORAGE_KEY)
    if (localUser) {
      inMemoryUser = JSON.parse(localUser)
      return inMemoryUser
    }
  } catch {
    // Storage access restricted or invalid JSON
  }
  return null
}

export function setStoredUser(user: User | null, rememberMe: boolean = false): void {
  inMemoryUser = user
  try {
    if (user) {
      const serialized = JSON.stringify(user)
      if (rememberMe) {
        localStorage.setItem(USER_STORAGE_KEY, serialized)
        sessionStorage.removeItem(USER_STORAGE_KEY)
      } else {
        sessionStorage.setItem(USER_STORAGE_KEY, serialized)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    } else {
      sessionStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch {
    // Storage access restricted
  }
}

export function clearStoredUser(): void {
  inMemoryUser = null
  try {
    sessionStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch {
    // Storage access restricted
  }
}

/**
 * Centralized Axios instance for DRISHTI REST APIs
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Bearer JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(normalizeApiError(error))
)

// Response Interceptor: Normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredToken()
      clearStoredUser()
    }
    const normalized = normalizeApiError(error)
    return Promise.reject(normalized)
  }
)
