/**
 * @fileoverview Inventory API Client
 * @version Next.js 15.5.4 / Enterprise-grade
 */

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
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const response = await fetch('/api/sppg/inventory/items?active=true')
  
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
