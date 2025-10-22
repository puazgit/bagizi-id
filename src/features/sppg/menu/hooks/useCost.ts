/**
 * @fileoverview TanStack Query hooks for Cost operations
 * @version Next.js 15.5.4 / React Query v5
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { costApi } from '../api/costApi'
import type { CalculateCostInput } from '../types/cost.types'

// Query key factory
export const costKeys = {
  menu: (menuId: string) => ['menu', menuId, 'cost'] as const,
}

/**
 * Hook to fetch cost report for a menu
 */
export function useCostReport(menuId: string) {
  return useQuery({
    queryKey: costKeys.menu(menuId),
    queryFn: () => costApi.getReport(menuId),
    select: (data) => data.data,
    retry: 1,
  })
}

/**
 * Hook to calculate cost for a menu
 */
export function useCalculateCost(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CalculateCostInput = {}) => 
      costApi.calculate(menuId, data),
    onSuccess: async () => {
      console.log('💰 Cost calculation success! Starting cache refresh...')
      
      // Invalidate cost report query to refetch
      await queryClient.invalidateQueries({ queryKey: costKeys.menu(menuId) })
      console.log('✅ Invalidated cost report')
      
      // Invalidate menu detail query to update calculated fields
      await queryClient.invalidateQueries({ queryKey: ['sppg', 'menus', menuId] })
      console.log('✅ Invalidated menu detail')
      
      // CRITICAL: Invalidate menu list queries to mark them stale
      // Use exact: false to match all queries starting with ['sppg', 'menus']
      console.log('� Invalidating all menu list queries...')
      await queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'menus'],
        exact: false, // Match all queries starting with this key
        refetchType: 'none' // Don't refetch now, will refetch on next mount
      })
      console.log('✅ Menu list queries invalidated!')
      
      toast.success('Biaya berhasil dihitung')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghitung biaya')
    }
  })
}
