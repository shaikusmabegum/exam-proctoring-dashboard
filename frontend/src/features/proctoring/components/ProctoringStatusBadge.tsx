import React from 'react'
import { Badge } from '@/components/ui/Badge'
import type { ProctoringSessionStatus, CameraStreamStatus } from '@/types/proctoring'

interface ProctoringStatusBadgeProps {
  status: ProctoringSessionStatus
  size?: 'sm' | 'md'
}

export const ProctoringStatusBadge: React.FC<ProctoringStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="success" size={size} dot>
          Session Active
        </Badge>
      )
    case 'INITIALIZING':
      return (
        <Badge variant="warning" size={size} dot>
          Initializing
        </Badge>
      )
    case 'CONNECTION_INTERRUPTED':
      return (
        <Badge variant="danger" size={size} dot>
          Interrupted
        </Badge>
      )
    case 'COMPLETED':
      return (
        <Badge variant="neutral" size={size}>
          Completed
        </Badge>
      )
    case 'TERMINATED':
      return (
        <Badge variant="danger" size={size}>
          Terminated
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

export const CameraStreamBadge: React.FC<{
  status: CameraStreamStatus
  size?: 'sm' | 'md'
}> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'STREAM_ACTIVE':
      return (
        <Badge variant="success" size={size} dot>
          Camera Active
        </Badge>
      )
    case 'PERMISSION_GRANTED':
      return (
        <Badge variant="primary" size={size}>
          Permitted
        </Badge>
      )
    case 'PERMISSION_DENIED':
      return (
        <Badge variant="danger" size={size}>
          Denied
        </Badge>
      )
    case 'STREAM_INTERRUPTED':
      return (
        <Badge variant="warning" size={size} dot>
          Interrupted
        </Badge>
      )
    case 'STREAM_STOPPED':
      return (
        <Badge variant="neutral" size={size}>
          Stopped
        </Badge>
      )
    case 'UNKNOWN':
    default:
      return (
        <Badge variant="neutral" size={size}>
          Unknown
        </Badge>
      )
  }
}
