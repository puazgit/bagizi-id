/**
 * @fileoverview Dashboard API Client
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API client patterns
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { DashboardStats, ActivityItem, NotificationItem } from '../types'

/**
 * API Response format
 */
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Dashboard API Client
 * Handles all dashboard-related API requests
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @param headers - Optional headers for SSR
   */
  async getStats(headers?: HeadersInit): Promise<ApiResponse<DashboardStats>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/dashboard/stats`, {
      ...getFetchOptions(headers),
      cache: 'no-store', // Always fetch fresh data
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch dashboard stats')
    }
    
    return response.json()
  },

  /**
   * Get recent activities
   * @param limit - Number of activities to fetch
   * @param headers - Optional headers for SSR
   */
  async getActivities(limit: number = 10, headers?: HeadersInit): Promise<ApiResponse<ActivityItem[]>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams({ limit: String(limit) })
    const response = await fetch(`${baseUrl}/api/sppg/dashboard/activities?${params.toString()}`, {
      ...getFetchOptions(headers),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch activities')
    }
    
    return response.json()
  },

  /**
   * Get notifications
   * @param unreadOnly - Filter for unread notifications only
   * @param headers - Optional headers for SSR
   */
  async getNotifications(unreadOnly: boolean = false, headers?: HeadersInit): Promise<ApiResponse<NotificationItem[]>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    if (unreadOnly) params.append('unreadOnly', 'true')
    
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`${baseUrl}/api/sppg/dashboard/notifications${queryString}`, {
      ...getFetchOptions(headers),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch notifications')
    }
    
    return response.json()
  },

  /**
   * Mark notification as read
   * @param notificationId - Notification ID to mark as read
   * @param headers - Optional headers for SSR
   */
  async markNotificationRead(notificationId: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/dashboard/notifications/${notificationId}/read`, {
      ...getFetchOptions(headers),
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to mark notification as read')
    }
    
    return response.json()
  },

  /**
   * Clear all notifications
   * @param headers - Optional headers for SSR
   */
  async clearNotifications(headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/dashboard/notifications/clear`, {
      ...getFetchOptions(headers),
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to clear notifications')
    }
    
    return response.json()
  },

  /**
   * Get complete dashboard data (stats + activities + notifications)
   * @param headers - Optional headers for SSR
   */
  async getDashboard(headers?: HeadersInit): Promise<ApiResponse<{
    stats: DashboardStats
    activities: ActivityItem[]
    notifications: NotificationItem[]
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/dashboard`, {
      ...getFetchOptions(headers),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch dashboard data')
    }
    
    return response.json()
  },
}
