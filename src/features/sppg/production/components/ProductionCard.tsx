/**
 * @fileoverview Food Production Card Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar,
  ChefHat,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  Thermometer,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeleteProduction } from '../hooks/useProductions'
import type { FoodProduction } from '@prisma/client'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// ============================================================================
// Types
// ============================================================================

interface ProductionCardProps {
  production: FoodProduction & {
    menu?: {
      id: string
      menuName: string
      menuCode: string
      mealType: string
    } | null
    program?: {
      id: string
      programName: string
    } | null
    _count?: {
      qualityChecks: number
    }
  }
  className?: string
  onDelete?: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMM yyyy, HH:mm', { locale: id })
}

function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm', { locale: id })
}

function getStatusConfig(status: string) {
  const configs = {
    PLANNED: {
      label: 'Dijadwalkan',
      variant: 'secondary' as const,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    },
    PREPARING: {
      label: 'Persiapan',
      variant: 'outline' as const,
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    COOKING: {
      label: 'Memasak',
      variant: 'default' as const,
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    },
    QUALITY_CHECK: {
      label: 'Quality Check',
      variant: 'outline' as const,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    },
    COMPLETED: {
      label: 'Selesai',
      variant: 'default' as const,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    },
    CANCELLED: {
      label: 'Dibatalkan',
      variant: 'destructive' as const,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    },
  }

  return configs[status as keyof typeof configs] || configs.PLANNED
}

function getMealTypeLabel(mealType: string): string {
  const labels: Record<string, string> = {
    BREAKFAST: 'Sarapan',
    SNACK: 'Snack',
    LUNCH: 'Makan Siang',
    DINNER: 'Makan Malam',
  }
  return labels[mealType] || mealType
}

// ============================================================================
// Components
// ============================================================================

/**
 * Main Component: Food Production Card
 */
export function ProductionCard({ production, className, onDelete }: ProductionCardProps) {
  const { mutate: deleteProduction, isPending: isDeleting } = useDeleteProduction()

  const statusConfig = getStatusConfig(production.status)
  const portionProgress = production.actualPortions
    ? (production.actualPortions / production.plannedPortions) * 100
    : 0
  const canEdit = production.status === 'PLANNED'
  const canDelete = production.status === 'PLANNED'

  const handleDelete = () => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus produksi "${production.batchNumber}"?\n\nTindakan ini tidak dapat dibatalkan.`
      )
    ) {
      deleteProduction(production.id, {
        onSuccess: () => {
          onDelete?.()
        },
      })
    }
  }

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              {production.menu?.mealType && (
                <Badge variant="outline">
                  {getMealTypeLabel(production.menu.mealType)}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg truncate" title={production.batchNumber}>
              {production.batchNumber}
            </h3>
            {production.menu && (
              <p className="text-sm text-foreground mt-1 truncate" title={production.menu.menuName}>
                {production.menu.menuName}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(production.productionDate)}</span>
            </div>
            {production.program && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Program: {production.program.programName}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/production/${production.id}`} className="cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/production/${production.id}/edit`} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Time Range */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatTime(production.plannedStartTime)} - {formatTime(production.plannedEndTime)}
          </span>
        </div>

        {/* Portions Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Porsi</span>
            </div>
            <span className="font-semibold">
              {production.actualPortions || 0} / {production.plannedPortions}
            </span>
          </div>
          {production.actualPortions && (
            <>
              <Progress value={portionProgress} className="h-1.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{portionProgress.toFixed(1)}% tercapai</span>
              </div>
            </>
          )}
        </div>

        {/* Cost Overview - Temporarily disabled until dynamic calculation implemented */}
        {/* TODO: Use ProductionCostCalculator service to calculate costs dynamically */}
        {/* <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimasi Biaya</span>
            <span className="font-semibold">{formatCurrency(calculatedEstimatedCost)}</span>
          </div>
          {calculatedActualCost && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Aktual</span>
              <span className="font-medium">{formatCurrency(calculatedActualCost)}</span>
            </div>
          )}
        </div> */}

        {/* Temperature Indicator (for COOKING/COMPLETED) */}
        {(production.status === 'COOKING' || production.status === 'COMPLETED') &&
          production.actualTemperature && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Thermometer className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Suhu Aktual</p>
                <p className="text-sm font-semibold">{production.actualTemperature}°C</p>
              </div>
              {production.targetTemperature && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-xs font-medium">{production.targetTemperature}°C</p>
                </div>
              )}
            </div>
          )}

        {/* Quality Checks Count (if completed) */}
        {production.status === 'COMPLETED' && production._count?.qualityChecks && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Quality Checks</span>
            <Badge variant="outline">{production._count.qualityChecks} checks</Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full" size="sm">
          <Link href={`/production/${production.id}`}>
            <ChefHat className="h-4 w-4 mr-2" />
            Lihat Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
