import React from 'react'
import { Badge } from '@/components/ui/Badge'
import type { EventSeverity, ProctoringReviewStatus } from '@/types/proctoring'

interface ViolationSeverityBadgeProps {
  severity: EventSeverity
  size?: 'sm' | 'md'
}

export const ViolationSeverityBadge: React.FC<ViolationSeverityBadgeProps> = ({
  severity,
  size = 'sm',
}) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <Badge variant="danger" size={size}>
          Critical
        </Badge>
      )
    case 'HIGH':
      return (
        <Badge variant="danger" size={size}>
          High
        </Badge>
      )
    case 'MEDIUM':
      return (
        <Badge variant="warning" size={size}>
          Medium
        </Badge>
      )
    case 'LOW':
      return (
        <Badge variant="neutral" size={size}>
          Low
        </Badge>
      )
    case 'INFO':
    default:
      return (
        <Badge variant="neutral" size={size}>
          Info
        </Badge>
      )
  }
}

export const ReviewStatusBadge: React.FC<{
  status: ProctoringReviewStatus
  size?: 'sm' | 'md'
}> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <Badge variant="danger" size={size} dot>
          Open Incident
        </Badge>
      )
    case 'UNDER_REVIEW':
      return (
        <Badge variant="warning" size={size} dot>
          Under Review
        </Badge>
      )
    case 'CONFIRMED':
      return (
        <Badge variant="danger" size={size}>
          Violation Confirmed
        </Badge>
      )
    case 'DISMISSED':
      return (
        <Badge variant="neutral" size={size}>
          Dismissed
        </Badge>
      )
    default:
      return (
        <Badge variant="neutral" size={size}>
          {status}
        </Badge>
      )
  }
}
