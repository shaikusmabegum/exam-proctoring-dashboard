import React from 'react'
import { ShieldCheck, Cpu, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { CURRENT_YEAR } from '@/lib/utils/constants'

export interface AuthLayoutProps {
  children: React.ReactNode
  heading: string
  subheading?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, heading, subheading }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50">
      {/* Brand Visual Column (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle geometric gradient backdrop */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center group">
            <Logo size="lg" variant="dark" subtitle="Assessment & Proctoring" />
          </Link>
        </div>

        {/* Brand Value Proposition */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-blue-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Academic Integrity & Security Platform</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Intelligent assessments. <br />
            <span className="text-blue-400">Trusted outcomes.</span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Delivering tamper-resilient examination environments with privacy-first client telemetry, authoritative evaluation, and live remote proctoring.
          </p>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Real-time presence and multi-face telemetry</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Authoritative server-side attempt timers & auto-submission</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Immutable cryptographic audit logs & instructor dispute reviews</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Meta */}
        <div className="relative z-10 pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-500" />
            <span>DRISHTI Platform Core v1.0</span>
          </div>
          <span>Enterprise University SaaS</span>
        </div>
      </div>

      {/* Form Content Column */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <Link to="/" className="inline-flex items-center">
            <Logo size="sm" variant="light" />
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            SaaS Platform
          </span>
        </div>

        {/* Center Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="text-left mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{heading}</h2>
            {subheading && <p className="text-sm text-slate-500 mt-2">{subheading}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            {children}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© {CURRENT_YEAR} DRISHTI Academic Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
