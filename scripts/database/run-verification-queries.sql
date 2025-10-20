-- ============================================================================
-- SPPG Phase 1 - Pre-Implementation Verification Queries
-- 
-- Run these queries before starting implementation to establish baseline
-- Run against: bagizi_staging database
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SPPG PHASE 1 - PRE-IMPLEMENTATION VERIFICATION'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Fix #1: MenuIngredient orphaned records
\echo '📊 Fix #1: MenuIngredient-InventoryItem Link'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as orphaned_menu_ingredients,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "MenuIngredient"), 0) * 100, 2) as percentage
FROM "MenuIngredient"
WHERE "inventoryItemId" IS NULL;
\echo ''

-- Fix #2: ProcurementItem orphaned records
\echo '📊 Fix #2: ProcurementItem-InventoryItem Link'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as orphaned_procurement_items,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "ProcurementItem"), 0) * 100, 2) as percentage
FROM "ProcurementItem"
WHERE "inventoryItemId" IS NULL;
\echo ''

-- Fix #3: FoodProduction with stored costs
\echo '📊 Fix #3: FoodProduction Stored Costs'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as productions_with_stored_costs,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "FoodProduction"), 0) * 100, 2) as percentage
FROM "FoodProduction"
WHERE "estimatedCost" IS NOT NULL;
\echo ''

-- Fix #4-5: Distribution without proof
\echo '📊 Fix #4-5: Distributions Without Delivery Proof'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as distributions_without_proof,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "FoodDistribution"), 0) * 100, 2) as percentage
FROM "FoodDistribution"
WHERE "recipientSignature" IS NULL 
   OR "photoUrl" IS NULL
   OR "gpsLatitude" IS NULL;
\echo ''

-- Fix #7: MenuPlan without approval
\echo '📊 Fix #7: Active MenuPlans Without Approval'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as unapproved_active_plans,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "MenuPlan" WHERE "isActive" = true), 0) * 100, 2) as percentage
FROM "MenuPlan"
WHERE "isActive" = true 
  AND "approvedBy" IS NULL;
\echo ''

-- Fix #8: SchoolBeneficiary without GPS
\echo '📊 Fix #8: Schools Without GPS Coordinates'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as schools_without_gps,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "SchoolBeneficiary"), 0) * 100, 2) as percentage
FROM "SchoolBeneficiary"
WHERE "latitude" IS NULL 
   OR "longitude" IS NULL;
\echo ''

-- Overall summary
\echo '📊 OVERALL SUMMARY'
\echo '─────────────────────────────────────────────'
SELECT 
    'Total Records' as metric,
    COUNT(*) as menu_ingredients
FROM "MenuIngredient"
UNION ALL
SELECT 'With InventoryItem', COUNT(*) FROM "MenuIngredient" WHERE "inventoryItemId" IS NOT NULL
UNION ALL
SELECT 'Orphaned', COUNT(*) FROM "MenuIngredient" WHERE "inventoryItemId" IS NULL;
\echo ''

\echo '✅ Verification queries complete!'
\echo 'Save these baseline numbers for comparison after implementation.'
