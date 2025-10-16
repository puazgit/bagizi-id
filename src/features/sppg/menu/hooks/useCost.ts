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
    onSuccess: () => {
      // Invalidate cost report query to refetch
      queryClient.invalidateQueries({ queryKey: costKeys.menu(menuId) })
      
      // Also invalidate menu query to update calculated fields
      queryClient.invalidateQueries({ queryKey: ['menu', menuId] })
      
      toast.success('Biaya berhasil dihitung')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghitung biaya')
    }
  })
}
