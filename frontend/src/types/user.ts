export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT'

export interface User {
  id: string
  fullName: string
  email: string
  role: Role
  active: boolean
  approved?: boolean
  createdAt?: string
}
