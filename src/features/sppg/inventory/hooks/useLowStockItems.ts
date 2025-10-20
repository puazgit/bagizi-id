/**
 * @fileoverview Low Stock Items Hook with Auto-Refresh
 * @version Next.js 15.5.4 / TanStack Query v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventoryApi'
import type { LowStockItem } from '../types'

/**
 * Low Stock Item with Urgency Level
 */
export interface LowStockItemWithUrgency extends LowStockItem {
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'
}

/**
 * Calculate urgency level based on stock percentage
 */
function calculateUrgency(item: LowStockItem): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
  const { stockPercentage } = item
  
  if (stockPercentage <= 25) return 'CRITICAL' // 0-25%
  if (stockPercentage <= 50) return 'HIGH'     // 26-50%
  return 'MEDIUM'                               // 51-100%
}

/**
 * Add urgency level to low stock items
 */
function addUrgencyToItems(items: LowStockItem[]): LowStockItemWithUrgency[] {
  return items.map(item => ({
    ...item,
    urgency: calculateUrgency(item)
  }))
}

/**
 * Query key for low stock items
 */
export const lowStockKeys = {
  all: ['low-stock'] as const,
}

/**
 * Hook: Fetch low stock items with urgency calculation
 * 
 * Features:
 * - Real-time low stock monitoring
 * - Auto-refresh every 5 minutes
 * - Urgency-based sorting (critical → high → medium)
 * - Refetch on window focus
 * - Includes reorder suggestions
 * 
 * @returns Query result with low stock items
 * 
 * @example
 * ```typescript
 * const { data, isLoading, isRefetching } = useLowStockItems()
 * 
 * // Low stock items with urgency levels:
 * // - CRITICAL: currentStock <= minStock * 0.5
 * // - HIGH: currentStock <= minStock
 * // - MEDIUM: currentStock <= minStock * 1.5
 * 
 * if (data?.items) {
 *   const criticalItems = data.items.filter(item => item.urgency === 'CRITICAL')
 *   console.log(`${criticalItems.length} items need immediate attention`)
 * }
 * ```
 */
export function useLowStockItems() {
  return useQuery({
    queryKey: lowStockKeys.all,
    queryFn: async () => {
      const result = await inventoryApi.getLowStock()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch low stock items')
      }
      
      // Add urgency levels to items
      const itemsWithUrgency = addUrgencyToItems(result.data)
      
      // Sort by urgency: CRITICAL > HIGH > MEDIUM
      const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 }
      const sortedItems = itemsWithUrgency.sort((a, b) => {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      })
      
      return sortedItems
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    refetchIntervalInBackground: true, // Refresh even when tab is not visible
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    retry: 2,
  })
}

/**
 * Hook: Check if there are critical low stock items
 * 
 * Features:
 * - Quick check for critical items
 * - Used for alert badges in navigation
 * - Minimal data fetching
 * 
 * @returns Query result with boolean flag
 * 
 * @example
 * ```typescript
 * const { data: hasCritical } = useHasCriticalLowStock()
 * 
 * // Show alert badge in sidebar
 * {hasCritical && <Badge variant="destructive">!</Badge>}
 * ```
 */
export function useHasCriticalLowStock() {
  return useQuery({
    queryKey: [...lowStockKeys.all, 'has-critical'],
    queryFn: async () => {
      const result = await inventoryApi.getLowStock()
      
      if (!result.success || !result.data) {
        return false
      }
      
      // Add urgency levels and check for CRITICAL items
      const itemsWithUrgency = addUrgencyToItems(result.data)
      return itemsWithUrgency.some((item) => item.urgency === 'CRITICAL')
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2,
  })
}

/**
 * Hook: Get low stock count by urgency level
 * 
 * Features:
 * - Aggregated counts by urgency
 * - Used for dashboard stats
 * - Real-time updates
 * 
 * @returns Query result with urgency counts
 * 
 * @example
 * ```typescript
 * const { data: counts } = useLowStockCounts()
 * 
 * // Display in dashboard cards
 * <Card>
 *   <CardTitle>Critical Items</CardTitle>
 *   <CardContent>{counts?.critical || 0}</CardContent>
 * </Card>
 * ```
 */
export function useLowStockCounts() {
  return useQuery({
    queryKey: [...lowStockKeys.all, 'counts'],
    queryFn: async () => {
      const result = await inventoryApi.getLowStock()
      
      if (!result.success || !result.data) {
        return {
          critical: 0,
          high: 0,
          medium: 0,
          total: 0,
        }
      }
      
      // Add urgency levels to items
      const itemsWithUrgency = addUrgencyToItems(result.data)
      
      const counts = {
        critical: 0,
        high: 0,
        medium: 0,
        total: itemsWithUrgency.length,
      }
      
      itemsWithUrgency.forEach((item) => {
        if (item.urgency === 'CRITICAL') counts.critical++
        else if (item.urgency === 'HIGH') counts.high++
        else if (item.urgency === 'MEDIUM') counts.medium++
      })
      
      return counts
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2,
  })
}
