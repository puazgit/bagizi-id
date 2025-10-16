/**
 * @fileoverview Cost API client for Menu domain
 * @version Next.js 15.5.4 / Fetch-based API
 */

import type { 
  CalculateCostInput,
  CostCalculationResponse 
} from '../types/cost.types'

export const costApi = {
  /**
   * Get cost report for a menu
   */
  async getReport(menuId: string): Promise<CostCalculationResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/cost-report`)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch cost report' }))
      throw new Error(error.error || 'Failed to fetch cost report')
    }

    return response.json()
  },

  /**
   * Calculate/recalculate cost for a menu
   */
  async calculate(menuId: string, data: CalculateCostInput = {}): Promise<CostCalculationResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/calculate-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to calculate cost' }))
      throw new Error(error.error || 'Failed to calculate cost')
    }

    return response.json()
  }
}
