/**
 * @fileoverview Stock Movement Hooks with TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventoryApi'
import { inventoryKeys } from './useInventory'
import type {
  StockMovementFilters,
  CreateStockMovementInput,
  StockMovementDetail,
} from '../types'
import { toast } from 'sonner'

/**
 * Query key factory for stock movements
 */
export const stockMovementKeys = {
  all: ['stock-movements'] as const,
  lists: () => [...stockMovementKeys.all, 'list'] as const,
  list: (filters?: StockMovementFilters) => 
    [...stockMovementKeys.lists(), { filters }] as const,
  details: () => [...stockMovementKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockMovementKeys.details(), id] as const,
  summary: (filters?: StockMovementFilters) => 
    [...stockMovementKeys.all, 'summary', { filters }] as const,
}

/**
 * Hook: Fetch stock movements list with filters
 * 
 * Features:
 * - Advanced filtering (type, date range, inventory, approval status)
 * - Pagination support
 * - Real-time updates
 * - 2-minute cache (frequent updates expected)
 * 
 * @param filters - Filter parameters
 * @returns Query result with stock movements
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useStockMovements({
 *   movementType: 'OUT',
 *   startDate: '2025-10-01',
 *   endDate: '2025-10-31'
 * })
 * ```
 */
export function useStockMovements(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: stockMovementKeys.list(filters),
    queryFn: async () => {
      const result = await inventoryApi.getStockMovements(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch stock movements')
      }
      
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (frequent updates)
    refetchOnWindowFocus: true,
    retry: 2,
  })
}

/**
 * Hook: Fetch single stock movement by ID
 * 
 * Features:
 * - Includes inventory and user details
 * - 5-minute cache
 * - Optimistic updates from approval
 * 
 * @param id - Stock movement ID
 * @param enabled - Whether to enable the query
 * @returns Query result with movement details
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useStockMovement(movementId)
 * ```
 */
export function useStockMovement(id: string, enabled = true) {
  return useQuery({
    queryKey: stockMovementKeys.detail(id),
    queryFn: async () => {
      const result = await inventoryApi.getStockMovementById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch stock movement')
      }
      
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

/**
 * Hook: Fetch stock movement summary
 * 
 * Features:
 * - Aggregated statistics
 * - Movement trends by month
 * - Recent movements
 * - 5-minute cache
 * 
 * @param filters - Date range and other filters
 * @returns Query result with summary data
 * 
 * @example
 * ```typescript
 * const { data } = useStockMovementSummary({
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31'
 * })
 * ```
 */
export function useStockMovementSummary(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: stockMovementKeys.summary(filters),
    queryFn: async () => {
      const result = await inventoryApi.getStockMovementSummary(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch movement summary')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

/**
 * Hook: Create new stock movement
 * 
 * Features:
 * - Automatic inventory stock update
 * - Optimistic UI update
 * - Cache invalidation for related queries
 * - Success/error notifications
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useCreateStockMovement()
 * 
 * mutate({
 *   inventoryId: 'item-123',
 *   movementType: 'OUT',
 *   quantity: 10,
 *   referenceType: 'PRODUCTION',
 *   referenceNumber: 'PROD-001'
 * }, {
 *   onSuccess: (movement) => {
 *     console.log('Stock movement created:', movement)
 *   }
 * })
 * ```
 */
export function useCreateStockMovement() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateStockMovementInput) => {
      const result = await inventoryApi.createStockMovement(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create stock movement')
      }
      
      return result.data
    },
    onMutate: async (newMovement) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: stockMovementKeys.lists() })
      await queryClient.cancelQueries({ 
        queryKey: inventoryKeys.detail(newMovement.inventoryId) 
      })
      
      // Snapshot previous values
      const previousMovements = queryClient.getQueryData(stockMovementKeys.lists())
      const previousInventory = queryClient.getQueryData(
        inventoryKeys.detail(newMovement.inventoryId)
      )
      
      // Optimistically update inventory stock
      queryClient.setQueryData(
        inventoryKeys.detail(newMovement.inventoryId),
        (old: unknown) => {
          if (!old || typeof old !== 'object' || !('data' in old)) return old
          const oldData = old as { data?: { currentStock: number; updatedAt?: string } }
          
          if (!oldData.data) return old
          
          const stockDelta = 
            newMovement.movementType === 'IN' 
              ? newMovement.quantity
              : newMovement.movementType === 'OUT'
              ? -newMovement.quantity
              : 0
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              currentStock: oldData.data.currentStock + stockDelta,
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )
      
      return { previousMovements, previousInventory, inventoryId: newMovement.inventoryId }
    },
    onSuccess: (newMovement) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: inventoryKeys.detail(newMovement.inventoryId) 
      })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.summary() })
      
      // Show success toast
      const actionText = 
        newMovement.movementType === 'IN' ? 'masuk' :
        newMovement.movementType === 'OUT' ? 'keluar' : 'penyesuaian'
      
      toast.success('Pergerakan stok berhasil dicatat', {
        description: `Stok ${actionText} sebanyak ${newMovement.quantity} ${newMovement.unit}`,
        duration: 3000,
      })
    },
    onError: (error: Error, newMovement, context) => {
      // Rollback on error
      if (context?.previousMovements) {
        queryClient.setQueryData(stockMovementKeys.lists(), context.previousMovements)
      }
      if (context?.previousInventory && context?.inventoryId) {
        queryClient.setQueryData(
          inventoryKeys.detail(context.inventoryId),
          context.previousInventory
        )
      }
      
      // Show error toast
      toast.error('Gagal mencatat pergerakan stok', {
        description: error.message,
        duration: 5000,
      })
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: inventoryKeys.detail(variables.inventoryId) 
      })
    },
  })
}

