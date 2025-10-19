/**
 * @fileoverview React Query Hooks for Nutrition Programs
 * @version Next.js 15.5.4 / TanStack Query
 * @description Hooks for fetching nutrition programs list
 */

import { useQuery } from '@tanstack/react-query'
import { programsApi } from '@/features/sppg/menu/api/programsApi'

/**
 * Program type for menu planning forms
 */
export interface ProgramOption {
  id: string
  name: string
  programCode: string
  targetRecipients: number
  budgetPerMeal: number
}

/**
 * Hook to fetch programs list for dropdown/select
 * Used in menu planning forms to select which program to plan for
 */
export function usePrograms() {
  return useQuery({
    queryKey: ['programs', 'all'],
    queryFn: async () => {
      const result = await programsApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch programs')
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - programs don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch active programs only
 */
export function useActivePrograms() {
  return useQuery({
    queryKey: ['programs', 'active'],
    queryFn: async () => {
      const result = await programsApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch active programs')
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
