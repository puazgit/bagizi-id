/**
 * @fileoverview Programs API client for nutrition programs
 * @version Next.js 15.5.4 / Enterprise-grade API layer
 * @author Bagizi-ID Development Team
 */

import { ApiResponse } from '../types'

/**
 * Simple Program type for API responses
 */
export interface Program {
  id: string
  sppgId: string
  programName: string
  description?: string | null
  targetBeneficiaries: number
  startDate?: string | null
  endDate?: string | null
  status: string
  createdAt: string
  updatedAt: string
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
  async getAll(filters?: ProgramsFilters): Promise<ApiResponse<Program[]>> {
    const params = new URLSearchParams()
    
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    const url = `/api/sppg/programs${params.toString() ? `?${params.toString()}` : ''}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch programs')
    }

    return response.json()
  },

  /**
   * Get program by ID
   */
  async getById(id: string): Promise<ApiResponse<Program>> {
    const response = await fetch(`/api/sppg/programs/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch program')
    }

    return response.json()
  },

  /**
   * Create new program
   */
  async create(data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Program>> {
    const response = await fetch('/api/sppg/programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async update(id: string, data: Partial<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Program>> {
    const response = await fetch(`/api/sppg/programs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`/api/sppg/programs/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete program')
    }

    return response.json()
  }
}