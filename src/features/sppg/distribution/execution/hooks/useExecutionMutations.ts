/**
 * @fileoverview Distribution Execution Mutation Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @description React Query mutation hooks for execution operations
 * @author Bagizi-ID Development Team
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { executionApi } from '../api'
import type {
  StartExecutionInput,
  UpdateExecutionInput,
  CompleteExecutionInput,
  ReportIssueInput,
} from '../types'

/**
 * Mutation hook to start new execution from schedule
 * @returns Mutation object with start function
 * 
 * @example
 * ```tsx
 * const { mutate: startExecution, isPending } = useStartExecution()
 * startExecution({ scheduleId: 'sched_123', notes: 'Ready to go' })
 * ```
 */
export function useStartExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: StartExecutionInput) => executionApi.start(data),
    onSuccess: () => {
      // Invalidate executions list
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions', 'statistics'] 
      })
      
      // Invalidate schedules (status changed to IN_PROGRESS)
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'schedules'] 
      })
      
      toast.success('Execution berhasil dimulai', {
        description: 'Status schedule diubah menjadi IN_PROGRESS'
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memulai execution', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation hook to update execution progress
 * @returns Mutation object with update function
 * 
 * @example
 * ```tsx
 * const { mutate: updateExecution } = useUpdateExecution()
 * updateExecution({ 
 *   id: 'exec_123', 
 *   data: { totalPortionsDelivered: 50 } 
 * })
 * ```
 */
export function useUpdateExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExecutionInput }) => 
      executionApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['sppg', 'distribution', 'executions', id] 
      })
      
      // Snapshot previous value
      const previousExecution = queryClient.getQueryData([
        'sppg', 
        'distribution', 
        'executions', 
        id
      ])
      
      // Optimistically update
      queryClient.setQueryData(
        ['sppg', 'distribution', 'executions', id],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old: any) => old ? { ...old, ...data } : old
      )
      
      return { previousExecution }
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousExecution) {
        queryClient.setQueryData(
          ['sppg', 'distribution', 'executions', variables.id],
          context.previousExecution
        )
      }
      
      toast.error('Gagal memperbarui execution', {
        description: error.message
      })
    },
    onSuccess: (response, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(
        ['sppg', 'distribution', 'executions', id],
        response.data
      )
      
      // Invalidate list
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      toast.success('Progress execution diperbarui')
    },
  })
}

/**
 * Mutation hook to complete execution
 * @returns Mutation object with complete function
 * 
 * @example
 * ```tsx
 * const { mutate: completeExecution } = useCompleteExecution()
 * completeExecution({ 
 *   id: 'exec_123',
 *   data: {
 *     actualEndTime: new Date(),
 *     totalPortionsDelivered: 100,
 *     totalBeneficiariesReached: 100
 *   }
 * })
 * ```
 */
export function useCompleteExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteExecutionInput }) => 
      executionApi.complete(id, data),
    onSuccess: (response, { id }) => {
      // Update specific execution
      queryClient.setQueryData(
        ['sppg', 'distribution', 'executions', id],
        response.data
      )
      
      // Invalidate all execution queries
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      // Invalidate schedules (status changed to COMPLETED)
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'schedules'] 
      })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions', 'statistics'] 
      })
      
      toast.success('Execution berhasil diselesaikan! 🎉', {
        description: 'Semua data distribusi telah tercatat'
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menyelesaikan execution', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation hook to cancel execution
 * @returns Mutation object with cancel function
 * 
 * @example
 * ```tsx
 * const { mutate: cancelExecution } = useCancelExecution()
 * cancelExecution({ id: 'exec_123', reason: 'Cuaca buruk' })
 * ```
 */
export function useCancelExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      executionApi.cancel(id, reason),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(
        ['sppg', 'distribution', 'executions', id],
        response.data
      )
      
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'schedules'] 
      })
      
      toast.success('Execution dibatalkan')
    },
    onError: (error: Error) => {
      toast.error('Gagal membatalkan execution', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation hook to delete execution
 * @returns Mutation object with delete function
 * 
 * @example
 * ```tsx
 * const { mutate: deleteExecution } = useDeleteExecution()
 * deleteExecution('exec_123')
 * ```
 */
export function useDeleteExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => executionApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: ['sppg', 'distribution', 'executions', deletedId] 
      })
      
      // Invalidate list
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      toast.success('Execution berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus execution', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation hook to report issue during execution
 * @returns Mutation object with report function
 * 
 * @example
 * ```tsx
 * const { mutate: reportIssue } = useReportIssue()
 * reportIssue({
 *   id: 'exec_123',
 *   data: {
 *     type: 'VEHICLE_BREAKDOWN',
 *     severity: 'HIGH',
 *     description: 'Ban bocor'
 *   }
 * })
 * ```
 */
export function useReportIssue() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReportIssueInput }) => 
      executionApi.reportIssue(id, data),
    onSuccess: (response, { id }) => {
      // Update execution with new issue
      queryClient.setQueryData(
        ['sppg', 'distribution', 'executions', id],
        response.data
      )
      
      // Invalidate list to update issue indicators
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      toast.error('Issue berhasil dilaporkan', {
        description: 'Tim akan segera menangani masalah ini'
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal melaporkan issue', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation hook to resolve reported issue
 * @returns Mutation object with resolve function
 * 
 * @example
 * ```tsx
 * const { mutate: resolveIssue } = useResolveIssue()
 * resolveIssue({
 *   id: 'exec_123',
 *   issueId: 'issue_456',
 *   data: {
 *     resolutionNotes: 'Ban diganti',
 *     resolvedAt: new Date()
 *   }
 * })
 * ```
 */
export function useResolveIssue() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      id, 
      issueId, 
      data 
    }: { 
      id: string
      issueId: string
      data: { resolutionNotes: string; resolvedAt: Date }
    }) => executionApi.resolveIssue(id, issueId, data),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(
        ['sppg', 'distribution', 'executions', id],
        response.data
      )
      
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      toast.success('Issue berhasil diselesaikan! ✅')
    },
    onError: (error: Error) => {
      toast.error('Gagal menyelesaikan issue', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation hook to record delivery completion
 * @returns Mutation object with record function
 * 
 * @example
 * ```tsx
 * const { mutate: recordDelivery } = useRecordDelivery()
 * recordDelivery({
 *   id: 'exec_123',
 *   data: {
 *     deliveryId: 'del_789',
 *     portionsDelivered: 50,
 *     beneficiariesReached: 50
 *   }
 * })
 * ```
 */
export function useRecordDelivery() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string
      data: { 
        deliveryId: string
        portionsDelivered: number
        beneficiariesReached: number
        notes?: string
      }
    }) => executionApi.recordDelivery(id, data),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(
        ['sppg', 'distribution', 'executions', id],
        response.data
      )
      
      queryClient.invalidateQueries({ 
        queryKey: ['sppg', 'distribution', 'executions'] 
      })
      
      toast.success('Delivery berhasil dicatat')
    },
    onError: (error: Error) => {
      toast.error('Gagal mencatat delivery', {
        description: error.message
      })
    }
  })
}
