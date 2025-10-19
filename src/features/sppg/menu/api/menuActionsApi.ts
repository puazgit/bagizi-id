/**
 * @fileoverview Menu Actions API Client (Calculate Cost & Nutrition)
 * @version Next.js 15.5.4 / Enterprise-grade API layer
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Section 2a - Enterprise API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

/**
 * Menu Cost Calculation Response
 */
export interface MenuCostCalculation {
  menuId: string
  grandTotalCost: number
  costPerPortion: number
  ingredientsCost?: number
  updatedAt?: string
}

/**
 * Menu Nutrition Calculation Response
 */
export interface MenuNutritionCalculation {
  menuId: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
  totalSodium?: number
  totalSugar?: number
  updatedAt?: string
}

/**
 * Menu Actions API client for calculation operations
 * Provides methods for calculating menu costs and nutritional values
 * 
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await menuActionsApi.calculateCost('menu-id-123')
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await menuActionsApi.calculateCost('menu-id-123', headers())
 * ```
 */
export const menuActionsApi = {
  /**
   * Calculate menu cost based on current ingredients
   * 
   * Triggers server-side calculation of:
   * - Grand total cost (sum of all ingredients)
   * - Cost per portion (total / serving size)
   * 
   * @param menuId - Menu ID to calculate cost for
   * @param headers - Optional headers for SSR
   * @returns Promise with calculated cost data
   * @throws Error if calculation fails or menu not found
   * 
   * @example
   * ```typescript
   * const { data } = await menuActionsApi.calculateCost('menu-123')
   * console.log(`Total: Rp ${data.grandTotalCost}`)
   * console.log(`Per Porsi: Rp ${data.costPerPortion}`)
   * ```
   */
  async calculateCost(
    menuId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<MenuCostCalculation>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/menu/${menuId}/calculate-cost`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Gagal menghitung biaya menu')
    }

    return response.json()
  },

  /**
   * Calculate menu nutrition based on current ingredients
   * 
   * Triggers server-side calculation of:
   * - Total calories (kcal)
   * - Total protein (g)
   * - Total carbohydrates (g)
   * - Total fat (g)
   * - Total fiber (g)
   * - Optional: sodium, sugar
   * 
   * @param menuId - Menu ID to calculate nutrition for
   * @param headers - Optional headers for SSR
   * @returns Promise with calculated nutrition data
   * @throws Error if calculation fails or menu not found
   * 
   * @example
   * ```typescript
   * const { data } = await menuActionsApi.calculateNutrition('menu-123')
   * console.log(`Kalori: ${data.totalCalories} kkal`)
   * console.log(`Protein: ${data.totalProtein}g`)
   * ```
   */
  async calculateNutrition(
    menuId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<MenuNutritionCalculation>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/menu/${menuId}/calculate-nutrition`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Gagal menghitung nutrisi menu')
    }

    return response.json()
  },
}
