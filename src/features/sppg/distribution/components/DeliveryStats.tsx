/**
 * @fileoverview Delivery Statistics Component
 * @version Next.js 15.5.4
 * @description Real-time stats for in-transit deliveries with GPS tracking
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

interface DeliveryStatsData {
  inTransit: number
  enRoute: number
  arrived: number
  totalDeliveriesToday: number
}

async function fetchDeliveryStats(): Promise<ApiResponse<DeliveryStatsData>> {
  const baseUrl = getBaseUrl()
  
  // Query for in-transit deliveries
  const params = new URLSearchParams({
    status: 'EN_ROUTE',
    limit: '0', // Just get count
  })
  
  const response = await fetch(
    `${baseUrl}/api/sppg/distribution/delivery?${params}`,
    getFetchOptions()
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch delivery stats')
  }

  const result = await response.json()
  
  // Transform to stats format
  return {
    success: true,
    data: {
      inTransit: result.data?.summary?.enRoute || 0,
      enRoute: result.data?.summary?.enRoute || 0,
      arrived: result.data?.summary?.arrived || 0,
      totalDeliveriesToday: result.data?.total || 0,
    }
  }
}

export function DeliveryStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['distribution', 'delivery', 'stats'],
    queryFn: fetchDeliveryStats,
    refetchInterval: 15000, // Refetch every 15 seconds (real-time tracking)
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  if (isLoading) {
    return <Skeleton className="h-8 w-16" />
  }

  if (error || !data?.success || !data.data) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <>
      {data.data.inTransit}
    </>
  )
}
