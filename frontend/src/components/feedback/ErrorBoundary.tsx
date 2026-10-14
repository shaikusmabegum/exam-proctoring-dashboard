import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log internally for debugging, never exposing client secrets
    console.error('Unhandled UI Error Caught by ErrorBoundary:', error, errorInfo)

    // When deployed on Vercel, new deployments may change asset hashes. Auto-reload once to fetch fresh assets.
    const isChunkFailure =
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('Loading chunk') ||
      error?.name === 'ChunkLoadError'

    if (isChunkFailure) {
      const hasReloaded = sessionStorage.getItem('chunk_load_retry')
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_load_retry', 'true')
        window.location.reload()
      }
    }
  }

  private handleReload = () => {
    sessionStorage.removeItem('chunk_load_retry')
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application Error Encountered</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              An unexpected interface error occurred. You can reload the application to restore state.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={this.handleReload}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="w-full mt-2"
            >
              Reload Application
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
