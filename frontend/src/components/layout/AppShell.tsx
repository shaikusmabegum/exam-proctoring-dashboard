import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { CURRENT_YEAR } from '@/lib/utils/constants'

export interface AppShellProps {
  children?: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleBadges = {
    ADMIN: <Badge variant="danger" size="sm">ADMINISTRATOR</Badge>,
    LECTURER: <Badge variant="primary" size="sm">LECTURER</Badge>,
    STUDENT: <Badge variant="neutral" size="sm">STUDENT</Badge>,
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center group">
              <Logo size="md" subtitle="Academic Platform" />
            </Link>

            {role && <div>{roleBadges[role]}</div>}
          </div>

          {/* User Controls & Logout */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900 leading-none">{user.fullName}</p>
                  <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                </div>
                <Avatar name={user.fullName} size="sm" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-3.5 w-3.5" />}
                  className="ml-2"
                >
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Platform Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            <span>DRISHTI Assessment & AI Remote Proctoring Environment</span>
          </div>
          <p>© {CURRENT_YEAR} DRISHTI Academic Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
