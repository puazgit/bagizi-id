/**
 * @fileoverview School Beneficiary React Hooks - TanStack Query Integration
 * @version Next.js 15.5.4 / TanStack Query v5 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/SCHOOL_API_CLIENT_IMPLEMENTATION_COMPLETE.md}
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { schoolApi } from '../api'
import type {
  SchoolMaster,
  SchoolMasterWithRelations,
  SchoolInput,
  SchoolUpdate,
  SchoolFilter,
} from '../types'
import { toast } from 'sonner'

// Type for pagination data
interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// Type for schools list response
interface SchoolsListResponse {
  schools: SchoolMaster[]
  pagination?: PaginationMeta
}

// Type for autocomplete/minimal school data
interface SchoolAutocompleteOption {
  id: string
  schoolName: string
  schoolCode: string | null
  schoolType: string
  totalStudents: number
}

/**
 * Query key factory for school queries
 * Centralized query key management for cache invalidation
 */
export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  list: (filters?: SchoolFilter) => [...schoolKeys.lists(), filters] as const,
  details: () => [...schoolKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
  autocomplete: (search?: string) => [...schoolKeys.all, 'autocomplete', search] as const,
  stats: () => [...schoolKeys.all, 'stats'] as const,
  statsByType: (filters?: SchoolFilter) => [...schoolKeys.stats(), 'byType', filters] as const,
  expiringContracts: () => [...schoolKeys.all, 'expiringContracts'] as const,
  highPerformers: (filters?: SchoolFilter) => [...schoolKeys.all, 'highPerformers', filters] as const,
}

/**
 * Hook to fetch list of schools with comprehensive filtering
 * 
 * @param filters - Optional filter parameters (26 options)
 * @param options - TanStack Query options
 * @returns Query result with schools list and pagination
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { data, isLoading } = useSchools()
 * 
 * // With filters
 * const { data } = useSchools({
 *   schoolType: 'SD',
 *   provinceId: 'xxx',
 *   minStudents: 100,
 *   page: 1,
 *   limit: 20
 * })
 * 
 * // With custom query options
 * const { data } = useSchools(
 *   { schoolType: 'SD' },
 *   { staleTime: 10 * 60 * 1000 } // 10 minutes
 * )
 * ```
 */
