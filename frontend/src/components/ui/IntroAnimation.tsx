import React, { useRef, useState, useEffect, useCallback } from 'react'
import introVideo from '@/assets/intro.mp4'
import { useIntro } from '@/features/intro/IntroContext'

export const IntroAnimation: React.FC = () => {
  const { isOpen, closeIntro } = useIntro()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Handle completion and transition to application
  const handleCompleted = useCallback(() => {
    setIsFadingOut(true)
    const timeout = setTimeout(() => {
      closeIntro()
      setIsFadingOut(false)
    }, 600) // Smooth fade out duration
    return () => clearTimeout(timeout)
  }, [closeIntro])

  useEffect(() => {
    if (!isOpen) return

    setIsFadingOut(false)

    // Ensure the video plays immediately on launch
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current
        .play()
        .catch(() => {
          // If browser policy requires muted playback, ensure muted and retry
          if (videoRef.current) {
            videoRef.current.muted = true
            videoRef.current.play().catch(() => {
              // Safety fallback: proceed if video cannot be played
              handleCompleted()
            })
          }
        })
    }
  }, [isOpen, handleCompleted])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-black flex items-center justify-center overflow-hidden select-none transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={!isOpen}
    >
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        playsInline
        muted
        onEnded={handleCompleted}
        onError={handleCompleted}
        className="w-full h-full object-cover sm:object-contain bg-black pointer-events-none"
      />
    </div>
  )
}
