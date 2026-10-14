import React, { useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ShieldCheck } from 'lucide-react'
import { Modal } from '@/components/feedback/Modal'
import { Button } from '@/components/ui/Button'
import { ViolationSeverityBadge } from '@/features/proctoring/components/ViolationSeverityBadge'
import { lecturerMonitoringService } from '@/features/proctoring/services/lecturerMonitoringService'
import { useToast } from '@/hooks/useToast'
import type { ProctoringReviewResponse, ProctoringReviewStatus } from '@/types/proctoring'

interface ReviewDecisionDialogProps {
  review: ProctoringReviewResponse | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updated: ProctoringReviewResponse) => void
}

export const ReviewDecisionDialog: React.FC<ReviewDecisionDialogProps> = ({
  review,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success: showToastSuccess, error: showToastError } = useToast()

  const [selectedStatus, setSelectedStatus] = useState<ProctoringReviewStatus>(
    review?.status || 'UNDER_REVIEW'
  )
  const [reviewerNotes, setReviewerNotes] = useState(review?.reviewerNotes || '')
  const [resolutionReason, setResolutionReason] = useState(review?.resolutionReason || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !review) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updated = await lecturerMonitoringService.updateReview(review.id, {
        status: selectedStatus,
        reviewerNotes: reviewerNotes.trim() || undefined,
        resolutionReason: resolutionReason.trim() || undefined,
      })

      showToastSuccess(`Incident review updated to: ${selectedStatus.replace('_', ' ')}`)
      onSuccess(updated)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update review decision'
      showToastError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proctoring Incident Audit & Human Review"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        {/* Incident Summary Banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">{review.studentName}</span>
            <ViolationSeverityBadge severity={review.severity} size="sm" />
          </div>
          <div className="text-xs text-slate-600 space-y-0.5">
            <p>
              <strong>Violation Category:</strong> {review.violationCategory}
            </p>
            <p className="font-mono text-slate-500 text-[11px]">
              Recorded: {new Date(review.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Human Oversight Note */}
        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Automated signals are indicators for review, not conclusive proof of academic misconduct.
            Exercise institutional fairness when evaluating candidate intent.
          </span>
        </div>

        {/* Status Decision Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Adjudication Decision <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStatus('CONFIRMED')}
              className={`p-2.5 rounded-lg border text-left font-medium flex items-center gap-2 transition-all cursor-pointer ${
                selectedStatus === 'CONFIRMED'
                  ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <div>
                <p className="font-semibold">Confirm Violation</p>
                <p className="text-[10px] text-slate-500 font-normal">Misconduct substantiated</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('DISMISSED')}
              className={`p-2.5 rounded-lg border text-left font-medium flex items-center gap-2 transition-all cursor-pointer ${
                selectedStatus === 'DISMISSED'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Dismiss Incident</p>
                <p className="text-[10px] text-slate-500 font-normal">Innocuous or false positive</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('UNDER_REVIEW')}
              className={`p-2.5 rounded-lg border text-left font-medium flex items-center gap-2 transition-all cursor-pointer ${
                selectedStatus === 'UNDER_REVIEW'
                  ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold">Under Investigation</p>
                <p className="text-[10px] text-slate-500 font-normal">Awaiting committee review</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('OPEN')}
              className={`p-2.5 rounded-lg border text-left font-medium flex items-center gap-2 transition-all cursor-pointer ${
                selectedStatus === 'OPEN'
                  ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <p className="font-semibold">Reopen Incident</p>
                <p className="text-[10px] text-slate-500 font-normal">Reset to unreviewed</p>
              </div>
            </button>
          </div>
        </div>

        {/* Resolution Reason Field */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Resolution Summary / Justification
          </label>
          <input
            type="text"
            maxLength={250}
            value={resolutionReason}
            onChange={(e) => setResolutionReason(e.target.value)}
            placeholder="e.g. Accidental tab switch verified via session video replay."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reviewer Detailed Notes Field */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Instructor Audit Notes
          </label>
          <textarea
            rows={3}
            maxLength={1000}
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            placeholder="Document evidence, timestamps, or academic integrity board consultation notes..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Confirm Review Decision
          </Button>
        </div>
      </form>
    </Modal>
  )
}
