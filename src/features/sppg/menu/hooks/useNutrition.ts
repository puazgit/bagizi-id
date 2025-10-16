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
    onSuccess: () => {
      // Invalidate nutrition report query to refetch
      queryClient.invalidateQueries({ queryKey: nutritionKeys.menu(menuId) })
      
      // Also invalidate menu query to update calculated fields
      queryClient.invalidateQueries({ queryKey: ['menu', menuId] })
      
      toast.success('Nutrisi berhasil dihitung')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghitung nutrisi')
    }
  })
}
