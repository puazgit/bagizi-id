import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type { AuditLogEntry } from '../components/ExecutionAuditTrail'

/**
 * Audit log API response with pagination
 */
export interface AuditLogResponse {
  logs: AuditLogEntry[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Audit log filter parameters
 */
export interface AuditLogFilters {
  action?: string
  limit?: number
  offset?: number
}

/**
 * Execution Audit API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await executionAuditApi.getAuditLogs('exec-123')
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await executionAuditApi.getAuditLogs('exec-123', {}, headers())
 * ```
 */
export const executionAuditApi = {
  /**
   * Fetch audit logs for a specific execution
   * @param executionId - ID of the distribution execution
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with audit logs and pagination info
   */
  async getAuditLogs(
    executionId: string,
    filters?: AuditLogFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<AuditLogResponse>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.action) params.append('action', filters.action)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/distribution/execution/${executionId}/audit?${queryString}`
      : `${baseUrl}/api/sppg/distribution/execution/${executionId}/audit`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch audit logs')
    }
    
    return response.json()
  },
}
