import { useState, useRef, useEffect, useCallback } from 'react'
import type { DeviceCheckStatus } from '@/types/proctoring'

export interface MediaDeviceState {
  cameraStatus: DeviceCheckStatus
  microphoneStatus: DeviceCheckStatus
  cameraError: string | null
  microphoneError: string | null
  stream: MediaStream | null
  hasVideoTracks: boolean
  hasAudioTracks: boolean
  isSupported: boolean
  requestCamera: () => Promise<MediaStream | null>
  requestMicrophone: () => Promise<boolean>
  stopAllTracks: () => void
}

export const useMediaDevices = (): MediaDeviceState => {
  const [cameraStatus, setCameraStatus] = useState<DeviceCheckStatus>('idle')
  const [microphoneStatus, setMicrophoneStatus] = useState<DeviceCheckStatus>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [microphoneError, setMicrophoneError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasVideoTracks, setHasVideoTracks] = useState(false)
  const [hasAudioTracks, setHasAudioTracks] = useState(false)

  const activeStreamRef = useRef<MediaStream | null>(null)

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const stopAllTracks = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          // ignore
        }
      })
      activeStreamRef.current = null
    }
    setStream(null)
    setHasVideoTracks(false)
    setHasAudioTracks(false)
  }, [])

  const parseMediaError = (err: unknown): string => {
    if (!err || typeof err !== 'object') {
      return 'An unknown media device error occurred.'
    }
    const name = (err as { name?: string }).name
    const message = (err as { message?: string }).message

    switch (name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera/Microphone permission was denied by the browser. Please click the camera icon in your browser address bar to allow access.'
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera or microphone hardware was detected on your device. Please connect a working webcam or headset.'
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Your camera or microphone is already in use by another application (e.g. Zoom, Teams, Meet). Please close competing apps and retry.'
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        return 'The requested video resolution is not supported by your hardware.'
      case 'SecurityError':
        return 'Media access is blocked due to an insecure context. WebRTC requires HTTPS or localhost.'
      default:
        return message || 'Failed to access media devices.'
    }
  }

  const requestCamera = useCallback(async (): Promise<MediaStream | null> => {
    if (!isSupported) {
      setCameraStatus('unsupported')
      setCameraError('WebRTC mediaDevices is not supported by this browser.')
      return null
    }

    setCameraStatus('checking')
    setCameraError(null)

    try {
      // Clean up previous tracks first
      if (activeStreamRef.current) {
        activeStreamRef.current.getVideoTracks().forEach((t) => t.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      })

      activeStreamRef.current = mediaStream
      setStream(mediaStream)
      setHasVideoTracks(mediaStream.getVideoTracks().length > 0)
      setCameraStatus('granted')

      // Listen for unexpected track endings (e.g. user unplugs camera)
      mediaStream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setCameraStatus('error')
          setCameraError('Camera stream was disconnected or stopped by the system.')
          setHasVideoTracks(false)
        }
      })

      return mediaStream
    } catch (err: unknown) {
      const msg = parseMediaError(err)
      const name = (err as { name?: string })?.name
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraStatus('denied')
      } else {
        setCameraStatus('error')
      }
      setCameraError(msg)
      return null
    }
  }, [isSupported])

  const requestMicrophone = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setMicrophoneStatus('unsupported')
      setMicrophoneError('WebRTC mediaDevices is not supported by this browser.')
      return false
    }

    setMicrophoneStatus('checking')
    setMicrophoneError(null)

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      // Audio verified: immediately stop audio tracks during pre-check unless active
      audioStream.getAudioTracks().forEach((track) => {
        track.stop()
      })

      setMicrophoneStatus('granted')
      setHasAudioTracks(true)
      return true
    } catch (err: unknown) {
      const msg = parseMediaError(err)
      const name = (err as { name?: string })?.name
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicrophoneStatus('denied')
      } else {
        setMicrophoneStatus('error')
      }
      setMicrophoneError(msg)
      return false
    }
  }, [isSupported])

  // Cleanup all media tracks on unmount
  useEffect(() => {
    return () => {
      stopAllTracks()
    }
  }, [stopAllTracks])

  return {
    cameraStatus,
    microphoneStatus,
    cameraError,
    microphoneError,
    stream,
    hasVideoTracks,
    hasAudioTracks,
    isSupported,
    requestCamera,
    requestMicrophone,
    stopAllTracks,
  }
}
