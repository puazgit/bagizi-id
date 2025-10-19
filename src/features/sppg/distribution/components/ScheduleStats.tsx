/**
 * @fileoverview Schedule Statistics Component
 * @version Next.js 15.5.4
 * @description Real-time stats for active distribution schedules
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

interface ScheduleStatsData {
  activeSchedules: number
  todaySchedules: number
  upcomingSchedules: number
  completedThisWeek: number
}

async function fetchScheduleStats(): Promise<ApiResponse<ScheduleStatsData>> {
  const baseUrl = getBaseUrl()
  const response = await fetch(
    `${baseUrl}/api/sppg/distribution/schedule/statistics`,
    getFetchOptions()
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch schedule stats')
  }

  return response.json()
}

export function ScheduleStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['distribution', 'schedule', 'stats'],
    queryFn: fetchScheduleStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  })

  if (isLoading) {
    return <Skeleton className="h-8 w-16" />
  }

  if (error || !data?.success || !data.data) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <>
      {data.data.activeSchedules}
    </>
  )
}