export function useSchools(
  filters?: SchoolFilter,
  options?: Omit<UseQueryOptions<SchoolsListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: schoolKeys.list(filters),
    queryFn: async () => {
      const result = await schoolApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch schools')
      }
      
      return {
        schools: result.data,
        pagination: (result as unknown as { pagination?: PaginationMeta }).pagination
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Hook to fetch single school by ID with all relations
 * 
 * @param id - School ID
 * @param options - TanStack Query options
 * @returns Query result with complete school data
 * 
 * @example
 * ```typescript
 * const { data: school, isLoading } = useSchool('cm5abc123')
 * 
 * // With enabled condition
 * const { data: school } = useSchool(schoolId, {
 *   enabled: !!schoolId
 * })
 * ```
 */
export function useSchool(
  id: string,
  options?: Omit<UseQueryOptions<SchoolMasterWithRelations>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: async () => {
      const result = await schoolApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch school')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to fetch schools for autocomplete/dropdown (minimal fields)
 * 
 * @param search - Optional search term
 * @param options - TanStack Query options
 * @returns Query result with minimal school data
 * 
 * @example
 * ```typescript
 * const { data: options } = useSchoolAutocomplete('SDN')
 * // Returns: [{ id, schoolName, schoolCode, schoolType, totalStudents }]
 * ```
 */
export function useSchoolAutocomplete(
  search?: string,
  options?: Omit<UseQueryOptions<SchoolAutocompleteOption[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: schoolKeys.autocomplete(search),
    queryFn: async () => {
      const result = await schoolApi.getAutocomplete(search)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch schools for autocomplete')
      }
      
      return result.data as SchoolAutocompleteOption[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (autocomplete data changes less frequently)
    ...options,
  })
}

/**
 * Hook to fetch schools with expiring contracts (within 30 days)
 * 
 * @param options - TanStack Query options
 * @returns Query result with schools with expiring contracts
 * 
 * @example
 * ```typescript
 * const { data: expiringSchools } = useExpiringContracts()
 * // Alert dashboard component
 * ```
 */
export function useExpiringContracts(
  options?: Omit<UseQueryOptions<SchoolMaster[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: schoolKeys.expiringContracts(),
    queryFn: async () => {
      const result = await schoolApi.getExpiringContracts()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch expiring contracts')
      }
      
      return result.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

/**
 * Hook to fetch high-performing schools (attendance ≥90%, satisfaction ≥4.0)
 * 
 * @param filters - Optional additional filters
 * @param options - TanStack Query options
 * @returns Query result with high-performing schools
 * 
 * @example
 * ```typescript
 * // All high performers
 * const { data: topSchools } = useHighPerformers()
 * 
 * // SD high performers only
 * const { data: topSD } = useHighPerformers({ schoolType: 'SD' })
 * ```
 */
export function useHighPerformers(
  filters?: Omit<SchoolFilter, 'minAttendanceRate' | 'minSatisfactionScore'>,
  options?: Omit<UseQueryOptions<SchoolMaster[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: schoolKeys.highPerformers(filters),
    queryFn: async () => {
      const result = await schoolApi.getHighPerformers(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch high performers')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

/**
 * Hook to fetch school statistics by type
 * 
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 * @returns Query result with school type distribution
 * 
 * @example
 * ```typescript
 * const { data: stats } = useSchoolStatsByType()
 * // Returns: { SD: 45, SMP: 23, SMA: 12, ... }
 * 
 * // By province
 * const { data: jakartaStats } = useSchoolStatsByType({ provinceId: 'xxx' })
 * ```
 */
export function useSchoolStatsByType(
  filters?: Omit<SchoolFilter, 'schoolType'>,
  options?: Omit<UseQueryOptions<Record<string, number>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: schoolKeys.statsByType(filters),
    queryFn: async () => {
      const result = await schoolApi.getStatsByType(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch statistics')
      }
      
      return result.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

/**
 * Hook to create new school with optimistic updates
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: createSchool, isPending } = useCreateSchool()
 * 
 * const handleSubmit = (data: SchoolInput) => {
 *   createSchool(data, {
 *     onSuccess: (school) => {
 *       console.log('Created:', school.id)
 *       router.push(`/schools/${school.id}`)
 *     }
 *   })
 * }
 * ```
 */
export function useCreateSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: SchoolInput) => {
      const result = await schoolApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create school')
      }
      
      return result.data
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: schoolKeys.lists() })
      
      // Snapshot previous value
      const previousSchools = queryClient.getQueryData(schoolKeys.lists())
      
      return { previousSchools }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() })
      
      // Set the new school in cache
      queryClient.setQueryData(schoolKeys.detail(data.id), data)
      
      toast.success('Sekolah berhasil ditambahkan', {
        description: `${data.schoolName} telah ditambahkan ke sistem`
      })
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousSchools) {
        queryClient.setQueryData(schoolKeys.lists(), context.previousSchools)
      }
      
      toast.error('Gagal menambahkan sekolah', {
        description: error.message
      })
    },
  })
}

/**
 * Hook to update school (full update - PUT)
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: updateSchool, isPending } = useUpdateSchool()
 * 
 * const handleUpdate = (id: string, data: SchoolInput) => {
 *   updateSchool({ id, data }, {
 *     onSuccess: () => {
 *       toast.success('School updated')
 *     }
 *   })
 * }
 * ```
 */
export function useUpdateSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SchoolInput }) => {
      const result = await schoolApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update school')
      }
      
      return result.data
    },
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: schoolKeys.detail(id) })
      
      // Snapshot previous value
      const previousSchool = queryClient.getQueryData(schoolKeys.detail(id))
      
      return { previousSchool }
    },
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(schoolKeys.detail(variables.id), data)
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() })
      
      toast.success('Sekolah berhasil diperbarui', {
        description: `${data.schoolName} telah diperbarui`
      })
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousSchool) {
        queryClient.setQueryData(schoolKeys.detail(variables.id), context.previousSchool)
      }
      
      toast.error('Gagal memperbarui sekolah', {
        description: error.message
      })
    },
  })
}

