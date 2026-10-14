import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppShell } from '@/components/layout/AppShell'

export const NotFoundPage: React.FC = () => {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-6 border border-slate-200">
          <FileQuestion className="h-9 w-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found (404)
        </h1>

        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          The requested page could not be located on the DRISHTI platform. Please verify the URL or return to the platform homepage.
        </p>

        <div className="mt-8">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />}>
              Return to DRISHTI Home
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
