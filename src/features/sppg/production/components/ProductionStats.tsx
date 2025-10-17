/**
 * @fileoverview Food Production Statistics Cards
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChefHat,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductionStats } from '../hooks/useProductions'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// ============================================================================
// Types
// ============================================================================

interface ProductionStatsProps {
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
 * Loading Skeleton for Statistics Cards
 */
function StatsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

/**
 * Error State Component
 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Gagal memuat statistik produksi
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Coba Lagi
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Main Component: Food Production Statistics
 */
export function ProductionStats({ className }: ProductionStatsProps) {
  const { data: stats, isLoading, isError, refetch } = useProductionStats()

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        <StatsSkeleton />
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className={cn('grid gap-4', className)}>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  const cards: StatCard[] = [
    {
      title: 'Total Produksi',
      value: stats.total,
      icon: ChefHat,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      description: `${stats.planned} dijadwalkan`,
    },
    {
      title: 'Sedang Berlangsung',
      value: stats.inProgress,
      icon: Clock,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/20',
      description: 'Persiapan, memasak, dan QC',
    },
    {
      title: 'Selesai',
      value: stats.completed,
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/20',
      description: `${stats.cancelled} dibatalkan`,
    },
    {
      title: 'Tingkat Keberhasilan',
      value: stats.total > 0 
        ? `${Math.round((stats.completed / stats.total) * 100)}%`
        : '0%',
      icon: TrendingUp,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Dari total produksi',
    },
  ]

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  )
}
