/**
 * @fileoverview Regional Data API Client (Provinces, Regencies, Districts, Villages)
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

/**
 * Province type
 */
export interface Province {
  id: string
  code: string
  name: string
  region: string
  timezone: string
}

/**
 * Regency type
 */
export interface Regency {
  id: string
  provinceId: string
  code: string
  name: string
  type: string
  province?: {
    name: string
  }
}

/**
 * District type
 */
export interface District {
  id: string
  regencyId: string
  code: string
  name: string
  regency?: {
    name: string
  }
}

/**
 * Village type (already exists in useVillages, but included for completeness)
 */
export interface Village {
  id: string
  districtId: string
  code: string
  name: string
  type: string
  postalCode?: string | null
  district?: {
    name: string
    regency?: {
      name: string
    }
  }
}

/**
 * Regional API client with cascading data fetching
 */
export const regionalApi = {
  /**
   * Fetch all provinces
   * @param headers - Optional headers for SSR
   */
  async getProvinces(
    headers?: HeadersInit
  ): Promise<ApiResponse<Province[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/regional/provinces`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch provinces')
    }
    
    return response.json()
  },

  /**
   * Fetch regencies by province
   * @param provinceId - Province ID to filter by
   * @param headers - Optional headers for SSR
   */
  async getRegencies(
    provinceId?: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Regency[]>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    if (provinceId) params.append('provinceId', provinceId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/regional/regencies?${queryString}`
      : `${baseUrl}/api/sppg/regional/regencies`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch regencies')
    }
    
    return response.json()
  },

  /**
   * Fetch districts by regency
   * @param regencyId - Regency ID to filter by
   * @param headers - Optional headers for SSR
   */
  async getDistricts(
    regencyId?: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<District[]>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    if (regencyId) params.append('regencyId', regencyId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/regional/districts?${queryString}`
      : `${baseUrl}/api/sppg/regional/districts`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch districts')
    }
    
    return response.json()
  },

  /**
   * Fetch villages by district
   * @param districtId - District ID to filter by
   * @param headers - Optional headers for SSR
   */
  async getVillages(
    districtId?: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Village[]>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    if (districtId) params.append('districtId', districtId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/regional/villages?${queryString}`
      : `${baseUrl}/api/sppg/regional/villages`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch villages')
    }
    
    return response.json()
  },
}
