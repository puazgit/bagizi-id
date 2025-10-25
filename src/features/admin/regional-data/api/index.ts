/**
 * @fileoverview Regional Data API Client
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type {
  Province,
  Regency,
  District,
  Village,
  ProvinceListItem,
  RegencyListItem,
  DistrictListItem,
  VillageListItem,
  CreateProvinceInput,
  UpdateProvinceInput,
  CreateRegencyInput,
  UpdateRegencyInput,
  CreateDistrictInput,
  UpdateDistrictInput,
  CreateVillageInput,
  UpdateVillageInput,
  RegionalFilters,
  PaginatedResponse,
  ApiResponse,
  RegionalStatistics,
  CascadeOption
} from '../types'

/**
 * Get base URL for API calls
 * Works in both client and server environments
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

/**
 * Get fetch options for SSR compatibility
 */
function getFetchOptions(headers?: HeadersInit): RequestInit {
  return {
    headers: {
      ...headers,
    },
  }
}

/**
 * Province API Client
 */
export const provinceApi = {
  /**
   * Get all provinces with pagination
   */
  async getAll(
    filters?: RegionalFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaginatedResponse<ProvinceListItem>>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/admin/regional/provinces?${queryString}`
      : `${baseUrl}/api/admin/regional/provinces`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch provinces')
    }
    
    return response.json()
  },

  /**
   * Get province by ID
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<Province>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/provinces/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch province')
    }
    
    return response.json()
  },

  /**
   * Create new province
   */
  async create(
    data: CreateProvinceInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Province>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/provinces`, {
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
      throw new Error(error.error || 'Failed to create province')
    }
    
    return response.json()
  },

  /**
   * Update province
   */
  async update(
    id: string,
    data: UpdateProvinceInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Province>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/provinces/${id}`, {
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
      throw new Error(error.error || 'Failed to update province')
    }
    
    return response.json()
  },

  /**
   * Delete province
   */
  async delete(id: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/provinces/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete province')
    }
    
    return response.json()
  },

  /**
   * Get provinces as cascade options
   */
  async getOptions(headers?: HeadersInit): Promise<ApiResponse<CascadeOption[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/provinces/options`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch province options')
    }
    
    return response.json()
  }
}

/**
 * Regency API Client
 */
export const regencyApi = {
  /**
   * Get all regencies with pagination
   */
  async getAll(
    filters?: RegionalFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaginatedResponse<RegencyListItem>>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.provinceId) params.append('provinceId', filters.provinceId)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/admin/regional/regencies?${queryString}`
      : `${baseUrl}/api/admin/regional/regencies`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch regencies')
    }
    
    return response.json()
  },

  /**
   * Get regency by ID
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<Regency>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/regencies/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch regency')
    }
    
    return response.json()
  },

  /**
   * Create new regency
   */
  async create(
    data: CreateRegencyInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Regency>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/regencies`, {
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
      throw new Error(error.error || 'Failed to create regency')
    }
    
    return response.json()
  },

  /**
   * Update regency
   */
  async update(
    id: string,
    data: UpdateRegencyInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Regency>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/regencies/${id}`, {
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
      throw new Error(error.error || 'Failed to update regency')
    }
    
    return response.json()
  },

  /**
   * Delete regency
   */
  async delete(id: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/regencies/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete regency')
    }
    
    return response.json()
  },

  /**
   * Get regencies by province as cascade options
   */
  async getByProvince(
    provinceId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<CascadeOption[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/provinces/${provinceId}/regencies`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch regencies')
    }
    
    return response.json()
  }
}

/**
 * District API Client
 */
export const districtApi = {
  /**
   * Get all districts with pagination
   */
  async getAll(
    filters?: RegionalFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaginatedResponse<DistrictListItem>>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.provinceId) params.append('provinceId', filters.provinceId)
    if (filters?.regencyId) params.append('regencyId', filters.regencyId)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/admin/regional/districts?${queryString}`
      : `${baseUrl}/api/admin/regional/districts`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch districts')
    }
    
    return response.json()
  },

  /**
   * Get district by ID
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<District>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/districts/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch district')
    }
    
    return response.json()
  },

  /**
   * Create new district
   */
  async create(
    data: CreateDistrictInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<District>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/districts`, {
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
      throw new Error(error.error || 'Failed to create district')
    }
    
    return response.json()
  },

  /**
   * Update district
   */
  async update(
    id: string,
    data: UpdateDistrictInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<District>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/districts/${id}`, {
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
      throw new Error(error.error || 'Failed to update district')
    }
    
    return response.json()
  },

  /**
   * Delete district
   */
  async delete(id: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/districts/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete district')
    }
    
    return response.json()
  },

  /**
   * Get districts by regency as cascade options
   */
  async getByRegency(
    regencyId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<CascadeOption[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/regencies/${regencyId}/districts`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch districts')
    }
    
    return response.json()
  }
}

/**
 * Village API Client
 */
export const villageApi = {
  /**
   * Get all villages with pagination
   */
  async getAll(
    filters?: RegionalFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaginatedResponse<VillageListItem>>> {
    const baseUrl = getBaseUrl()
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.provinceId) params.append('provinceId', filters.provinceId)
    if (filters?.regencyId) params.append('regencyId', filters.regencyId)
    if (filters?.districtId) params.append('districtId', filters.districtId)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/admin/regional/villages?${queryString}`
      : `${baseUrl}/api/admin/regional/villages`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch villages')
    }
    
    return response.json()
  },

  /**
   * Get village by ID
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<Village>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/villages/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch village')
    }
    
    return response.json()
  },

  /**
   * Create new village
   */
  async create(
    data: CreateVillageInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Village>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/villages`, {
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
      throw new Error(error.error || 'Failed to create village')
    }
    
    return response.json()
  },

  /**
   * Update village
   */
  async update(
    id: string,
    data: UpdateVillageInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Village>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/regional/villages/${id}`, {
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
      throw new Error(error.error || 'Failed to update village')
    }
    
    return response.json()
  },

  /**
   * Delete village
   */
  async delete(id: string, headers?: HeadersInit): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/villages/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete village')
    }
    
    return response.json()
  },

  /**
   * Get villages by district as cascade options
   */
  async getByDistrict(
    districtId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<CascadeOption[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/districts/${districtId}/villages`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch villages')
    }
    
    return response.json()
  }
}

/**
 * Regional Statistics API
 */
export const regionalStatsApi = {
  /**
   * Get regional data statistics
   */
  async getStatistics(headers?: HeadersInit): Promise<ApiResponse<RegionalStatistics>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/regional/statistics`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch statistics')
    }
    
    return response.json()
  }
}
