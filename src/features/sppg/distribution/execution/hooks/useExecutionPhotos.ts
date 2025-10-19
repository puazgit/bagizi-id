/**
 * @fileoverview TanStack Query Hook - Execution Photos
 * 
 * React Query hook for fetching execution photos with caching
 * 
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { executionPhotosApi, type PhotoFilters } from '../api/executionPhotosApi'

/**
 * Hook to fetch photos for a specific execution
 * 
 * @param executionId - Execution ID
 * @param filters - Optional photo filters
 * @returns TanStack Query result with photos data
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useExecutionPhotos('exec-123')
 * const photos = data?.photos || []
 * ```
 */
export function useExecutionPhotos(
  executionId: string,
  filters?: PhotoFilters
) {
  return useQuery({
    queryKey: ['execution-photos', executionId, filters],
    queryFn: async () => {
      const result = await executionPhotosApi.getPhotos(executionId, filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch execution photos')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}
