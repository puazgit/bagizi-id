/**
 * @fileoverview Recipe Step Types
 * @version Next.js 15.5.4 / Enterprise-grade
 */

export interface RecipeStep {
  id: string
  menuId: string
  stepNumber: number
  instruction: string
  duration: number | null
  temperature: number | null
  temperatureUnit: string | null
  equipment: string[]
  qualityCheckNotes: string | null
  mediaUrl: string | null
}

export interface CreateRecipeStepInput {
  stepNumber: number
  instruction: string
  duration?: number
  temperature?: number
  temperatureUnit?: string
  equipment?: string[]
  qualityCheckNotes?: string
  mediaUrl?: string
}

export type UpdateRecipeStepInput = Partial<CreateRecipeStepInput>

export interface RecipeStepResponse {
  success: boolean
  data?: RecipeStep
  error?: string
  details?: unknown
}

export interface RecipeStepsListResponse {
  success: boolean
  data?: RecipeStep[]
  error?: string
}
