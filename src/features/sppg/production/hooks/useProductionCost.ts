/**
 * @fileoverview Production Cost Hooks
 * @description React Query hooks for dynamic cost calculation using ProductionCostCalculator
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { productionCostCalculator } from '@/services/production/ProductionCostCalculator'

// ============================================================================
// Query Keys
// ============================================================================

export const PRODUCTION_COST_KEYS = {
  all: ['production-costs'] as const,
  detail: (productionId: string) => ['production-costs', productionId] as const,
  breakdown: (productionId: string) => ['production-costs', productionId, 'breakdown'] as const,
  estimated: (menuId: string, portions: number) => 
    ['production-costs', 'estimated', menuId, portions] as const,
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get calculated production cost (total + per portion)
 * Only works if production has usage records
 * 
 * @param productionId - ID of the food production
 * @param enabled - Whether to enable the query (default: true)
 * 
 * @example
 * ```tsx
 * const { data: cost, isLoading } = useProductionCost(production.id)
 * if (cost) {
 *   console.log(`Total: ${cost.totalCost}`)
 *   console.log(`Per Portion: ${cost.costPerPortion}`)
 * }
 * ```
 */
export function useProductionCost(productionId: string, enabled = true) {
  return useQuery({
    queryKey: PRODUCTION_COST_KEYS.detail(productionId),
    queryFn: async () => {
      try {
        return await productionCostCalculator.calculateProductionCost(productionId)
      } catch (error) {
        // If no usage records exist yet, return null instead of error
        if (error instanceof Error && error.message.includes('No usage records')) {
          return null
        }
        throw error
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if no usage records
  })
}

/**
 * Hook to get cost breakdown by ingredient
 * Shows which ingredients contributed how much to total cost
 * 
 * @param productionId - ID of the food production
 * @param enabled - Whether to enable the query (default: true)
 * 
 * @example
 * ```tsx
 * const { data: breakdown } = useProductionCostBreakdown(production.id)
 * breakdown?.forEach(item => {
 *   console.log(`${item.itemName}: ${item.percentage}%`)
 * })
 * ```
 */
export function useProductionCostBreakdown(productionId: string, enabled = true) {
  return useQuery({
    queryKey: PRODUCTION_COST_KEYS.breakdown(productionId),
    queryFn: () => productionCostCalculator.getCostBreakdown(productionId),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get estimated cost from menu (for planning)
 * Calculates cost based on current inventory prices
 * 
 * @param menuId - ID of the nutrition menu
 * @param portions - Number of portions to produce
 * @param enabled - Whether to enable the query (default: true)
 * 
 * @example
 * ```tsx
 * const { data: estimatedCost } = useEstimatedProductionCost(
 *   selectedMenu.id, 
 *   100
 * )
 * ```
 */
export function useEstimatedProductionCost(
  menuId: string, 
  portions: number,
  enabled = true
) {
  return useQuery({
    queryKey: PRODUCTION_COST_KEYS.estimated(menuId, portions),
    queryFn: () => productionCostCalculator.calculateEstimatedCost(menuId, portions),
    enabled: enabled && !!menuId && portions > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes (prices change more frequently)
  })
}
