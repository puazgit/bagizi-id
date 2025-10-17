/**
 * @fileoverview Procurement Orders & Plans Hooks - TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { procurementApi, procurementPlanApi } from '../api'
import type {
  CreateProcurementInput,
  UpdateProcurementInput,
  CreateProcurementPlanInput,
  UpdateProcurementPlanInput,
  ProcurementFilters
} from '../types'

// ================================ QUERY KEY FACTORIES ================================

/**
 * Query key factory for procurement orders
 */
export const procurementKeys = {
  all: ['procurement'] as const,
  lists: () => [...procurementKeys.all, 'list'] as const,
  list: (filters?: Partial<ProcurementFilters>) => 
    [...procurementKeys.lists(), { filters }] as const,
  details: () => [...procurementKeys.all, 'detail'] as const,
  detail: (id: string) => [...procurementKeys.details(), id] as const,
}

/**
 * Query key factory for procurement plans
 */
export const procurementPlanKeys = {
  all: ['procurement', 'plans'] as const,
  lists: () => [...procurementPlanKeys.all, 'list'] as const,
  list: (filters?: Partial<ProcurementFilters>) => 
    [...procurementPlanKeys.lists(), { filters }] as const,
  details: () => [...procurementPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...procurementPlanKeys.details(), id] as const,
}

// ================================ PROCUREMENT PLANS HOOKS ================================

/**
 * Hook to fetch procurement plans with optional filters
 */
export function useProcurementPlans(filters?: Partial<ProcurementFilters>) {
  return useQuery({
    queryKey: procurementPlanKeys.list(filters),
    queryFn: () => procurementPlanApi.getPlans(filters),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to fetch single procurement plan by ID
 */
export function useProcurementPlan(id: string) {
  return useQuery({
    queryKey: procurementPlanKeys.detail(id),
    queryFn: () => procurementPlanApi.getPlanById(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to create new procurement plan
 */
export function useCreateProcurementPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProcurementPlanInput) => procurementPlanApi.createPlan(data),
    onSuccess: () => {
      // Invalidate plans list
      queryClient.invalidateQueries({ queryKey: procurementPlanKeys.lists() })
      toast.success('Rencana pengadaan berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat rencana pengadaan')
    }
  })
}

/**
 * Hook to update procurement plan
 */
export function useUpdateProcurementPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateProcurementPlanInput> }) => 
      procurementPlanApi.updatePlan(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific plan and lists
      queryClient.invalidateQueries({ queryKey: procurementPlanKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: procurementPlanKeys.lists() })
      toast.success('Rencana pengadaan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui rencana pengadaan')
    }
  })
}

/**
 * Hook to delete procurement plan
 */
export function useDeleteProcurementPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => procurementPlanApi.deletePlan(id),
    onSuccess: () => {
      // Invalidate plans list
      queryClient.invalidateQueries({ queryKey: procurementPlanKeys.lists() })
      toast.success('Rencana pengadaan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus rencana pengadaan')
    }
  })
}

/**
 * Hook to approve or reject procurement plan
 */
export function useApproveProcurementPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, action, reason }: { 
      id: string
      action: 'APPROVE' | 'REJECT'
      reason?: string 
    }) => procurementPlanApi.approvePlan(id, action, reason),
    onSuccess: (response, variables) => {
      // Invalidate specific plan and lists
      queryClient.invalidateQueries({ queryKey: procurementPlanKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: procurementPlanKeys.lists() })
      
      const message = variables.action === 'APPROVE' 
        ? 'Rencana pengadaan berhasil disetujui'
        : 'Rencana pengadaan ditolak'
      toast.success(message)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memproses persetujuan')
    }
  })
}

// ================================ PROCUREMENT ORDERS HOOKS ================================

/**
 * Hook to fetch procurement orders with optional filters
 */
export function useProcurements(filters?: Partial<ProcurementFilters>) {
  return useQuery({
    queryKey: procurementKeys.list(filters),
    queryFn: () => procurementApi.getProcurements(filters),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to fetch single procurement order by ID
 */
export function useProcurement(id: string) {
  return useQuery({
    queryKey: procurementKeys.detail(id),
    queryFn: () => procurementApi.getProcurementById(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to create new procurement order
 */
export function useCreateProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProcurementInput) => procurementApi.createProcurement(data),
    onSuccess: () => {
      // Invalidate orders list and plans (if linked)
      queryClient.invalidateQueries({ queryKey: procurementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: procurementPlanKeys.lists() })
      toast.success('Pengadaan berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat pengadaan')
    }
  })
}

/**
 * Hook to update procurement order
 */
export function useUpdateProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateProcurementInput> }) => 
      procurementApi.updateProcurement(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific order and lists
      queryClient.invalidateQueries({ queryKey: procurementKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.lists() })
      toast.success('Pengadaan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui pengadaan')
    }
  })
}

/**
 * Hook to delete procurement order
 */
export function useDeleteProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => procurementApi.deleteProcurement(id),
    onSuccess: () => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: procurementKeys.lists() })
      toast.success('Pengadaan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus pengadaan')
    }
  })
}

/**
 * Hook to receive procurement items (Quality Control)
 */
export function useReceiveProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string
      data: {
        items: Array<{
          itemId: string
          receivedQuantity: number
          isAccepted: boolean
          rejectionReason?: string
          notes?: string
        }>
        actualDelivery?: Date
        qualityGrade?: 'A' | 'B' | 'C'
        qualityNotes?: string
        receiptNumber?: string
        receiptPhoto?: string
        deliveryPhoto?: string
      }
    }) => procurementApi.receiveProcurement(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific order, lists, and inventory
      queryClient.invalidateQueries({ queryKey: procurementKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Penerimaan barang berhasil diproses')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memproses penerimaan barang')
    }
  })
}
