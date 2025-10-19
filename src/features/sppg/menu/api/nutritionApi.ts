/**
 * @fileoverview Nutrition API client for Menu domain
 * @version Next.js 15.5.4 / Fetch-based API
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { 
  CalculateNutritionInput,
  NutritionCalculationResponse 
} from '../types/nutrition.types'

export const nutritionApi = {
  /**
   * Get nutrition report for a menu
   */
  async getReport(menuId: string, headers?: HeadersInit): Promise<NutritionCalculationResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/nutrition-report`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch nutrition report' }))
      throw new Error(error.error || 'Failed to fetch nutrition report')
    }

    return response.json()
  },

  /**
   * Calculate/recalculate nutrition for a menu
   */
  async calculate(menuId: string, data: CalculateNutritionInput = {}, headers?: HeadersInit): Promise<NutritionCalculationResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/calculate-nutrition`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to calculate nutrition' }))
      throw new Error(error.error || 'Failed to calculate nutrition')
    }

    return response.json()
  }
}
