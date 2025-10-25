/**
 * @fileoverview Admin Dashboard Hooks
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api'

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      try {
        const result = await dashboardApi.getStats()
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch dashboard statistics')
        }
        
        return result.data
      } catch (error) {
        console.error('Dashboard stats fetch error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    retry: 2,
    retryDelay: 1000
  })
}
