/**
 * @fileoverview Villages API client for location selection
 * @version Next.js 15.5.4 / Enterprise-grade API layer
 * @author Bagizi-ID Development Team
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'

export interface Village {
  id: string
  districtId: string
  code: string
  name: string
  type: string
  postalCode?: string | null
  district?: {
    id: string
    name: string
    regency?: {
      id: string
      name: string
      province?: {
        id: string
        name: string
      }
    }
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Villages API client
 */
export const villagesApi = {
  /**
   * Get all villages with hierarchical location data
   */
  async getAll(headers?: HeadersInit): Promise<ApiResponse<Village[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/villages`, getFetchOptions(headers))
    
    if (!response.ok) {
      throw new Error('Failed to fetch villages')
    }

    return response.json()
  },

  /**
   * Get village by ID with location hierarchy
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<Village>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/villages/${id}`, getFetchOptions(headers))
    
    if (!response.ok) {
      throw new Error('Failed to fetch village')
    }

    return response.json()
  },
}
