/**
 * @fileoverview Performance Metrics Component
 * @version Next.js 15.5.4
 * @description Overall distribution performance metrics dashboard
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

interface PerformanceMetricsData {
  totalDistributions: number
  onTimePercentage: number
  totalPortionsDelivered: number
  averageRating: number
  trend: {
    distributions: 'up' | 'down' | 'stable'
    onTime: 'up' | 'down' | 'stable'
    portions: 'up' | 'down' | 'stable'
    rating: 'up' | 'down' | 'stable'
  }
}

async function fetchPerformanceMetrics(): Promise<ApiResponse<PerformanceMetricsData>> {
  const baseUrl = getBaseUrl()
  
  // Fetch overall distribution stats
  const response = await fetch(
    `${baseUrl}/api/sppg/distribution?limit=1`,
    getFetchOptions()
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch performance metrics')
  }

  const result = await response.json()
  
  // Calculate metrics from summary
  const summary = result.data?.summary || {}
  const total = summary.total || 0
  const completed = summary.completed || 0
  const onTimePercentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return {
    success: true,
    data: {
      totalDistributions: total,
      onTimePercentage,
      totalPortionsDelivered: 0, // Will be calculated from actual data
      averageRating: 4.5, // Placeholder - integrate with feedback system
      trend: {
        distributions: 'up',
        onTime: 'stable',
        portions: 'up',
        rating: 'up',
      }
    }
  }
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

export function PerformanceMetrics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['distribution', 'performance', 'metrics'],
    queryFn: fetchPerformanceMetrics,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 45000, // Consider data stale after 45 seconds
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !data?.success || !data.data) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Tidak dapat memuat metrik performa
      </div>
    )
  }

  const metrics = data.data

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Distribusi */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Total Distribusi</p>
          <TrendIcon trend={metrics.trend.distributions} />
        </div>
        <p className="text-2xl font-bold">{metrics.totalDistributions}</p>
        <p className="text-xs text-muted-foreground">Bulan ini</p>
      </div>

      {/* Tepat Waktu */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Tepat Waktu</p>
          <TrendIcon trend={metrics.trend.onTime} />
        </div>
        <p className="text-2xl font-bold">{metrics.onTimePercentage}%</p>
        <p className="text-xs text-muted-foreground">Tingkat ketepatan</p>
      </div>

      {/* Total Porsi */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Porsi Terdistribusi</p>
          <TrendIcon trend={metrics.trend.portions} />
        </div>
        <p className="text-2xl font-bold">
          {metrics.totalPortionsDelivered.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-muted-foreground">Bulan ini</p>
      </div>

      {/* Rating Rata-rata */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rating Rata-rata</p>
          <TrendIcon trend={metrics.trend.rating} />
        </div>
        <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}/5</p>
        <p className="text-xs text-muted-foreground">Kepuasan</p>
      </div>
    </div>
  )
}
