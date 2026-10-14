import { apiClient, setStoredToken, clearStoredToken, setStoredUser, clearStoredUser } from '@/lib/api/apiClient'
import { AppApiError } from '@/lib/api/apiErrors'
import type { ApiResponse } from '@/types/api'
import type { User } from '@/types/user'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponseData,
  ForgotPasswordData,
  ResetPasswordData,
} from '../types/authTypes'

export const authService = {
  /**
   * Authenticates user against POST /api/v1/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    })

    const authData = response.data.data
    const token = authData?.accessToken || authData?.token
    if (token) {
      setStoredToken(token, !!credentials.rememberMe)
      if (authData?.user) {
        setStoredUser(authData.user, !!credentials.rememberMe)
      }
    }

    return authData
  },

  /**
   * Registers a student user against POST /api/v1/auth/register
   * Note: The backend strictly creates accounts with role: STUDENT.
   */
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', {
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    })

    return response.data.data
  },

  /**
   * Registers a lecturer user against POST /api/v1/auth/register/lecturer
   * Account will be in pending-approval status until activated by Admin.
   */
  async registerLecturer(data: RegisterData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register/lecturer', {
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    })

    return response.data.data
  },

  /**
   * Fetches the current authenticated profile against GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data.data
  },

  /**
   * Logs out user by calling POST /api/v1/auth/logout and clearing local tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Stateless server logout: proceed with local cleanup regardless
    } finally {
      clearStoredToken()
      clearStoredUser()
    }
  },

  /**
   * Password reset request contract.
   * NOTE: The current Spring Boot backend does not yet have a dedicated /auth/forgot-password endpoint.
   * We honestly document this dependency and inform the user.
   */
  async requestPasswordReset(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
        email: data.email.trim().toLowerCase(),
      })
      return response.data.data
    } catch (err) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 405)) {
        throw new AppApiError(
          'Password reset service is currently disabled on this platform. Please contact your institution administrator.',
          'SERVICE_UNAVAILABLE',
          501
        )
      }
      throw err
    }
  },

  /**
   * Password reset confirmation contract.
   * NOTE: The current Spring Boot backend does not yet have a dedicated /auth/reset-password endpoint.
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      })
      return response.data.data
    } catch (err) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 405)) {
        throw new AppApiError(
          'Password reset service is currently disabled on this platform. Please contact your institution administrator.',
          'SERVICE_UNAVAILABLE',
          501
        )
      }
      throw err
    }
  },
}
