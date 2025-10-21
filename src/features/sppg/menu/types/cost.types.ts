/**
 * @fileoverview Cost data types for Menu domain
 * @version Next.js 15.5.4 / TypeScript strict mode
 */

export interface CostBreakdown {
  ingredientsCost: number
  laborCost: number
  utilitiesCost: number
  operationalCost: number
  overheadCost: number
  totalDirectCost: number
  totalCost: number
}

export interface LaborCost {
  preparationHours: number
  cookingHours: number
  totalHours: number
  laborCostPerHour: number
  totalLaborCost: number
}

export interface UtilitiesCost {
  gasCost: number
  electricityCost: number
  waterCost: number
  totalUtilitiesCost: number
}

export interface OperationalCost {
  packagingCost: number
  equipmentMaintenanceCost: number
  cleaningSuppliesCost: number
  totalOperationalCost: number
}

export interface CostRatios {
  ingredientCostRatio: number
  laborCostRatio: number
  overheadCostRatio: number
}

export interface BudgetPlanning {
  budgetAllocation?: number // Alokasi anggaran untuk menu ini
  budgetUtilization?: number // Persentase penggunaan budget
  budgetRemaining?: number // Sisa budget
}

export interface CostIngredientDetail {
  ingredientName: string
  quantity: number
  unit: string
  costPerUnit: number
  totalCost: number
  inventoryItem?: {
    itemName: string
    itemCode: string
    unit: string
    costPerUnit: number
    preferredSupplier?: {
      supplierName: string
      supplierCode: string
    }
  }
}

export interface CostReport {
  menuId: string
  menuName: string
  servingSize: number
  servingsPerRecipe: number
  costBreakdown: CostBreakdown
  laborCost: LaborCost
  utilitiesCost: UtilitiesCost
  operationalCost: OperationalCost
  costRatios: CostRatios
  budgetPlanning?: BudgetPlanning // Budget planning untuk SPPG
  costPerServing: number
  costPerGram: number
  ingredients: CostIngredientDetail[]
  calculatedAt: string
  
  // Freshness tracking (NEW)
  isStale?: boolean                      // Is this calculation outdated?
  ingredientsLastModified?: string       // When ingredients were last changed
  staleReason?: string                   // Why calculation is stale
  needsRecalculation?: boolean           // Helper flag for UI
}

export interface CalculateCostInput {
  laborCostPerHour?: number
  preparationHours?: number
  cookingHours?: number
  gasCost?: number
  electricityCost?: number
  waterCost?: number
  packagingCost?: number
  equipmentMaintenanceCost?: number
  cleaningSuppliesCost?: number
  overheadPercentage?: number
  budgetAllocation?: number // Alokasi anggaran untuk menu ini
  forceRecalculate?: boolean
}

export interface CostCalculationResponse {
  success: boolean
  data?: CostReport
  error?: string
}
