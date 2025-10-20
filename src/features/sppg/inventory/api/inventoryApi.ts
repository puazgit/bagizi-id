/**
 * @fileoverview Inventory API Client with Enterprise Patterns
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { InventoryCategory } from '@prisma/client'
import type {
  InventoryItemResponse,
  InventoryListResponse,
  InventoryStatsResponse,
  CreateInventoryInput,
  UpdateInventoryInput,
  InventoryFilters,
  LowStockItem,
  StockMovementFilters,
  CreateStockMovementInput,
  StockMovementDetail,
  StockMovementSummary,
} from '../types'

/**
 * API Response wrapper type
 */
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Base URL helper for SSR support
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

/**
 * Fetch options helper for SSR support
 */
function getFetchOptions(headers?: HeadersInit): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include' as RequestCredentials,
  }
}

/**
 * Inventory API Client
 * Provides enterprise-grade API methods for inventory management
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const items = await inventoryApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const items = await inventoryApi.getAll(undefined, headers())
 * ```
 */
export const inventoryApi = {
  /**
   * Fetch all inventory items with optional filtering
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with inventory items list
   */
  async getAll(
    filters?: InventoryFilters,
    headers?: HeadersInit
  ): Promise<InventoryListResponse> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.stockStatus) params.append('stockStatus', filters.stockStatus)
    if (filters?.storageLocation) params.append('storageLocation', filters.storageLocation)
    if (filters?.supplierId) params.append('supplierId', filters.supplierId)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/inventory?${queryString}`
      : `${baseUrl}/api/sppg/inventory`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch inventory items')
    }
    
    return response.json()
  },

  /**
   * Fetch single inventory item by ID
   * @param id - Inventory item ID
   * @param headers - Optional headers for SSR
   * @returns Promise with inventory item details
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<InventoryItemResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/inventory/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch inventory item')
    }
    
    return response.json()
  },

  /**
   * Create new inventory item
   * @param data - Inventory item creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with created inventory item
   */
  async create(
    data: CreateInventoryInput,
    headers?: HeadersInit
  ): Promise<InventoryItemResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/inventory`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create inventory item')
    }
    
    return response.json()
  },

  /**
   * Update existing inventory item
   * @param id - Inventory item ID
   * @param data - Partial inventory item data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated inventory item
   */
  async update(
    id: string,
    data: Partial<UpdateInventoryInput>,
    headers?: HeadersInit
  ): Promise<InventoryItemResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/inventory/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update inventory item')
    }
    
    return response.json()
  },

  /**
   * Delete inventory item
   * @param id - Inventory item ID
   * @param headers - Optional headers for SSR
   * @returns Promise with deletion result
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/inventory/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete inventory item')
    }
    
    return response.json()
  },

  /**
   * Fetch low stock items
   * @param headers - Optional headers for SSR
   * @returns Promise with low stock items
   */
  async getLowStock(
    headers?: HeadersInit
  ): Promise<{ success: boolean; data?: LowStockItem[]; error?: string }> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/inventory/low-stock`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch low stock items')
    }
    
    return response.json()
  },

  /**
   * Fetch inventory statistics
   * @param headers - Optional headers for SSR
   * @returns Promise with inventory statistics
   */
  async getStats(
    headers?: HeadersInit
  ): Promise<InventoryStatsResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/inventory/stats`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch inventory statistics')
    }
    
    return response.json()
  },

  /**
   * Search inventory items by name or code
   * @param query - Search query
   * @param headers - Optional headers for SSR
   * @returns Promise with search results
   */
  async search(
    query: string,
    headers?: HeadersInit
  ): Promise<InventoryListResponse> {
    return this.getAll({ search: query }, headers)
  },

  /**
   * Fetch inventory items by category
   * @param category - Inventory category
   * @param headers - Optional headers for SSR
   * @returns Promise with filtered items
   */
  async getByCategory(
    category: InventoryCategory,
    headers?: HeadersInit
  ): Promise<InventoryListResponse> {
    return this.getAll({ category }, headers)
  },

  /**
   * Fetch inventory items by storage location
   * @param location - Storage location
   * @param headers - Optional headers for SSR
   * @returns Promise with filtered items
   */
  async getByLocation(
    location: string,
    headers?: HeadersInit
  ): Promise<InventoryListResponse> {
    return this.getAll({ storageLocation: location }, headers)
  },

  /**
   * Fetch inventory items by supplier
   * @param supplierId - Supplier ID
   * @param headers - Optional headers for SSR
   * @returns Promise with filtered items
   */
  async getBySupplier(
    supplierId: string,
    headers?: HeadersInit
  ): Promise<InventoryListResponse> {
    return this.getAll({ supplierId }, headers)
  },

  /**
   * Toggle inventory item active status
   * @param id - Inventory item ID
   * @param isActive - New active status
   * @param headers - Optional headers for SSR
   * @returns Promise with updated item
   */
  async toggleActive(
    id: string,
    isActive: boolean,
    headers?: HeadersInit
  ): Promise<InventoryItemResponse> {
    return this.update(id, { isActive }, headers)
  },

  /**
   * Update inventory stock level
   * Note: This is for direct stock updates. Use Stock Movement API for tracked changes.
   * @param id - Inventory item ID
   * @param currentStock - New stock level
   * @param headers - Optional headers for SSR
   * @returns Promise with updated item
   */
  async updateStock(
    id: string,
    currentStock: number,
    headers?: HeadersInit
  ): Promise<InventoryItemResponse> {
    return this.update(id, { currentStock }, headers)
  },

  // ==================== Stock Movement Methods ====================

  /**
   * Fetch stock movements with optional filtering
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with stock movements list
   */
  async getStockMovements(
    filters?: StockMovementFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<StockMovementDetail[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.inventoryId) params.append('inventoryId', filters.inventoryId)
    if (filters?.movementType) params.append('movementType', filters.movementType)
    if (filters?.startDate) params.append('startDate', String(filters.startDate))
    if (filters?.endDate) params.append('endDate', String(filters.endDate))
    if (filters?.movedBy) params.append('movedBy', filters.movedBy)
    if (filters?.approvedBy) params.append('approvedBy', filters.approvedBy)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/inventory/movements?${queryString}`
      : `${baseUrl}/api/sppg/inventory/movements`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch stock movements')
    }
    
    return response.json()
  },

  /**
   * Fetch single stock movement by ID
   * @param id - Stock movement ID
   * @param headers - Optional headers for SSR
   * @returns Promise with movement details
   */
  async getStockMovementById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<StockMovementDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/inventory/movements/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch stock movement')
    }
    
    return response.json()
  },

  /**
   * Fetch stock movement summary
   * @param filters - Optional date range filters
   * @param headers - Optional headers for SSR
   * @returns Promise with summary data
   */
  async getStockMovementSummary(
    filters?: StockMovementFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<StockMovementSummary>> {
    const baseUrl = getBaseUrl()
    
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', String(filters.startDate))
    if (filters?.endDate) params.append('endDate', String(filters.endDate))
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/inventory/movements/summary?${queryString}`
      : `${baseUrl}/api/sppg/inventory/movements/summary`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch movement summary')
    }
    
    return response.json()
  },

  /**
   * Create new stock movement
   * @param data - Stock movement data
   * @param headers - Optional headers for SSR
   * @returns Promise with created movement
   */
  async createStockMovement(
    data: CreateStockMovementInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<StockMovementDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/inventory/movements`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create stock movement')
    }
    
    return response.json()
  },

  /**
   * Approve stock movement
   * @param id - Stock movement ID
   * @param data - Approval data (notes)
   * @param headers - Optional headers for SSR
   * @returns Promise with updated movement
   */
  async approveStockMovement(
    id: string,
    data: { notes?: string },
    headers?: HeadersInit
  ): Promise<ApiResponse<StockMovementDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/inventory/movements/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to approve stock movement')
    }
    
    return response.json()
  },

  /**
   * Create batch stock movements
   * @param movements - Array of stock movement data
   * @param headers - Optional headers for SSR
   * @returns Promise with created movements
   */
  async createBatchStockMovements(
    movements: CreateStockMovementInput[],
    headers?: HeadersInit
  ): Promise<ApiResponse<StockMovementDetail[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/inventory/movements/batch`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify({ movements }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create batch stock movements')
    }
    
    return response.json()
  },
}
