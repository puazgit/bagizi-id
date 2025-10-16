/**
 * @fileoverview Menu Ingredient Types
 * @version Next.js 15.5.4 / Enterprise-grade
 */

export interface MenuIngredient {
  id: string
  menuId: string
  inventoryItemId: string | null
  ingredientName: string
  quantity: number
  unit: string
  costPerUnit: number
  totalCost: number
  preparationNotes: string | null
  isOptional: boolean
  substitutes: string[]
  inventoryItem?: {
    itemName: string
    unit: string
    currentStock: number
    minStock: number
    costPerUnit: number | null
  }
}

export interface CreateIngredientInput {
  inventoryItemId?: string
  ingredientName: string
  quantity: number
  unit: string
  costPerUnit: number
  preparationNotes?: string
  isOptional?: boolean
  substitutes?: string[]
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
