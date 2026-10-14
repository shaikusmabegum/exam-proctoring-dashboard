import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { AppShell } from '@/components/layout/AppShell'

export const UnauthorizedPage: React.FC = () => {
  const { user, role, getRoleRedirectPath } = useAuth()
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
          <ShieldX className="h-9 w-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Access Restricted (403)
        </h1>

        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          You do not possess the required privileges to view this section of the platform.
          {user && (
            <span className="block mt-2 font-medium text-slate-700">
              Current account role: <span className="font-bold text-blue-600">{role}</span> ({user.email})
            </span>
          )}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          {user ? (
            <Link to={getRoleRedirectPath(role || undefined)} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Home className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Return to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Sign in with Another Account
              </Button>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  )
}
