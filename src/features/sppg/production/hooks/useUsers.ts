/**
 * @fileoverview Users TanStack Query Hooks
 * @version TanStack Query v5 / Next.js 15.5.4
 * @description React hooks for fetching users data with caching
 */

'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { usersApi, type UserData } from '../api/usersApi'
import type { UserRole } from '@prisma/client'

// ================================ QUERY HOOKS ================================

/**
 * Hook to fetch all users for SPPG
 * @param role - Optional role filter
 * 
 * Features:
 * - Auto refetch on window focus
 * - 5 minute stale time
 * - Cached across components
 * 
 * @example
 * ```tsx
 * function ProductionPage() {
 *   const { data: users, isLoading } = useUsers()
 *   
 *   return <ProductionForm users={users} />
 * }
 * ```
 */
export function useUsers(role?: UserRole | string): UseQueryResult<UserData[], Error> {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const response = await usersApi.getAll(role)
      return response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

/**
 * Hook to fetch kitchen staff specifically
 * Convenience wrapper for ProductionForm chef selection
 * 
 * @example
 * ```tsx
 * function ChefSelector() {
 *   const { data: kitchenStaff, isLoading } = useKitchenStaff()
 *   
 *   return (
 *     <Select>
 *       {kitchenStaff?.map(chef => (
 *         <SelectItem key={chef.id} value={chef.id}>
 *           {chef.name}
 *         </SelectItem>
 *       ))}
 *     </Select>
 *   )
 * }
 * ```
 */
export function useKitchenStaff(): UseQueryResult<UserData[], Error> {
  return useQuery({
    queryKey: ['users', 'SPPG_STAFF_DAPUR'],
    queryFn: async () => {
      const response = await usersApi.getKitchenStaff()
      return response.data || []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch users with filters
 * @param options - Filter options
 * 
 * @example
 * ```tsx
 * function FilteredUsers() {
 *   const { data: users } = useUsersFiltered({
 *     role: 'SPPG_AHLI_GIZI',
 *     status: 'active'
 *   })
 *   
 *   return <UsersList users={users} />
 * }
 * ```
 */
export function useUsersFiltered(options?: {
  role?: UserRole | string
  search?: string
  status?: 'active' | 'inactive'
}): UseQueryResult<UserData[], Error> {
  return useQuery({
    queryKey: ['users', 'filtered', options],
    queryFn: async () => {
      const response = await usersApi.getFiltered(options)
      return response.data || []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!options,
  })
}

/**
 * Hook to fetch single user by ID
 * @param userId - User ID to fetch
 * @param enabled - Enable/disable query (default: true when userId exists)
 * 
 * @example
 * ```tsx
 * function UserProfile({ id }: { id: string }) {
 *   const { data: user, isLoading } = useUser(id)
 *   
 *   return <div>{user?.name}</div>
 * }
 * ```
 */
export function useUser(userId: string, enabled = true): UseQueryResult<UserData, Error> {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await usersApi.getById(userId)
      if (!response.data) throw new Error('User not found')
      return response.data
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// ================================ HELPER HOOKS ================================

/**
 * Hook to get active users only
 * @param role - Optional role filter
 */
export function useActiveUsers(role?: UserRole | string): UseQueryResult<UserData[], Error> {
  return useQuery({
    queryKey: ['users', 'active', role],
    queryFn: async () => {
      const response = await usersApi.getFiltered({ role, status: 'active' })
      return response.data || []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get users count
 * @param role - Optional role filter
 */
export function useUsersCount(role?: UserRole | string): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ['users', 'count', role],
    queryFn: async () => {
      const response = await usersApi.getAll(role)
      return response.data?.length || 0
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get available chef options
 * Returns kitchen staff formatted for dropdown
 */
export function useChefOptions(): UseQueryResult<
  Array<{ value: string; label: string }>,
  Error
> {
  return useQuery({
    queryKey: ['users', 'chef-options'],
    queryFn: async () => {
      const response = await usersApi.getKitchenStaff()
      const users = response.data || []
      return users.map((user) => ({
        value: user.id,
        label: user.jobTitle ? `${user.name} (${user.jobTitle})` : user.name,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}
