/**
 * @fileoverview Menu Assignment TanStack Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @see {@link /docs/copilot-instructions.md} React Query patterns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { assignmentApi } from '../api'
import { menuPlanningKeys } from './useMenuPlans'
import {
  CreateAssignmentInput,
  UpdateAssignmentInput,
  AssignmentFilters
} from '../schemas'

/**
 * Query Keys for Assignments
 */
export const assignmentKeys = {
  all: ['menu-assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters?: AssignmentFilters) => [...assignmentKeys.lists(), filters] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
}

/**
 * Get list of assignments
 */
export function useAssignments(filters?: AssignmentFilters) {
  return useQuery({
    queryKey: assignmentKeys.list(filters),
    queryFn: () => assignmentApi.getAssignments(filters),
    select: (response) => ({
      assignments: response.data || []
    }),
  })
}

/**
 * Get single assignment detail
 */
export function useAssignment(assignmentId: string | undefined) {
  return useQuery({
    queryKey: assignmentKeys.detail(assignmentId || ''),
    queryFn: () => assignmentApi.getAssignment(assignmentId!),
    enabled: !!assignmentId,
    select: (response) => response.data,
  })
}

/**
 * Create new assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAssignmentInput) => assignmentApi.createAssignment(data),
    onSuccess: (response, variables) => {
      // Invalidate assignments list
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      
      // Invalidate parent plan detail and analytics
      if (variables.planId) {
        queryClient.invalidateQueries({ 
          queryKey: menuPlanningKeys.detail(variables.planId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: menuPlanningKeys.analytics(variables.planId) 
        })
      }
      
      toast.success(response.message || 'Menu berhasil ditambahkan ke jadwal')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan menu ke jadwal')
    },
  })
}

/**
 * Update assignment
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, planId, data }: { assignmentId: string; planId: string; data: UpdateAssignmentInput }) =>
      assignmentApi.updateAssignment({ assignmentId, planId, data }),
    onSuccess: (response, variables) => {
      // Update assignment in cache
      queryClient.setQueryData(
        assignmentKeys.detail(variables.assignmentId),
        response
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      
      // Invalidate parent plan if assignment has plan
      if (response.data?.plan?.id) {
        queryClient.invalidateQueries({ 
          queryKey: menuPlanningKeys.detail(response.data.plan.id) 
        })
        queryClient.invalidateQueries({ 
          queryKey: menuPlanningKeys.analytics(response.data.plan.id) 
        })
      }
      
      toast.success(response.message || 'Jadwal menu berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui jadwal menu')
    },
  })
}

/**
 * Delete assignment
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, planId }: { assignmentId: string; planId: string }) =>
      assignmentApi.deleteAssignment(assignmentId, planId),
    onSuccess: (response, { assignmentId, planId }) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: assignmentKeys.detail(assignmentId) 
      })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      
      // Invalidate parent plan
      queryClient.invalidateQueries({ 
        queryKey: menuPlanningKeys.detail(planId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: menuPlanningKeys.analytics(planId) 
      })
      
      toast.success(response.message || 'Menu berhasil dihapus dari jadwal')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus menu dari jadwal')
    },
  })
}

/**
 * Bulk create assignments (for batch operations)
 */
export function useBulkCreateAssignments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (assignments: CreateAssignmentInput[]) => {
      const results = await Promise.all(
        assignments.map(data => assignmentApi.createAssignment(data))
      )
      return results
    },
    onSuccess: (results, assignments) => {
      // Invalidate assignments list
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      
      // Invalidate all affected plans
      const planIds = new Set(assignments.map(a => a.planId))
      planIds.forEach(planId => {
        queryClient.invalidateQueries({ 
          queryKey: menuPlanningKeys.detail(planId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: menuPlanningKeys.analytics(planId) 
        })
      })
      
      toast.success(`Berhasil menambahkan ${results.length} menu ke jadwal`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan menu ke jadwal')
    },
  })
}
