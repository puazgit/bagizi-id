/**
 * @fileoverview React Query Hooks for Nutrition Programs
 * @version Next.js 15.5.4 / TanStack Query
 * @description Hooks for fetching nutrition programs list
 */

import { useQuery } from '@tanstack/react-query'

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
 * API Response format
 */
interface ProgramsApiResponse {
  success: boolean
  data: ProgramOption[]
  message?: string
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

/**
 * Hook to fetch programs list for dropdown/select
 * Used in menu planning forms to select which program to plan for
 */
export function usePrograms() {
  return useQuery({
    queryKey: ['programs', 'all'],
    queryFn: async (): Promise<ProgramOption[]> => {
      const response = await fetch('/api/sppg/programs?limit=100&status=ACTIVE')
      
      if (!response.ok) {
        throw new Error('Failed to fetch programs')
      }

      const json: ProgramsApiResponse = await response.json()
      
      if (!json.success || !json.data) {
        throw new Error(json.message || 'Failed to fetch programs')
      }

      return json.data
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
    queryFn: async (): Promise<ProgramOption[]> => {
      const response = await fetch('/api/sppg/programs?status=ACTIVE&limit=100')
      
      if (!response.ok) {
        throw new Error('Failed to fetch active programs')
      }

      const json: ProgramsApiResponse = await response.json()
      
      if (!json.success || !json.data) {
        throw new Error(json.message || 'Failed to fetch active programs')
      }

      return json.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
