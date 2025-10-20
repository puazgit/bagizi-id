/**
 * @fileoverview School Management React Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolsApi, type QueryMode } from '../api'
import type { SchoolMaster, SchoolMasterWithRelations } from '../types'
import type { SchoolMasterInput, UpdateSchoolMasterInput } from '../schemas'
import { toast } from 'sonner'

/**
 * Query key factory for schools
 * Centralized query key management for cache invalidation
 */
export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...schoolKeys.lists(), filters] as const,
  details: () => [...schoolKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
}

/**
 * Get all schools with optional filtering
 * 
 * @param options - Query options
 * @param options.mode - Query mode: 'autocomplete' | 'full' | 'standard'
 * @param options.programId - Filter by program
 * @param options.isActive - Filter by active status
 * @param options.schoolType - Filter by school type
 * @param options.search - Search query
 * @param options.enabled - Enable/disable query
 * 
 * @returns React Query result with schools data
 * 
 * @example
 * ```tsx
 * function SchoolList() {
 *   const { data, isLoading, error } = useSchools({
 *     mode: 'full',
 *     programId: 'prog_123',
 *     isActive: true
 *   })
 *   
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   
 *   return (
 *     <div>
 *       {data?.map(school => (
 *         <SchoolCard key={school.id} school={school} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSchools(options: {
  mode?: QueryMode
  programId?: string
  isActive?: boolean
  schoolType?: string
  search?: string
  enabled?: boolean
} = {}) {
  const { enabled = true, ...filters } = options
  
  return useQuery({
    queryKey: schoolKeys.list(filters),
    queryFn: async () => {
      const result = await schoolsApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch schools')
      }
      
      return result.data as SchoolMaster[] | SchoolMasterWithRelations[]
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for management)
    gcTime: 5 * 60 * 1000,    // 5 minutes
  })
}

/**
 * Get single school by ID
 * 
 * @param id - School ID
 * @param options - Query options
 * @param options.enabled - Enable/disable query
 * 
 * @returns React Query result with school data
 * 
 * @example
 * ```tsx
 * function SchoolDetail({ schoolId }: { schoolId: string }) {
 *   const { data: school, isLoading } = useSchool(schoolId)
 *   
 *   if (isLoading) return <LoadingSpinner />
 *   if (!school) return <NotFound />
 *   
 *   return <SchoolDetailView school={school} />
 * }
 * ```
 */
export function useSchool(
  id: string,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options
  
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: async () => {
      const result = await schoolsApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch school')
      }
      
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create new school mutation
 * 
 * Features:
 * - Automatic cache invalidation
 * - Success/error toast notifications
 * - Optimistic updates (optional)
 * 
 * @returns React Query mutation for creating school
 * 
 * @example
 * ```tsx
 * function CreateSchoolForm() {
 *   const createSchool = useCreateSchool()
 *   
 *   const handleSubmit = async (data: SchoolMasterInput) => {
 *     try {
 *       const result = await createSchool.mutateAsync(data)
 *       router.push(`/school/${result.id}`)
 *     } catch (error) {
 *       // Error handled by mutation
 *     }
 *   }
 *   
 *   return (
 *     <SchoolForm
 *       onSubmit={handleSubmit}
 *       isSubmitting={createSchool.isPending}
 *     />
 *   )
 * }
 * ```
 */
export function useCreateSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SchoolMasterInput) => schoolsApi.create(data),
    onSuccess: (response) => {
      // Invalidate schools list to refetch
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      
      // Show success toast
      toast.success('Sekolah berhasil ditambahkan', {
        description: response.data?.schoolName
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan sekolah', {
        description: error.message
      })
    }
  })
}

/**
 * Update school mutation
 * 
 * Features:
 * - Automatic cache update
 * - Success/error toast notifications
 * - Optimistic updates
 * 
 * @returns React Query mutation for updating school
 * 
 * @example
 * ```tsx
 * function EditSchoolForm({ schoolId }: { schoolId: string }) {
 *   const updateSchool = useUpdateSchool()
 *   
 *   const handleSubmit = async (data: UpdateSchoolMasterInput) => {
 *     await updateSchool.mutateAsync({ id: schoolId, data })
 *   }
 *   
 *   return (
 *     <SchoolForm
 *       onSubmit={handleSubmit}
 *       isSubmitting={updateSchool.isPending}
 *     />
 *   )
 * }
 * ```
 */
export function useUpdateSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchoolMasterInput }) =>
      schoolsApi.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific school in cache
      queryClient.setQueryData(
        schoolKeys.detail(variables.id),
        response.data
      )
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      
      toast.success('Sekolah berhasil diperbarui', {
        description: response.data?.schoolName
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui sekolah', {
        description: error.message
      })
    }
  })
}

/**
 * Delete school mutation (soft delete)
 * 
 * Features:
 * - Automatic cache update
 * - Success/error toast notifications
 * - Confirmation handling (should be done in UI)
 * 
 * @returns React Query mutation for deleting school
 * 
 * @example
 * ```tsx
 * function DeleteSchoolButton({ schoolId }: { schoolId: string }) {
 *   const deleteSchool = useDeleteSchool()
 *   
 *   const handleDelete = async () => {
 *     if (confirm('Yakin ingin menghapus sekolah ini?')) {
 *       await deleteSchool.mutateAsync(schoolId)
 *     }
 *   }
 *   
 *   return (
 *     <Button
 *       onClick={handleDelete}
 *       disabled={deleteSchool.isPending}
 *       variant="destructive"
 *     >
 *       Hapus
 *     </Button>
 *   )
 * }
 * ```
 */
export function useDeleteSchool() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => schoolsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: schoolKeys.detail(deletedId) })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
      
      toast.success('Sekolah berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus sekolah', {
        description: error.message
      })
    }
  })
}
