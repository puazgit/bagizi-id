/**
 * @fileoverview TanStack Query Hook for Execution Issues
 * @version React Query v5
 * @see {@link /docs/copilot-instructions.md} Enterprise Hooks Pattern
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { executionIssuesApi } from '@/features/sppg/distribution/execution/api/executionIssuesApi'
import type {
  IssuesFilters,
  CreateIssueInput,
} from '@/features/sppg/distribution/execution/api/executionIssuesApi'
import { toast } from 'sonner'

/**
 * Query hook for fetching execution issues
 * 
 * @param executionId - Distribution execution ID
 * @param filters - Optional filters for issues
 * @returns TanStack Query result with issues and summary
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { data, isLoading } = useExecutionIssues('exec-123')
 * 
 * // With filters
 * const { data } = useExecutionIssues('exec-123', { severity: 'CRITICAL' })
 * 
 * // Only unresolved
 * const { data } = useExecutionIssues('exec-123', { resolved: false })
 * ```
 */
export function useExecutionIssues(
  executionId: string,
  filters?: IssuesFilters
) {
  return useQuery({
    queryKey: ['execution-issues', executionId, filters],
    queryFn: async () => {
      const result = await executionIssuesApi.getIssues(executionId, filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch execution issues')
      }
      
      // Convert ISO date strings to Date objects
      const issuesWithDates = result.data.issues.map((issue) => ({
        ...issue,
        reportedAt: new Date(issue.reportedAt),
        resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : null,
      }))
      
      return {
        ...result.data,
        issues: issuesWithDates,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}

/**
 * Mutation hook for creating a new issue
 * 
 * @returns TanStack Query mutation for creating issues
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useCreateIssue('exec-123')
 * 
 * mutate({
 *   issueType: 'VEHICLE_BREAKDOWN',
 *   severity: 'CRITICAL',
 *   description: 'Engine failure on main road',
 *   location: 'Jl. Sudirman KM 5'
 * })
 * ```
 */
export function useCreateIssue(executionId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateIssueInput) => {
      const result = await executionIssuesApi.createIssue(executionId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create issue')
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalidate all issue queries for this execution
      queryClient.invalidateQueries({
        queryKey: ['execution-issues', executionId],
      })
      
      toast.success('Masalah berhasil dilaporkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal melaporkan masalah')
    },
  })
}

/**
 * Helper hook: Get only unresolved issues
 * 
 * @param executionId - Distribution execution ID
 */
export function useUnresolvedIssues(executionId: string) {
  return useExecutionIssues(executionId, { resolved: false })
}

/**
 * Helper hook: Get only critical issues
 * 
 * @param executionId - Distribution execution ID
 */
export function useCriticalIssues(executionId: string) {
  return useExecutionIssues(executionId, { severity: 'CRITICAL' })
}
