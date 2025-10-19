/**
 * @fileoverview Procurement statistics and analytics client-side API functions
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type {
  ProcurementStatistics,
  ApiResponse
} from '../types'

// ================================ API BASE CONFIGURATION ================================

const STATISTICS_BASE = '/api/sppg/procurement/statistics'

/**
 * Handle API responses with consistent error handling
 */
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }
  
  return data
}

// ================================ STATISTICS OPERATIONS ================================

export const statisticsApi = {
  /**
   * Get comprehensive procurement statistics
   * @param dateFrom Optional start date for filtering
   * @param dateTo Optional end date for filtering
   */
  async getStatistics(dateFrom?: Date, dateTo?: Date, headers?: HeadersInit): Promise<ApiResponse<ProcurementStatistics>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (dateFrom) {
      params.append('dateFrom', dateFrom.toISOString())
    }
    if (dateTo) {
      params.append('dateTo', dateTo.toISOString())
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}${queryString}`, getFetchOptions(headers))
    return handleApiResponse<ProcurementStatistics>(response)
  },

  /**
   * Get procurement overview statistics
   */
  async getOverview(headers?: HeadersInit): Promise<ApiResponse<{
    totalOrders: number
    totalAmount: number
    activeSuppliers: number
    pendingApprovals: number
    recentTrend: 'UP' | 'DOWN' | 'STABLE'
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/overview`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get status breakdown statistics
   */
  async getStatusBreakdown(headers?: HeadersInit): Promise<ApiResponse<{
    byStatus: Array<{
      status: string
      count: number
      percentage: number
      totalAmount: number
    }>
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/status`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get top suppliers by performance
   */
  async getTopSuppliers(limit: number = 10, headers?: HeadersInit): Promise<ApiResponse<{
    suppliers: Array<{
      id: string
      name: string
      totalOrders: number
      totalAmount: number
      onTimeRate: number
      qualityScore: number
    }>
  }>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams({ limit: String(limit) })
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/top-suppliers?${params.toString()}`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get procurement trends by month
   */
  async getMonthlyTrends(months: number = 12, headers?: HeadersInit): Promise<ApiResponse<{
    trends: Array<{
      month: string
      year: number
      totalOrders: number
      totalAmount: number
      averageOrderValue: number
      completionRate: number
    }>
  }>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams({ months: String(months) })
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/trends?${params.toString()}`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get category breakdown statistics
   */
  async getCategoryBreakdown(headers?: HeadersInit): Promise<ApiResponse<{
    categories: Array<{
      category: string
      count: number
      percentage: number
      totalAmount: number
      averagePrice: number
    }>
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/categories`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get delivery performance metrics
   */
  async getDeliveryMetrics(headers?: HeadersInit): Promise<ApiResponse<{
    onTimeDeliveries: number
    lateDeliveries: number
    averageDeliveryTime: number
    onTimeRate: number
    byStatus: Array<{
      status: string
      count: number
      percentage: number
    }>
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/delivery`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get payment status metrics
   */
  async getPaymentMetrics(headers?: HeadersInit): Promise<ApiResponse<{
    paid: number
    partial: number
    unpaid: number
    overdue: number
    totalOutstanding: number
    paymentRate: number
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/payment`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get budget utilization for procurement plans
   */
  async getBudgetUtilization(headers?: HeadersInit): Promise<ApiResponse<{
    totalBudget: number
    allocatedBudget: number
    usedBudget: number
    remainingBudget: number
    utilizationRate: number
    projectedOverrun: boolean
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${STATISTICS_BASE}/budget`, getFetchOptions(headers))
    return handleApiResponse(response)
  },
}

export default statisticsApi
