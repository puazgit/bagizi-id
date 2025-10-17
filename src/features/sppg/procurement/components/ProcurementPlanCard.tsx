/**
 * @fileoverview Procurement Plan Card Component
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
  DollarSign,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeleteProcurementPlan } from '../hooks/useProcurementPlans'
import type { ProcurementPlan } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

interface ProcurementPlanCardProps {
  plan: ProcurementPlan & {
    sppg?: { name: string; id?: string; code?: string } | null
    program?: { name: string } | null
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

function formatMonth(planMonth: string): string {
  const [year, month] = planMonth.split('-')
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

function getStatusConfig(status: string) {
  const configs = {
    DRAFT: {
      label: 'Draft',
      variant: 'secondary' as const,
      icon: AlertCircle,
      color: 'text-gray-600',
    },
    SUBMITTED: {
      label: 'Menunggu',
      variant: 'outline' as const,
      icon: Clock,
      color: 'text-yellow-600',
    },
    APPROVED: {
      label: 'Disetujui',
      variant: 'default' as const,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    REJECTED: {
      label: 'Ditolak',
      variant: 'destructive' as const,
      icon: XCircle,
      color: 'text-red-600',
    },
    REVISION: {
      label: 'Revisi',
      variant: 'outline' as const,
      icon: Send,
      color: 'text-orange-600',
    },
  }

  return configs[status as keyof typeof configs] || configs.DRAFT
}

// ============================================================================
// Components
// ============================================================================

/**
 * Main Component: Procurement Plan Card
 */
export function ProcurementPlanCard({ plan, className, onDelete }: ProcurementPlanCardProps) {
  const { mutate: deletePlan, isPending: isDeleting } = useDeleteProcurementPlan()

  const statusConfig = getStatusConfig(plan.approvalStatus)
  const budgetUtilization = (plan.usedBudget / plan.totalBudget) * 100
  const canEdit = plan.approvalStatus === 'DRAFT' || plan.approvalStatus === 'REVISION'

  const handleDelete = () => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus rencana "${plan.planName}"?\n\nTindakan ini tidak dapat dibatalkan.`
      )
    ) {
      deletePlan(plan.id, {
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
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                <statusConfig.icon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              {plan.planQuarter && (
                <Badge variant="outline">Q{plan.planQuarter}</Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg truncate" title={plan.planName}>
              {plan.planName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>{formatMonth(plan.planMonth)}</span>
            </div>
            {plan.program && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Program: {plan.program.name}
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
                <Link href={`/procurement/plans/${plan.id}`} className="cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/procurement/plans/${plan.id}/edit`} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting || plan.approvalStatus === 'APPROVED'}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Anggaran</span>
            <span className="font-semibold">{formatCurrency(plan.totalBudget)}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Terpakai</span>
              <span className="font-medium">
                {formatCurrency(plan.usedBudget)} ({budgetUtilization.toFixed(1)}%)
              </span>
            </div>
            <Progress value={budgetUtilization} className="h-1.5" />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tersisa: {formatCurrency(plan.remainingBudget)}</span>
          </div>
        </div>

        {/* Target Metrics */}
        {(plan.targetRecipients || plan.targetMeals) && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            {plan.targetRecipients && (
              <div>
                <p className="text-xs text-muted-foreground">Target Penerima</p>
                <p className="text-sm font-semibold mt-0.5">
                  {plan.targetRecipients.toLocaleString('id-ID')} orang
                </p>
              </div>
            )}
            {plan.targetMeals && (
              <div>
                <p className="text-xs text-muted-foreground">Target Makanan</p>
                <p className="text-sm font-semibold mt-0.5">
                  {plan.targetMeals.toLocaleString('id-ID')} porsi
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cost per Meal */}
        {plan.costPerMeal && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Biaya per Porsi</p>
              <p className="text-sm font-semibold">{formatCurrency(plan.costPerMeal)}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full" size="sm">
          <Link href={`/procurement/plans/${plan.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Lihat Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
