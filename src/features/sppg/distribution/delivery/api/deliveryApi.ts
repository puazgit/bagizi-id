/**
 * @fileoverview Delivery API client with enterprise patterns
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_PHASE3_DELIVERY_PLAN.md} PHASE 3 Implementation Plan
 * 
 * CRITICAL: All methods support SSR via optional headers parameter
 * 
 * @example Client-side usage
 * ```typescript
 * const result = await deliveryApi.getByExecution('exec-123')
 * ```
 * 
 * @example Server-side usage (SSR/RSC)
 * ```typescript
 * import { headers } from 'next/headers'
 * 
 * const headersList = await headers()
 * const cookieHeader = headersList.get('cookie')
 * const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : {}
 * 
 * const result = await deliveryApi.getByExecution('exec-123', requestHeaders)
 * ```
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  DeliveryListItem,
  DeliveryDetail,
  DeliveryFilters,
  DeliveryStatistics,
  UpdateDeliveryStatusInput,
  StartDeliveryInput,
  ArriveDeliveryInput,
  CompleteDeliveryInput,
  UploadPhotoInput,
  ReportIssueInput,
  TrackLocationInput,
} from '../types'
import type { DistributionDelivery, DeliveryTracking } from '@prisma/client'

// ============================================================================
// Response Types
// ============================================================================

/**
 * Delivery list response with pagination and statistics
 */
