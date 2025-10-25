/**
 * @fileoverview Demo Request API Client
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Centralized API client for Demo Request operations
 * Supports SSR via optional headers parameter
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  DemoRequestWithRelations,
  DemoRequestListItem,
  DemoRequestFormInput,
  DemoRequestFilters,
  DemoRequestApprovalInput,
  DemoRequestRejectionInput,
  DemoRequestAssignmentInput,
  DemoRequestConversionInput,
  DemoRequestAnalytics,
} from '../types/demo-request.types'

/**
 * Demo Request API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const demoRequestApi = {
  /**
   * Fetch all demo requests with optional filters
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async getAll(
    filters?: DemoRequestFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestListItem[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.organizationType) params.append('organizationType', filters.organizationType)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
    if (filters?.isConverted !== undefined) params.append('isConverted', String(filters.isConverted))
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/admin/demo-requests?${queryString}`
      : `${baseUrl}/api/admin/demo-requests`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch demo requests')
    }
    
    return response.json()
  },

  /**
   * Get demo request by ID
   * @param id - Demo request ID
   * @param headers - Optional headers for SSR
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests/${id}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch demo request')
    }
    
    return response.json()
  },

  /**
   * Create new demo request
   * @param data - Demo request creation data
   * @param headers - Optional headers for SSR
   */
  async create(
    data: DemoRequestFormInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests`, {
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
      throw new Error(error.error || 'Failed to create demo request')
    }
    
    return response.json()
  },

  /**
   * Update existing demo request
   * @param id - Demo request ID
   * @param data - Partial demo request update data
   * @param headers - Optional headers for SSR
   */
  async update(
    id: string,
    data: Partial<DemoRequestFormInput>,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests/${id}`, {
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
      throw new Error(error.error || 'Failed to update demo request')
    }
    
    return response.json()
  },

  /**
   * Delete demo request (soft delete - sets status to CANCELLED)
   * @param id - Demo request ID
   * @param headers - Optional headers for SSR
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete demo request')
    }
    
    return response.json()
  },

  /**
   * Approve demo request
   * @param id - Demo request ID
   * @param data - Approval data (optional notes)
   * @param headers - Optional headers for SSR
   */
  async approve(
    id: string,
    data?: DemoRequestApprovalInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests/${id}/approve`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data || {}),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to approve demo request')
    }
    
    return response.json()
  },

  /**
   * Reject demo request
   * @param id - Demo request ID
   * @param data - Rejection data (reason required)
   * @param headers - Optional headers for SSR
   */
  async reject(
    id: string,
    data: DemoRequestRejectionInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests/${id}/reject`, {
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
      throw new Error(error.error || 'Failed to reject demo request')
    }
    
    return response.json()
  },

  /**
   * Assign demo request to platform user
   * @param id - Demo request ID
   * @param data - Assignment data (assignedTo user ID)
   * @param headers - Optional headers for SSR
   */
  async assign(
    id: string,
    data: DemoRequestAssignmentInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests/${id}/assign`, {
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
      throw new Error(error.error || 'Failed to assign demo request')
    }
    
    return response.json()
  },

  /**
   * Convert demo request to SPPG (SUPERADMIN only)
   * @param id - Demo request ID
   * @param data - Conversion data (convertedSppgId)
   * @param headers - Optional headers for SSR
   */
  async convert(
    id: string,
    data: DemoRequestConversionInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/demo-requests/${id}/convert`, {
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
      throw new Error(error.error || 'Failed to convert demo request')
    }
    
    return response.json()
  },

  /**
   * Get demo request analytics
   * @param startDate - Optional start date for analytics period
   * @param endDate - Optional end date for analytics period
   * @param headers - Optional headers for SSR
   */
  async getAnalytics(
    startDate?: string,
    endDate?: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<DemoRequestAnalytics>> {
    const baseUrl = getBaseUrl()
    
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/admin/demo-requests/analytics?${queryString}`
      : `${baseUrl}/api/admin/demo-requests/analytics`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch analytics')
    }
    
    return response.json()
  },
}
