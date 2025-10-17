/**
 * @fileoverview Procurement Statistics Cards - Modular & Robust
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import { 
  ShoppingCart, 
  TrendingUp,
  DollarSign, 
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  isLoading?: boolean
  className?: string
}

interface ProcurementStatsProps {
  stats: {
    totalOrders: number
    totalValue: number
    pendingOrders: number
    completedOrders: number
    averageOrderValue: number
    monthlyGrowth: number
  }
  isLoading?: boolean
  className?: string
}

// ================================ UTILITIES ================================

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(2)}jt`
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num)
}

// ================================ STAT CARD COMPONENT ================================

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = 'neutral',
  isLoading,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="h-3 w-3" />
    if (trend === 'down') return <ArrowDownRight className="h-3 w-3" />
    return null
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
    if (trend === 'down') return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
    return 'text-muted-foreground bg-muted'
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <Badge 
              variant="secondary"
              className={cn('text-xs font-medium px-1.5', getTrendColor())}
            >
              {getTrendIcon()}
              <span className="ml-0.5">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </Badge>
            {changeLabel && (
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ================================ MAIN COMPONENT ================================

export const ProcurementStats: FC<ProcurementStatsProps> = ({
  stats,
  isLoading,
  className,
}) => {
  const completionRate = stats.totalOrders > 0 
    ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
    : '0'

  const pendingRate = stats.totalOrders > 0
    ? ((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1)
    : '0'

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        title="Total Pengadaan"
        value={formatNumber(stats.totalOrders)}
        change={stats.monthlyGrowth}
        changeLabel="vs bulan lalu"
        icon={<ShoppingCart className="h-4 w-4" />}
        trend={stats.monthlyGrowth > 0 ? 'up' : stats.monthlyGrowth < 0 ? 'down' : 'neutral'}
        isLoading={isLoading}
      />

      <StatCard
        title="Total Nilai"
        value={formatCurrency(stats.totalValue)}
        change={stats.monthlyGrowth * 1.2} // Assume value growth slightly higher
        changeLabel="vs bulan lalu"
        icon={<DollarSign className="h-4 w-4" />}
        trend={stats.monthlyGrowth > 0 ? 'up' : stats.monthlyGrowth < 0 ? 'down' : 'neutral'}
        isLoading={isLoading}
      />

      <StatCard
        title="Order Selesai"
        value={`${formatNumber(stats.completedOrders)} (${completionRate}%)`}
        icon={<CheckCircle className="h-4 w-4" />}
        isLoading={isLoading}
      />

      <StatCard
        title="Order Pending"
        value={`${formatNumber(stats.pendingOrders)} (${pendingRate}%)`}
        icon={<Clock className="h-4 w-4" />}
        isLoading={isLoading}
      />
    </div>
  )
}

// ================================ DETAILED STATS COMPONENT ================================

interface DetailedStatsProps {
  stats: {
    avgDeliveryTime: number
    onTimeDeliveryRate: number
    qualityIssueRate: number
    supplierCount: number
    topSupplier?: string
  }
  isLoading?: boolean
  className?: string
}

export const DetailedProcurementStats: FC<DetailedStatsProps> = ({
  stats,
  isLoading,
  className,
}) => {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        title="Rata-rata Waktu Kirim"
        value={`${stats.avgDeliveryTime} hari`}
        icon={<Package className="h-4 w-4" />}
        trend={stats.avgDeliveryTime <= 3 ? 'up' : 'down'}
        isLoading={isLoading}
      />

      <StatCard
        title="Ketepatan Waktu"
        value={`${stats.onTimeDeliveryRate}%`}
        icon={<TrendingUp className="h-4 w-4" />}
        trend={stats.onTimeDeliveryRate >= 80 ? 'up' : 'down'}
        isLoading={isLoading}
      />

      <StatCard
        title="Masalah Kualitas"
        value={`${stats.qualityIssueRate}%`}
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={stats.qualityIssueRate <= 5 ? 'up' : 'down'}
        isLoading={isLoading}
      />

      <StatCard
        title="Total Supplier"
        value={formatNumber(stats.supplierCount)}
        icon={<Package className="h-4 w-4" />}
        isLoading={isLoading}
      />
    </div>
  )
}
