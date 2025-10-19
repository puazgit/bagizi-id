/**
 * @fileoverview Distribution Execution Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @description React Query hooks for execution data fetching with real-time polling
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { executionApi } from '../api'
import type { ExecutionFilters, ExecutionDetail } from '../types'

/**
 * Pagination parameters
 */
interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * Query hook to fetch all executions with filtering and pagination
 * @param filters - Optional filter parameters
 * @param pagination - Optional pagination parameters
 * @returns Query result with executions list
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useExecutions({ status: 'IN_TRANSIT' })
 * ```
 */
export function useExecutions(
  filters?: ExecutionFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: ['sppg', 'distribution', 'executions', filters, pagination],
    queryFn: async () => {
      const result = await executionApi.getAll(filters, pagination)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch executions')
      }
      
      return result.data
    },
    staleTime: 30 * 1000, // 30 seconds - fresh for active monitoring
    refetchInterval: (query) => {
      // Auto-refresh active executions every 30 seconds
      const hasActiveExecutions = query.state.data?.executions?.some(
        (exec) => ['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(exec.status)
      )
      return hasActiveExecutions ? 30 * 1000 : false
    },
  })
}

/**
 * Query hook to fetch single execution by ID with real-time updates
 * @param id - Execution ID
 * @param enabled - Whether query is enabled
 * @returns Query result with execution detail
 * 
 * @example
 * ```tsx
 * const { data: execution } = useExecution('exec_123')
 * ```
 */
export function useExecution(id: string, enabled = true) {
  return useQuery({
    queryKey: ['sppg', 'distribution', 'executions', id],
    queryFn: async () => {
      const result = await executionApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch execution')
      }
      
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 10 * 1000, // 10 seconds for detail view
    refetchInterval: (query) => {
      // Auto-refresh if execution is active
      const execution = query.state.data as ExecutionDetail | undefined
      const isActive = execution && ['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(execution.status)
      return isActive ? 10 * 1000 : false
    },
  })
}

/**
 * Query hook to fetch execution statistics
 * @param filters - Optional date range filters
 * @returns Query result with statistics
 * 
 * @example
 * ```tsx
 * const { data: stats } = useExecutionStatistics({
 *   dateFrom: startOfMonth(new Date()),
 *   dateTo: new Date()
 * })
 * ```
 */
export function useExecutionStatistics(
  filters?: Pick<ExecutionFilters, 'dateFrom' | 'dateTo'>
) {
  return useQuery({
    queryKey: ['sppg', 'distribution', 'executions', 'statistics', filters],
    queryFn: async () => {
      const result = await executionApi.getStatistics(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch statistics')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change frequently
  })
}

/**
 * Query hook to fetch active executions (in-progress only)
 * Auto-refreshes every 30 seconds for real-time monitoring
 * @returns Query result with active executions
 * 
 * @example
 * ```tsx
 * const { data } = useActiveExecutions()
 * ```
 */
export function useActiveExecutions() {
  return useQuery({
    queryKey: ['sppg', 'distribution', 'executions', 'active'],
    queryFn: async () => {
      const result = await executionApi.getAll({
        status: ['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'],
      })
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch active executions')
      }
      
      return result.data
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Always refresh for active monitoring
  })
}
