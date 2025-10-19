/**
 * @fileoverview DeliveryCard component for mobile/grid view
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Compact delivery card showing:
 * - Status badge with color coding
 * - Progress indicators
 * - Quick action buttons
 * - Issue badges
 */

'use client'

import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  MapPin,
  Clock,
  Package,
  User,
  AlertCircle,
  CheckCircle2,
  Eye,
  Navigation,
  CheckSquare,
} from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

import type { DeliveryListItem } from '@/features/sppg/distribution/delivery/types'

// ============================================================================
// Types
// ============================================================================

interface DeliveryCardProps {
  delivery: DeliveryListItem
  onViewDetail?: (id: string) => void
  onTrackLive?: (id: string) => void
  onComplete?: (id: string) => void
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<
  string,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    label: string
    color: string
  }
> = {
  ASSIGNED: {
    variant: 'secondary',
    label: 'Ditugaskan',
    color: 'bg-gray-500',
  },
  DEPARTED: {
    variant: 'default',
    label: 'Dalam Perjalanan',
    color: 'bg-blue-500',
  },
  DELIVERED: {
    variant: 'outline',
    label: 'Terkirim',
    color: 'bg-green-500',
  },
  FAILED: {
    variant: 'destructive',
    label: 'Gagal',
    color: 'bg-red-500',
  },
}

// ============================================================================
// Main Component
// ============================================================================

export function DeliveryCard({
  delivery,
  onViewDetail,
  onTrackLive,
  onComplete,
}: DeliveryCardProps) {
  const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.ASSIGNED
  const portionProgress = delivery.portionsPlanned
    ? (delivery.portionsDelivered / delivery.portionsPlanned) * 100
    : 0

  const hasIssues = delivery._count && delivery._count.issues > 0
  const hasPhotos = delivery._count && delivery._count.photos > 0
  const isTracked = !!delivery.currentLocation

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {delivery.targetName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {delivery.targetAddress}
            </p>
          </div>
          <Badge variant={statusConfig.variant} className="shrink-0">
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timing */}
        {delivery.plannedTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-muted-foreground">Rencana: </span>
              <span className="font-medium">
                {format(new Date(delivery.plannedTime), 'dd MMM, HH:mm', {
                  locale: localeId,
                })}
              </span>
            </div>
          </div>
        )}

        {delivery.actualTime && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-muted-foreground">Aktual: </span>
              <span className="font-medium">
                {format(new Date(delivery.actualTime), 'dd MMM, HH:mm', {
                  locale: localeId,
                })}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Portions Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Porsi</span>
            </div>
            <span className="text-muted-foreground">
              {delivery.portionsDelivered} / {delivery.portionsPlanned}
            </span>
          </div>
          <Progress value={portionProgress} className="h-2" />
        </div>

        {/* Driver */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">{delivery.driverName}</span>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-3">
          {delivery.foodQualityChecked && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Quality OK</span>
            </div>
          )}
          {hasIssues && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{delivery._count?.issues} Masalah</span>
            </div>
          )}
          {isTracked && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <MapPin className="h-4 w-4" />
              <span>GPS Aktif</span>
            </div>
          )}
          {hasPhotos && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>📷 {delivery._count?.photos}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="pt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetail?.(delivery.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Detail
        </Button>

        {delivery.status === 'DEPARTED' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onTrackLive?.(delivery.id)}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Lacak
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onComplete?.(delivery.id)}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Selesai
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
