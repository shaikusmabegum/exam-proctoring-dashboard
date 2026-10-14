import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  Users,
  Server,
  Activity,
  FileCheck2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import { CURRENT_YEAR } from '@/lib/utils/constants'

export const LandingPage: React.FC = () => {
  const { user, role, getRoleRedirectPath } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" subtitle="Examination Platform" />
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to={getRoleRedirectPath(role || undefined)}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Go to {role} Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Student Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-linear-to-b from-white to-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-6">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Enterprise Academic Assessment & AI Remote Proctoring</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Intelligent assessments. <br />
            <span className="text-blue-600">Trusted outcomes.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A secure online examination platform engineered for universities, academic institutions, and certification bodies. Combines privacy-first client telemetry with authoritative evaluation and live instructor oversight.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to={getRoleRedirectPath(role || undefined)}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Access {role} Portal
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Sign in to Portal
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg">
                    Register as Student
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-left">
            <div className="p-3 border-r border-slate-100 last:border-none">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Integrity</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">Continuous</p>
              <p className="text-[11px] text-slate-400">AI telemetry monitoring</p>
            </div>
            <div className="p-3 border-r border-slate-100 last:border-none">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Timers</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">Authoritative</p>
              <p className="text-[11px] text-slate-400">Server-enforced deadlines</p>
            </div>
            <div className="p-3 border-r border-slate-100 last:border-none">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Grading</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">Hybrid Engine</p>
              <p className="text-[11px] text-slate-400">Automated + manual review</p>
            </div>
            <div className="p-3">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Security</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">Audited</p>
              <p className="text-[11px] text-slate-400">Tamper-evident logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" size="md">Architecture & Safeguards</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-3">
              Built on strict academic and technical safeguards
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Every stage of the assessment lifecycle has been engineered with defense-in-depth principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <Card variant="default" className="border-slate-200 flex flex-col">
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 border border-blue-100">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI Remote Proctoring</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Real-time client telemetry detecting tab switches, fullscreen departures, face absence, and secondary individuals, streamed via SSE to proctor consoles.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>TokenBucket rate-limited ingestion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Idempotent replayed signal deduplication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Human-in-the-loop violation verdict review</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pillar 2 */}
            <Card variant="default" className="border-slate-200 flex flex-col">
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 border border-indigo-100">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Authoritative Examination Engine</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Strictly synchronized attempt countdowns that reject stale submissions, coupled with zero-leak student DTOs hiding answer keys until instructor release.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Automated scoring for objective questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Configurable negative marking penalties</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Instructor-managed answer key visibility</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pillar 3 */}
            <Card variant="default" className="border-slate-200 flex flex-col">
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 border border-slate-200">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Role-Based Governance</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Three distinct authorization tiers (Student, Lecturer, Admin) backed by Spring Security 6 stateless JWTs, BCrypt password hashing, and sanitized audit trails.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Pre-authorization method-level security</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Redacted credential logging in audit logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Actuator health probes & Prometheus metrics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Workspaces Preview */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Three Dedicated Academic Workspaces
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Each user persona operates within an isolated, tailored experience matching their administrative responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-slate-900">Student Portal</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Discover active scheduled exams, verify camera permissions, take timed tests with autosave, and view released grades.
              </p>
              <Link to="/register" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                <span>Register student profile</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Lecturer Console</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Author question banks, publish exams, observe real-time student telemetry via SSE, and resolve flagged violation reviews.
              </p>
              <Link to="/login" className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1">
                <span>Sign in as lecturer</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <Server className="h-5 w-5 text-slate-700" />
                <h4 className="font-bold text-slate-900">Admin Control Center</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Manage university user accounts, supervise system-wide proctoring sessions, review audit trails, and inspect analytics.
              </p>
              <Link to="/login" className="text-xs font-semibold text-slate-700 hover:underline inline-flex items-center gap-1">
                <span>Sign in as administrator</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" variant="dark" subtitle="Intelligent assessments. Trusted outcomes." />

          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <span>Spring Boot 3.4.2 REST Backend</span>
            <span>MongoDB 7.0 Persistence</span>
            <span>WCAG 2.2 AA Accessibility Compliant</span>
          </div>

          <p className="text-slate-500">
            © {CURRENT_YEAR} DRISHTI Academic Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
