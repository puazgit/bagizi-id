/**
 * @fileoverview Menu Ingredient Types - Fix #1 Compatible
 * @version Next.js 15.5.4 / Enterprise-grade
 * @note Fix #1: inventoryItemId is REQUIRED, redundant fields removed
 */

export interface MenuIngredient {
  id: string
  menuId: string
  inventoryItemId: string // ✅ Fix #1: REQUIRED (no longer nullable)
  quantity: number
  preparationNotes: string | null
  isOptional: boolean
  substitutes: string[]
  // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit, totalCost (redundant)
  // These values now come from inventoryItem relation
  inventoryItem: { // ✅ Fix #1: REQUIRED relation
    id: string
    itemName: string
    unit: string
    currentStock: number
    minStock: number
    costPerUnit: number | null
  }
}

export interface CreateIngredientInput {
  inventoryItemId: string // ✅ Fix #1: REQUIRED
  quantity: number
  preparationNotes?: string
  isOptional?: boolean
  substitutes?: string[]
  // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit (use inventoryItem instead)
}

export type UpdateIngredientInput = Partial<CreateIngredientInput>

export interface IngredientResponse {
  success: boolean
  data?: MenuIngredient
  error?: string
  details?: unknown
}

export interface IngredientsListResponse {
  success: boolean
  data?: MenuIngredient[]
  error?: string
}
