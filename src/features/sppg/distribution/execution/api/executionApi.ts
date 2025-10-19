/**
 * @fileoverview Distribution Execution API Client
 * @version Next.js 15.5.4
 * @description Centralized API client for execution operations with SSR support
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_PHASE2_EXECUTION_PLAN.md} PHASE 2 Plan
 * @see {@link /docs/copilot-instructions.md} Section 2a - API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type { DistributionStatus } from '@prisma/client'
import type {
  ExecutionListItem,
  ExecutionDetail,
  ExecutionStatistics,
  StartExecutionInput,
  UpdateExecutionInput,
  CompleteExecutionInput,
  ReportIssueInput,
  ExecutionFilters,
} from '../types'

/**
 * Pagination parameters
 */
interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * Distribution Execution API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await executionApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await executionApi.getAll(undefined, undefined, headers())
 * ```
 */
export const executionApi = {
  /**
   * Fetch all executions with optional filtering and pagination
   * @param filters - Optional filter parameters
   * @param pagination - Optional pagination parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing execution list
   */
  async getAll(
    filters?: ExecutionFilters,
    pagination?: PaginationParams,
    headers?: HeadersInit
  ): Promise<ApiResponse<{ executions: ExecutionListItem[]; total: number; page: number; pageSize: number; hasMore: boolean }>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach((s: DistributionStatus) => params.append('status', s))
      } else {
        params.append('status', filters.status)
      }
    }
    if (filters?.scheduleId) params.append('scheduleId', filters.scheduleId)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())
    if (filters?.hasIssues !== undefined) params.append('hasIssues', String(filters.hasIssues))
    if (filters?.search) params.append('search', filters.search)
    
    if (pagination?.page) params.append('page', String(pagination.page))
    if (pagination?.pageSize) params.append('pageSize', String(pagination.pageSize))
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/distribution/execution?${queryString}`
      : `${baseUrl}/api/sppg/distribution/execution`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch executions')
    }
    
    return response.json()
  },

  /**
   * Fetch single execution by ID
   * @param id - Execution ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing execution detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch execution')
    }
    
    return response.json()
  },

  /**
   * Start new execution from schedule
   * @param data - Start execution input data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created execution
   */
  async start(
    data: StartExecutionInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/distribution/execution`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start execution')
    }
    
    return response.json()
  },

  /**
   * Update execution progress
   * @param id - Execution ID
   * @param data - Update execution input data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated execution
   */
  async update(
    id: string,
    data: UpdateExecutionInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/distribution/execution/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update execution')
    }
    
    return response.json()
  },

  /**
   * Complete execution
   * @param id - Execution ID
   * @param data - Complete execution input data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing completed execution
   */
  async complete(
    id: string,
    data: CompleteExecutionInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${id}/complete`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to complete execution')
    }
    
    return response.json()
  },

  /**
   * Cancel execution
   * @param id - Execution ID
   * @param reason - Cancellation reason
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing cancelled execution
   */
  async cancel(
    id: string,
    reason: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${id}/cancel`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ reason }),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel execution')
    }
    
    return response.json()
  },

  /**
   * Delete execution
   * @param id - Execution ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete execution')
    }
    
    return response.json()
  },

  /**
   * Report issue during execution
   * @param id - Execution ID
   * @param data - Issue report data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated execution
   */
  async reportIssue(
    id: string,
    data: ReportIssueInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${id}/issue`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to report issue')
    }
    
    return response.json()
  },

  /**
   * Resolve reported issue
   * @param id - Execution ID
   * @param issueId - Issue ID
   * @param data - Resolution data (resolutionNotes, resolvedAt)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated execution
   */
  async resolveIssue(
    id: string,
    issueId: string,
    data: { resolutionNotes: string; resolvedAt: Date },
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${id}/issue/${issueId}/resolve`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to resolve issue')
    }
    
    return response.json()
  },

  /**
   * Record delivery completion
   * @param id - Execution ID
   * @param data - Delivery record data (deliveryId, portionsDelivered, beneficiariesReached, notes)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated execution
   */
  async recordDelivery(
    id: string,
    data: { deliveryId: string; portionsDelivered: number; beneficiariesReached: number; notes?: string },
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${id}/delivery`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to record delivery')
    }
    
    return response.json()
  },

  /**
   * Get execution statistics
   * @param filters - Optional filter parameters (dateFrom, dateTo)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing statistics
   */
  async getStatistics(
    filters?: Pick<ExecutionFilters, 'dateFrom' | 'dateTo'>,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionStatistics>> {
    const baseUrl = getBaseUrl()
    
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/distribution/execution/statistics?${queryString}`
      : `${baseUrl}/api/sppg/distribution/execution/statistics`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch statistics')
    }
    
    return response.json()
  },
}
