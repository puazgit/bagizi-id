/**
 * @fileoverview Nutrition data types for Menu domain
 * @version Next.js 15.5.4 / TypeScript strict mode
 * 
 * IMPORTANT: Field names align with API response structure (NOT Prisma schema)
 * - API transforms Prisma "total*" fields to clean names without prefix
 * - e.g., totalCalories (DB) → calories (API) → calories (Frontend)
 * - This provides cleaner API contract and better DX
 */

/**
 * Nutrition data for entire recipe/menu (as returned by API)
 * These values represent TOTAL nutrition for the full batch/recipe
 * Made optional as nutrition calculation might not have been performed yet
 */
export interface NutritionData {
  // Macronutrients (total for recipe) - optional until calculated
  calories?: number            // kcal - Total for recipe
  protein?: number             // grams - Total for recipe
  carbohydrates?: number       // grams - Total for recipe
  fat?: number                 // grams - Total for recipe
  fiber?: number               // grams - Total for recipe
  
  // Vitamins (total for recipe) - optional until calculated
  vitaminA?: number            // mcg RE
  vitaminC?: number            // mg
  vitaminD?: number            // mcg
  vitaminE?: number            // mg
  vitaminK?: number            // mcg
  vitaminB1?: number           // mg (Thiamin)
  vitaminB2?: number           // mg (Riboflavin)
  vitaminB3?: number           // mg (Niacin)
  vitaminB6?: number           // mg
  vitaminB12?: number          // mcg
  folate?: number              // mcg (Folat)
  
  // Minerals (total for recipe) - optional until calculated
  calcium?: number             // mg
  iron?: number                // mg
  magnesium?: number           // mg
  phosphorus?: number          // mg
  potassium?: number           // mg
  sodium?: number              // mg
  zinc?: number                // mg
  copper?: number              // mg
  manganese?: number           // mg
  selenium?: number            // mcg
}

/**
 * Daily Value Percentages (% of AKG/RDA)
 * These percentages are calculated based on Indonesian AKG standards
 * Made optional as nutrition calculation might not have been performed yet
 * API returns these without "DV" suffix for cleaner naming
 */
export interface DailyValuePercentages {
  calories?: number            // % of daily calorie needs
  protein?: number             // % of daily protein needs
  carbohydrates?: number       // % of daily carbohydrate needs
  fat?: number                 // % of daily fat needs
  fiber?: number               // % of daily fiber needs
  vitaminA?: number            // % of daily vitamin A needs
  vitaminC?: number            // % of daily vitamin C needs
  vitaminD?: number            // % of daily vitamin D needs
  vitaminE?: number            // % of daily vitamin E needs
  vitaminK?: number            // % of daily vitamin K needs
  vitaminB1?: number           // % of daily vitamin B1 needs
  vitaminB2?: number           // % of daily vitamin B2 needs
  vitaminB3?: number           // % of daily vitamin B3 needs
  vitaminB6?: number           // % of daily vitamin B6 needs
  vitaminB12?: number          // % of daily vitamin B12 needs
  folate?: number              // % of daily folate needs
  calcium?: number             // % of daily calcium needs
  iron?: number                // % of daily iron needs
  magnesium?: number           // % of daily magnesium needs
  phosphorus?: number          // % of daily phosphorus needs
  potassium?: number           // % of daily potassium needs
  sodium?: number              // % of daily sodium needs
  zinc?: number                // % of daily zinc needs
  copper?: number              // % of daily copper needs
  manganese?: number           // % of daily manganese needs
  selenium?: number            // % of daily selenium needs
}

/**
 * Per-Serving Nutrition Data
 * Helper interface for displaying nutrition per individual serving
 */
export interface PerServingNutrition {
  // Macronutrients (per serving)
  calories: number            // Calculated: totalCalories / servings
  protein: number             // Calculated: totalProtein / servings
  carbohydrates: number       // Calculated: totalCarbohydrates / servings
  fat: number                 // Calculated: totalFat / servings
  fiber: number               // Calculated: totalFiber / servings
  
  // Vitamins (per serving) - only key vitamins for display
  vitaminA: number
  vitaminC: number
  vitaminD: number
  calcium: number
  iron: number
  
  // Serving info
  servingSize: number         // grams
  servingsPerRecipe: number   // Total servings in recipe
}

/**
 * Ingredient-level nutrition detail
 * Shows nutrition contribution from each ingredient
 * API returns clean field names without "total" prefix
 */
export interface NutritionIngredientDetail {
  ingredientName: string
  quantity: number
  unit: string
  
  // Contribution to total nutrition (optional in case data is not available yet)
  calories?: number            // Calories this ingredient contributes
  protein?: number             // Protein this ingredient contributes
  carbohydrates?: number       // Carbs this ingredient contributes
  fat?: number                 // Fat this ingredient contributes
  fiber?: number               // Fiber this ingredient contributes
  
  inventoryItem?: {
    itemName: string
    itemCode: string
  }
}

/**
 * Complete nutrition report for a menu
 */
export interface NutritionReport {
  menuId: string
  menuName: string
  servingSize: number           // grams per serving
  servingsPerRecipe: number     // Total servings in recipe
  
  // Total nutrition (for entire recipe)
  nutrition: NutritionData
  
  // Daily value percentages (based on AKG)
  dailyValuePercentages: DailyValuePercentages
  
  // AKG compliance
  akgCompliant: boolean         // Overall compliance
  complianceScore: number       // 0-100 score
  
  // Ingredient breakdown
  ingredients: NutritionIngredientDetail[]
  
  // Calculation metadata
  calculatedAt: string
  calculatedBy?: string
  
  // Freshness tracking (NEW)
  isStale?: boolean                      // Is this calculation outdated?
  ingredientsLastModified?: string       // When ingredients were last changed
  staleReason?: string                   // Why calculation is stale
  needsRecalculation?: boolean           // Helper flag for UI
}

/**
 * Input for nutrition calculation
 */
export interface CalculateNutritionInput {
  servingSize?: number
  servingsPerRecipe?: number
  forceRecalculate?: boolean
}

/**
 * Nutrition calculation response
 */
export interface NutritionCalculationResponse {
  success: boolean
  data?: NutritionReport
  error?: string
  details?: unknown
}

/**
 * Helper function to calculate per-serving nutrition from total
 */
export function calculatePerServing(
  totalNutrition: NutritionData,
  servings: number
): PerServingNutrition {
  if (servings <= 0) {
    throw new Error('Servings must be greater than 0')
  }
  
  return {
    calories: (totalNutrition.calories ?? 0) / servings,
    protein: (totalNutrition.protein ?? 0) / servings,
    carbohydrates: (totalNutrition.carbohydrates ?? 0) / servings,
    fat: (totalNutrition.fat ?? 0) / servings,
    fiber: (totalNutrition.fiber ?? 0) / servings,
    vitaminA: (totalNutrition.vitaminA ?? 0) / servings,
    vitaminC: (totalNutrition.vitaminC ?? 0) / servings,
    vitaminD: (totalNutrition.vitaminD ?? 0) / servings,
    calcium: (totalNutrition.calcium ?? 0) / servings,
    iron: (totalNutrition.iron ?? 0) / servings,
    servingSize: 0, // To be filled by caller
    servingsPerRecipe: servings
  }
}
