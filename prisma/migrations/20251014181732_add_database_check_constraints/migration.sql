-- Add CHECK constraints for Menu Domain models
-- This migration adds database-level validation constraints to ensure data integrity

-- ============================================================================
-- 1. NutritionMenu Constraints
-- ============================================================================

-- Cost per serving must be non-negative
ALTER TABLE "nutrition_menus" 
ADD CONSTRAINT "cost_non_negative" 
CHECK ("costPerServing" >= 0);

-- Serving size must be reasonable (50g - 2000g)
ALTER TABLE "nutrition_menus" 
ADD CONSTRAINT "serving_size_range" 
CHECK ("servingSize" >= 50 AND "servingSize" <= 2000);

-- Cooking time must be positive if specified
ALTER TABLE "nutrition_menus" 
ADD CONSTRAINT "cooking_time_positive" 
CHECK ("cookingTime" IS NULL OR "cookingTime" > 0);

-- Preparation time must be positive if specified
ALTER TABLE "nutrition_menus" 
ADD CONSTRAINT "prep_time_positive" 
CHECK ("preparationTime" IS NULL OR "preparationTime" > 0);

-- Batch size must be positive if specified
ALTER TABLE "nutrition_menus" 
ADD CONSTRAINT "batch_size_positive" 
CHECK ("batchSize" IS NULL OR "batchSize" > 0);

-- Budget allocation must be non-negative if specified
ALTER TABLE "nutrition_menus" 
ADD CONSTRAINT "budget_non_negative" 
CHECK ("budgetAllocation" IS NULL OR "budgetAllocation" >= 0);

-- ============================================================================
-- 2. MenuIngredient Constraints
-- ============================================================================

-- Quantity must be positive
ALTER TABLE "menu_ingredients" 
ADD CONSTRAINT "quantity_positive" 
CHECK ("quantity" > 0);

-- Cost per unit must be non-negative
ALTER TABLE "menu_ingredients" 
ADD CONSTRAINT "cost_per_unit_non_negative" 
CHECK ("costPerUnit" >= 0);

-- Total cost must be non-negative
ALTER TABLE "menu_ingredients" 
ADD CONSTRAINT "total_cost_non_negative" 
CHECK ("totalCost" >= 0);

-- ============================================================================
-- 3. MenuCostCalculation Constraints
-- ============================================================================

-- All cost fields must be non-negative
ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "total_ingredient_cost_non_negative" 
CHECK ("totalIngredientCost" >= 0);

ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "total_labor_cost_non_negative" 
CHECK ("totalLaborCost" >= 0);

ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "total_utility_cost_non_negative" 
CHECK ("totalUtilityCost" >= 0);

ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "total_direct_cost_non_negative" 
CHECK ("totalDirectCost" >= 0);

ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "total_indirect_cost_non_negative" 
CHECK ("totalIndirectCost" >= 0);

ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "grand_total_cost_non_negative" 
CHECK ("grandTotalCost" >= 0);

ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "cost_per_portion_non_negative" 
CHECK ("costPerPortion" >= 0);

-- Overhead percentage must be reasonable (0% to 100%)
ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "overhead_percentage_range" 
CHECK ("overheadPercentage" >= 0 AND "overheadPercentage" <= 100);

-- Planned portions must be positive
ALTER TABLE "menu_cost_calculations" 
ADD CONSTRAINT "planned_portions_positive" 
CHECK ("plannedPortions" > 0);

-- ============================================================================
-- 4. MenuNutritionCalculation Constraints
-- ============================================================================

-- All nutrition values must be non-negative
ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "total_calories_non_negative" 
CHECK ("totalCalories" >= 0);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "total_protein_non_negative" 
CHECK ("totalProtein" >= 0);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "total_carbs_non_negative" 
CHECK ("totalCarbs" >= 0);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "total_fat_non_negative" 
CHECK ("totalFat" >= 0);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "total_fiber_non_negative" 
CHECK ("totalFiber" >= 0);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "total_sodium_non_negative" 
CHECK ("totalSodium" >= 0);

-- All Daily Value percentages must be between 0-1000%
ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "calories_dv_range" 
CHECK ("caloriesDV" >= 0 AND "caloriesDV" <= 1000);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "protein_dv_range" 
CHECK ("proteinDV" >= 0 AND "proteinDV" <= 1000);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "carbs_dv_range" 
CHECK ("carbsDV" >= 0 AND "carbsDV" <= 1000);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "fat_dv_range" 
CHECK ("fatDV" >= 0 AND "fatDV" <= 1000);

ALTER TABLE "menu_nutrition_calculations" 
ADD CONSTRAINT "fiber_dv_range" 
CHECK ("fiberDV" >= 0 AND "fiberDV" <= 1000);

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- - 6 constraints on NutritionMenu (cost, serving size, times, batch, budget)
-- - 3 constraints on MenuIngredient (quantity, cost per unit, total cost)
-- - 9 constraints on MenuCostCalculation (costs, overhead%, portions)
-- - 11 constraints on MenuNutritionCalculation (nutrition values, DV%)
-- Total: 29 database-level CHECK constraints added
-- 
-- Impact: Database-level data integrity enforcement
-- - Prevents negative costs and quantities at DB level
-- - Enforces reasonable ranges for serving sizes and percentages
-- - Complements application-level Zod validation
-- - Provides defense-in-depth for data quality
-- ============================================================================
