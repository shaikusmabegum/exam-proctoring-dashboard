import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'

export const StudentProfilePage: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Verified identity credentials associated with your DRISHTI examination sessions.
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-blue-600" />
              Candidate Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <Avatar name={user?.fullName || 'User'} size="lg" />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                  <Badge variant="neutral" size="sm">CANDIDATE: STUDENT</Badge>
                  <Badge variant="success" size="sm" dot>Active Account</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Primary Institutional Email
                </span>
                <strong className="text-slate-900 block font-mono">{user?.email}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  Security Authorization Tier
                </span>
                <strong className="text-slate-900 block">{user?.role} (Standard Student Permissions)</strong>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Verified Candidate Identity
              </p>
              <p>
                Your candidate identity is authenticated via Spring Security JWT session tokens.
                All examination responses and proctoring telemetry are cryptographically linked to your verified account.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sign Out Academic Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
