/**
 * @fileoverview Allergen API Client - Centralized allergen API calls
 * @version Next.js 15.5.4 / Enterprise API Pattern
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Client Standards
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  AllergenResponse,
  AllergenQueryResult,
  AllergenFilter,
} from '@/features/sppg/menu/types/allergen.types'
import type { AllergenCreateInput } from '@/features/sppg/menu/schemas/allergenSchema'

/**
 * Allergen API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const allergensApi = {
  /**
   * Fetch all allergens (platform + SPPG custom)
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with allergen query result
   * 
   * @example
   * ```typescript
   * // Client-side
   * const result = await allergensApi.getAll({ category: 'NUTS' })
   * 
   * // Server-side (SSR)
   * const result = await allergensApi.getAll({ category: 'NUTS' }, headers)
   * ```
   */
  async getAll(
    filters?: AllergenFilter,
    headers?: HeadersInit
  ): Promise<ApiResponse<AllergenQueryResult>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (filters?.category) params.append('category', filters.category)
    if (filters?.isCommon !== undefined) params.append('isCommon', String(filters.isCommon))
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/allergens?${queryString}`
      : `${baseUrl}/api/sppg/allergens`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch allergens')
    }
    
    return response.json()
  },

  /**
   * Create custom allergen for SPPG
   * @param data - Allergen creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with created allergen
   * 
   * @example
   * ```typescript
   * const result = await allergensApi.create({
   *   name: 'Kacang Mete',
   *   category: 'NUTS',
   *   description: 'Kacang mete mentah atau olahan'
   * })
   * ```
   */
  async create(
    data: AllergenCreateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<AllergenResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/allergens`, {
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
      throw new Error(error.error || 'Failed to create allergen')
    }
    
    return response.json()
  },

  /**
   * Update existing allergen
   * @param id - Allergen ID
   * @param data - Partial allergen update data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated allergen
   * 
   * @example
   * ```typescript
   * const result = await allergensApi.update('allergen-id', {
   *   isActive: false,
   *   description: 'Updated description'
   * })
   * ```
   */
  async update(
    id: string,
    data: Partial<AllergenCreateInput>,
    headers?: HeadersInit
  ): Promise<ApiResponse<AllergenResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/allergens/${id}`, {
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
      throw new Error(error.error || 'Failed to update allergen')
    }
    
    return response.json()
  },

  /**
   * Delete allergen (soft delete)
   * @param id - Allergen ID
   * @param headers - Optional headers for SSR
   * @returns Promise with success status
   * 
   * @example
   * ```typescript
   * const result = await allergensApi.delete('allergen-id')
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/allergens/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete allergen')
    }
    
    return response.json()
  },
}
