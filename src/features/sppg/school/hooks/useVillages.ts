/**
 * @fileoverview Villages hook for school form
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { villagesApi } from '@/features/sppg/school/api/villagesApi'

/**
 * Hook to fetch all villages for dropdown with location hierarchy
 */
export function useVillages() {
  return useQuery({
    queryKey: ['villages', 'all'],
    queryFn: async () => {
      const result = await villagesApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch villages')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - location data rarely changes
  })
}
