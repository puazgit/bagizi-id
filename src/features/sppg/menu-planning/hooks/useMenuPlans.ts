/**
 * @fileoverview Menu Planning TanStack Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @see {@link /docs/copilot-instructions.md} React Query patterns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuPlanningApi } from '../api'
import {
  CreateMenuPlanInput,
  UpdateMenuPlanInput,
  MenuPlanFilters,
  PublishActionInput,
  SubmitForReviewInput,
  ApproveActionInput,
  RejectActionInput
} from '../schemas'

/**
 * Query Keys for Menu Planning
 */
export const menuPlanningKeys = {
  all: ['menu-planning'] as const,
  lists: () => [...menuPlanningKeys.all, 'list'] as const,
  list: (filters?: MenuPlanFilters) => [...menuPlanningKeys.lists(), filters] as const,
  details: () => [...menuPlanningKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuPlanningKeys.details(), id] as const,
  analytics: (id: string) => [...menuPlanningKeys.all, 'analytics', id] as const,
}

/**
 * Get list of menu plans
 */
export function useMenuPlans(filters?: MenuPlanFilters) {
  return useQuery({
    queryKey: menuPlanningKeys.list(filters),
    queryFn: () => menuPlanningApi.getPlans(filters),
    select: (response) => ({
      plans: response.data || [],
      summary: response.summary,
      meta: response.meta
    }),
  })
}

/**
 * Get single menu plan detail
 */
export function useMenuPlan(planId: string | undefined) {
  return useQuery({
    queryKey: menuPlanningKeys.detail(planId || ''),
    queryFn: () => menuPlanningApi.getPlan(planId!),
    enabled: !!planId,
    select: (response) => response.data,
  })
}

/**
 * Get menu plan analytics
 */
export function useMenuPlanAnalytics(planId: string | undefined) {
  return useQuery({
    queryKey: menuPlanningKeys.analytics(planId || ''),
    queryFn: () => menuPlanningApi.getAnalytics(planId!),
    enabled: !!planId,
    select: (response) => response.data,
  })
}

/**
 * Create new menu plan
 */
export function useCreateMenuPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMenuPlanInput) => menuPlanningApi.createPlan(data),
    onSuccess: (response) => {
      // Invalidate plans list
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success(response.message || 'Rencana menu berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat rencana menu')
    },
  })
}

/**
 * Update menu plan
 */
export function useUpdateMenuPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdateMenuPlanInput }) =>
      menuPlanningApi.updatePlan(planId, data),
    onSuccess: (response, variables) => {
      // Update plan in cache
      queryClient.setQueryData(
        menuPlanningKeys.detail(variables.planId),
        response
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success(response.message || 'Rencana menu berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui rencana menu')
    },
  })
}

/**
 * Delete (archive) menu plan
 */
export function useDeleteMenuPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => menuPlanningApi.deletePlan(planId),
    onSuccess: (response, planId) => {
      // Remove detail from cache
      queryClient.removeQueries({ queryKey: menuPlanningKeys.detail(planId) })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      // Always use Indonesian message for consistency
      toast.success('Rencana menu berhasil diarsipkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengarsipkan rencana menu')
    },
  })
}

/**
 * Publish menu plan
 */
export function usePublishMenuPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: PublishActionInput }) => 
      menuPlanningApi.publishPlan(planId, data),
    onSuccess: (response, variables) => {
      // Update plan in cache
      queryClient.setQueryData(
        menuPlanningKeys.detail(variables.planId),
        response
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success(response.message || 'Rencana menu berhasil dipublikasikan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mempublikasikan rencana menu')
    },
  })
}

/**
 * Submit menu plan for review
 */
export function useSubmitMenuPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: SubmitForReviewInput }) =>
      menuPlanningApi.submitPlan(planId, data),
    onSuccess: (response, variables) => {
      // Update plan in cache
      queryClient.setQueryData(
        menuPlanningKeys.detail(variables.planId),
        response
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success(response.message || 'Rencana menu berhasil diajukan untuk review')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengajukan rencana menu')
    },
  })
}

/**
 * Approve menu plan
 */
export function useApproveMenuPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: ApproveActionInput }) =>
      menuPlanningApi.approvePlan(planId, data),
    onSuccess: (response, variables) => {
      // Update plan in cache
      queryClient.setQueryData(
        menuPlanningKeys.detail(variables.planId),
        response
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success(response.message || 'Rencana menu berhasil disetujui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menyetujui rencana menu')
    },
  })
}

/**
 * Reject menu plan
 */
export function useRejectMenuPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: RejectActionInput }) =>
      menuPlanningApi.rejectPlan(planId, data),
    onSuccess: (response, variables) => {
      // Update plan in cache
      queryClient.setQueryData(
        menuPlanningKeys.detail(variables.planId),
        response
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success(response.message || 'Rencana menu ditolak')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menolak rencana menu')
    },
  })
}
