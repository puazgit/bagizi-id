/**
 * @fileoverview Menu Planning Workflow Action Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @see {@link /docs/copilot-instructions.md} React Query mutation patterns
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuPlanningApi } from '../api'
import {
  SubmitForReviewInput,
  ApproveActionInput,
  RejectActionInput,
  PublishActionInput
} from '../schemas'
import { ApiResponse, MenuPlanDetail } from '../types'
import { menuPlanningKeys } from './useMenuPlans'

// Type for query data from TanStack Query
type QueryData = ApiResponse<MenuPlanDetail> | undefined

/**
 * Submit menu plan for review (DRAFT → PENDING_REVIEW)
 * 
 * @param planId - Menu plan ID to submit
 * @returns Mutation hook with submitPlan function
 * 
 * @example
 * const { mutate: submitPlan } = useSubmitPlan(planId)
 * submitPlan({ submitNotes: 'Ready for review' })
 */
export function useSubmitPlan(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitForReviewInput) => menuPlanningApi.submitPlan(planId, data),
    
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: menuPlanningKeys.detail(planId) })
      
      // Snapshot previous value for rollback
      const previousPlan = queryClient.getQueryData(menuPlanningKeys.detail(planId))
      
      // Optimistically update status
      queryClient.setQueryData(menuPlanningKeys.detail(planId), (old: QueryData) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'PENDING_REVIEW'
          }
        }
      })
      
      return { previousPlan }
    },
    
    onSuccess: () => {
      // Invalidate and refetch menu plan detail
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.detail(planId) })
      
      // Invalidate list queries to reflect status change
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success('Rencana menu berhasil diajukan untuk review', {
        description: 'Status berubah menjadi Pending Review'
      })
    },
    
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousPlan) {
        queryClient.setQueryData(menuPlanningKeys.detail(planId), context.previousPlan)
      }
      
      toast.error('Gagal mengajukan rencana menu', {
        description: error.message || 'Terjadi kesalahan saat submit'
      })
    }
  })
}

/**
 * Approve menu plan (PENDING_REVIEW → APPROVED)
 * Only accessible by SPPG_KEPALA and SPPG_ADMIN roles
 * 
 * @param planId - Menu plan ID to approve
 * @returns Mutation hook with approvePlan function
 * 
 * @example
 * const { mutate: approvePlan } = useApprovePlan(planId)
 * approvePlan({ approvalNotes: 'Approved with conditions' })
 */
export function useApprovePlan(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApproveActionInput) => menuPlanningApi.approvePlan(planId, data),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: menuPlanningKeys.detail(planId) })
      
      const previousPlan = queryClient.getQueryData(menuPlanningKeys.detail(planId))
      
      // Optimistically update status
      queryClient.setQueryData(menuPlanningKeys.detail(planId), (old: QueryData) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'APPROVED',
            approvedAt: new Date().toISOString()
          }
        }
      })
      
      return { previousPlan }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.success('Rencana menu berhasil disetujui', {
        description: 'Status berubah menjadi Approved. Siap untuk dipublikasi.'
      })
    },
    
    onError: (error: Error, _variables, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(menuPlanningKeys.detail(planId), context.previousPlan)
      }
      
      toast.error('Gagal menyetujui rencana menu', {
        description: error.message || 'Terjadi kesalahan saat approve'
      })
    }
  })
}

/**
 * Reject menu plan (PENDING_REVIEW → DRAFT)
 * Only accessible by SPPG_KEPALA and SPPG_ADMIN roles
 * Returns plan to draft status for revision
 * 
 * @param planId - Menu plan ID to reject
 * @returns Mutation hook with rejectPlan function
 * 
 * @example
 * const { mutate: rejectPlan } = useRejectPlan(planId)
 * rejectPlan({ rejectionReason: 'Budget constraints not met' })
 */
export function useRejectPlan(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RejectActionInput) => menuPlanningApi.rejectPlan(planId, data),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: menuPlanningKeys.detail(planId) })
      
      const previousPlan = queryClient.getQueryData(menuPlanningKeys.detail(planId))
      
      // Optimistically update status
      queryClient.setQueryData(menuPlanningKeys.detail(planId), (old: QueryData) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'DRAFT',
            rejectedAt: new Date().toISOString()
          }
        }
      })
      
      return { previousPlan }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      toast.info('Rencana menu ditolak dan dikembalikan ke draft', {
        description: 'Silakan lakukan revisi sesuai catatan penolakan'
      })
    },
    
    onError: (error: Error, _variables, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(menuPlanningKeys.detail(planId), context.previousPlan)
      }
      
      toast.error('Gagal menolak rencana menu', {
        description: error.message || 'Terjadi kesalahan saat reject'
      })
    }
  })
}

/**
 * Publish menu plan (APPROVED → ACTIVE)
 * Only accessible by SPPG_KEPALA and SPPG_ADMIN roles
 * Activates the plan and makes it available for production
 * 
 * @param planId - Menu plan ID to publish
 * @returns Mutation hook with publishPlan function
 * 
 * @example
 * const { mutate: publishPlan } = usePublishPlan(planId)
 * publishPlan({ publishNotes: 'Published for October 2025' })
 */
export function usePublishPlan(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PublishActionInput) => menuPlanningApi.publishPlan(planId, data),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: menuPlanningKeys.detail(planId) })
      
      const previousPlan = queryClient.getQueryData(menuPlanningKeys.detail(planId))
      
      // Optimistically update status
      queryClient.setQueryData(menuPlanningKeys.detail(planId), (old: QueryData) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'ACTIVE',
            isActive: true,
            publishedAt: new Date().toISOString()
          }
        }
      })
      
      return { previousPlan }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      
      // Also invalidate analytics as active plans affect metrics
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.analytics(planId) })
      
      toast.success('Rencana menu berhasil dipublikasi!', {
        description: 'Menu plan sudah aktif dan siap digunakan untuk produksi'
      })
    },
    
    onError: (error: Error, _variables, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(menuPlanningKeys.detail(planId), context.previousPlan)
      }
      
      toast.error('Gagal mempublikasi rencana menu', {
        description: error.message || 'Terjadi kesalahan saat publish'
      })
    }
  })
}
