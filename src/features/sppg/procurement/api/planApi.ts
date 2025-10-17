/**
 * @fileoverview Procurement Plan API Client
 * @module features/sppg/procurement/api/planApi
 * @description API client for procurement plan operations
 */

import { ProcurementPlan } from '@prisma/client'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ProcurementPlanFilters {
  page?: number
  limit?: number
  search?: string
  approvalStatus?: string
  planMonth?: string
  planYear?: number
  planQuarter?: number
}

export interface ProcurementPlanInput {
  planName: string
  planMonth: string
  planYear: number
  planQuarter?: number
  totalBudget: number
  proteinBudget?: number
  carbBudget?: number
  vegetableBudget?: number
  fruitBudget?: number
  otherBudget?: number
  targetRecipients: number
  targetMeals: number
  costPerMeal?: number
  emergencyBuffer?: number
  programId?: string
  notes?: string
}

export interface ProcurementPlanResponse {
  success: boolean
  data?: ProcurementPlan & {
    sppg?: {
      id: string
      name: string
      code: string
    }
    program?: {
      id: string
      name: string
    } | null
    _count?: {
      procurements: number
    }
  }
  error?: string
}

export interface ProcurementPlanListResponse {
  success: boolean
  data?: Array<ProcurementPlan & {
    sppg?: {
      id: string
      name: string
      code: string
    }
    program?: {
      id: string
      name: string
    } | null
    _count?: {
      procurements: number
    }
  }>
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}

export interface ApprovalActionInput {
  action: 'submit' | 'approve' | 'reject' | 'revise'
  rejectionReason?: string
}

// ============================================
// API CLIENT
// ============================================

export const planApi = {
  /**
   * Get all procurement plans with filters
   */
  async getAll(filters?: ProcurementPlanFilters): Promise<ProcurementPlanListResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    const url = `/api/sppg/procurement/plans${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch procurement plans')
    }

    return response.json()
  },

  /**
   * Get single procurement plan by ID
   */
  async getById(id: string): Promise<ProcurementPlanResponse> {
    const response = await fetch(`/api/sppg/procurement/plans/${id}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch procurement plan')
    }

    return response.json()
  },

  /**
   * Create new procurement plan
   */
  async create(data: ProcurementPlanInput): Promise<ProcurementPlanResponse> {
    const response = await fetch('/api/sppg/procurement/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create procurement plan')
    }

    return response.json()
  },

  /**
   * Update existing procurement plan
   */
  async update(id: string, data: Partial<ProcurementPlanInput>): Promise<ProcurementPlanResponse> {
    const response = await fetch(`/api/sppg/procurement/plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update procurement plan')
    }

    return response.json()
  },

  /**
   * Delete procurement plan
   */
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`/api/sppg/procurement/plans/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete procurement plan')
    }

    return response.json()
  },

  /**
   * Approval workflow actions
   */
  async approvalAction(id: string, action: ApprovalActionInput): Promise<ProcurementPlanResponse> {
    const response = await fetch(`/api/sppg/procurement/plans/${id}/approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to ${action.action} procurement plan`)
    }

    return response.json()
  },
}
