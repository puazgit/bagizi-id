/**
 * @fileoverview Menu Ingredient Validation Schemas
 * @version Next.js 15.5.4 / Zod Validation
 */

import { z } from 'zod'

export const ingredientSchema = z.object({
  inventoryItemId: z.string().cuid().optional(),
  ingredientName: z.string().min(2, 'Ingredient name must be at least 2 characters').max(100),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0').max(10000),
  unit: z.string().min(1, 'Unit is required').max(20),
  costPerUnit: z.number().min(0, 'Cost must be non-negative').max(1000000),
  preparationNotes: z.string().max(500).nullish(),
  isOptional: z.boolean().optional(),
  substitutes: z.array(z.string().max(100)).optional()
})

export const updateIngredientSchema = ingredientSchema.partial()

export type IngredientFormData = z.infer<typeof ingredientSchema>
export type UpdateIngredientFormData = z.infer<typeof updateIngredientSchema>
