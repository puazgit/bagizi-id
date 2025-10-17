/**
 * @fileoverview Budget Breakdown Visualization Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ProcurementPlan } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

interface BudgetBreakdownProps {
  plan: ProcurementPlan
  className?: string
  showChart?: boolean
}

interface CategoryBudget {
  name: string
  budget: number
  percentage: number
  color: string
  bgColor: string
  icon: string
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

function calculateCategoryBudgets(plan: ProcurementPlan): CategoryBudget[] {
  const categories: CategoryBudget[] = []

  if (plan.proteinBudget) {
    categories.push({
      name: 'Protein',
      budget: plan.proteinBudget,
      percentage: (plan.proteinBudget / plan.totalBudget) * 100,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: '🥩',
    })
  }

  if (plan.carbBudget) {
    categories.push({
      name: 'Karbohidrat',
      budget: plan.carbBudget,
      percentage: (plan.carbBudget / plan.totalBudget) * 100,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: '🍚',
    })
  }

  if (plan.vegetableBudget) {
    categories.push({
      name: 'Sayuran',
      budget: plan.vegetableBudget,
      percentage: (plan.vegetableBudget / plan.totalBudget) * 100,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: '🥬',
    })
  }

  if (plan.fruitBudget) {
    categories.push({
      name: 'Buah',
      budget: plan.fruitBudget,
      percentage: (plan.fruitBudget / plan.totalBudget) * 100,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      icon: '🍎',
    })
  }

  if (plan.otherBudget) {
    categories.push({
      name: 'Lainnya',
      budget: plan.otherBudget,
      percentage: (plan.otherBudget / plan.totalBudget) * 100,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      icon: '📦',
    })
  }

  return categories
}

function calculateBudgetStatus(plan: ProcurementPlan) {
  const utilizationPercentage = (plan.usedBudget / plan.totalBudget) * 100
  const allocationPercentage = (plan.allocatedBudget / plan.totalBudget) * 100
  const remainingPercentage = (plan.remainingBudget / plan.totalBudget) * 100

  return {
    utilization: {
      amount: plan.usedBudget,
      percentage: utilizationPercentage,
    },
    allocation: {
      amount: plan.allocatedBudget,
      percentage: allocationPercentage,
    },
    remaining: {
      amount: plan.remainingBudget,
      percentage: remainingPercentage,
    },
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Simple Pie Chart Visualization
 */
function SimplePieChart({ categories }: { categories: CategoryBudget[] }) {
  let cumulativePercentage = 0

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="hsl(var(--muted))" opacity="0.1" />

        {/* Category segments */}
        {categories.map((category, index) => {
          const startAngle = (cumulativePercentage / 100) * 360
          const endAngle = ((cumulativePercentage + category.percentage) / 100) * 360
          cumulativePercentage += category.percentage

          // Calculate path for pie slice
          const startRad = (startAngle - 90) * (Math.PI / 180)
          const endRad = (endAngle - 90) * (Math.PI / 180)

          const x1 = 100 + 90 * Math.cos(startRad)
          const y1 = 100 + 90 * Math.sin(startRad)
          const x2 = 100 + 90 * Math.cos(endRad)
          const y2 = 100 + 90 * Math.sin(endRad)

          const largeArc = endAngle - startAngle > 180 ? 1 : 0

          const pathData = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`

          // Color mapping
          const colorMap: Record<string, string> = {
            'text-red-600': '#dc2626',
            'text-yellow-600': '#ca8a04',
            'text-green-600': '#16a34a',
            'text-orange-600': '#ea580c',
            'text-purple-600': '#9333ea',
          }

          return (
            <path
              key={index}
              d={pathData}
              fill={colorMap[category.color] || '#6b7280'}
              opacity="0.8"
              className="transition-opacity hover:opacity-100"
            />
          )
        })}

        {/* Center circle for donut effect */}
        <circle cx="100" cy="100" r="50" fill="hsl(var(--background))" />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold">{categories.length}</p>
          <p className="text-xs text-muted-foreground">Kategori</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Main Component: Budget Breakdown
 */
export function BudgetBreakdown({ plan, className, showChart = true }: BudgetBreakdownProps) {
  const categories = calculateCategoryBudgets(plan)
  const budgetStatus = calculateBudgetStatus(plan)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Anggaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Budget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Anggaran</span>
              <span className="text-2xl font-bold">{formatCurrency(plan.totalBudget)}</span>
            </div>
          </div>

          <Separator />

          {/* Budget Status */}
          <div className="space-y-4">
            {/* Used Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Terpakai</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(budgetStatus.utilization.amount)}</span>
                  <Badge variant="secondary">
                    {budgetStatus.utilization.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={budgetStatus.utilization.percentage} className="h-2" />
            </div>

            {/* Allocated Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dialokasikan</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(budgetStatus.allocation.amount)}</span>
                  <Badge variant="outline">
                    {budgetStatus.allocation.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={budgetStatus.allocation.percentage} className="h-2" />
            </div>

            {/* Remaining Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tersisa</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(budgetStatus.remaining.amount)}</span>
                  <Badge variant="default">
                    {budgetStatus.remaining.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={budgetStatus.remaining.percentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Alokasi per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pie Chart */}
          {showChart && categories.length > 0 && (
            <div className="flex items-center justify-center">
              <SimplePieChart categories={categories} />
            </div>
          )}

          {/* Category List */}
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-lg p-2 text-lg', category.bgColor)}>
                      {category.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.percentage.toFixed(1)}% dari total
                      </p>
                    </div>
                  </div>
                  <span className={cn('text-sm font-bold', category.color)}>
                    {formatCurrency(category.budget)}
                  </span>
                </div>
                {/* Simple progress bar with category color */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all', category.color.replace('text-', 'bg-'))}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Belum ada alokasi budget per kategori</p>
              <p className="text-xs mt-1">Tambahkan budget untuk setiap kategori</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Metrics */}
      {(plan.targetRecipients || plan.targetMeals || plan.costPerMeal) && (
        <Card>
          <CardHeader>
            <CardTitle>Target & Kalkulasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plan.targetRecipients && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Target Penerima</p>
                  <p className="text-2xl font-bold">
                    {plan.targetRecipients.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">Orang</p>
                </div>
              )}

              {plan.targetMeals && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Target Makanan</p>
                  <p className="text-2xl font-bold">
                    {plan.targetMeals.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">Porsi</p>
                </div>
              )}

              {plan.costPerMeal && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Biaya per Porsi</p>
                  <p className="text-2xl font-bold">{formatCurrency(plan.costPerMeal)}</p>
                  <p className="text-xs text-muted-foreground">Per porsi</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
