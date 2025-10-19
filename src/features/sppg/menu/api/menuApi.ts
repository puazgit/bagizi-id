/**
 * @fileoverview Menu domain client-side API functions
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type {
  Menu,
  MenuWithDetails,
  MenuIngredient,
  MenuInput,
  MenuUpdateInput,
  MenuIngredientInput,
  MenuFilters,
  ApiResponse,
  MenuListResponse,
  MenuCreateResponse
} from '../types'

// ================================ API BASE CONFIGURATION ================================

const API_BASE = '/api/sppg/menu'

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

/**
 * Build query string from filters
 */
function buildQueryString(filters?: Partial<MenuFilters>): string {
  if (!filters) return ''
  
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  
  return params.toString() ? `?${params.toString()}` : ''
}

// ================================ MENU CRUD OPERATIONS ================================

const menuOperations = {
  /**
   * Fetch menus with optional filtering and pagination
   */
  async getMenus(filters?: Partial<MenuFilters>, headers?: HeadersInit): Promise<ApiResponse<MenuListResponse>> {
    const baseUrl = getBaseUrl()
    const queryString = buildQueryString(filters)
    const response = await fetch(`${baseUrl}${API_BASE}${queryString}`, getFetchOptions(headers))
    return handleApiResponse<MenuListResponse>(response)
  },

  /**
   * Get detailed menu by ID
   */
  async getMenuById(id: string, headers?: HeadersInit): Promise<ApiResponse<MenuWithDetails>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, getFetchOptions(headers))
    return handleApiResponse<MenuWithDetails>(response)
  },

  /**
   * Create new menu
   */
  async createMenu(data: MenuInput, headers?: HeadersInit): Promise<ApiResponse<MenuCreateResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleApiResponse<MenuCreateResponse>(response)
  },

  /**
   * Update existing menu
   */
  async updateMenu(id: string, data: Partial<MenuUpdateInput>, headers?: HeadersInit): Promise<ApiResponse<Menu>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return handleApiResponse<Menu>(response)
  },

  /**
   * Delete menu
   */
  async deleteMenu(id: string, headers?: HeadersInit): Promise<ApiResponse<{ message: string }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    return handleApiResponse<{ message: string }>(response)
  }
}

// ================================ MENU INGREDIENT OPERATIONS ================================

const ingredientOperations = {
  /**
   * Get ingredients for a specific menu
   */
  async getIngredients(menuId: string, headers?: HeadersInit): Promise<ApiResponse<{
    ingredients: MenuIngredient[]
    summary: {
      totalIngredients: number
      totalCost: number
      hasStockIssues: boolean
      stockWarnings: Array<{
        ingredientId: string
        ingredientName: string
        required: number
        available: number
        shortage: number
      }>
    }
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${menuId}/ingredients`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Add ingredient to menu
   */
  async addIngredient(menuId: string, data: Omit<MenuIngredientInput, 'menuId'>, headers?: HeadersInit): Promise<ApiResponse<{
    ingredient: MenuIngredient
    message: string
    calculationTriggered: boolean
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${menuId}/ingredients`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleApiResponse(response)
  },

  /**
   * Update ingredient
   */
  async updateIngredient(ingredientId: string, data: Partial<MenuIngredientInput>, headers?: HeadersInit): Promise<ApiResponse<MenuIngredient>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/ingredients/${ingredientId}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return handleApiResponse<MenuIngredient>(response)
  },

  /**
   * Remove ingredient from menu
   */
  async removeIngredient(ingredientId: string, headers?: HeadersInit): Promise<ApiResponse<{ message: string }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/ingredients/${ingredientId}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    return handleApiResponse<{ message: string }>(response)
  }
}

// ================================ CALCULATION OPERATIONS ================================

interface NutritionCalculation {
  id: string
  menuId: string
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  calcium: number
  iron: number
  vitaminA: number
  vitaminC: number
  sodium: number
  sugar: number
  saturatedFat: number
  isUpToDate: boolean
  calculatedAt: Date
  calculatedBy: string
}

interface CostCalculation {
  id: string
  menuId: string
  ingredientCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  costPerServing: number
  plannedPortions: number
  laborHours: number
  laborCostPerHour: number
  overheadPercentage: number
  isUpToDate: boolean
  calculatedAt: Date
  calculatedBy: string
}

const calculationOperations = {
  /**
   * Trigger nutrition calculation for menu
   */
  async calculateNutrition(menuId: string, forceRecalculate = false, headers?: HeadersInit): Promise<ApiResponse<{
    nutritionCalculation: NutritionCalculation
    message: string
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${menuId}/calculate-nutrition`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify({ forceRecalculate }),
    })
    return handleApiResponse(response)
  },

  /**
   * Trigger cost calculation for menu
   */
  async calculateCost(menuId: string, options?: {
    laborCostPerHour?: number
    overheadPercentage?: number
    plannedPortions?: number
    forceRecalculate?: boolean
  }, headers?: HeadersInit): Promise<ApiResponse<{
    costCalculation: CostCalculation
    message: string
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${menuId}/calculate-cost`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(options || {}),
    })
    return handleApiResponse(response)
  },

  /**
   * Get nutrition calculation for menu
   */
  async getNutritionCalculation(menuId: string, headers?: HeadersInit): Promise<ApiResponse<NutritionCalculation>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${menuId}/nutrition-calculation`, getFetchOptions(headers))
    return handleApiResponse(response)
  },

  /**
   * Get cost calculation for menu
   */
  async getCostCalculation(menuId: string, headers?: HeadersInit): Promise<ApiResponse<CostCalculation>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${API_BASE}/${menuId}/cost-calculation`, getFetchOptions(headers))
    return handleApiResponse(response)
  }
}

// ================================ EXPORT API OPERATIONS ================================

export const menuApi = menuOperations
export const menuIngredientApi = ingredientOperations
export const menuCalculationApi = calculationOperations

// Default export
const menuDomainApi = {
  menu: menuOperations,
  ingredient: ingredientOperations,
  calculation: calculationOperations
}

export default menuDomainApi