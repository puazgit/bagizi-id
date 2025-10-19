/**
 * @fileoverview Menu Ingredient API Client
 * @version Next.js 15.5.4 / Fetch API
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { 
  CreateIngredientInput, 
  UpdateIngredientInput,
  IngredientResponse,
  IngredientsListResponse
} from '../types/ingredient.types'

export const ingredientApi = {
  /**
   * Get all ingredients for a menu
   */
  async getAll(menuId: string, headers?: HeadersInit): Promise<IngredientsListResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/ingredients`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch ingredients')
    }

    return response.json()
  },

  /**
   * Add new ingredient to menu
   */
  async create(menuId: string, data: CreateIngredientInput, headers?: HeadersInit): Promise<IngredientResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/ingredients`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add ingredient')
    }

    return response.json()
  },

  /**
   * Update existing ingredient
   */
  async update(menuId: string, ingredientId: string, data: UpdateIngredientInput, headers?: HeadersInit): Promise<IngredientResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/ingredients/${ingredientId}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update ingredient')
    }

    return response.json()
  },

  /**
   * Delete ingredient
   */
  async delete(menuId: string, ingredientId: string, headers?: HeadersInit): Promise<IngredientResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/ingredients/${ingredientId}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete ingredient')
    }

    return response.json()
  }
}
