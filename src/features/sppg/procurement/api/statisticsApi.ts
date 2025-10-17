/**
 * @fileoverview Procurement statistics and analytics client-side API functions
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

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
  async getStatistics(dateFrom?: Date, dateTo?: Date): Promise<ApiResponse<ProcurementStatistics>> {
    const params = new URLSearchParams()
    
    if (dateFrom) {
      params.append('dateFrom', dateFrom.toISOString())
    }
    if (dateTo) {
      params.append('dateTo', dateTo.toISOString())
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`${STATISTICS_BASE}${queryString}`)
    return handleApiResponse<ProcurementStatistics>(response)
  },

  /**
   * Get procurement overview statistics
   */
  async getOverview(): Promise<ApiResponse<{
    totalOrders: number
    totalAmount: number
    activeSuppliers: number
    pendingApprovals: number
    recentTrend: 'UP' | 'DOWN' | 'STABLE'
  }>> {
    const response = await fetch(`${STATISTICS_BASE}/overview`)
    return handleApiResponse(response)
  },

  /**
   * Get status breakdown statistics
   */
  async getStatusBreakdown(): Promise<ApiResponse<{
    byStatus: Array<{
      status: string
      count: number
      percentage: number
      totalAmount: number
    }>
  }>> {
    const response = await fetch(`${STATISTICS_BASE}/status`)
    return handleApiResponse(response)
  },

  /**
   * Get top suppliers by performance
   */
  async getTopSuppliers(limit: number = 10): Promise<ApiResponse<{
    suppliers: Array<{
      id: string
      name: string
      totalOrders: number
      totalAmount: number
      onTimeRate: number
      qualityScore: number
    }>
  }>> {
    const params = new URLSearchParams({ limit: String(limit) })
    const response = await fetch(`${STATISTICS_BASE}/top-suppliers?${params.toString()}`)
    return handleApiResponse(response)
  },

  /**
   * Get procurement trends by month
   */
  async getMonthlyTrends(months: number = 12): Promise<ApiResponse<{
    trends: Array<{
      month: string
      year: number
      totalOrders: number
      totalAmount: number
      averageOrderValue: number
      completionRate: number
    }>
  }>> {
    const params = new URLSearchParams({ months: String(months) })
    const response = await fetch(`${STATISTICS_BASE}/trends?${params.toString()}`)
    return handleApiResponse(response)
  },

  /**
   * Get category breakdown statistics
   */
  async getCategoryBreakdown(): Promise<ApiResponse<{
    categories: Array<{
      category: string
      count: number
      percentage: number
      totalAmount: number
      averagePrice: number
    }>
  }>> {
    const response = await fetch(`${STATISTICS_BASE}/categories`)
    return handleApiResponse(response)
  },

  /**
   * Get delivery performance metrics
   */
  async getDeliveryMetrics(): Promise<ApiResponse<{
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
    const response = await fetch(`${STATISTICS_BASE}/delivery`)
    return handleApiResponse(response)
  },

  /**
   * Get payment status metrics
   */
  async getPaymentMetrics(): Promise<ApiResponse<{
    paid: number
    partial: number
    unpaid: number
    overdue: number
    totalOutstanding: number
    paymentRate: number
  }>> {
    const response = await fetch(`${STATISTICS_BASE}/payment`)
    return handleApiResponse(response)
  },

  /**
   * Get budget utilization for procurement plans
   */
  async getBudgetUtilization(): Promise<ApiResponse<{
    totalBudget: number
    allocatedBudget: number
    usedBudget: number
    remainingBudget: number
    utilizationRate: number
    projectedOverrun: boolean
  }>> {
    const response = await fetch(`${STATISTICS_BASE}/budget`)
    return handleApiResponse(response)
  },
}

export default statisticsApi