/**
 * Hook: Approve stock movement
 * 
 * Features:
 * - Update approval status
 * - Optimistic UI update
 * - Cache invalidation
 * - Success/error notifications
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useApproveStockMovement()
 * 
 * mutate({
 *   id: movementId,
 *   notes: 'Approved by manager'
 * })
 * ```
 */
export function useApproveStockMovement() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const result = await inventoryApi.approveStockMovement(id, { notes })
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to approve stock movement')
      }
      
      return result.data
    },
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: stockMovementKeys.detail(id) })
      
      // Snapshot previous value
      const previousMovement = queryClient.getQueryData(stockMovementKeys.detail(id))
      
      // Optimistically update
      queryClient.setQueryData(stockMovementKeys.detail(id), (old: unknown) => {
        if (!old || typeof old !== 'object' || !('data' in old)) return old
        const oldData = old as { data?: { approvedBy?: string; approvedAt?: string } }
        
        if (!oldData.data) return old
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            approvedBy: 'pending',
            approvedAt: new Date().toISOString(),
          },
        }
      })
      
      return { previousMovement, id }
    },
    onSuccess: (approvedMovement) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: stockMovementKeys.detail(approvedMovement.id) 
      })
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.summary() })
      
      // Show success toast
      toast.success('Pergerakan stok berhasil disetujui', {
        description: 'Status persetujuan telah diperbarui',
        duration: 3000,
      })
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousMovement) {
        queryClient.setQueryData(
          stockMovementKeys.detail(context.id),
          context.previousMovement
        )
      }
      
      // Show error toast
      toast.error('Gagal menyetujui pergerakan stok', {
        description: error.message,
        duration: 5000,
      })
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: stockMovementKeys.detail(variables.id) 
      })
    },
  })
}

/**
 * Hook: Create batch stock movements
 * 
 * Features:
 * - Atomic transaction (all or nothing)
 * - Bulk inventory updates
 * - Cache invalidation for all affected items
 * - Success/error notifications
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useBatchStockMovements()
 * 
 * mutate({
 *   movements: [
 *     { inventoryId: 'item-1', movementType: 'OUT', quantity: 5 },
 *     { inventoryId: 'item-2', movementType: 'OUT', quantity: 3 }
 *   ]
 * }, {
 *   onSuccess: (results) => {
 *     console.log(`Created ${results.length} movements`)
 *   }
 * })
 * ```
 */
export function useBatchStockMovements() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { movements: CreateStockMovementInput[] }) => {
      const result = await inventoryApi.createBatchStockMovements(data.movements)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create batch stock movements')
      }
      
      return result.data
    },
    onSuccess: (createdMovements) => {
      // Get unique inventory IDs
      const inventoryIds = new Set<string>(
        createdMovements.map((movement: StockMovementDetail) => movement.inventoryId)
      )
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.summary() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      
      // Invalidate specific inventory items
      inventoryIds.forEach((inventoryId: string) => {
        queryClient.invalidateQueries({ 
          queryKey: inventoryKeys.detail(inventoryId) 
        })
      })
      
      // Show success toast
      toast.success('Pergerakan stok batch berhasil', {
        description: `${createdMovements.length} pergerakan stok telah dicatat`,
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error('Gagal mencatat pergerakan stok batch', {
        description: error.message,
        duration: 5000,
      })
    },
  })
}
