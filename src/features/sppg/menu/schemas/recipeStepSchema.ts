/**
 * @fileoverview Recipe Step Validation Schemas
 * @version Next.js 15.5.4 / Zod Validation
 */

import { z } from 'zod'

export const recipeStepSchema = z.object({
  stepNumber: z.number().int().min(1, 'Step number must be at least 1').max(100),
  instruction: z.string().min(5, 'Instruction must be at least 5 characters').max(1000),
  duration: z.number().int().min(1).max(1440).nullish(), // Max 24 hours in minutes
  temperature: z.number().min(0).max(500).nullish(), // Max 500°C
  temperatureUnit: z.enum(['CELSIUS', 'FAHRENHEIT']).nullish(),
  equipment: z.array(z.string().max(100)).optional(),
  qualityCheckNotes: z.string().max(500).nullish(),
  mediaUrl: z.string().url('Must be a valid URL').max(500).nullish()
})

export const updateRecipeStepSchema = recipeStepSchema.partial()

export type RecipeStepFormData = z.infer<typeof recipeStepSchema>
export type UpdateRecipeStepFormData = z.infer<typeof updateRecipeStepSchema>
