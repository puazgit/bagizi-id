/**
 * @fileoverview Execution Photos API Client
 * 
 * API client for fetching execution photos with enterprise patterns
 * All photos come from DeliveryPhoto model linked to deliveries
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Section 2a - API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type { PhotoType } from '@prisma/client'

/**
 * Execution photo data structure
 */
export interface ExecutionPhotoData {
  id: string
  photoUrl: string
  photoType: PhotoType
  caption?: string | null
  locationTaken?: string | null
  fileSize?: number | null
  mimeType?: string | null
  takenAt: string // ISO date string
  deliveryId: string
  delivery: {
    id: string
    targetName: string // Delivery location name
    schedule: {
      menuName: string
    }
  }
}

/**
 * Photos response structure
 */
export interface ExecutionPhotosResponse {
  photos: ExecutionPhotoData[]
  total: number
}

/**
 * Photo filters
 */
export interface PhotoFilters {
  photoType?: PhotoType
}

/**
 * Execution Photos API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await executionPhotosApi.getPhotos('exec-123')
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await executionPhotosApi.getPhotos('exec-123', undefined, headers())
 * ```
 */
export const executionPhotosApi = {
  /**
   * Fetch all photos from deliveries in execution
   * @param executionId - Execution ID
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing photos
   */
  async getPhotos(
    executionId: string,
    filters?: PhotoFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<ExecutionPhotosResponse>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.photoType) {
      params.append('photoType', filters.photoType)
    }
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/distribution/execution/${executionId}/photos?${queryString}`
      : `${baseUrl}/api/sppg/distribution/execution/${executionId}/photos`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch execution photos')
    }
    
    return response.json()
  },
}
