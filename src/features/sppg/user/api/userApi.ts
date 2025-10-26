/**
 * @fileoverview SPPG User Management API Client
 * @version Next.js 15.5.4 / Enterprise API Pattern
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Section 2a - Enterprise API Client Pattern
 * 
 * Centralized API client for SPPG user management operations.
 * All methods support SSR via optional headers parameter.
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await userApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await userApi.getAll(undefined, headers())
 * ```
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  UserListItem,
  UserDetail,
  UserFilters,
  UserStatistics,
} from '../types'
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  ResetPasswordInput,
} from '../schemas'

/**
 * SPPG User API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const userApi = {
  /**
   * Fetch all users with optional filtering and pagination
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing user list and pagination
   */
  async getAll(
    filters?: UserFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserListItem[]>> {
    try {
      const baseUrl = getBaseUrl()
      
      // Build query string
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.userRole) params.append('userRole', filters.userRole)
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      const queryString = params.toString()
      const url = queryString 
        ? `${baseUrl}/api/sppg/users?${queryString}`
        : `${baseUrl}/api/sppg/users`
      
      const response = await fetch(url, getFetchOptions(headers))
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch users')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.getAll] Error:', error)
      throw error
    }
  },

  /**
   * Fetch single user by ID
   * @param id - User ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing user detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users/${id}`
      
      const response = await fetch(url, getFetchOptions(headers))
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch user')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.getById] Error:', error)
      throw error
    }
  },

  /**
   * Create new user
   * @param data - User creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created user
   */
  async create(
    data: CreateUserInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users`
      
      const response = await fetch(url, {
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
        throw new Error(error.error || 'Failed to create user')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.create] Error:', error)
      throw error
    }
  },

  /**
   * Update existing user
   * @param id - User ID
   * @param data - User update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated user
   */
  async update(
    id: string,
    data: UpdateUserInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users/${id}`
      
      const response = await fetch(url, {
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
        throw new Error(error.error || 'Failed to update user')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.update] Error:', error)
      throw error
    }
  },

  /**
   * Delete user
   * @param id - User ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users/${id}`
      
      const response = await fetch(url, {
        ...getFetchOptions(headers),
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.delete] Error:', error)
      throw error
    }
  },

  /**
   * Update user password (self-service)
   * @param id - User ID
   * @param data - Password update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async updatePassword(
    id: string,
    data: UpdatePasswordInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users/${id}/password`
      
      const response = await fetch(url, {
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
        throw new Error(error.error || 'Failed to update password')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.updatePassword] Error:', error)
      throw error
    }
  },

  /**
   * Reset user password (admin only)
   * @param id - User ID
   * @param data - Password reset data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async resetPassword(
    id: string,
    data: ResetPasswordInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users/${id}/reset-password`
      
      const response = await fetch(url, {
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
        throw new Error(error.error || 'Failed to reset password')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.resetPassword] Error:', error)
      throw error
    }
  },

  /**
   * Update user status (activate/deactivate)
   * @param id - User ID
   * @param isActive - New status
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async updateStatus(
    id: string,
    isActive: boolean,
    headers?: HeadersInit
  ): Promise<ApiResponse<UserDetail>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users/${id}/status`
      
      const response = await fetch(url, {
        ...getFetchOptions(headers),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ isActive }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.updateStatus] Error:', error)
      throw error
    }
  },

  /**
   * Fetch user statistics
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing statistics
   */
  async getStatistics(
    headers?: HeadersInit
  ): Promise<ApiResponse<UserStatistics>> {
    try {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/users/statistics`
      
      const response = await fetch(url, getFetchOptions(headers))
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch statistics')
      }
      
      return response.json()
    } catch (error) {
      console.error('[userApi.getStatistics] Error:', error)
      throw error
    }
  },
}
