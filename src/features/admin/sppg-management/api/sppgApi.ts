/**
 * @fileoverview SPPG Management API Client
 * @version Next.js 15.5.4 / Enterprise API Pattern
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Section 2a - Enterprise API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  SppgDetail,
  SppgListItem,
  SppgFilters,
  SppgStatistics,
  CreateSppgInput,
  UpdateSppgInput
} from '../types'

/**
 * SPPG API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await sppgApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await sppgApi.getAll(undefined, headers())
 * ```
 */
export const sppgApi = {
  /**
   * Fetch all SPPG with optional filtering
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing SPPG array and pagination
   */
  async getAll(
    filters?: SppgFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<SppgListItem[]>> {
    try {
      const baseUrl = getBaseUrl()
      
      // Build query string if filters provided
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.organizationType) params.append('organizationType', filters.organizationType)
      if (filters?.provinceId) params.append('provinceId', filters.provinceId)
      if (filters?.regencyId) params.append('regencyId', filters.regencyId)
      if (filters?.isDemoAccount !== undefined) params.append('isDemoAccount', String(filters.isDemoAccount))
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      
      const queryString = params.toString()
      const url = queryString 
        ? `${baseUrl}/api/admin/sppg?${queryString}`
        : `${baseUrl}/api/admin/sppg`
      
      console.log('🔍 sppgApi.getAll:', { url, hasFilters: !!filters })
      
      const response = await fetch(url, getFetchOptions(headers))
      
      console.log('📡 Response:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      })
      
      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const error = await response.json()
          console.log('📋 Error response:', error)
          throw new Error(error.error || error.details || 'Failed to fetch SPPG list')
        } else {
          // HTML response means auth redirect
          const text = await response.text()
          console.log('📋 HTML response (first 200 chars):', text.substring(0, 200))
          throw new Error('Authentication required. Please login again.')
        }
      }
      
      const data = await response.json()
      console.log('✅ Data received:', {
        success: data.success,
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : null
      })
      
      return data
    } catch (error) {
      console.error('❌ sppgApi.getAll error:', error)
      throw error
    }
  },

  /**
   * Fetch single SPPG by ID with full details
   * @param id - SPPG ID
   * @param headers - Optional headers for SSR
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<SppgDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/sppg/${id}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch SPPG detail')
    }
    
    return response.json()
  },

  /**
   * Create new SPPG
   * @param data - SPPG creation data
   * @param headers - Optional headers for SSR
   */
  async create(
    data: CreateSppgInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<SppgDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/sppg`, {
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
      throw new Error(error.error || 'Failed to create SPPG')
    }
    
    return response.json()
  },

  /**
   * Update existing SPPG
   * @param id - SPPG ID
   * @param data - Partial SPPG update data
   * @param headers - Optional headers for SSR
   */
  async update(
    id: string,
    data: Partial<UpdateSppgInput>,
    headers?: HeadersInit
  ): Promise<ApiResponse<SppgDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/sppg/${id}`, {
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
      throw new Error(error.error || 'Failed to update SPPG')
    }
    
    return response.json()
  },

  /**
   * Delete SPPG (soft delete - set status to INACTIVE)
   * @param id - SPPG ID
   * @param headers - Optional headers for SSR
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/sppg/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete SPPG')
    }
    
    return response.json()
  },

  /**
   * Activate SPPG (set status to ACTIVE)
   * @param id - SPPG ID
   * @param headers - Optional headers for SSR
   */
  async activate(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<SppgDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/sppg/${id}/activate`, {
      ...getFetchOptions(headers),
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to activate SPPG')
    }
    
    return response.json()
  },

  /**
   * Suspend SPPG (set status to SUSPENDED)
   * @param id - SPPG ID
   * @param reason - Suspension reason
   * @param headers - Optional headers for SSR
   */
  async suspend(
    id: string,
    reason: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<SppgDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/sppg/${id}/suspend`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ reason }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to suspend SPPG')
    }
    
    return response.json()
  },

  /**
   * Get SPPG statistics for admin dashboard
   * @param headers - Optional headers for SSR
   */
  async getStatistics(
    headers?: HeadersInit
  ): Promise<ApiResponse<SppgStatistics>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/sppg/statistics`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch SPPG statistics')
    }
    
    return response.json()
  },
}
