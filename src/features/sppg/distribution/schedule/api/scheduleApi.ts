/**
 * @fileoverview API Client for Distribution Schedule
 * @version Next.js 15.5.4
 * @description Centralized API client for schedule operations with SSR support
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Section 2a - Enterprise API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  ScheduleWithRelations,
  CreateScheduleInput,
  UpdateScheduleInput,
  UpdateScheduleStatusInput,
  AssignVehicleInput,
  ScheduleFilters,
  ScheduleSortOptions,
  ScheduleListResponse,
  ScheduleDetailResponse,
  CreateScheduleResponse,
} from '../types'

/**
 * Distribution Schedule API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 *
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await scheduleApi.getAll()
 *
 * // Server-side usage (SSR/RSC)
 * const result = await scheduleApi.getAll(undefined, undefined, headers())
 * ```
 */
export const scheduleApi = {
  /**
   * Fetch all schedules with optional filtering and pagination
   * @param filters - Optional filter parameters
   * @param options - Optional pagination and sort options
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing schedule list
   */
  async getAll(
    filters?: ScheduleFilters,
    options?: {
      page?: number
      limit?: number
      sort?: ScheduleSortOptions
    },
    headers?: HeadersInit
  ): Promise<ScheduleListResponse> {
    const baseUrl = getBaseUrl()

    // Build query string
    const params = new URLSearchParams()
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach((s) => params.append('status', s))
      } else {
        params.append('status', filters.status)
      }
    }
    if (filters?.dateFrom)
      params.append('dateFrom', filters.dateFrom.toISOString())
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())
    if (filters?.wave) params.append('wave', filters.wave)
    if (filters?.deliveryMethod)
      params.append('deliveryMethod', filters.deliveryMethod)
    if (filters?.search) params.append('search', filters.search)

    // Pagination
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())

    // Sort
    if (options?.sort) {
      params.append('sortField', options.sort.field)
      params.append('sortDirection', options.sort.direction)
    }

    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/distribution/schedule?${queryString}`
      : `${baseUrl}/api/sppg/distribution/schedule`

    const response = await fetch(url, getFetchOptions(headers))

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch schedules')
    }

    return response.json()
  },

  /**
   * Get schedule by ID
   * @param id - Schedule ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing schedule detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ScheduleDetailResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule/${id}`,
      getFetchOptions(headers)
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch schedule')
    }

    return response.json()
  },

  /**
   * Create new schedule
   * @param data - Schedule creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created schedule
   */
  async create(
    data: CreateScheduleInput,
    headers?: HeadersInit
  ): Promise<CreateScheduleResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule`,
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
      throw new Error(error.error || 'Failed to create schedule')
    }

    return response.json()
  },

  /**
   * Update existing schedule
   * @param id - Schedule ID
   * @param data - Schedule update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated schedule
   */
  async update(
    id: string,
    data: UpdateScheduleInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ScheduleWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update schedule')
    }

    return response.json()
  },

  /**
   * Delete schedule
   * @param id - Schedule ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete schedule')
    }

    return response.json()
  },

  /**
   * Update schedule status
   * @param id - Schedule ID
   * @param data - Status update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated schedule
   */
  async updateStatus(
    id: string,
    data: UpdateScheduleStatusInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ScheduleWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule/${id}/status`,
      {
        ...getFetchOptions(headers),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update schedule status')
    }

    return response.json()
  },

  /**
   * Assign vehicle to schedule
   * @param id - Schedule ID
   * @param data - Vehicle assignment data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated schedule
   */
  async assignVehicle(
    id: string,
    data: AssignVehicleInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ScheduleWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule/${id}/assign-vehicle`,
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
      throw new Error(error.error || 'Failed to assign vehicle')
    }

    return response.json()
  },

  /**
   * Remove vehicle assignment from schedule
   * @param id - Schedule ID
   * @param vehicleAssignmentId - Vehicle assignment ID to remove
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated schedule
   */
  async removeVehicle(
    id: string,
    vehicleAssignmentId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ScheduleWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule/${id}/remove-vehicle/${vehicleAssignmentId}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove vehicle')
    }

    return response.json()
  },

  /**
   * Get schedule statistics
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing statistics
   */
  async getStatistics(headers?: HeadersInit): Promise<ApiResponse<{
    total: number
    byStatus: Record<string, number>
    byWave: Record<string, number>
    totalBeneficiaries: number
    totalPortions: number
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/distribution/schedule/statistics`,
      getFetchOptions(headers)
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch statistics')
    }

    return response.json()
  },
}
