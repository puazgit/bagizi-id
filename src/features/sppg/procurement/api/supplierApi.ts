/**
 * @fileoverview Supplier management client-side API functions
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import type {
  Supplier,
  SupplierWithDetails,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
  ApiResponse,
  PaginatedResponse
} from '../types'

// ================================ API BASE CONFIGURATION ================================

const SUPPLIER_BASE = '/api/sppg/suppliers'

/**
 * Handle API responses with consistent error handling
 */
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }
  
  return data
}

/**
 * Build query string from filters
 */
function buildQueryString(filters?: Record<string, unknown>): string {
  if (!filters) return ''
  
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        params.append(key, value.join(','))
      } else {
        params.append(key, String(value))
      }
    }
  })
  
  return params.toString() ? `?${params.toString()}` : ''
}

// ================================ SUPPLIER OPERATIONS ================================

export const supplierApi = {
  /**
   * Fetch suppliers with optional filtering and pagination
   */
  async getSuppliers(filters?: Partial<SupplierFilters>): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    const queryString = buildQueryString(filters)
    const response = await fetch(`${SUPPLIER_BASE}${queryString}`)
    return handleApiResponse<PaginatedResponse<Supplier>>(response)
  },

  /**
   * Get detailed supplier by ID
   */
  async getSupplierById(id: string): Promise<ApiResponse<SupplierWithDetails>> {
    const response = await fetch(`${SUPPLIER_BASE}/${id}`)
    return handleApiResponse<SupplierWithDetails>(response)
  },

  /**
   * Create new supplier
   */
  async createSupplier(data: CreateSupplierInput): Promise<ApiResponse<Supplier>> {
    const response = await fetch(SUPPLIER_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse<Supplier>(response)
  },

  /**
   * Update existing supplier
   */
  async updateSupplier(id: string, data: Partial<UpdateSupplierInput>): Promise<ApiResponse<Supplier>> {
    const response = await fetch(`${SUPPLIER_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse<Supplier>(response)
  },

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${SUPPLIER_BASE}/${id}`, {
      method: 'DELETE',
    })
    return handleApiResponse<void>(response)
  },

  /**
   * Get supplier performance analytics
   */
  async getSupplierPerformance(id: string): Promise<ApiResponse<{
    supplier: SupplierWithDetails
    performance: {
      totalOrders: number
      completedOrders: number
      cancelledOrders: number
      onTimeDeliveryRate: number
      averageDeliveryTime: number
      qualityMetrics: {
        averageQualityGrade: number
        acceptanceRate: number
        rejectionRate: number
      }
      financialMetrics: {
        totalPurchaseValue: number
        averageOrderValue: number
        outstandingAmount: number
      }
    }
    trends: {
      monthly: Array<{
        month: string
        orders: number
        amount: number
        onTimeRate: number
      }>
    }
    riskAssessment: {
      level: 'LOW' | 'MEDIUM' | 'HIGH'
      factors: string[]
      recommendations: string[]
    }
  }>> {
    const response = await fetch(`${SUPPLIER_BASE}/${id}/performance`)
    return handleApiResponse(response)
  },

  /**
   * Activate supplier
   */
  async activateSupplier(id: string): Promise<ApiResponse<Supplier>> {
    const response = await fetch(`${SUPPLIER_BASE}/${id}/activate`, {
      method: 'PATCH',
    })
    return handleApiResponse<Supplier>(response)
  },

  /**
   * Deactivate supplier
   */
  async deactivateSupplier(id: string, reason?: string): Promise<ApiResponse<Supplier>> {
    const response = await fetch(`${SUPPLIER_BASE}/${id}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })
    return handleApiResponse<Supplier>(response)
  },

  /**
   * Blacklist supplier
   */
  async blacklistSupplier(id: string, reason: string): Promise<ApiResponse<Supplier>> {
    const response = await fetch(`${SUPPLIER_BASE}/${id}/blacklist`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })
    return handleApiResponse<Supplier>(response)
  },
}

export default supplierApi
