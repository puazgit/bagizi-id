/**
 * @fileoverview Menu Planning API Client Functions
 * @version Next.js 15.5.4 / TanStack Query Integration
 * @see {@link /docs/copilot-instructions.md} API client patterns
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import {
  CreateMenuPlanInput,
  UpdateMenuPlanInput,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  SubmitForReviewInput,
  ApproveActionInput,
  RejectActionInput,
  PublishActionInput,
  MenuPlanFilters,
  AssignmentFilters
} from '../schemas'
import {
  MenuPlanWithRelations,
  MenuPlanDetail,
  MenuPlanAnalytics,
  MenuAssignmentWithPlan,
  ApiResponse,
  ApiListResponse
} from '../types'

/**
 * Menu Plan API Client
 */
export const menuPlanningApi = {
  /**
   * Get list of menu plans with filters
   */
  async getPlans(filters?: MenuPlanFilters, headers?: HeadersInit): Promise<ApiListResponse<MenuPlanWithRelations[]>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (filters?.status) params.append('status', filters.status)
    if (filters?.programId) params.append('programId', filters.programId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await fetch(`${baseUrl}/api/sppg/menu-planning?${params.toString()}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch menu plans')
    }

    return response.json()
  },

  /**
   * Get single menu plan detail with assignments
   */
  async getPlan(planId: string, headers?: HeadersInit): Promise<ApiResponse<MenuPlanDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch menu plan')
    }

    return response.json()
  },

  /**
   * Create new menu plan
   */
  async createPlan(data: CreateMenuPlanInput, headers?: HeadersInit): Promise<ApiResponse<MenuPlanWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create menu plan')
    }

    return response.json()
  },

  /**
   * Update existing menu plan
   */
  async updatePlan(planId: string, data: UpdateMenuPlanInput, headers?: HeadersInit): Promise<ApiResponse<MenuPlanWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update menu plan')
    }

    return response.json()
  },

  /**
   * Delete (archive) menu plan
   */
  async deletePlan(planId: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete menu plan')
    }

    return response.json()
  },

  /**
   * Submit menu plan for review (DRAFT → PENDING_REVIEW)
   */
  async submitPlan(planId: string, data: SubmitForReviewInput, headers?: HeadersInit): Promise<ApiResponse<MenuPlanWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/submit`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit menu plan')
    }

    return response.json()
  },

  /**
   * Approve menu plan (PENDING_REVIEW → APPROVED)
   */
  async approvePlan(planId: string, data: ApproveActionInput, headers?: HeadersInit): Promise<ApiResponse<MenuPlanWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/approve`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Clone response to read body multiple times if needed
      const responseClone = response.clone()
      let error
      
      try {
        error = await response.json()
        console.error('Approve plan API error - Status:', response.status)
        console.error('Approve plan API error - Body:', error)
        throw new Error(error.details || error.error || `Failed to approve menu plan (${response.status})`)
      } catch {
        // If JSON parse fails, try reading as text
        try {
          const text = await responseClone.text()
          console.error('Approve plan API error - Status:', response.status)
          console.error('Approve plan API error - Response text:', text)
          throw new Error(`Failed to approve menu plan (${response.status}): ${text || 'Unknown error'}`)
        } catch {
          console.error('Approve plan API error - Status:', response.status)
          console.error('Approve plan API error - Could not read response body')
          throw new Error(`Failed to approve menu plan (${response.status})`)
        }
      }
    }

    return response.json()
  },

  /**
   * Reject menu plan (PENDING_REVIEW → DRAFT)
   */
  async rejectPlan(planId: string, data: RejectActionInput, headers?: HeadersInit): Promise<ApiResponse<MenuPlanWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/reject`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reject menu plan')
    }

    return response.json()
  },

  /**
   * Publish menu plan (APPROVED → ACTIVE)
   */
  async publishPlan(planId: string, data: PublishActionInput, headers?: HeadersInit): Promise<ApiResponse<MenuPlanWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/publish`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to publish menu plan')
    }

    return response.json()
  },

  /**
   * Get menu plan analytics
   */
  async getAnalytics(planId: string, headers?: HeadersInit): Promise<ApiResponse<MenuPlanAnalytics>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/analytics`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch analytics')
    }

    return response.json()
  },
}

/**
 * Menu Assignment API Client
 */
export const assignmentApi = {
  /**
   * Get menu assignments with filters
   */
  async getAssignments(filters?: AssignmentFilters, headers?: HeadersInit): Promise<ApiResponse<MenuAssignmentWithPlan[]>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (filters?.planId) params.append('planId', filters.planId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.mealType) params.append('mealType', filters.mealType)

    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/assignments?${params.toString()}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch assignments')
    }

    return response.json()
  },

  /**
   * Get single assignment detail
   */
  async getAssignment(assignmentId: string, headers?: HeadersInit): Promise<ApiResponse<MenuAssignmentWithPlan>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/assignments/${assignmentId}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch assignment')
    }

    return response.json()
  },

  /**
   * Create new menu assignment
   */
  async createAssignment(data: CreateAssignmentInput, headers?: HeadersInit): Promise<ApiResponse<MenuAssignmentWithPlan>> {
    const baseUrl = getBaseUrl()
    const { planId, ...assignmentData } = data
    
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/assignments`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(assignmentData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create assignment')
    }

    return response.json()
  },

  /**
   * Update existing assignment
   */
  async updateAssignment(params: { assignmentId: string; planId: string; data: UpdateAssignmentInput }, headers?: HeadersInit): Promise<ApiResponse<MenuAssignmentWithPlan>> {
    const baseUrl = getBaseUrl()
    const { assignmentId, planId, data } = params
    
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/assignments/${assignmentId}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update assignment')
    }

    return response.json()
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId: string, planId: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu-planning/${planId}/assignments/${assignmentId}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete assignment')
    }

    return response.json()
  },
}
