/**
 * @fileoverview Menu Ingredient API Client
 * @version Next.js 15.5.4 / Fetch API
 */

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
  async getAll(menuId: string): Promise<IngredientsListResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/ingredients`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch ingredients')
    }

    return response.json()
  },

  /**
   * Add new ingredient to menu
   */
  async create(menuId: string, data: CreateIngredientInput): Promise<IngredientResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async update(menuId: string, ingredientId: string, data: UpdateIngredientInput): Promise<IngredientResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/ingredients/${ingredientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async delete(menuId: string, ingredientId: string): Promise<IngredientResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/ingredients/${ingredientId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete ingredient')
    }

    return response.json()
  }
}
