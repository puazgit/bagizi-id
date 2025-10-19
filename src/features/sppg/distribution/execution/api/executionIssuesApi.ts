/**
 * @fileoverview API Client for Execution Issues
 * @version Next.js 15.5.4
 * @see {@link /docs/copilot-instructions.md} Enterprise API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type { IssueType, IssueSeverity } from '@prisma/client'

/**
 * Issue data structure returned from API
 */
export interface ExecutionIssueData {
  id: string
  issueType: IssueType
  severity: IssueSeverity
  description: string
  location: string | null
  affectedDeliveries: string[]
  reportedAt: Date
  reportedBy: string
  resolvedAt: Date | null
  resolvedBy: string | null
  resolutionNotes: string | null
}

/**
 * Summary statistics for issues
 */
export interface IssuesSummary {
  total: number
  resolved: number
  unresolved: number
  bySeverity: {
    CRITICAL: number
    HIGH: number
    MEDIUM: number
    LOW: number
  }
  byType: {
    VEHICLE_BREAKDOWN: number
    WEATHER_DELAY: number
    TRAFFIC_JAM: number
    ACCESS_DENIED: number
    RECIPIENT_UNAVAILABLE: number
    FOOD_QUALITY: number
    SHORTAGE: number
    OTHER: number
  }
}

/**
 * Response from GET /issues endpoint
 */
export interface ExecutionIssuesResponse {
  issues: ExecutionIssueData[]
  summary: IssuesSummary
}

/**
 * Filters for querying issues
 */
export interface IssuesFilters {
  issueType?: IssueType
  severity?: IssueSeverity
  resolved?: boolean
}

/**
 * Input for creating a new issue
 */
export interface CreateIssueInput {
  issueType: IssueType
  severity: IssueSeverity
  description: string
  location?: string
  affectedDeliveries?: string[]
}

/**
 * Execution Issues API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await executionIssuesApi.getIssues('exec-123')
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await executionIssuesApi.getIssues('exec-123', undefined, headers())
 * 
 * // With filtering
 * const critical = await executionIssuesApi.getIssues('exec-123', { severity: 'CRITICAL' })
 * ```
 */
export const executionIssuesApi = {
  /**
   * Fetch all issues for an execution with optional filtering
   * 
   * @param executionId - Distribution execution ID
   * @param filters - Optional filters (issueType, severity, resolved)
   * @param headers - Optional headers for SSR
   * @returns Promise with issues and summary statistics
   */
  async getIssues(
    executionId: string,
    filters?: IssuesFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionIssuesResponse>> {
    const baseUrl = getBaseUrl()
    
    // Build query string from filters
    const params = new URLSearchParams()
    if (filters?.issueType) params.append('issueType', filters.issueType)
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.resolved !== undefined) params.append('resolved', String(filters.resolved))
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/distribution/execution/${executionId}/issues?${queryString}`
      : `${baseUrl}/api/sppg/distribution/execution/${executionId}/issues`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch execution issues')
    }
    
    return response.json()
  },

  /**
   * Create a new issue for an execution
   * 
   * @param executionId - Distribution execution ID
   * @param data - Issue creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with created issue
   */
  async createIssue(
    executionId: string,
    data: CreateIssueInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionIssueData>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/execution/${executionId}/issues`,
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
      throw new Error(error.error || 'Failed to create issue')
    }
    
    return response.json()
  },

  /**
   * Helper: Get only unresolved issues
   * 
   * @param executionId - Distribution execution ID
   * @param headers - Optional headers for SSR
   */
  async getUnresolvedIssues(
    executionId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionIssuesResponse>> {
    return this.getIssues(executionId, { resolved: false }, headers)
  },

  /**
   * Helper: Get only critical issues
   * 
   * @param executionId - Distribution execution ID
   * @param headers - Optional headers for SSR
   */
  async getCriticalIssues(
    executionId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionIssuesResponse>> {
    return this.getIssues(executionId, { severity: 'CRITICAL' }, headers)
  },

  /**
   * Helper: Get issues by type
   * 
   * @param executionId - Distribution execution ID
   * @param issueType - Type of issue to filter by
   * @param headers - Optional headers for SSR
   */
  async getIssuesByType(
    executionId: string,
    issueType: IssueType,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionIssuesResponse>> {
    return this.getIssues(executionId, { issueType }, headers)
  },
}
