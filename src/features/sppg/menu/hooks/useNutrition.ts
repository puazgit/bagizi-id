/**
 * @fileoverview TanStack Query hooks for Nutrition operations
 * @version Next.js 15.5.4 / React Query v5
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { nutritionApi } from '../api/nutritionApi'
import type { CalculateNutritionInput } from '../types/nutrition.types'

// Query key factory
export const nutritionKeys = {
  menu: (menuId: string) => ['menu', menuId, 'nutrition'] as const,
}

/**
 * Hook to fetch nutrition report for a menu
 */
export function useNutritionReport(menuId: string) {
  return useQuery({
    queryKey: nutritionKeys.menu(menuId),
    queryFn: () => nutritionApi.getReport(menuId),
    select: (data) => data.data,
    retry: 1,
  })
}

/**
 * Hook to calculate nutrition for a menu
 */
export function useCalculateNutrition(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CalculateNutritionInput = {}) => 
      nutritionApi.calculate(menuId, data),
    onSuccess: async () => {
      // Invalidate all related queries to refetch with new nutrition data
      await queryClient.invalidateQueries({ queryKey: nutritionKeys.menu(menuId) })
      
      // Invalidate menu detail query to update calculated fields
      await queryClient.invalidateQueries({ queryKey: ['sppg', 'menus', menuId] })
      
      // CRITICAL: Invalidate menu list queries to mark them stale
      // Use exact: false to match all queries starting with ['sppg', 'menus']
      console.log('� Invalidating all menu list queries...')
      await queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'menus'],
        exact: false, // Match all queries starting with this key
        refetchType: 'none' // Don't refetch now, will refetch on next mount
      })
      console.log('✅ Menu list queries invalidated!')
      
      toast.success('Nutrisi berhasil dihitung')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghitung nutrisi')
    }
  })
}
