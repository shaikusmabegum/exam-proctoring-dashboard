import { createContext } from 'react'
import type { User, Role } from '@/types/user'
import type { LoginCredentials, RegisterData } from '@/features/auth/types/authTypes'

export interface AuthContextType {
  user: User | null
  role: Role | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  registerLecturer: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  getRoleRedirectPath: (targetRole?: Role) => string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
