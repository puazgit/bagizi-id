/**
 * @fileoverview Admin Dashboard API Client
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type { DashboardStats } from '../types'

/**
 * Admin Dashboard API client
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @param headers - Optional headers for SSR
   * @returns Dashboard statistics
   */
  async getStats(headers?: HeadersInit): Promise<ApiResponse<DashboardStats>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/dashboard/stats`,
      getFetchOptions(headers)
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch dashboard statistics')
    }

    return response.json()
  }
}
