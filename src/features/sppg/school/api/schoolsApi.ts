/**
 * @fileoverview Schools API Client - Full CRUD Operations
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API client patterns (Section 2a)
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { SchoolMaster, SchoolMasterWithRelations } from '../types'
import type { SchoolMasterInput, UpdateSchoolMasterInput } from '../schemas'

/**
 * API Response format
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  count?: number
  error?: string
  details?: unknown
}

/**
 * Query mode for fetching schools
 * - autocomplete: Minimal fields for dropdowns (id, name, code, type)
 * - full: All fields with relations (for management pages)
 * - standard: Common fields without relations (default)
 */
export type QueryMode = 'autocomplete' | 'full' | 'standard'

/**
 * Schools API Client
 * Centralized client for all school beneficiary operations
 * 
 * CRITICAL: This follows Section 2a enterprise pattern from copilot-instructions.md
 * - Uses getBaseUrl() for SSR support
 * - Uses getFetchOptions() for header forwarding
 * - All methods accept optional headers parameter
 * - Proper error handling with type safety
 * - Comprehensive JSDoc documentation
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await schoolsApi.getAll({ mode: 'full' })
 * 
 * // Server-side usage (SSR/RSC)
 * import { headers } from 'next/headers'
 * const headersList = await headers()
 * const result = await schoolsApi.getAll({ mode: 'full' }, headersList)
 * ```
 */
export const schoolsApi = {
  /**
   * Get all schools with optional filtering
   * 
   * @param options - Query options for filtering and mode selection
   * @param options.mode - Query mode: 'autocomplete' | 'full' | 'standard'
   * @param options.programId - Filter by specific program
   * @param options.isActive - Filter by active status
   * @param options.schoolType - Filter by school type (TK, SD, SMP, SMA, SMK, PAUD)
   * @param options.search - Search by school name, code, or principal name
   * @param headers - Optional headers for SSR (cookie forwarding)
   * 
   * @returns Promise with API response containing schools array
   * @throws Error if fetch fails or authentication required
   * 
   * @example
   * ```typescript
   * // Get all schools with full details
   * const result = await schoolsApi.getAll({ mode: 'full' })
   * 
   * // Get schools for autocomplete
   * const result = await schoolsApi.getAll({ mode: 'autocomplete' })
   * 
   * // Filter by program and school type
   * const result = await schoolsApi.getAll({
   *   mode: 'standard',
   *   programId: 'prog_123',
   *   schoolType: 'SD'
   * })
   * 
   * // Search schools
   * const result = await schoolsApi.getAll({
   *   mode: 'standard',
   *   search: 'SDN 01'
   * })
   * ```
   */
  async getAll(
    options: {
      mode?: QueryMode
      programId?: string
      isActive?: boolean
      schoolType?: string
      search?: string
    } = {},
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMaster[] | SchoolMasterWithRelations[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (options.mode) params.append('mode', options.mode)
    if (options.programId) params.append('programId', options.programId)
    if (options.isActive !== undefined) params.append('isActive', String(options.isActive))
    if (options.schoolType) params.append('schoolType', options.schoolType)
    if (options.search) params.append('search', options.search)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/schools?${queryString}`
      : `${baseUrl}/api/sppg/schools`
    
    const response = await fetch(url, {
      ...getFetchOptions(headers),
      cache: 'no-store', // Always fetch fresh data for management
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch schools')
    }
    
    return response.json()
  },

  /**
   * Get single school by ID with full details
   * 
   * @param id - School ID
   * @param headers - Optional headers for SSR
   * 
   * @returns Promise with API response containing school data
   * @throws Error if school not found or access denied
   * 
   * @example
   * ```typescript
   * const result = await schoolsApi.getById('school_123')
   * if (result.success && result.data) {
   *   console.log(result.data.schoolName)
   * }
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMasterWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/schools/${id}`, {
      ...getFetchOptions(headers),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch school')
    }
    
    return response.json()
  },

  /**
   * Create new school beneficiary
   * 
   * @param data - School creation data
   * @param headers - Optional headers for SSR
   * 
   * @returns Promise with API response containing created school
   * @throws Error if validation fails or program not found
   * 
   * @example
   * ```typescript
   * const newSchool = await schoolsApi.create({
   *   programId: 'prog_123',
   *   schoolName: 'SDN 01 Menteng',
   *   schoolCode: 'SD-001',
   *   schoolType: 'SD',
   *   schoolStatus: 'ACTIVE',
   *   principalName: 'Budi Santoso',
   *   contactPhone: '081234567890',
   *   schoolAddress: 'Jl. Menteng Raya No. 1',
   *   villageId: 'village_123',
   *   totalStudents: 500,
   *   targetStudents: 300,
   *   deliveryAddress: 'Jl. Menteng Raya No. 1',
   *   deliveryContact: '081234567890'
   * })
   * ```
   */
  async create(
    data: SchoolMasterInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMasterWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/schools`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create school')
    }
    
    return response.json()
  },

  /**
   * Update existing school
   * 
   * @param id - School ID to update
   * @param data - Partial school data to update
   * @param headers - Optional headers for SSR
   * 
   * @returns Promise with API response containing updated school
   * @throws Error if school not found or validation fails
   * 
   * @example
   * ```typescript
   * const updated = await schoolsApi.update('school_123', {
   *   totalStudents: 550,
   *   activeStudents: 320
   * })
   * ```
   */
  async update(
    id: string,
    data: UpdateSchoolMasterInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMasterWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/schools/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update school')
    }
    
    return response.json()
  },

  /**
   * Delete school (soft delete - sets isActive = false)
   * 
   * @param id - School ID to delete
   * @param headers - Optional headers for SSR
   * 
   * @returns Promise with API response
   * @throws Error if school not found or access denied
   * 
   * @example
   * ```typescript
   * await schoolsApi.delete('school_123')
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/schools/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete school')
    }
    
    return response.json()
  },
}
