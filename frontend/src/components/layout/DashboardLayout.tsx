import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LogOut,
  LayoutDashboard,
  Users,
  BookOpen,
  Clock,
  ShieldAlert,
  PlusCircle,
  Award,
  User as UserIcon,
  Menu,
  X,
  ChevronRight,
  Video,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { CURRENT_YEAR } from '@/lib/utils/constants'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItemsByRole: Record<string, NavItem[]> = {
    ADMIN: [
      { label: 'Platform Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'User Directory', href: '/admin/users', icon: Users },
      { label: 'Exams Overview', href: '/admin/exams', icon: BookOpen },
      { label: 'Live Attempts', href: '/admin/attempts', icon: Clock },
      { label: 'Audit Trail', href: '/admin/reports', icon: ShieldAlert },
    ],
    LECTURER: [
      { label: 'Lecturer Dashboard', href: '/lecturer/dashboard', icon: LayoutDashboard },
      { label: 'Exam Repository', href: '/lecturer/exams', icon: BookOpen },
      { label: 'Live Monitoring', href: '/lecturer/monitoring', icon: Video },
      { label: 'Create New Exam', href: '/lecturer/exams/new', icon: PlusCircle },
    ],
    STUDENT: [
      { label: 'Student Home', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Available Exams', href: '/student/exams', icon: BookOpen },
      { label: 'Result History', href: '/student/results', icon: Award },
      { label: 'Academic Profile', href: '/student/profile', icon: UserIcon },
    ],
  }

  const navItems = role ? navItemsByRole[role] || [] : []

  // Generate breadcrumb trail
  const pathParts = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    const isLast = index === pathParts.length - 1
    return { url, label, isLast }
  })

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Sticky & Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <Link to="/" className="flex items-center">
            <Logo size="sm" variant="dark" subtitle="PORTAL" />
          </Link>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <Avatar name={user?.fullName || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Academic User'}</p>
              <div className="mt-0.5">
                {role === 'ADMIN' && <Badge variant="danger" size="sm">ADMINISTRATOR</Badge>}
                {role === 'LECTURER' && <Badge variant="primary" size="sm">LECTURER</Badge>}
                {role === 'STUDENT' && <Badge variant="neutral" size="sm">STUDENT</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.href ||
              (item.href !== `/${role?.toLowerCase()}/dashboard` && location.pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Trail */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link to="/" className="hover:text-slate-900 transition-colors">
                DRISHTI
              </Link>
              {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.url}>
                  <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                  {crumb.isLast ? (
                    <span className="text-slate-900 font-semibold">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.url} className="hover:text-slate-900 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-900 block leading-tight">{user?.fullName}</span>
              <span className="text-2xs text-slate-500 font-mono">{user?.email}</span>
            </div>
            <Avatar name={user?.fullName || 'User'} size="sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs"
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Standard Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>DRISHTI Assessment Engine — Verified Academic Instance</span>
            <span>© {CURRENT_YEAR} All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
