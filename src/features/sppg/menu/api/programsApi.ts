/**
 * @fileoverview Programs API client for nutrition programs
 * @version Next.js 15.5.4 / Enterprise-grade API layer
 * @author Bagizi-ID Development Team
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import { ApiResponse } from '../types'

/**
 * Program type matching NutritionProgram model from API responses
 * Aligned with Prisma schema and actual API endpoint
 */
export interface Program {
  id: string
  sppgId?: string
  name: string
  description?: string | null
  programCode: string
  programType?: string
  targetGroup?: string
  
  // Nutrition goals
  calorieTarget?: number | null
  proteinTarget?: number | null
  carbTarget?: number | null
  fatTarget?: number | null
  fiberTarget?: number | null
  
  // Schedule
  startDate?: string | null
  endDate?: string | null
  feedingDays?: number[]
  mealsPerDay?: number
  
  // Budget & Targets
  totalBudget?: number | null
  budgetPerMeal?: number | null
  targetRecipients: number
  currentRecipients?: number
  
  // Location
  implementationArea?: string
  partnerSchools?: string[]
  
  // Status & Timestamps
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface ProgramsFilters {
  status?: string
  search?: string
}

/**
 * Programs API client
 */
export const programsApi = {
  /**
   * Get all programs for current SPPG
   */
  async getAll(filters?: ProgramsFilters, headers?: HeadersInit): Promise<ApiResponse<Program[]>> {
    const params = new URLSearchParams()
    
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/program${params.toString() ? `?${params.toString()}` : ''}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      throw new Error('Failed to fetch programs')
    }

    return response.json()
  },

  /**
   * Get program by ID
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<Program>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program/${id}`, getFetchOptions(headers))
    
    if (!response.ok) {
      throw new Error('Failed to fetch program')
    }

    return response.json()
  },

  /**
   * Create new program
   */
  async create(data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>, headers?: HeadersInit): Promise<ApiResponse<Program>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create program')
    }

    return response.json()
  },

  /**
   * Update program
   */
  async update(id: string, data: Partial<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>, headers?: HeadersInit): Promise<ApiResponse<Program>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update program')
    }

    return response.json()
  },

  /**
   * Delete program
   */
  async delete(id: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete program')
    }

    return response.json()
  }
}