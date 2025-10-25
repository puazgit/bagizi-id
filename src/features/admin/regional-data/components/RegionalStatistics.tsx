/**
 * @fileoverview Regional Statistics Dashboard Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Building2, MapPinned, Home, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRegionalStatistics } from '../hooks'
import { calculateRegionalSummary, formatDate } from '../lib'

/**
 * Stat card data
 */
interface StatCardData {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
  color: string
}

/**
 * Component props
 */
interface RegionalStatisticsProps {
  /**
   * Show trend indicators
   * @default false
   */
  showTrends?: boolean
  
  /**
   * Custom class name
   */
  className?: string
}

/**
 * Regional Statistics Component
 * 
 * Displays summary statistics for all regional levels
 * 
 * @example
 * ```tsx
 * <RegionalStatistics showTrends />
 * ```
 */
export function RegionalStatistics({ 
  showTrends = false,
  className 
}: RegionalStatisticsProps) {
  const { data: stats, isLoading } = useRegionalStatistics()

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const summary = calculateRegionalSummary({
    provinces: stats.totalProvinces ?? 0,
    regencies: stats.totalRegencies ?? 0,
    districts: stats.totalDistricts ?? 0,
    villages: stats.totalVillages ?? 0,
  })

  const statCards: StatCardData[] = [
    {
      title: 'Total Provinsi',
      value: stats.totalProvinces ?? 0,
      icon: <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      trend: showTrends ? `${summary.avgRegenciesPerProvince} kab/kota per provinsi` : undefined,
      color: 'blue',
    },
    {
      title: 'Total Kabupaten/Kota',
      value: stats.totalRegencies ?? 0,
      icon: <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
      trend: showTrends ? `${summary.avgDistrictsPerRegency} kecamatan per kab/kota` : undefined,
      color: 'green',
    },
    {
      title: 'Total Kecamatan',
      value: stats.totalDistricts ?? 0,
      icon: <MapPinned className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
      trend: showTrends ? `${summary.avgVillagesPerDistrict} desa per kecamatan` : undefined,
      color: 'orange',
    },
    {
      title: 'Total Desa/Kelurahan',
      value: stats.totalVillages ?? 0,
      icon: <Home className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      trend: showTrends ? 'Data lengkap' : undefined,
      color: 'purple',
    },
  ]

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn(
                'rounded-full p-2',
                stat.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/20',
                stat.color === 'green' && 'bg-green-100 dark:bg-green-900/20',
                stat.color === 'orange' && 'bg-orange-100 dark:bg-orange-900/20',
                stat.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/20'
              )}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString('id-ID')}
              </div>
              {stat.trend && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Data terakhir diperbarui: {formatDate(stats.lastUpdated)}
        </p>
      )}
    </div>
  )
}

/**
 * Compact version for small spaces
 */
export function RegionalStatisticsCompact() {
  const { data: stats, isLoading } = useRegionalStatistics()

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />
  }

  if (!stats) {
    return null
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalProvinces}
            </div>
            <div className="text-xs text-muted-foreground">Provinsi</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.totalRegencies}
            </div>
            <div className="text-xs text-muted-foreground">Kab/Kota</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.totalDistricts}
            </div>
            <div className="text-xs text-muted-foreground">Kecamatan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalVillages}
            </div>
            <div className="text-xs text-muted-foreground">Desa/Kel</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
