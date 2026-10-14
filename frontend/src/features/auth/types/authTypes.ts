import type { User } from '@/types/user'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
}

export interface AuthResponseData {
  token?: string
  accessToken?: string
  tokenType?: string
  type?: string
  expiresInMs?: number
  user: User
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
}
