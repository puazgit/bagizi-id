/**
 * @fileoverview Inventory API Client
 * @version Next.js 15.5.4 / Enterprise-grade
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'

export interface InventoryItem {
  id: string
  itemName: string
  itemCode: string | null
  unit: string
  currentStock: number
  minStock: number
  costPerUnit: number | null
  category: string
  isActive: boolean
}

export interface InventoryItemsResponse {
  success: boolean
  data?: InventoryItem[]
  error?: string
}

/**
 * Fetch all active inventory items for SPPG
 */
export async function fetchInventoryItems(headers?: HeadersInit): Promise<InventoryItem[]> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/sppg/inventory/items?active=true`, getFetchOptions(headers))
  
  if (!response.ok) {
    throw new Error('Failed to fetch inventory items')
  }

  const result: InventoryItemsResponse = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch inventory items')
  }

  return result.data
}

export const inventoryApi = {
  fetchItems: fetchInventoryItems,
}
