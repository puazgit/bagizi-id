import { useQuery } from '@tanstack/react-query'
import { executionAuditApi, type AuditLogFilters } from '../api/executionAuditApi'

/**
 * Hook to fetch audit logs for a distribution execution
 * 
 * @param executionId - ID of the distribution execution
 * @param filters - Optional filter parameters
 * @returns TanStack Query result with audit logs
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useExecutionAuditLogs('exec-123')
 * 
 * // With filters
 * const { data } = useExecutionAuditLogs('exec-123', {
 *   action: 'UPDATE',
 *   limit: 20
 * })
 * ```
 */
export function useExecutionAuditLogs(
  executionId: string,
  filters?: AuditLogFilters
) {
  return useQuery({
    queryKey: ['execution-audit', executionId, filters],
    queryFn: async () => {
      const result = await executionAuditApi.getAuditLogs(executionId, filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch audit logs')
      }
      
      return result.data
    },
    // Audit logs don't change frequently, so we can cache them longer
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Refetch when window gains focus to catch any new changes
    refetchOnWindowFocus: true,
  })
}
