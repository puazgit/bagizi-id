/**
 * @fileoverview Distribution Card Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Compact distribution card for grid layouts
 */

'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Truck,
  Clock,
  Eye,
} from 'lucide-react'
import { safeFormatDate } from '../lib/dateUtils'
import type { DistributionWithRelations } from '@/features/sppg/distribution/types'

interface DistributionCardProps {
  distribution: DistributionWithRelations
  onView?: (id: string) => void
}

export function DistributionCard({ 
  distribution,
  onView,
}: DistributionCardProps) {
  const router = useRouter()

  const handleView = () => {
    if (onView) {
      onView(distribution.id)
    } else {
      router.push(`/distribution/${distribution.id}`)
    }
  }

  // Calculate progress
  const getProgress = () => {
    const statusProgress: Record<string, number> = {
      SCHEDULED: 0,
      PREPARING: 25,
      IN_TRANSIT: 50,
      DISTRIBUTING: 75,
      COMPLETED: 100,
      CANCELLED: 0,
    }
    return statusProgress[distribution.status] || 0
  }

  // Format meal type label
  const formatMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      BREAKFAST: 'Sarapan',
      SNACK: 'Makanan Tambahan',
      LUNCH: 'Makan Siang',
      DINNER: 'Makan Malam',
    }
    return labels[mealType] || mealType
  }

  const progress = getProgress()
  const isCancelled = distribution.status === 'CANCELLED'
  const isCompleted = distribution.status === 'COMPLETED'

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {distribution.distributionCode}
            </p>
            <h4 className="font-semibold">
              {distribution.program?.name || 'Tanpa Program'}
            </h4>
          </div>
          <Badge variant={
            distribution.status === 'COMPLETED' ? 'default' :
            distribution.status === 'CANCELLED' ? 'destructive' :
            'secondary'
          }>
            {distribution.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {!isCancelled && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progress}% Selesai
            </p>
          </div>
        )}

        {/* Distribution Info */}
        <div className="grid gap-3">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {safeFormatDate(distribution.distributionDate)}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground line-clamp-1">
              {distribution.distributionPoint}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {distribution.actualRecipients || distribution.plannedRecipients || 0} penerima
            </span>
          </div>

          {distribution.distributionMethod && (
            <div className="flex items-center text-sm">
              <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground capitalize">
                {distribution.distributionMethod.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Meal Type Badge */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">
            {formatMealTypeLabel(distribution.mealType)}
          </Badge>
        </div>

        {/* Completion Info */}
        {isCompleted && distribution.actualRecipients && distribution.plannedRecipients && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Terpenuhi: {distribution.actualRecipients} / {distribution.plannedRecipients} 
              {' '}
              ({((distribution.actualRecipients / distribution.plannedRecipients) * 100).toFixed(0)}%)
            </p>
          </div>
        )}

        {/* Cancellation Reason */}
        {isCancelled && distribution.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-destructive line-clamp-2">
              {distribution.notes}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <Button 
          onClick={handleView} 
          variant="outline" 
          className="w-full"
          size="sm"
        >
          <Eye className="mr-2 h-4 w-4" />
          Lihat Detail
        </Button>
      </CardFooter>
    </Card>
  )
}
