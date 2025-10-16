/**
 * @fileoverview Recipe Step API Client
 * @version Next.js 15.5.4 / Fetch API
 */

import type { 
  CreateRecipeStepInput, 
  UpdateRecipeStepInput,
  RecipeStepResponse,
  RecipeStepsListResponse
} from '../types/recipe.types'

export const recipeStepApi = {
  /**
   * Get all recipe steps for a menu
   */
  async getAll(menuId: string): Promise<RecipeStepsListResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/recipe`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch recipe steps')
    }

    return response.json()
  },

  /**
   * Add new recipe step to menu
   */
  async create(menuId: string, data: CreateRecipeStepInput): Promise<RecipeStepResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add recipe step')
    }

    return response.json()
  },

  /**
   * Update existing recipe step
   */
  async update(menuId: string, stepId: string, data: UpdateRecipeStepInput): Promise<RecipeStepResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/recipe/${stepId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update recipe step')
    }

    return response.json()
  },

  /**
   * Delete recipe step
   */
  async delete(menuId: string, stepId: string): Promise<RecipeStepResponse> {
    const response = await fetch(`/api/sppg/menu/${menuId}/recipe/${stepId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete recipe step')
    }

    return response.json()
  }
}
