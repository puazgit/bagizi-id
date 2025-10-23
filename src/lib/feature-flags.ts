/**
 * Feature Flags for SPPG Phase 1 Implementation
 * 
 * Controls progressive rollout of Phase 1 fixes
 * Toggle via environment variables
 */

export const PHASE1_FEATURE_FLAGS = {
  // Fix #1: MenuIngredient-InventoryItem Link
  MENU_INGREDIENT_FIX: process.env.NEXT_PUBLIC_FF_MENU_INGREDIENT === 'true',
  
  // Fix #2: ProcurementItem-InventoryItem Link
  PROCUREMENT_ITEM_FIX: process.env.NEXT_PUBLIC_FF_PROCUREMENT_ITEM === 'true',
  
  // Fix #3: FoodProduction Cost Calculation
  PRODUCTION_COST_FIX: process.env.NEXT_PUBLIC_FF_PRODUCTION_COST === 'true',
  
  // Fix #4-5: Distribution Flow Complete
  DISTRIBUTION_FLOW_FIX: process.env.NEXT_PUBLIC_FF_DISTRIBUTION_FLOW === 'true',
  
  // Fix #6: Procurement Supplier Cleanup
  PROCUREMENT_SUPPLIER_FIX: process.env.NEXT_PUBLIC_FF_PROCUREMENT_SUPPLIER === 'true',
  
  // Fix #7: MenuPlan Approval Workflow
  MENU_PLAN_APPROVAL_FIX: process.env.NEXT_PUBLIC_FF_MENU_PLAN_APPROVAL === 'true',
  
  // Fix #8: SchoolBeneficiary Address Standardization
  SCHOOL_ADDRESS_FIX: process.env.NEXT_PUBLIC_FF_SCHOOL_ADDRESS === 'true',
} as const

/**
 * Check if a specific Phase 1 fix is enabled
 */
export function isPhase1FixEnabled(fixName: keyof typeof PHASE1_FEATURE_FLAGS): boolean {
  return PHASE1_FEATURE_FLAGS[fixName] ?? false
}

/**
 * Get all enabled Phase 1 fixes
 */
export function getEnabledPhase1Fixes(): string[] {
  return Object.entries(PHASE1_FEATURE_FLAGS)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
}

/**
 * Check if any Phase 1 fix is enabled
 */
export function hasAnyPhase1FixEnabled(): boolean {
  return Object.values(PHASE1_FEATURE_FLAGS).some(enabled => enabled)
}
