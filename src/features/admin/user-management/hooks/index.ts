/**
 * @fileoverview User Management Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userApi } from '../api'
import type {
  UserDetail,
  UserFilters,
  UserStatistics,
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
  ResetPasswordInput,
  PaginatedUsers,
  UserActivityLog
} from '../types'

/**
 * Query keys for user management
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  statistics: () => [...userKeys.all, 'statistics'] as const,
  activity: (id: string) => [...userKeys.all, 'activity', id] as const
}

/**
 * Hook to fetch paginated users list
 * @param filters - Filter and pagination parameters
 * @returns Query result with paginated users
 */
export function useUsers(filters?: UserFilters): UseQueryResult<PaginatedUsers> {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const result = await userApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch users')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

/**
 * Hook to fetch single user detail
 * @param id - User ID
 * @param enabled - Whether to enable the query
 * @returns Query result with user detail
 */
export function useUser(id: string, enabled: boolean = true): UseQueryResult<UserDetail> {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const result = await userApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch user')
      }
      
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2
  })
}

/**
 * Hook to fetch user statistics
 * @returns Query result with user statistics
 */
export function useUserStatistics(): UseQueryResult<UserStatistics> {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: async () => {
      const result = await userApi.getStatistics()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch statistics')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

/**
 * Hook to fetch user activity logs
 * @param id - User ID
 * @param limit - Number of logs to fetch
 * @returns Query result with activity logs
 */
export function useUserActivity(id: string, limit: number = 50): UseQueryResult<UserActivityLog[]> {
  return useQuery({
    queryKey: userKeys.activity(id),
    queryFn: async () => {
      const result = await userApi.getActivityLogs(id, limit)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch activity logs')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  })
}

/**
 * Hook to create new user
 * @returns Mutation result
 */
export function useCreateUser(): UseMutationResult<UserDetail, Error, CreateUserInput> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const result = await userApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create user')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      toast.success('User created successfully', {
        description: `${data.name} has been added to the system`
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create user', {
        description: error.message
      })
    }
  })
}

/**
 * Hook to update existing user
 * @returns Mutation result
 */
export function useUpdateUser(): UseMutationResult<UserDetail, Error, { id: string; data: UpdateUserInput }> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const result = await userApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update user')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update user detail in cache
      queryClient.setQueryData(userKeys.detail(variables.id), data)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      toast.success('User updated successfully', {
        description: `${data.name}'s information has been updated`
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update user', {
        description: error.message
      })
    }
  })
}

/**
 * Hook to delete user
 * @returns Mutation result
 */
export function useDeleteUser(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await userApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user')
      }
    },
    onSuccess: (_, id) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(id) })
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      toast.success('User deleted successfully', {
        description: 'The user has been removed from the system'
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete user', {
        description: error.message
      })
    }
  })
}

/**
 * Hook to assign role to user
 * @returns Mutation result
 */
export function useAssignRole(): UseMutationResult<UserDetail, Error, { id: string; data: AssignRoleInput }> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssignRoleInput }) => {
      const result = await userApi.assignRole(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to assign role')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update user detail in cache
      queryClient.setQueryData(userKeys.detail(variables.id), data)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      toast.success('Role assigned successfully', {
        description: `${data.name}'s role has been changed to ${data.userRole}`
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to assign role', {
        description: error.message
      })
    }
  })
}

/**
 * Hook to reset user password
 * @returns Mutation result
 */
export function useResetPassword(): UseMutationResult<
  { temporaryPassword?: string },
  Error,
  { id: string; data: ResetPasswordInput }
> {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResetPasswordInput }) => {
      const result = await userApi.resetPassword(id, data)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset password')
      }
      
      return result.data || {}
    },
    onSuccess: (data) => {
      if (data.temporaryPassword) {
        toast.success('Password reset successfully', {
          description: `Temporary password: ${data.temporaryPassword}`,
          duration: 10000
        })
      } else {
        toast.success('Password reset successfully', {
          description: 'User will receive password reset instructions via email'
        })
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to reset password', {
        description: error.message
      })
    }
  })
}

/**
 * Hook to verify user email
 * @returns Mutation result
 */
export function useVerifyEmail(): UseMutationResult<UserDetail, Error, string> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await userApi.verifyEmail(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to verify email')
      }
      
      return result.data
    },
    onSuccess: (data, id) => {
      // Update user detail in cache
      queryClient.setQueryData(userKeys.detail(id), data)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      toast.success('Email verified successfully', {
        description: `${data.name}'s email has been verified`
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to verify email', {
        description: error.message
      })
    }
  })
}

/**
 * Hook to unlock user account
 * @returns Mutation result
 */
export function useUnlockAccount(): UseMutationResult<UserDetail, Error, string> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await userApi.unlockAccount(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to unlock account')
      }
      
      return result.data
    },
    onSuccess: (data, id) => {
      // Update user detail in cache
      queryClient.setQueryData(userKeys.detail(id), data)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      toast.success('Account unlocked successfully', {
        description: `${data.name} can now login again`
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to unlock account', {
        description: error.message
      })
    }
  })
}
