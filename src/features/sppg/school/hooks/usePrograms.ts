/**
 * @fileoverview Programs hook for school form
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { programsApi } from '@/features/sppg/menu/api/programsApi'

/**
 * Hook to fetch all programs for dropdown
 */
export function usePrograms() {
  return useQuery({
    queryKey: ['programs', 'all'],
    queryFn: async () => {
      const result = await programsApi.getAll({ status: 'ACTIVE' })
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch programs')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
