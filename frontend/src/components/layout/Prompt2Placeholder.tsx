import React from 'react'
import { ShieldCheck, UserCheck, Calendar, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShell } from './AppShell'
import { PageContainer } from './PageContainer'
import { PageHeader } from './PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export interface Prompt2PlaceholderProps {
  portalName: string
  expectedRole: string
}

export const Prompt2Placeholder: React.FC<Prompt2PlaceholderProps> = ({
  portalName,
  expectedRole,
}) => {
  const { user } = useAuth()

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title={`${portalName} Workspace`}
          description={`Authenticated session verified for ${user?.fullName} (${user?.role})`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: portalName },
          ]}
          actions={
            <Link to="/">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Platform Overview
              </Button>
            </Link>
          }
        />

        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Session Identity & Verification</CardTitle>
                  <CardDescription>
                    Cryptographically validated via Spring Security 6 stateless JWT
                  </CardDescription>
                </div>
                <Badge variant="success" size="md" dot>
                  SESSION ACTIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">User ID:</span>
                  <p className="font-mono text-slate-800 text-xs mt-0.5 truncate">{user?.id}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Email:</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">{user?.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Enforced Role:</span>
                  <p className="font-bold text-blue-600 text-xs mt-0.5">{user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="p-8 text-center max-w-xl mx-auto space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {portalName} Foundation Operational
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prompt 1 frontend foundation, design system, route guards, token management, and backend authentication are fully functional. Complete role modules (examination execution, live SSE proctoring console, and administrative controls) will be delivered in Prompt 2.
              </p>
              <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Route Guard: {expectedRole}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Scheduled for Prompt 2
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppShell>
  )
}
