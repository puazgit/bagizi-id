/**
 * @fileoverview Demo Request Card Component - Card display for demo request preview
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { DemoRequestListItem } from '../types/demo-request.types'
import {
  DEMO_REQUEST_STATUS_VARIANTS,
  ORGANIZATION_TYPE_LABELS,
} from '../types/demo-request.types'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface DemoRequestCardProps {
  /**
   * Demo request data to display
   */
  data: DemoRequestListItem

  /**
   * Callback when card is clicked
   */
  onClick?: () => void

  /**
   * Callback for quick actions
   */
  onAction?: (action: 'approve' | 'reject' | 'assign' | 'view') => void

  /**
   * Show actions footer
   * @default true
   */
  showActions?: boolean

  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'compact'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status badge variant mapping to valid shadcn variants
 */
function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap = DEMO_REQUEST_STATUS_VARIANTS[status as keyof typeof DEMO_REQUEST_STATUS_VARIANTS] || 'default'

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
 * Get organization type badge color
 */
function getOrgTypeColor(orgType: string): string {
  const colors: Record<string, string> = {
    YAYASAN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    LEMBAGA:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    SEKOLAH:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    PEMERINTAH:
      'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  }

  return colors[orgType] || 'bg-gray-100 text-gray-800'
}

/**
 * Get probability badge variant and color
 */
function getProbabilityDisplay(probability: number | null): {
  variant: 'default' | 'secondary' | 'outline'
  color: string
} {
  if (probability === null) {
    return { variant: 'outline', color: 'text-muted-foreground' }
  }

  if (probability >= 70) {
    return {
      variant: 'default',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    }
  }

  if (probability >= 40) {
    return {
      variant: 'secondary',
      color:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    }
  }

  return {
    variant: 'outline',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }
}

/**
 * Format status label to Indonesian
 */
function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DemoRequestCard - Card component for displaying demo request preview
 *
 * Features:
 * - Organization info with badge
 * - Status and probability badges
 * - Key metrics (beneficiaries, date)
 * - Contact information
 * - Quick action buttons
 * - Hover effects for interactivity
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <DemoRequestCard
 *   data={demoRequest}
 *   onClick={() => router.push(`/admin/demo-requests/${demoRequest.id}`)}
 *   onAction={(action) => handleAction(action, demoRequest.id)}
 * />
 * ```
 */
export function DemoRequestCard({
  data,
  onClick,
  onAction,
  showActions = true,
  variant = 'default',
}: DemoRequestCardProps) {
  const probabilityDisplay = getProbabilityDisplay(data.conversionProbability)
  const isCompact = variant === 'compact'

  return (
    <Card
      className={`
        transition-all duration-200 hover:shadow-lg dark:hover:shadow-primary/5
        ${onClick ? 'cursor-pointer hover:border-primary/50' : ''}
        ${isCompact ? 'p-4' : ''}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <CardHeader className={isCompact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-foreground truncate ${
                isCompact ? 'text-base' : 'text-lg'
              }`}
            >
              {data.organizationName}
            </h3>
            {data.picName && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                <span className="font-medium">PIC:</span> {data.picName}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <Badge variant={getStatusVariant(data.status)} className="shrink-0">
            {formatStatusLabel(data.status)}
          </Badge>
        </div>

        {/* Organization Type */}
        <div className="flex items-center gap-2 mt-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Badge className={getOrgTypeColor(data.organizationType)}>
            {ORGANIZATION_TYPE_LABELS[data.organizationType] ||
              data.organizationType}
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className={isCompact ? 'py-3' : 'py-4'}>
        <div className="grid grid-cols-2 gap-4">
          {/* Target Beneficiaries */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Penerima</p>
              <p className="text-sm font-semibold">
                {data.targetBeneficiaries 
                  ? data.targetBeneficiaries.toLocaleString('id-ID')
                  : '-'}
              </p>
            </div>
          </div>

          {/* Conversion Probability */}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Probabilitas</p>
              {data.conversionProbability !== null ? (
                <Badge className={probabilityDisplay.color}>
                  {data.conversionProbability}%
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-2 col-span-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
              <p className="text-sm font-medium">
                {format(new Date(data.createdAt), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info (if not compact) */}
        {!isCompact && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {data.picPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{data.picPhone}</span>
              </div>
            )}
            {data.picEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground truncate">
                  {data.picEmail}
                </span>
              </div>
            )}
            {data.operationalArea && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground line-clamp-2">
                  {data.operationalArea}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Actions Footer */}
      {showActions && onAction && (
        <CardFooter className={`pt-0 ${isCompact ? 'pb-4' : ''}`}>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onAction('view')
              }}
            >
              Lihat Detail
            </Button>

            {data.status === 'SUBMITTED' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAction('approve')
                  }}
                >
                  Setujui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAction('reject')
                  }}
                >
                  Tolak
                </Button>
              </>
            )}

            {data.status === 'UNDER_REVIEW' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction('assign')
                }}
              >
                Tugaskan
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
