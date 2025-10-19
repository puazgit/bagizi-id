/**
 * @fileoverview Procurement domain client-side API functions
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type {
  Procurement,
  ProcurementWithDetails,
  ProcurementPlan,
  ProcurementPlanWithDetails,
  CreateProcurementInput,
  UpdateProcurementInput,
  CreateProcurementPlanInput,
  UpdateProcurementPlanInput,
  ProcurementFilters,
  ApiResponse,
  PaginatedResponse
} from '../types'

// ================================ API BASE CONFIGURATION ================================

const PROCUREMENT_BASE = '/api/sppg/procurement'
const PLANS_BASE = '/api/sppg/procurement/plans'

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

// ================================ PROCUREMENT PLANS OPERATIONS ================================

export const procurementPlanApi = {
  /**
   * Fetch procurement plans with optional filtering and pagination
   */
  async getPlans(filters?: Partial<ProcurementFilters>, headers?: HeadersInit): Promise<ApiResponse<PaginatedResponse<ProcurementPlan>>> {
    const baseUrl = getBaseUrl()
    const queryString = buildQueryString(filters)
    const response = await fetch(`${baseUrl}${PLANS_BASE}${queryString}`, getFetchOptions(headers))
    return handleApiResponse<PaginatedResponse<ProcurementPlan>>(response)
  },

  /**
   * Get detailed procurement plan by ID
   */
  async getPlanById(id: string, headers?: HeadersInit): Promise<ApiResponse<ProcurementPlanWithDetails>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PLANS_BASE}/${id}`, getFetchOptions(headers))
    return handleApiResponse<ProcurementPlanWithDetails>(response)
  },

  /**
   * Create new procurement plan
   */
  async createPlan(data: CreateProcurementPlanInput, headers?: HeadersInit): Promise<ApiResponse<ProcurementPlan>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PLANS_BASE}`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleApiResponse<ProcurementPlan>(response)
  },

  /**
   * Update existing procurement plan
   */
  async updatePlan(id: string, data: Partial<UpdateProcurementPlanInput>, headers?: HeadersInit): Promise<ApiResponse<ProcurementPlan>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PLANS_BASE}/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return handleApiResponse<ProcurementPlan>(response)
  },

  /**
   * Delete procurement plan
   */
  async deletePlan(id: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PLANS_BASE}/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    return handleApiResponse<void>(response)
  },

  /**
   * Approve or reject procurement plan
   */
  async approvePlan(id: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string, headers?: HeadersInit): Promise<ApiResponse<ProcurementPlan>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PLANS_BASE}/${id}`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      body: JSON.stringify({ action, rejectionReason }),
    })
    return handleApiResponse<ProcurementPlan>(response)
  },
}

// ================================ PROCUREMENT ORDERS OPERATIONS ================================

export const procurementApi = {
  /**
   * Fetch procurement orders with optional filtering and pagination
   */
  /**
   * Get all procurement orders with optional filters
   * Returns procurement data WITH relations (supplier, items, plan, sppg)
   */
  async getProcurements(filters?: Partial<ProcurementFilters>, headers?: HeadersInit): Promise<ApiResponse<PaginatedResponse<ProcurementWithDetails>>> {
    const baseUrl = getBaseUrl()
    const queryString = buildQueryString(filters)
    const response = await fetch(`${baseUrl}${PROCUREMENT_BASE}${queryString}`, getFetchOptions(headers))
    return handleApiResponse<PaginatedResponse<ProcurementWithDetails>>(response)
  },

  /**
   * Get detailed procurement order by ID
   */
  async getProcurementById(id: string, headers?: HeadersInit): Promise<ApiResponse<ProcurementWithDetails>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PROCUREMENT_BASE}/${id}`, getFetchOptions(headers))
    return handleApiResponse<ProcurementWithDetails>(response)
  },

  /**
   * Create new procurement order
   */
  async createProcurement(data: CreateProcurementInput, headers?: HeadersInit): Promise<ApiResponse<Procurement>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PROCUREMENT_BASE}`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleApiResponse<Procurement>(response)
  },

  /**
   * Update existing procurement order
   */
  async updateProcurement(id: string, data: Partial<UpdateProcurementInput>, headers?: HeadersInit): Promise<ApiResponse<Procurement>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PROCUREMENT_BASE}/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return handleApiResponse<Procurement>(response)
  },

  /**
   * Delete procurement order
   */
  async deleteProcurement(id: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PROCUREMENT_BASE}/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    return handleApiResponse<void>(response)
  },

  /**
   * Receive procurement items (Quality Control)
   */
  async receiveProcurement(
    id: string,
    data: {
      items: Array<{
        itemId: string
        receivedQuantity: number
        isAccepted: boolean
        rejectionReason?: string
        notes?: string
      }>
      actualDelivery?: Date
      qualityGrade?: 'A' | 'B' | 'C'
      qualityNotes?: string
      receiptNumber?: string
      receiptPhoto?: string
      deliveryPhoto?: string
    },
    headers?: HeadersInit
  ): Promise<ApiResponse<Procurement>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${PROCUREMENT_BASE}/${id}/receive`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return handleApiResponse<Procurement>(response)
  },
}

// ================================ COMBINED EXPORT ================================

/**
 * Combined procurement API operations
 */
export const procurementOperations = {
  plans: procurementPlanApi,
  orders: procurementApi,
}

export default procurementOperations
