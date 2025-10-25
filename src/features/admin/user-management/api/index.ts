/**
 * @fileoverview User Management API Client
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type {
  UserDetail,
  UserFilters,
  UserStatistics,
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
  ResetPasswordInput,
  PaginatedUsers,
  ApiResponse,
  UserActivityLog
} from '../types'

/**
 * Get base URL for API calls (SSR compatible)
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return `http://localhost:${process.env.PORT || 3000}`
}

/**
 * Get fetch options with optional headers for SSR
 */
function getFetchOptions(headers?: HeadersInit): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }
}

/**
 * User Management API Client
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const users = await userApi.getAll({ page: 1, limit: 20 })
 * 
 * // Server-side usage (SSR/RSC)
 * const users = await userApi.getAll({ page: 1 }, headers())
 * ```
 */
export const userApi = {
  /**
   * Get paginated list of users with filters
   * @param filters - Filter and pagination parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with paginated users
   */
  async getAll(
    filters?: UserFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaginatedUsers>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.userRole) params.append('userRole', filters.userRole)
    if (filters?.userType) params.append('userType', filters.userType)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.sppgId) params.append('sppgId', filters.sppgId)
    if (filters?.hasEmailVerified !== undefined) params.append('hasEmailVerified', String(filters.hasEmailVerified))
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/admin/users?${queryString}`
      : `${baseUrl}/api/admin/users`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch users')
    }
    
    const result = await response.json()
    
    // Transform response to match PaginatedUsers structure
    return {
      success: result.success,
      data: {
        data: result.data,
        pagination: result.pagination
      }
    }
  },

  /**
   * Get single user by ID
   * @param id - User ID
   * @param headers - Optional headers for SSR
   * @returns Promise with user detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/${id}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch user')
    }
    
    return response.json()
  },

  /**
   * Create new user
   * @param data - User creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with created user
   */
  async create(
    data: CreateUserInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create user')
    }
    
    return response.json()
  },

  /**
   * Update existing user
   * @param id - User ID
   * @param data - User update data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated user
   */
  async update(
    id: string,
    data: UpdateUserInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update user')
    }
    
    return response.json()
  },

  /**
   * Delete user
   * @param id - User ID
   * @param headers - Optional headers for SSR
   * @returns Promise with success response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete user')
    }
    
    return response.json()
  },

  /**
   * Assign role to user
   * @param id - User ID
   * @param data - Role assignment data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated user
   */
  async assignRole(
    id: string,
    data: AssignRoleInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/${id}/assign-role`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to assign role')
    }
    
    return response.json()
  },

  /**
   * Reset user password
   * @param id - User ID
   * @param data - Password reset data
   * @param headers - Optional headers for SSR
   * @returns Promise with success response
   */
  async resetPassword(
    id: string,
    data: ResetPasswordInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<{ temporaryPassword?: string }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/${id}/reset-password`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reset password')
    }
    
    return response.json()
  },

  /**
   * Get user statistics for dashboard
   * @param headers - Optional headers for SSR
   * @returns Promise with user statistics
   */
  async getStatistics(
    headers?: HeadersInit
  ): Promise<ApiResponse<UserStatistics>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/statistics`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch statistics')
    }
    
    return response.json()
  },

  /**
   * Get user activity logs
   * @param id - User ID
   * @param limit - Number of logs to fetch
   * @param headers - Optional headers for SSR
   * @returns Promise with activity logs
   */
  async getActivityLogs(
    id: string,
    limit: number = 50,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserActivityLog[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/admin/users/${id}/activity?limit=${limit}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch activity logs')
    }
    
    return response.json()
  },

  /**
   * Verify user email manually
   * @param id - User ID
   * @param headers - Optional headers for SSR
   * @returns Promise with updated user
   */
  async verifyEmail(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/${id}/verify-email`, {
      ...getFetchOptions(headers),
      method: 'POST'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to verify email')
    }
    
    return response.json()
  },

  /**
   * Unlock locked user account
   * @param id - User ID
   * @param headers - Optional headers for SSR
   * @returns Promise with updated user
   */
  async unlockAccount(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/users/${id}/unlock`, {
      ...getFetchOptions(headers),
      method: 'POST'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to unlock account')
    }
    
    return response.json()
  }
}
