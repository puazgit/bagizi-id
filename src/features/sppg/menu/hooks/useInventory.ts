/**
 * @fileoverview Inventory Items Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 */

import { useQuery } from '@tanstack/react-query'
import { inventoryApi, type InventoryItem } from '../api/inventoryApi'

/**
 * Query keys for inventory
 */
export const inventoryKeys = {
  all: ['inventory'] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
}

/**
 * Hook to fetch inventory items
 */
export function useInventoryItems() {
  return useQuery<InventoryItem[]>({
    queryKey: inventoryKeys.items(),
    queryFn: () => inventoryApi.fetchItems(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
