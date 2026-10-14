import React, { useEffect, useRef, useState } from 'react'
import { Video, VideoOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { DeviceCheckStatus } from '@/types/proctoring'

interface CameraPreviewProps {
  stream: MediaStream | null
  status: DeviceCheckStatus
  errorMessage?: string | null
  onRetry?: () => void
  isMirrored?: boolean
  className?: string
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  stream,
  status,
  errorMessage,
  onRetry,
  isMirrored = true,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (stream && status === 'granted') {
      video.srcObject = stream
      video.play().catch(() => {})
    } else {
      video.srcObject = null
    }

    return () => {
      if (video) {
        video.srcObject = null
      }
    }
  }, [stream, status])

  return (
    <div
      className={`relative w-full aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isPlaying && status === 'granted' ? 'opacity-100' : 'opacity-0'
        } ${isMirrored ? 'scale-x-[-1]' : ''}`}
      />

      {/* Stream Active Indicator Overlay */}
      {isPlaying && status === 'granted' && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 text-[11px] text-emerald-400 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Camera Live</span>
        </div>
      )}

      {/* Granted State Fallback */}
      {status === 'granted' && !isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-sm font-medium text-slate-200">Camera Connected</p>
          <p className="text-xs text-slate-500">Video stream ready for exam session.</p>
        </div>
      )}

      {/* Checking / Requesting State */}
      {status === 'checking' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-3 bg-slate-900/90">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-sm font-medium">Requesting camera access...</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Please allow camera permissions in your browser prompt.
          </p>
        </div>
      )}

      {/* Idle / Uninitialized State */}
      {status === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
            <Video className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-slate-300">Camera Not Initialized</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Click &ldquo;Enable Camera&rdquo; to test your webcam feed prior to starting.
          </p>
        </div>
      )}

      {/* Denied / Error State */}
      {(status === 'denied' || status === 'error' || status === 'unsupported') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-rose-300 space-y-3 bg-rose-950/40 backdrop-blur-xs">
          <div className="h-12 w-12 rounded-xl bg-rose-900/60 border border-rose-800 flex items-center justify-center text-rose-400">
            <VideoOff className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-200 flex items-center justify-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              {status === 'denied'
                ? 'Permission Denied'
                : status === 'unsupported'
                ? 'Browser Unsupported'
                : 'Camera Unavailable'}
            </p>
            <p className="text-xs text-rose-300/80 mt-1 max-w-sm line-clamp-3">
              {errorMessage || 'Unable to connect to camera hardware.'}
            </p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-rose-700 text-rose-200 hover:bg-rose-900/50"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Retry Camera Access
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
