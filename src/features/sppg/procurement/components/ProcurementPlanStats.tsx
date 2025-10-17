/**
 * @fileoverview Procurement Plan Statistics Cards
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProcurementPlan } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

interface ProcurementPlanStatsProps {
  plans: (ProcurementPlan & {
    sppg?: { sppgName: string }
    program?: { name: string }
  })[]
  className?: string
}

interface StatCard {
  title: string
  value: string | number
  icon: React.ElementType
  iconColor: string
  iconBg: string
  change?: {
    value: number
    isPositive: boolean
  }
  description?: string
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

function calculateStatistics(plans: ProcurementPlan[]) {
  const totalBudget = plans.reduce((sum, plan) => sum + plan.totalBudget, 0)
  const usedBudget = plans.reduce((sum, plan) => sum + plan.usedBudget, 0)
  const remainingBudget = plans.reduce((sum, plan) => sum + plan.remainingBudget, 0)
  const allocatedBudget = plans.reduce((sum, plan) => sum + plan.allocatedBudget, 0)

  const budgetUtilization = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0
  const allocationRate = totalBudget > 0 ? (allocatedBudget / totalBudget) * 100 : 0

  const statusCounts = plans.reduce(
    (acc, plan) => {
      acc[plan.approvalStatus] = (acc[plan.approvalStatus] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const targetRecipients = plans.reduce((sum, plan) => sum + (plan.targetRecipients || 0), 0)
  const targetMeals = plans.reduce((sum, plan) => sum + (plan.targetMeals || 0), 0)

  return {
    totalBudget,
    usedBudget,
    remainingBudget,
    allocatedBudget,
    budgetUtilization,
    allocationRate,
    statusCounts,
    targetRecipients,
    targetMeals,
    totalPlans: plans.length,
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * StatCard Component
 */
function StatCard({ title, value, icon: Icon, iconColor, iconBg, change, description }: StatCard) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn('rounded-lg p-2', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {change.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={change.isPositive ? 'text-green-600' : 'text-red-600'}>
              {change.value > 0 ? '+' : ''}
              {change.value}%
            </span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

/**
 * Main Component: Procurement Plan Statistics
 */
export function ProcurementPlanStats({ plans, className }: ProcurementPlanStatsProps) {
  const stats = calculateStatistics(plans)

  const statusInfo = [
    {
      status: 'APPROVED',
      label: 'Disetujui',
      count: stats.statusCounts['APPROVED'] || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      status: 'SUBMITTED',
      label: 'Menunggu',
      count: stats.statusCounts['SUBMITTED'] || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      status: 'DRAFT',
      label: 'Draft',
      count: stats.statusCounts['DRAFT'] || 0,
      icon: AlertCircle,
      color: 'text-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-900/20',
    },
    {
      status: 'REJECTED',
      label: 'Ditolak',
      count: stats.statusCounts['REJECTED'] || 0,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/20',
    },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Budget Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Anggaran"
          value={formatCurrency(stats.totalBudget)}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-900/20"
          description={`${stats.totalPlans} rencana pengadaan`}
        />
        <StatCard
          title="Anggaran Terpakai"
          value={formatCurrency(stats.usedBudget)}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-900/20"
          description={`${stats.budgetUtilization.toFixed(1)}% dari total`}
        />
        <StatCard
          title="Anggaran Dialokasikan"
          value={formatCurrency(stats.allocatedBudget)}
          icon={Calendar}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100 dark:bg-yellow-900/20"
          description={`${stats.allocationRate.toFixed(1)}% dari total`}
        />
        <StatCard
          title="Sisa Anggaran"
          value={formatCurrency(stats.remainingBudget)}
          icon={TrendingDown}
          iconColor="text-purple-600"
          iconBg="bg-purple-100 dark:bg-purple-900/20"
          description={`${(100 - stats.budgetUtilization).toFixed(1)}% tersisa`}
        />
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Pemakaian Anggaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Terpakai</span>
              <span className="font-medium">{stats.budgetUtilization.toFixed(1)}%</span>
            </div>
            <Progress value={stats.budgetUtilization} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(stats.usedBudget)}</span>
              <span>{formatCurrency(stats.totalBudget)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dialokasikan</span>
              <span className="font-medium">{stats.allocationRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.allocationRate} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(stats.allocatedBudget)}</span>
              <span>{formatCurrency(stats.totalBudget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Rencana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statusInfo.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2', item.bg)}>
                  <item.icon className={cn('h-4 w-4', item.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Penerima</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.targetRecipients.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Orang</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Makanan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.targetMeals.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Porsi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
