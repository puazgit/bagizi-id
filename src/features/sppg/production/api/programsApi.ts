/**
 * @fileoverview Programs API Client for Production Feature
 * @version Next.js 15.5.4 / TanStack Query v5
 * @description API client functions for fetching programs with menus
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { NutritionProgram, NutritionMenu } from '@prisma/client'

// ================================ TYPES ================================

export interface ProgramWithMenus extends NutritionProgram {
  menus: Array<
    Pick<
      NutritionMenu,
      | 'id'
      | 'menuName'
      | 'menuCode'
      | 'mealType'
      | 'servingSize'
      | 'costPerServing'
      | 'description'
    > & {
      nutritionCalc?: {
        totalCalories: number
        totalProtein: number
        totalCarbs: number
        totalFat: number
        totalFiber: number
      } | null
    }
  >
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    filters?: Record<string, string | number | Date | undefined>
    timestamp: string
    requestId: string
  }
}

// ================================ API CLIENT ================================

/**
 * Programs API Client
 * Handles all program-related API requests
 * Enterprise-grade with proper authentication handling
 */
export const programsApi = {
  /**
   * Get all programs with their menus
   * Used by ProductionForm to populate program and menu dropdowns
   * @param headers - Optional headers (for server-side auth forwarding)
   */
  async getAll(headers?: HeadersInit): Promise<ApiResponse<ProgramWithMenus[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program`, getFetchOptions(headers))

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch programs')
      } else {
        // HTML error page or other non-JSON response
        throw new Error(`Failed to fetch programs: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Get single program with menus by ID
   * @param id - Program ID
   * @param headers - Optional headers (for server-side auth forwarding)
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<ProgramWithMenus>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program/${id}`, getFetchOptions(headers))

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch program')
      } else {
        throw new Error(`Failed to fetch program: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Get programs with filters
   * @param filters - Optional filters for programs
   * @param headers - Optional headers (for server-side auth forwarding)
   */
  async getFiltered(
    filters?: {
      programType?: string
      targetGroup?: string
      status?: string
      search?: string
    },
    headers?: HeadersInit
  ): Promise<ApiResponse<ProgramWithMenus[]>> {
    const params = new URLSearchParams()

    if (filters?.programType) params.append('programType', filters.programType)
    if (filters?.targetGroup) params.append('targetGroup', filters.targetGroup)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)

    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/program${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, getFetchOptions(headers))

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch programs')
      } else {
        throw new Error(`Failed to fetch programs: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },
}

/**
 * Type guard to check if program has menus
 */
export function hasMenus(
  program: ProgramWithMenus
): program is ProgramWithMenus & { menus: NonNullable<ProgramWithMenus['menus']> } {
  return program.menus !== undefined && program.menus.length > 0
}

/**
 * Get active menus from programs
 * @param programs - Array of programs
 * @returns Flat array of all menus from all programs
 */
export function getAllMenus(programs: ProgramWithMenus[]) {
  return programs.flatMap((program) => program.menus || [])
}

/**
 * Find program by ID
 * @param programs - Array of programs
 * @param programId - Program ID to find
 */
export function findProgram(programs: ProgramWithMenus[], programId: string) {
  return programs.find((p) => p.id === programId)
}

/**
 * Get menus for specific program
 * @param programs - Array of programs
 * @param programId - Program ID
 */
export function getMenusForProgram(programs: ProgramWithMenus[], programId: string) {
  const program = findProgram(programs, programId)
  return program?.menus || []
}