/**
 * Hook to partially update school (PATCH) - EFFICIENT!
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: updateSchool, isPending } = usePartialUpdateSchool()
 * 
 * // Update only student counts
 * updateSchool({
 *   id: 'cm5abc123',
 *   data: {
 *     totalStudents: 150,
 *     activeStudents: 145
 *   }
 * })
 * 
 * // Update only performance metrics
 * updateSchool({
 *   id: 'cm5abc123',
 *   data: {
 *     attendanceRate: 95.5,
 *     satisfactionScore: 4.5
 *   }
 * })
 * ```
 */
export function usePartialUpdateSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SchoolUpdate> }) => {
      const result = await schoolApi.partialUpdate(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update school')
      }
      
      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: schoolKeys.detail(id) })
      
      // Snapshot previous value
      const previousSchool = queryClient.getQueryData<SchoolMasterWithRelations>(schoolKeys.detail(id))
      
      // Optimistically update
      if (previousSchool) {
        queryClient.setQueryData(schoolKeys.detail(id), {
          ...previousSchool,
          ...data,
        })
      }
      
      return { previousSchool }
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      queryClient.setQueryData(schoolKeys.detail(variables.id), data)
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      
      // Always invalidate stats for partial updates (safer approach)
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() })
      
      toast.success('Data berhasil diperbarui', {
        description: 'Perubahan telah disimpan'
      })
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousSchool) {
        queryClient.setQueryData(schoolKeys.detail(variables.id), context.previousSchool)
      }
      
      toast.error('Gagal memperbarui data', {
        description: error.message
      })
    },
  })
}

/**
 * Hook to delete school (soft delete by default)
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: deleteSchool, isPending } = useDeleteSchool()
 * 
 * // Soft delete
 * deleteSchool({ id: 'cm5abc123' })
 * 
 * // Hard delete (admin only)
 * deleteSchool({ id: 'cm5abc123', permanent: true })
 * ```
 */
export function useDeleteSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, permanent = false }: { id: string; permanent?: boolean }) => {
      if (permanent) {
        const result = await schoolApi.hardDelete(id)
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to permanently delete school')
        }
        
        return { id, permanent: true }
      } else {
        const result = await schoolApi.softDelete(id)
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to delete school')
        }
        
        return { ...result.data, permanent: false }
      }
    },
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: schoolKeys.detail(id) })
      
      // Snapshot previous value
      const previousSchool = queryClient.getQueryData(schoolKeys.detail(id))
      
      return { previousSchool }
    },
    onSuccess: (data, variables) => {
      if (variables.permanent) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: schoolKeys.detail(variables.id) })
        
        toast.success('Sekolah berhasil dihapus permanen', {
          description: 'Data sekolah telah dihapus dari sistem'
        })
      } else {
        // Update cache with deactivated status
        queryClient.setQueryData(schoolKeys.detail(variables.id), data)
        
        toast.success('Sekolah berhasil dinonaktifkan', {
          description: 'Sekolah dapat diaktifkan kembali kapan saja'
        })
      }
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() })
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousSchool) {
        queryClient.setQueryData(schoolKeys.detail(variables.id), context.previousSchool)
      }
      
      toast.error('Gagal menghapus sekolah', {
        description: error.message
      })
    },
  })
}

/**
 * Hook to reactivate soft-deleted school
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: reactivateSchool, isPending } = useReactivateSchool()
 * 
 * reactivateSchool('cm5abc123', {
 *   onSuccess: () => {
 *     toast.success('School reactivated')
 *   }
 * })
 * ```
 */
export function useReactivateSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await schoolApi.reactivate(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to reactivate school')
      }
      
      return result.data
    },
    onSuccess: (data, id) => {
      // Update cache
      queryClient.setQueryData(schoolKeys.detail(id), data)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() })
      
      toast.success('Sekolah berhasil diaktifkan kembali', {
        description: `${data.schoolName} telah aktif kembali`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal mengaktifkan kembali sekolah', {
        description: error.message
      })
    },
  })
}
