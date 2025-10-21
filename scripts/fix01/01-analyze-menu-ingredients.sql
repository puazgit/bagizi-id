-- ============================================================================
-- FIX #1: MenuIngredient → InventoryItem Analysis
-- Purpose: Analyze current state of MenuIngredient records
-- Date: October 21, 2025
-- ============================================================================

-- 1. Count total MenuIngredients
SELECT 
  'Total MenuIngredients' as metric,
  COUNT(*) as count
FROM menu_ingredients;

-- 2. Count orphaned MenuIngredients (no inventory link)
SELECT 
  'Orphaned MenuIngredients (no inventoryItemId)' as metric,
  COUNT(*) as count
FROM menu_ingredients
WHERE "inventoryItemId" IS NULL;

-- 3. Count MenuIngredients with inventory link
SELECT 
  'MenuIngredients with inventory link' as metric,
  COUNT(*) as count
FROM menu_ingredients
WHERE "inventoryItemId" IS NOT NULL;

-- 4. List unique ingredient names without inventory link
SELECT 
  "ingredientName",
  unit,
  COUNT(*) as usage_count,
  AVG("costPerUnit") as avg_cost,
  MIN("costPerUnit") as min_cost,
  MAX("costPerUnit") as max_cost
FROM menu_ingredients
WHERE "inventoryItemId" IS NULL
GROUP BY "ingredientName", unit
ORDER BY usage_count DESC;

-- 5. Sample orphaned records with menu context
SELECT 
  mi.id,
  mi."ingredientName",
  mi.quantity,
  mi.unit,
  mi."costPerUnit",
  mi."totalCost",
  m."menuName",
  m."mealType",
  p.name as program_name
FROM menu_ingredients mi
JOIN nutrition_menus m ON mi."menuId" = m.id
JOIN nutrition_programs p ON m."programId" = p.id
WHERE mi."inventoryItemId" IS NULL
LIMIT 20;

-- 6. Check for potential matches in inventory
SELECT 
  mi."ingredientName" as menu_ingredient_name,
  ii."itemName" as inventory_item_name,
  ii.id as inventory_item_id,
  ii.unit as inventory_unit,
  ii."costPerUnit" as current_inventory_cost,
  COUNT(*) as potential_matches
FROM menu_ingredients mi
CROSS JOIN inventory_items ii
WHERE mi."inventoryItemId" IS NULL
  AND (
    LOWER(mi."ingredientName") = LOWER(ii."itemName")
    OR LOWER(mi."ingredientName") LIKE '%' || LOWER(ii."itemName") || '%'
    OR LOWER(ii."itemName") LIKE '%' || LOWER(mi."ingredientName") || '%'
  )
GROUP BY mi."ingredientName", ii."itemName", ii.id, ii.unit, ii."costPerUnit"
ORDER BY mi."ingredientName", potential_matches DESC;

-- 7. Check MenuIngredients with stored costs vs inventory costs
SELECT 
  mi."ingredientName",
  mi."costPerUnit" as stored_cost,
  ii."costPerUnit" as current_inventory_cost,
  ((ii."costPerUnit" - mi."costPerUnit") / NULLIF(mi."costPerUnit", 0) * 100) as price_difference_pct,
  COUNT(*) as affected_menus
FROM menu_ingredients mi
JOIN inventory_items ii ON mi."inventoryItemId" = ii.id
WHERE ABS(mi."costPerUnit" - ii."costPerUnit") > 0.01
GROUP BY mi."ingredientName", mi."costPerUnit", ii."costPerUnit"
ORDER BY ABS(price_difference_pct) DESC;

-- 8. Summary statistics
SELECT 
  COUNT(*) as total_menu_ingredients,
  COUNT("inventoryItemId") as with_inventory_link,
  COUNT(*) - COUNT("inventoryItemId") as without_inventory_link,
  ROUND(COUNT("inventoryItemId") * 100.0 / COUNT(*), 2) as link_percentage
FROM menu_ingredients;
