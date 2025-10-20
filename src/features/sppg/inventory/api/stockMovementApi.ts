/**
 * @fileoverview Stock Movement API Client with Enterprise Patterns
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { MovementType } from '@prisma/client'
import type {
  StockMovementResponse,
  StockMovementListResponse,
  StockMovementSummaryResponse,
  CreateStockMovementInput,
  UpdateStockMovementInput,
  StockMovementFilters,
  BatchStockMovementInput,
  ReferenceType,
} from '../types'

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
 * Stock Movement API Client
 * Provides enterprise-grade API methods for stock movement tracking
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const movements = await stockMovementApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const movements = await stockMovementApi.getAll(undefined, headers())
 * ```
 */
export const stockMovementApi = {
  /**
   * Fetch all stock movements with optional filtering
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with stock movements list
   */
  async getAll(
    filters?: StockMovementFilters,
    headers?: HeadersInit
  ): Promise<StockMovementListResponse> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.inventoryId) params.append('inventoryId', filters.inventoryId)
    if (filters?.movementType) params.append('movementType', filters.movementType)
    if (filters?.referenceType) params.append('referenceType', filters.referenceType)
    if (filters?.startDate) {
      const startDate = filters.startDate instanceof Date 
        ? filters.startDate.toISOString() 
        : filters.startDate
      params.append('startDate', startDate)
    }
    if (filters?.endDate) {
      const endDate = filters.endDate instanceof Date 
        ? filters.endDate.toISOString() 
        : filters.endDate
      params.append('endDate', endDate)
    }
    if (filters?.movedBy) params.append('movedBy', filters.movedBy)
    if (filters?.approvedBy) params.append('approvedBy', filters.approvedBy)
    if (filters?.isApproved !== undefined) params.append('isApproved', String(filters.isApproved))
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
    
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
   * @returns Promise with stock movement details
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<StockMovementResponse> {
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
   * Create new stock movement
   * @param data - Stock movement creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with created stock movement
   */
  async create(
    data: CreateStockMovementInput,
    headers?: HeadersInit
  ): Promise<StockMovementResponse> {
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
   * @param data - Approval data
   * @param headers - Optional headers for SSR
   * @returns Promise with approved stock movement
   */
  async approve(
    id: string,
    data: UpdateStockMovementInput,
    headers?: HeadersInit
  ): Promise<StockMovementResponse> {
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
   * Fetch stock movements for specific inventory item
   * @param inventoryId - Inventory item ID
   * @param headers - Optional headers for SSR
   * @returns Promise with stock movements
   */
  async getByInventory(
    inventoryId: string,
    headers?: HeadersInit
  ): Promise<StockMovementListResponse> {
    return this.getAll({ inventoryId }, headers)
  },

  /**
   * Fetch stock movements by movement type
   * @param movementType - Movement type (IN/OUT/ADJUSTMENT)
   * @param headers - Optional headers for SSR
   * @returns Promise with filtered movements
   */
  async getByType(
    movementType: MovementType,
    headers?: HeadersInit
  ): Promise<StockMovementListResponse> {
    return this.getAll({ movementType }, headers)
  },

  /**
   * Fetch stock movements by reference
   * @param referenceType - Reference type
   * @param referenceId - Reference ID
   * @param headers - Optional headers for SSR
   * @returns Promise with filtered movements
   */
  async getByReference(
    referenceType: ReferenceType,
    referenceId?: string,
    headers?: HeadersInit
  ): Promise<StockMovementListResponse> {
    return this.getAll({ 
      referenceType,
    }, headers)
  },

  /**
   * Fetch stock movement summary/statistics
   * @param startDate - Start date for statistics
   * @param endDate - End date for statistics
   * @param headers - Optional headers for SSR
   * @returns Promise with movement summary
   */
  async getSummary(
    startDate?: Date | string,
    endDate?: Date | string,
    headers?: HeadersInit
  ): Promise<StockMovementSummaryResponse> {
    const baseUrl = getBaseUrl()
    
    const params = new URLSearchParams()
    if (startDate) {
      const start = startDate instanceof Date ? startDate.toISOString() : startDate
      params.append('startDate', start)
    }
    if (endDate) {
      const end = endDate instanceof Date ? endDate.toISOString() : endDate
      params.append('endDate', end)
    }
    
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
   * Create batch stock movements
   * @param data - Batch movement data
   * @param headers - Optional headers for SSR
   * @returns Promise with created movements
   */
  async createBatch(
    data: BatchStockMovementInput,
    headers?: HeadersInit
  ): Promise<StockMovementListResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/inventory/movements/batch`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create batch movements')
    }
    
    return response.json()
  },

  /**
   * Fetch unapproved stock movements (pending approval)
   * @param headers - Optional headers for SSR
   * @returns Promise with unapproved movements
   */
  async getUnapproved(
    headers?: HeadersInit
  ): Promise<StockMovementListResponse> {
    return this.getAll({ isApproved: false }, headers)
  },

  /**
   * Fetch recent stock movements
   * @param limit - Number of recent movements to fetch
   * @param headers - Optional headers for SSR
   * @returns Promise with recent movements
   */
  async getRecent(
    limit: number = 10,
    headers?: HeadersInit
  ): Promise<StockMovementListResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/inventory/movements?limit=${limit}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch recent movements')
    }
    
    return response.json()
  },
}
