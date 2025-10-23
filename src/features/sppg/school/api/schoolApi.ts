/**
 * @fileoverview School Beneficiary API Client - Centralized API Methods
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/SCHOOL_API_ENDPOINTS_UPDATE_COMPLETE.md}
 * @see {@link /docs/copilot-instructions.md} Section 2a - Enterprise API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  SchoolMaster,
  SchoolMasterWithRelations,
  SchoolInput,
  SchoolUpdate,
  SchoolFilter,
} from '../types'

/**
 * School Beneficiary API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await schoolApi.getAll({ schoolType: 'SD' })
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await schoolApi.getAll({ schoolType: 'SD' }, headers())
 * ```
 */
export const schoolApi = {
  /**
   * Fetch all schools with comprehensive filtering and pagination
   * 
   * @param filters - Optional filter parameters (26 options available)
   * @param headers - Optional headers for SSR
   * @returns Promise with paginated API response
   * 
   * @example
   * ```typescript
   * // Basic list
   * const schools = await schoolApi.getAll()
   * 
   * // Filtered by type and region
   * const sdSchools = await schoolApi.getAll({
   *   schoolType: 'SD',
   *   provinceId: 'xxx',
   *   isActive: true
   * })
   * 
   * // With pagination and sorting
   * const pagedSchools = await schoolApi.getAll({
   *   page: 2,
   *   limit: 20,
   *   sortBy: 'totalStudents',
   *   sortOrder: 'desc'
   * })
   * 
   * // Contract expiring alert
   * const expiringContracts = await schoolApi.getAll({
   *   hasContract: true,
   *   contractExpiring: true
   * })
   * 
   * // Performance filtering
   * const highPerformers = await schoolApi.getAll({
   *   minAttendanceRate: 90,
   *   minSatisfactionScore: 4.0
   * })
   * ```
   */
  async getAll(
    filters?: SchoolFilter,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMaster[] | SchoolMasterWithRelations[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string from filters
    const params = new URLSearchParams()
    
    if (filters) {
      // Mode selection
      if (filters.mode) params.append('mode', filters.mode)
      
      // Program & Status
      if (filters.programId) params.append('programId', filters.programId)
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive))
      
      // School Classification
      if (filters.schoolType) params.append('schoolType', filters.schoolType)
      if (filters.schoolStatus) params.append('schoolStatus', filters.schoolStatus)
      
      // Regional Filters
      if (filters.provinceId) params.append('provinceId', filters.provinceId)
      if (filters.regencyId) params.append('regencyId', filters.regencyId)
      if (filters.districtId) params.append('districtId', filters.districtId)
      if (filters.villageId) params.append('villageId', filters.villageId)
      if (filters.urbanRural) params.append('urbanRural', filters.urbanRural)
      
      // Student Range
      if (filters.minStudents !== undefined) params.append('minStudents', String(filters.minStudents))
      if (filters.maxStudents !== undefined) params.append('maxStudents', String(filters.maxStudents))
      
      // Contract Filters
      if (filters.hasContract !== undefined) params.append('hasContract', String(filters.hasContract))
      if (filters.contractExpiring !== undefined) params.append('contractExpiring', String(filters.contractExpiring))
      
      // Performance Filters
      if (filters.minAttendanceRate !== undefined) params.append('minAttendanceRate', String(filters.minAttendanceRate))
      if (filters.minSatisfactionScore !== undefined) params.append('minSatisfactionScore', String(filters.minSatisfactionScore))
      
      // Facility Filters
      if (filters.hasKitchen !== undefined) params.append('hasKitchen', String(filters.hasKitchen))
      if (filters.hasRefrigerator !== undefined) params.append('hasRefrigerator', String(filters.hasRefrigerator))
      if (filters.hasDiningArea !== undefined) params.append('hasDiningArea', String(filters.hasDiningArea))
      
      // Search
      if (filters.search) params.append('search', filters.search)
      
      // Pagination
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.limit !== undefined) params.append('limit', String(filters.limit))
      
      // Sorting
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
    }
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/schools?${queryString}`
      : `${baseUrl}/api/sppg/schools`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch schools')
    }
    
    return response.json()
  },

  /**
   * Fetch schools for autocomplete/dropdown (minimal fields)
   * 
   * @param search - Optional search term
   * @param headers - Optional headers for SSR
   * @returns Promise with minimal school data
   * 
   * @example
   * ```typescript
   * // For dropdown/autocomplete
   * const options = await schoolApi.getAutocomplete('SDN')
   * // Returns: [{ id, schoolName, schoolCode, schoolType, totalStudents }]
   * ```
   */
  async getAutocomplete(
    search?: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Array<Pick<SchoolMaster, 'id' | 'schoolName' | 'schoolCode' | 'schoolType' | 'totalStudents'>>>> {
    const baseUrl = getBaseUrl()
    
    const params = new URLSearchParams()
    params.append('mode', 'autocomplete')
    if (search) params.append('search', search)
    
    const url = `${baseUrl}/api/sppg/schools?${params.toString()}`
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch schools for autocomplete')
    }
    
    return response.json()
  },

  /**
   * Fetch single school by ID with all 82 fields and relations
   * 
   * @param id - School ID
   * @param headers - Optional headers for SSR
   * @returns Promise with complete school data
   * 
   * @example
   * ```typescript
   * const school = await schoolApi.getById('cm5abc123')
   * // Returns: All 82 fields + flat relations (sppg, program, province, regency, district, village)
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMasterWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/schools/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch school')
    }
    
    return response.json()
  },

  /**
   * Create new school with comprehensive validation
   * 
   * @param data - School creation data (82 fields)
   * @param headers - Optional headers for SSR
   * @returns Promise with created school data
   * 
   * @example
   * ```typescript
   * const newSchool = await schoolApi.create({
   *   programId: 'xxx',
   *   schoolName: 'SDN 01 Menteng',
   *   schoolCode: 'SD-001',
   *   npsn: '20104623',
   *   schoolType: 'SD',
   *   schoolStatus: 'NEGERI',
   *   principalName: 'Budi Santoso',
   *   contactPhone: '081234567890',
   *   schoolAddress: 'Jl. Menteng Raya No. 1',
   *   villageId: 'xxx',  // Auto-fills province, regency, district
   *   urbanRural: 'URBAN',
   *   // ... 72 more fields
   * })
   * ```
   */
  async create(
    data: SchoolInput,
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
   * Full update school (replaces all fields)
   * 
   * @param id - School ID
   * @param data - Complete school data (all 82 fields)
   * @param headers - Optional headers for SSR
   * @returns Promise with updated school data
   * 
   * @example
   * ```typescript
   * const updated = await schoolApi.update('cm5abc123', {
   *   programId: 'xxx',
   *   schoolName: 'SDN 01 Menteng (Updated)',
   *   // ... all other 80 fields
   * })
   * ```
   */
  async update(
    id: string,
    data: SchoolInput,
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
   * Partial update school (only provided fields) ⭐ EFFICIENT!
   * 
   * @param id - School ID
   * @param data - Partial school data (any fields)
   * @param headers - Optional headers for SSR
   * @returns Promise with updated school data
   * 
   * @example
   * ```typescript
   * // Update only student counts
   * await schoolApi.partialUpdate('cm5abc123', {
   *   totalStudents: 150,
   *   activeStudents: 145,
   *   maleStudents: 75,
   *   femaleStudents: 75
   * })
   * 
   * // Update only performance metrics
   * await schoolApi.partialUpdate('cm5abc123', {
   *   attendanceRate: 95.5,
   *   participationRate: 92.3,
   *   satisfactionScore: 4.5
   * })
   * 
   * // Update only contact info
   * await schoolApi.partialUpdate('cm5abc123', {
   *   contactPhone: '081234567890',
   *   contactEmail: 'new@example.com'
   * })
   * ```
   */
  async partialUpdate(
    id: string,
    data: Partial<SchoolUpdate>,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMasterWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/schools/${id}`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
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
   * Soft delete school (sets isActive = false)
   * 
   * @param id - School ID
   * @param headers - Optional headers for SSR
   * @returns Promise with success response
   * 
   * @example
   * ```typescript
   * await schoolApi.softDelete('cm5abc123')
   * // School deactivated, can be reactivated later
   * ```
   */
  async softDelete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<{ id: string; schoolName: string; schoolCode: string; isActive: boolean; suspendedAt: Date; suspensionReason: string }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/schools/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete school')
    }
    
    return response.json()
  },

  /**
   * Hard delete school (permanent removal) - ADMIN ONLY
   * Requires: SPPG_KEPALA | SPPG_ADMIN | PLATFORM_SUPERADMIN
   * 
   * @param id - School ID
   * @param headers - Optional headers for SSR
   * @returns Promise with success response
   * 
   * @example
   * ```typescript
   * // Only for admins
   * await schoolApi.hardDelete('cm5abc123')
   * // School permanently removed from database
   * ```
   */
  async hardDelete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<{ deletedId: string }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/schools/${id}?permanent=true`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to permanently delete school')
    }
    
    return response.json()
  },

  /**
   * Reactivate suspended school
   * 
   * @param id - School ID to reactivate
   * @param headers - Optional headers for SSR
   * @returns Promise with reactivated school data
   * 
   * @example
   * ```typescript
   * const result = await schoolApi.reactivate('school-id')
   * ```
   */
  async reactivate(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMasterWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/schools/${id}`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        suspendedAt: null,
        suspensionReason: null,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reactivate school')
    }

    return response.json()
  },

  /**
   * Get schools grouped by type with counts
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with school type statistics
   * 
   * @example
   * ```typescript
   * const stats = await schoolApi.getStatsByType({ provinceId: 'xxx' })
   * // Returns: { SD: 45, SMP: 23, SMA: 12, ... }
   * ```
   */
  async getStatsByType(
    filters?: Omit<SchoolFilter, 'schoolType'>,
    headers?: HeadersInit
  ): Promise<ApiResponse<Record<string, number>>> {
    // Fetch all schools with filters
    const response = await this.getAll(
      { ...filters, mode: 'standard' },
      headers
    )
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch school statistics')
    }
    
    // Group by type
    const stats: Record<string, number> = {}
    response.data.forEach((school) => {
      const type = school.schoolType
      stats[type] = (stats[type] || 0) + 1
    })
    
    return {
      success: true,
      data: stats,
    }
  },

  /**
   * Get schools with expiring contracts (within 30 days)
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with schools with expiring contracts
   * 
   * @example
   * ```typescript
   * const expiring = await schoolApi.getExpiringContracts()
   * // Returns schools with contracts expiring in next 30 days
   * ```
   */
  async getExpiringContracts(
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMaster[]>> {
    return this.getAll(
      {
        hasContract: true,
        contractExpiring: true,
        sortBy: 'contractEndDate',
        sortOrder: 'asc',
      },
      headers
    )
  },

  /**
   * Get high-performing schools (attendance ≥90%, satisfaction ≥4.0)
   * 
   * @param filters - Optional additional filters
   * @param headers - Optional headers for SSR
   * @returns Promise with high-performing schools
   * 
   * @example
   * ```typescript
   * const topSchools = await schoolApi.getHighPerformers({ schoolType: 'SD' })
   * // Returns SD schools with ≥90% attendance and ≥4.0 satisfaction
   * ```
   */
  async getHighPerformers(
    filters?: Omit<SchoolFilter, 'minAttendanceRate' | 'minSatisfactionScore'>,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMaster[]>> {
    return this.getAll(
      {
        ...filters,
        minAttendanceRate: 90,
        minSatisfactionScore: 4.0,
        sortBy: 'satisfactionScore',
        sortOrder: 'desc',
      },
      headers
    )
  },

  /**
   * Search schools by name, code, NPSN, or principal
   * 
   * @param query - Search query string
   * @param filters - Optional additional filters
   * @param headers - Optional headers for SSR
   * @returns Promise with matching schools
   * 
   * @example
   * ```typescript
   * const results = await schoolApi.search('SDN Menteng')
   * // Returns schools matching query in name, code, NPSN, or principal
   * ```
   */
  async search(
    query: string,
    filters?: Omit<SchoolFilter, 'search'>,
    headers?: HeadersInit
  ): Promise<ApiResponse<SchoolMaster[]>> {
    return this.getAll(
      {
        ...filters,
        search: query,
      },
      headers
    )
  },
}