export interface DeliveryListResponse {
  success: boolean
  data: DeliveryListItem[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  statistics?: DeliveryStatistics
}

/**
 * Single delivery detail response
 */
export interface DeliveryDetailResponse {
  success: boolean
  data: DeliveryDetail
}

/**
 * Tracking history response
 */
export interface TrackingHistoryResponse {
  success: boolean
  data: DeliveryTracking[]
  statistics: {
    totalPoints: number
    totalDistance: number
    latestPoint: {
      latitude: number
      longitude: number
      recordedAt: Date
      status: string
    } | null
  }
}

// ============================================================================
// Delivery API Client
// ============================================================================

/**
 * Delivery API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const deliveryApi = {
  /**
   * Get ALL deliveries for current SPPG (across all schedules)
   * 
   * @param filters - Optional filters for the list
   * @param options - Optional pagination and sort options
   * @param headers - Optional headers for SSR
   * @returns Promise with delivery list response
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.getAll({
   *   status: ['DEPARTED', 'ASSIGNED'],
   *   dateFrom: new Date('2025-10-01')
   * }, {
   *   page: 1,
   *   limit: 20
   * })
   * ```
   */
  async getAll(
    filters?: {
      status?: string | string[]
      driverName?: string
      dateFrom?: Date
      dateTo?: Date
      search?: string
    },
    options?: {
      page?: number
      limit?: number
      sortField?: string
      sortDirection?: 'asc' | 'desc'
    },
    headers?: HeadersInit
  ): Promise<DeliveryListResponse> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => params.append('status', s))
      } else {
        params.append('status', filters.status)
      }
    }
    if (filters?.driverName) {
      params.append('driverName', filters.driverName)
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom.toISOString())
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo.toISOString())
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    // Pagination
    if (options?.page) {
      params.append('page', options.page.toString())
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString())
    }
    if (options?.sortField) {
      params.append('sortField', options.sortField)
    }
    if (options?.sortDirection) {
      params.append('sortDirection', options.sortDirection)
    }
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/distribution/delivery?${queryString}`
      : `${baseUrl}/api/sppg/distribution/delivery`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch all deliveries')
    }
    
    return response.json()
  },

  /**
   * Get deliveries by execution ID
   * 
   * @param executionId - FoodDistribution execution ID
   * @param filters - Optional filters for the list
   * @param headers - Optional headers for SSR
   * @returns Promise with delivery list response
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.getByExecution('exec-123', {
   *   status: 'IN_TRANSIT',
   *   hasIssues: false
   * })
   * ```
   */
  async getByExecution(
    executionId: string,
    filters?: Partial<DeliveryFilters>,
    headers?: HeadersInit
  ): Promise<DeliveryListResponse> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => params.append('status', s))
      } else {
        params.append('status', filters.status)
      }
    }
    if (filters?.hasIssues !== undefined) {
      params.append('hasIssues', String(filters.hasIssues))
    }
    if (filters?.qualityChecked !== undefined) {
      params.append('qualityChecked', String(filters.qualityChecked))
    }
    if (filters?.driverName) {
      params.append('driverName', filters.driverName)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/distribution/delivery/execution/${executionId}?${queryString}`
      : `${baseUrl}/api/sppg/distribution/delivery/execution/${executionId}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch deliveries')
    }
    
    return response.json()
  },

  /**
   * Get single delivery detail by ID
   * 
   * @param id - Delivery ID
   * @param headers - Optional headers for SSR
   * @returns Promise with delivery detail response
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.getById('delivery-123')
   * const delivery = result.data
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<DeliveryDetailResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch delivery')
    }
    
    return response.json()
  },

  /**
   * Update delivery status
   * 
   * @param id - Delivery ID
   * @param data - Status update data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated delivery
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.updateStatus('delivery-123', {
   *   status: 'IN_TRANSIT',
   *   currentLocation: '-6.200000,106.816666',
   *   notes: 'Dalam perjalanan'
   * })
   * ```
   */
  async updateStatus(
    id: string,
    data: UpdateDeliveryStatusInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DistributionDelivery>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/status`,
      {
        ...getFetchOptions(headers),
        method: 'PUT',
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update delivery status')
    }
    
    return response.json()
  },

  /**
   * Start delivery (departure)
   * 
   * @param id - Delivery ID
   * @param data - Departure data with GPS location
   * @param headers - Optional headers for SSR
   * @returns Promise with updated delivery
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.start('delivery-123', {
   *   departureTime: new Date(),
   *   departureLocation: '-6.200000,106.816666',
   *   driverName: 'John Doe',
   *   vehicleInfo: 'Toyota Avanza B1234XYZ'
   * })
   * ```
   */
  async start(
    id: string,
    data: StartDeliveryInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DistributionDelivery>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/start`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start delivery')
    }
    
    return response.json()
  },

  /**
   * Mark arrival at destination
   * 
   * @param id - Delivery ID
   * @param data - Arrival data with GPS location
   * @param headers - Optional headers for SSR
   * @returns Promise with updated delivery
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.arrive('delivery-123', {
   *   arrivalTime: new Date(),
   *   arrivalLocation: '-6.917464,107.619123',
   *   notes: 'Tiba di lokasi'
   * })
   * ```
   */
  async arrive(
    id: string,
    data: ArriveDeliveryInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DistributionDelivery>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/arrive`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to mark arrival')
    }
    
    return response.json()
  },

  /**
   * Complete delivery with signature and quality check
   * 
   * @param id - Delivery ID
   * @param data - Completion data with signature and quality info
   * @param headers - Optional headers for SSR
   * @returns Promise with completed delivery
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.complete('delivery-123', {
   *   deliveryCompletedAt: new Date(),
   *   portionsDelivered: 150,
   *   recipientName: 'Kepala Sekolah',
   *   recipientTitle: 'Kepala Sekolah SDN 01',
   *   recipientSignature: 'https://example.com/signature.png',
   *   foodQualityChecked: true,
   *   foodQualityNotes: 'Makanan dalam kondisi baik',
   *   foodTemperature: 75
   * })
   * ```
   */
  async complete(
    id: string,
    data: CompleteDeliveryInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<DistributionDelivery>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/complete`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to complete delivery')
    }
    
    return response.json()
  },

  /**
   * Mark delivery as failed
   * 
   * @param id - Delivery ID
   * @param reason - Failure reason
   * @param headers - Optional headers for SSR
   * @returns Promise with updated delivery
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.fail('delivery-123', 'Jalan terblokir')
   * ```
   */
  async fail(
    id: string,
    reason: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<DistributionDelivery>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/fail`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to mark delivery as failed')
    }
    
    return response.json()
  },

  /**
   * Upload delivery photo
   * 
   * @param id - Delivery ID
   * @param data - Photo data with GPS tagging
   * @param headers - Optional headers for SSR
   * @returns Promise with success response
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.uploadPhoto('delivery-123', {
   *   photoUrl: 'https://example.com/photo.jpg',
   *   photoType: 'DELIVERY_PROOF',
   *   caption: 'Foto pengiriman di SDN 01',
   *   locationTaken: '-6.200000,106.816666',
   *   fileSize: 1024000,
   *   mimeType: 'image/jpeg'
   * })
   * ```
   */
  async uploadPhoto(
    id: string,
    data: UploadPhotoInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/photo`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload photo')
    }
    
    return response.json()
  },

  /**
   * Report delivery issue
   * 
   * @param id - Delivery ID
   * @param data - Issue data
   * @param headers - Optional headers for SSR
   * @returns Promise with success response
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.reportIssue('delivery-123', {
   *   issueType: 'VEHICLE_BREAKDOWN',
   *   severity: 'HIGH',
   *   description: 'Ban kendaraan bocor di jalan',
   *   notes: 'Butuh bantuan segera'
   * })
   * ```
   */
  async reportIssue(
    id: string,
    data: ReportIssueInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/issue`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
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
   * Track GPS location during delivery
   * 
   * @param id - Delivery ID
   * @param data - GPS tracking data
   * @param headers - Optional headers for SSR
   * @returns Promise with success response
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.trackLocation('delivery-123', {
   *   latitude: -6.200000,
   *   longitude: 106.816666,
   *   accuracy: 10.5,
   *   status: 'IN_TRANSIT',
   *   notes: 'Melewati jalan tol'
   * })
   * ```
   */
  async trackLocation(
    id: string,
    data: TrackLocationInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/tracking`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to track location')
    }
    
    return response.json()
  },

  /**
   * Get GPS tracking history for delivery
   * 
   * @param id - Delivery ID
   * @param headers - Optional headers for SSR
   * @returns Promise with tracking history
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.getTrackingHistory('delivery-123')
   * const trackingPoints = result.data
   * ```
   */
  async getTrackingHistory(
    id: string,
    headers?: HeadersInit
  ): Promise<TrackingHistoryResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/tracking`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch tracking history')
    }
    
    return response.json()
  },

  /**
   * Add signature to delivery
   * 
   * @param id - Delivery ID
   * @param data - Signature data (base64 image, recipient info)
   * @param headers - Optional headers for SSR
   * @returns Promise with updated delivery
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.addSignature('delivery-123', {
   *   signatureDataUrl: 'data:image/png;base64,...',
   *   recipientName: 'John Doe',
   *   recipientTitle: 'Principal'
   * })
   * ```
   */
  async addSignature(
    id: string,
    data: {
      signatureDataUrl: string
      recipientName: string
      recipientTitle?: string
    },
    headers?: HeadersInit
  ): Promise<ApiResponse<DistributionDelivery>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/signature`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add signature')
    }
    
    return response.json()
  },

  /**
   * Remove signature from delivery
   * 
   * @param id - Delivery ID
   * @param headers - Optional headers for SSR
   * @returns Promise with updated delivery
   * 
   * @example
   * ```typescript
   * const result = await deliveryApi.removeSignature('delivery-123')
   * ```
   */
  async removeSignature(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<DistributionDelivery>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/delivery/${id}/signature`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove signature')
    }
    
    return response.json()
  },
}
