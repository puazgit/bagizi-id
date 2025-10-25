/**
 * @fileoverview Demo Request Status Badge Component - Reusable status indicator
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { Badge } from '@/components/ui/badge'
import type { DemoRequestStatus } from '@prisma/client'
import { DEMO_REQUEST_STATUS_VARIANTS } from '../types/demo-request.types'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface DemoRequestStatusBadgeProps {
  /**
   * Demo request status
   */
  status: DemoRequestStatus

  /**
   * Show status label text
   * @default true
   */
  showLabel?: boolean

  /**
   * Badge size
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg'

  /**
   * Additional CSS classes
   */
  className?: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status badge variant mapping to valid shadcn variants
 */
function getStatusVariant(
  status: DemoRequestStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap = DEMO_REQUEST_STATUS_VARIANTS[status] || 'default'

  const validVariants: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    default: 'default',
    secondary: 'secondary',
    success: 'default',
    destructive: 'destructive',
    info: 'secondary',
    warning: 'outline',
  }

  return validVariants[variantMap] || 'secondary'
}

/**
 * Format status label to Indonesian
 */
function formatStatusLabel(status: DemoRequestStatus): string {
  const labels: Record<DemoRequestStatus, string> = {
    SUBMITTED: 'Dikirim',
    UNDER_REVIEW: 'Dalam Review',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    DEMO_ACTIVE: 'Demo Aktif',
    EXPIRED: 'Kadaluarsa',
    CONVERTED: 'Terkonversi',
    CANCELLED: 'Dibatalkan',
  }

  return labels[status] || status
}

/**
 * Get status description
 */
function getStatusDescription(status: DemoRequestStatus): string {
  const descriptions: Record<DemoRequestStatus, string> = {
    SUBMITTED: 'Permintaan demo baru telah dikirim',
    UNDER_REVIEW: 'Sedang ditinjau oleh tim',
    APPROVED: 'Permintaan demo telah disetujui',
    REJECTED: 'Permintaan demo ditolak',
    DEMO_ACTIVE: 'Demo sedang berlangsung',
    EXPIRED: 'Masa demo telah berakhir',
    CONVERTED: 'Telah dikonversi menjadi SPPG',
    CANCELLED: 'Permintaan demo dibatalkan',
  }

  return descriptions[status] || ''
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DemoRequestStatusBadge - Reusable status badge component
 *
 * Features:
 * - Consistent status display across app
 * - Proper color mapping based on status
 * - Indonesian labels
 * - Tooltip with description
 * - Multiple size variants
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <DemoRequestStatusBadge status="SUBMITTED" />
 * <DemoRequestStatusBadge status="APPROVED" size="lg" />
 * <DemoRequestStatusBadge status="REJECTED" showLabel={false} />
 * ```
 */
export function DemoRequestStatusBadge({
  status,
  showLabel = true,
  size = 'default',
  className,
}: DemoRequestStatusBadgeProps) {
  const variant = getStatusVariant(status)
  const label = formatStatusLabel(status)
  const description = getStatusDescription(status)

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm',
    lg: 'text-base px-3 py-1',
  }

  return (
    <Badge
      variant={variant}
      className={`${sizeClasses[size]} ${className || ''}`}
      title={description}
    >
      {showLabel ? label : null}
    </Badge>
  )
}

/**
 * Get status badge info without rendering
 * Useful for custom implementations
 */
export function getStatusBadgeInfo(status: DemoRequestStatus) {
  return {
    variant: getStatusVariant(status),
    label: formatStatusLabel(status),
    description: getStatusDescription(status),
  }
}
