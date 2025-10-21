/**
 * @fileoverview Menu Ingredient Validation Schemas - Fix #1 Compatible
 * @version Next.js 15.5.4 / Zod Validation
 * @note Fix #1: inventoryItemId REQUIRED, redundant fields removed
 */

import { z } from 'zod'

export const ingredientSchema = z.object({
  inventoryItemId: z.string().cuid('Invalid inventory item ID'), // ✅ Fix #1: REQUIRED
  quantity: z.number().min(0.01, 'Quantity must be greater than 0').max(10000),
  preparationNotes: z.string().max(500).nullish(),
  isOptional: z.boolean().optional().default(false),
  substitutes: z.array(z.string().max(100)).optional().default([])
  // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit (use inventoryItem relation)
})

export const updateIngredientSchema = ingredientSchema.partial().extend({
  inventoryItemId: z.string().cuid().optional() // Allow update without changing inventory item
})

export type IngredientFormData = z.infer<typeof ingredientSchema>
export type UpdateIngredientFormData = z.infer<typeof updateIngredientSchema>
