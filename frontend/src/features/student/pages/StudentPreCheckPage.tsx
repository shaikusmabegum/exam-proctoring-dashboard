import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Mic,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Play,
  Lock,
  Maximize2,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Alert } from '@/components/feedback/Alert'
import { Skeleton } from '@/components/feedback/Skeleton'
import { CameraPreview } from '@/features/proctoring/components/CameraPreview'
import { DeviceCheckCard } from '@/features/proctoring/components/DeviceCheckCard'
import { useMediaDevices } from '@/features/proctoring/hooks/useMediaDevices'
import { studentService } from '@/features/student/services/studentService'
import { studentProctoringService } from '@/features/proctoring/services/studentProctoringService'
import { useToast } from '@/hooks/useToast'
import type { StudentExamResponse } from '@/types/exam'
import type { DeviceCheckStatus } from '@/types/proctoring'

export const StudentPreCheckPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [exam, setExam] = useState<StudentExamResponse | null>(null)
  const [isLoadingExam, setIsLoadingExam] = useState(true)
  const [examError, setExamError] = useState<string | null>(null)

  // Informed consent checkbox
  const [consentAgreed, setConsentAgreed] = useState(false)
  const [isStartingAttempt, setIsStartingAttempt] = useState(false)

  // Browser Network and Fullscreen check states
  const [networkStatus, setNetworkStatus] = useState<DeviceCheckStatus>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'granted' : 'error'
  )
  const [fullscreenSupported] = useState<DeviceCheckStatus>(
    typeof document !== 'undefined' &&
      (document.fullscreenEnabled || (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled)
      ? 'granted'
      : 'unsupported'
  )

  const {
    cameraStatus,
    microphoneStatus,
    cameraError,
    microphoneError,
    stream,
    requestCamera,
    requestMicrophone,
    stopAllTracks,
  } = useMediaDevices()

  // Load Exam Parameters
  useEffect(() => {
    if (!examId) return
    studentService
      .getExamById(examId)
      .then((data) => setExam(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve examination parameters'
        setExamError(msg)
      })
      .finally(() => setIsLoadingExam(false))
  }, [examId])

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('granted')
    const handleOffline = () => setNetworkStatus('error')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check if mandatory readiness requirements are satisfied
  const isReadinessSatisfied =
    cameraStatus === 'granted' &&
    networkStatus === 'granted' &&
    consentAgreed &&
    (exam ? exam.canAttempt : false)

  const handleStartExam = useCallback(async () => {
    if (!examId || !isReadinessSatisfied) return
    setIsStartingAttempt(true)

    try {
      // 1. Start or resume official attempt on backend
      const attempt = await studentService.startOrResumeAttempt(examId)

      // 2. Start or get proctoring session on backend
      const session = await studentProctoringService.startOrGetSession(attempt.id)

      // 3. Update camera status to active
      await studentProctoringService.updateCameraStatus(session.id, 'STREAM_ACTIVE')

      // 4. Report initial event
      await studentProctoringService.ingestEvents(session.id, [
        {
          eventType: 'CAMERA_PERMISSION_GRANTED',
          eventTimestamp: new Date().toISOString(),
          metadata: { userAgent: navigator.userAgent },
        },
        {
          eventType: 'EXAM_STARTED',
          eventTimestamp: new Date().toISOString(),
        },
      ])

      // 5. Release pre-check camera stream tracks so the active exam interface can claim it cleanly
      stopAllTracks()

      showToastSuccess('Proctoring session initialized! Entering exam console.')
      navigate(`/student/attempts/${attempt.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start examination session'
      showToastError(msg)
      setIsStartingAttempt(false)
    }
  }, [examId, isReadinessSatisfied, stopAllTracks, showToastSuccess, showToastError, navigate])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link to={`/student/exams/${examId}`}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Exam Overview
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pre-Examination Readiness & Proctoring Consent
            </h1>
            <p className="text-xs text-slate-500">
              Verify your camera feed, network connectivity, and review the academic integrity policy.
            </p>
          </div>
        </div>

        {examError && (
          <Alert variant="error" title="Error Loading Exam">
            {examError}
          </Alert>
        )}

        {/* Examination Context Card */}
        {isLoadingExam ? (
          <Skeleton className="h-28 w-full" />
        ) : exam ? (
          <Card className="bg-slate-50/50">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {exam.courseName}
                </span>
                <h3 className="text-base font-bold text-slate-900">{exam.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Duration: <strong>{exam.durationMinutes} mins</strong></span>
                  <span>•</span>
                  <span>Total Marks: <strong>{exam.totalMarks}</strong></span>
                  <span>•</span>
                  <span>Questions: <strong>{exam.questionCount}</strong></span>
                </div>
              </div>

              {!exam.canAttempt && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  <span>Exam Window Inactive</span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Two-Column Grid: Left Column = Device Verification, Right Column = Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Device Checks */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              1. Hardware & System Verification
            </h3>

            {/* Camera Check */}
            <DeviceCheckCard
              title="Webcam / Video Camera"
              description="A live video feed is required for automated identity and continuous presence verification."
              status={cameraStatus}
              icon={<Camera className="h-5 w-5" />}
              actionLabel="Enable Camera"
              onAction={requestCamera}
              errorMessage={cameraError}
              troubleshootingTip="Check that no other app (Zoom, Teams) is using your webcam, then click Allow in the browser prompt."
            />

            {/* Microphone Check (Optional for written exams) */}
            <DeviceCheckCard
              title="Microphone Check"
              description="Microphone check for acoustic ambient monitoring where required by your institution."
              status={microphoneStatus}
              icon={<Mic className="h-5 w-5" />}
              actionLabel="Test Microphone"
              onAction={requestMicrophone}
              errorMessage={microphoneError}
              isOptional={true}
              troubleshootingTip="Check your audio input settings and allow microphone access in your browser."
            />

            {/* Network Check */}
            <DeviceCheckCard
              title="Internet Connectivity"
              description="Continuous telemetry connection is required to autosave responses and sync countdown timers."
              status={networkStatus}
              icon={<Wifi className="h-5 w-5" />}
              errorMessage={
                networkStatus === 'error'
                  ? 'Your browser is currently offline. Please restore Wi-Fi or Ethernet connection.'
                  : null
              }
            />

            {/* Fullscreen API Check */}
            <DeviceCheckCard
              title="Fullscreen Mode Support"
              description="Examinations utilize locked window focus to deter unauthorized navigation and external aids."
              status={fullscreenSupported}
              icon={<Maximize2 className="h-5 w-5" />}
            />
          </div>

          {/* Right Column: Live Camera Preview & Consent */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              2. Camera Feed Preview
            </h3>

            <CameraPreview
              stream={stream}
              status={cameraStatus}
              errorMessage={cameraError}
              onRetry={requestCamera}
            />

            {/* Privacy & Proctoring Notice Card */}
            <Card className="border-blue-100 bg-blue-50/40">
              <CardContent className="p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Telemetry & Privacy Transparency Notice</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  During this proctored examination, DRISHTI monitors browser window visibility,
                  tab switches, and video feed presence. Telemetry signals are evaluated by automated
                  rules and provided exclusively to your authorized instructor for fair academic review.
                </p>
                <div className="pt-2 border-t border-blue-200/60">
                  <Checkbox
                    id="proctoring-consent-checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    label="I understand and agree to automated proctoring telemetry and the Academic Honor Code."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <Card className="border-t-2 border-t-blue-600">
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50">
            <div className="text-xs text-slate-500">
              {!isReadinessSatisfied ? (
                <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  Complete camera verification and accept proctoring consent to begin.
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  All mandatory readiness checks passed. You may start the examination.
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={!isReadinessSatisfied}
              isLoading={isStartingAttempt}
              onClick={handleStartExam}
              leftIcon={<Play className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Commence Proctored Examination →
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
