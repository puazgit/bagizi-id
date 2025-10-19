/**
 * @fileoverview Recipe Step API Client
 * @version Next.js 15.5.4 / Fetch API
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
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
  async getAll(menuId: string, headers?: HeadersInit): Promise<RecipeStepsListResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/recipe`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch recipe steps')
    }

    return response.json()
  },

  /**
   * Add new recipe step to menu
   */
  async create(menuId: string, data: CreateRecipeStepInput, headers?: HeadersInit): Promise<RecipeStepResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/recipe`, {
      ...getFetchOptions(headers),
      method: 'POST',
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
  async update(menuId: string, stepId: string, data: UpdateRecipeStepInput, headers?: HeadersInit): Promise<RecipeStepResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/recipe/${stepId}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
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
  async delete(menuId: string, stepId: string, headers?: HeadersInit): Promise<RecipeStepResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/${menuId}/recipe/${stepId}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete recipe step')
    }

    return response.json()
  }
}
