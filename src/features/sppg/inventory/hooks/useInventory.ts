/**
 * @fileoverview Inventory Management Hooks with TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventoryApi'
import type {
  InventoryFilters,
  CreateInventoryInput,
  UpdateInventoryInput,
  InventoryItem,
} from '../types'
import type { ApiResponse } from '@/lib/api-utils'
import { toast } from 'sonner'

/**
 * Query key factory for inventory
 * Provides type-safe query keys with dependency tracking
 */
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters?: InventoryFilters) => [...inventoryKeys.lists(), { filters }] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
}

/**
 * Hook: Fetch inventory items list with filters
 * 
 * Features:
 * - Advanced filtering (category, stock status, supplier, etc)
 * - Search functionality
 * - 5-minute cache with stale-while-revalidate
 * - Automatic refetch on window focus
 * 
 * @param filters - Filter parameters
 * @returns Query result with inventory items
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useInventoryList({
 *   category: 'PROTEIN_HEWANI',
 *   stockStatus: 'LOW_STOCK'
 * })
 * ```
 */
export function useInventoryList(filters?: InventoryFilters) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: async () => {
      const result = await inventoryApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch inventory items')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  })
}

/**
 * Hook: Fetch single inventory item by ID
 * 
 * Features:
 * - Includes stock movements and supplier details
 * - 10-minute cache (less frequent updates)
 * - Optimistic updates from mutations
 * 
 * @param id - Inventory item ID
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with inventory item details
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useInventoryItem(itemId)
 * ```
 */
export function useInventoryItem(id: string, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: async () => {
      const result = await inventoryApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch inventory item')
      }
      
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook: Create new inventory item
 * 
 * Features:
 * - Optimistic UI update (instant feedback)
 * - Automatic list invalidation
 * - Success/error toast notifications
 * - Rollback on error
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useCreateInventory()
 * 
 * mutate({
 *   itemName: 'Ayam Kampung',
 *   category: 'PROTEIN_HEWANI',
 *   unit: 'kg',
 *   costPerUnit: 45000
 * }, {
 *   onSuccess: (item) => {
 *     router.push(`/inventory/${item.id}`)
 *   }
 * })
 * ```
 */
export function useCreateInventory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateInventoryInput) => {
      const result = await inventoryApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create inventory item')
      }
      
      return result.data
    },
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() })
      
      // Snapshot previous value
      const previousItems = queryClient.getQueryData(inventoryKeys.lists())
      
      // Optimistically update to the new value
      queryClient.setQueryData<ApiResponse<InventoryItem[]>>(inventoryKeys.lists(), (old) => {
        if (!old?.data) return old
        
        // Create optimistic item with all required fields
        const optimisticItem: InventoryItem = {
          id: 'temp-' + Date.now(),
          sppgId: 'temp-sppg',
          itemName: newItem.itemName,
          itemCode: newItem.itemCode ?? null,
          brand: newItem.brand ?? null,
          category: newItem.category,
          unit: newItem.unit,
          currentStock: newItem.currentStock ?? 0,
          minStock: newItem.minStock,
          maxStock: newItem.maxStock,
          reorderQuantity: newItem.reorderQuantity ?? null,
          lastPrice: newItem.lastPrice ?? null,
          averagePrice: null,
          costPerUnit: newItem.costPerUnit ?? null,
          preferredSupplierId: newItem.preferredSupplierId ?? null,
          legacySupplierName: newItem.legacySupplierName ?? null,
          supplierContact: newItem.supplierContact ?? null,
          leadTime: newItem.leadTime ?? null,
          storageLocation: newItem.storageLocation,
          storageCondition: newItem.storageCondition ?? null,
          hasExpiry: newItem.hasExpiry ?? false,
          shelfLife: newItem.shelfLife ?? null,
          calories: newItem.calories ?? null,
          protein: newItem.protein ?? null,
          carbohydrates: newItem.carbohydrates ?? null,
          fat: newItem.fat ?? null,
          fiber: newItem.fiber ?? null,
          isActive: newItem.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
          preferredSupplier: null,
        }
        
        return {
          ...old,
          data: [optimisticItem, ...old.data],
        }
      })
      
      return { previousItems }
    },
    onSuccess: (newItem) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      
      // Show success toast
      toast.success('Item inventori berhasil dibuat', {
        description: `${newItem.itemName} telah ditambahkan ke inventori`,
        duration: 3000,
      })
    },
    onError: (error: Error, newItem, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(inventoryKeys.lists(), context.previousItems)
      }
      
      // Show error toast
      toast.error('Gagal membuat item inventori', {
        description: error.message,
        duration: 5000,
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
    },
  })
}

/**
 * Hook: Update existing inventory item
 * 
 * Features:
 * - Optimistic update on detail view
 * - Automatic cache invalidation
 * - Success/error notifications
 * - Rollback on error
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useUpdateInventory()
 * 
 * mutate({
 *   id: itemId,
 *   data: {
 *     costPerUnit: 50000,
 *     minStock: 20
 *   }
 * })
 * ```
 */
export function useUpdateInventory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInventoryInput }) => {
      const result = await inventoryApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update inventory item')
      }
      
      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: inventoryKeys.detail(id) })
      
      // Snapshot previous value
      const previousItem = queryClient.getQueryData(inventoryKeys.detail(id))
      
      // Optimistically update to the new value
      queryClient.setQueryData<ApiResponse<InventoryItem>>(inventoryKeys.detail(id), (old) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: {
            ...old.data,
            ...data,
            updatedAt: new Date(),
          },
        }
      })
      
      return { previousItem, id }
    },
    onSuccess: (updatedItem) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(updatedItem.id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      
      // Show success toast
      toast.success('Item inventori berhasil diperbarui', {
        description: `${updatedItem.itemName} telah diperbarui`,
        duration: 3000,
      })
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousItem) {
        queryClient.setQueryData(
          inventoryKeys.detail(context.id),
          context.previousItem
        )
      }
      
      // Show error toast
      toast.error('Gagal memperbarui item inventori', {
        description: error.message,
        duration: 5000,
      })
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) })
    },
  })
}

/**
 * Hook: Delete inventory item
 * 
 * Features:
 * - Optimistic removal from list
 * - Confirmation handled by component
 * - Success/error notifications
 * - Rollback on error
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useDeleteInventory()
 * 
 * // In component with confirmation
 * if (confirm('Hapus item inventori?')) {
 *   mutate(itemId, {
 *     onSuccess: () => {
 *       router.push('/inventory')
 *     }
 *   })
 * }
 * ```
 */
export function useDeleteInventory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await inventoryApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete inventory item')
      }
      
      return id
    },
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() })
      
      // Snapshot previous value
      const previousItems = queryClient.getQueryData(inventoryKeys.lists())
      
      // Optimistically remove from list
      queryClient.setQueryData<ApiResponse<InventoryItem[]>>(inventoryKeys.lists(), (old) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.filter((item) => item.id !== deletedId),
        }
      })
      
      return { previousItems, deletedId }
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: inventoryKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      
      // Show success toast
      toast.success('Item inventori berhasil dihapus', {
        description: 'Item telah dihapus dari inventori',
        duration: 3000,
      })
    },
    onError: (error: Error, deletedId, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(inventoryKeys.lists(), context.previousItems)
      }
      
      // Show error toast
      toast.error('Gagal menghapus item inventori', {
        description: error.message,
        duration: 5000,
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
    },
  })
}
