/**
 * @fileoverview TanStack Query hooks for Procurement Plans
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { planApi } from '../api/planApi'
import type {
  ProcurementPlanFilters,
  ProcurementPlanInput,
  ProcurementPlanResponse,
  ApprovalActionInput,
} from '../api/planApi'

// ============================================================================
// Query Keys
// ============================================================================

const QUERY_KEYS = {
  all: ['procurement', 'plans'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters: ProcurementPlanFilters) => [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch procurement plans list with filters
 */
export function useProcurementPlans(filters: ProcurementPlanFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => planApi.getAll(filters),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single procurement plan details
 */
export function useProcurementPlan(id: string | undefined) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.detail(id) : ['procurement', 'plans', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Plan ID is required')
      return planApi.getById(id)
    },
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create new procurement plan
 */
export function useCreateProcurementPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProcurementPlanInput) => planApi.create(data),
    onSuccess: (response) => {
      // Invalidate plans list to refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })

      toast.success('Rencana Pengadaan berhasil dibuat', {
        description: response.data?.planName,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat Rencana Pengadaan', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update existing procurement plan
 */
export function useUpdateProcurementPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProcurementPlanInput> }) =>
      planApi.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific plan in cache
      queryClient.setQueryData<ProcurementPlanResponse>(
        QUERY_KEYS.detail(variables.id),
        response
      )

      // Invalidate lists to refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })

      toast.success('Rencana Pengadaan berhasil diperbarui', {
        description: response.data?.planName,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui Rencana Pengadaan', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to delete procurement plan
 */
export function useDeleteProcurementPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => planApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove plan from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.detail(deletedId),
      })

      // Invalidate lists to refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })

      toast.success('Rencana Pengadaan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus Rencana Pengadaan', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to perform approval actions (submit, approve, reject, revise)
 */
export function useApprovalAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApprovalActionInput }) =>
      planApi.approvalAction(id, input),
    onSuccess: (response, variables) => {
      // Update specific plan in cache
      queryClient.setQueryData<ProcurementPlanResponse>(
        QUERY_KEYS.detail(variables.id),
        response
      )

      // Invalidate lists to refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })

      const actionMessages = {
        submit: 'Rencana Pengadaan berhasil diajukan untuk persetujuan',
        approve: 'Rencana Pengadaan berhasil disetujui',
        reject: 'Rencana Pengadaan ditolak',
        revise: 'Rencana Pengadaan dikembalikan untuk revisi',
      }

      toast.success(
        actionMessages[variables.input.action] || 'Status berhasil diperbarui',
        {
          description: response.data?.planName,
        }
      )
    },
    onError: (error: Error) => {
      toast.error('Gagal memproses approval', {
        description: error.message,
      })
    },
  })
}

// ============================================================================
// Compound Hooks
// ============================================================================

/**
 * Hook to get procurement plans with statistics
 */
export function useProcurementPlansWithStats(filters: ProcurementPlanFilters = {}) {
  const plansQuery = useProcurementPlans(filters)

  // Calculate statistics from plans (data is array directly from select)
  const statistics = plansQuery.data
    ? {
        totalPlans: plansQuery.data.length,
        totalBudget: plansQuery.data.reduce((sum: number, plan) => sum + plan.totalBudget, 0),
        usedBudget: plansQuery.data.reduce((sum: number, plan) => sum + plan.usedBudget, 0),
        remainingBudget: plansQuery.data.reduce(
          (sum: number, plan) => sum + plan.remainingBudget,
          0
        ),
        byStatus: plansQuery.data.reduce(
          (acc: Record<string, number>, plan) => {
            acc[plan.approvalStatus] = (acc[plan.approvalStatus] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
      }
    : null

  return {
    ...plansQuery,
    statistics,
  }
}

/**
 * Hook to check if user can edit plan (based on status)
 */
export function useCanEditPlan(planId: string | undefined) {
  const { data: plan, isLoading } = useProcurementPlan(planId)

  const canEdit =
    plan?.approvalStatus === 'DRAFT' || plan?.approvalStatus === 'REVISION'

  return {
    canEdit,
    isLoading,
    plan,
  }
}
