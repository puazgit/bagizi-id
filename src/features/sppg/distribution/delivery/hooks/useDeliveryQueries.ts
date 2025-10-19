/**
 * @fileoverview React Query hooks for delivery tracking
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Provides data fetching hooks for delivery management:
 * - useDeliveries: List deliveries by execution with filters
 * - useDelivery: Get single delivery detail
 * - useDeliveryTracking: Get GPS tracking history
 * - useActiveDeliveries: Filter for active deliveries only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { deliveryApi } from '@/features/sppg/distribution/delivery/api'
import type {
  DeliveryFilters,
  DeliveryListResponse,
  DeliveryDetailResponse,
  TrackingHistoryResponse,
} from '@/features/sppg/distribution/delivery/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const deliveryKeys = {
  all: ['deliveries'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  allDeliveries: (filters?: Partial<DeliveryFilters>) =>
    [...deliveryKeys.lists(), 'all-deliveries', filters] as const,
  list: (executionId: string, filters?: DeliveryFilters) =>
    [...deliveryKeys.lists(), executionId, filters] as const,
  details: () => [...deliveryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deliveryKeys.details(), id] as const,
  tracking: (id: string) => [...deliveryKeys.all, 'tracking', id] as const,
  active: (executionId: string) =>
    [...deliveryKeys.all, 'active', executionId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch ALL deliveries across all schedules for current SPPG
 * 
 * @param filters - Optional filter parameters
 * @param options - Optional pagination and TanStack Query options
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useAllDeliveries({
 *   status: ['DEPARTED', 'ASSIGNED'],
 *   driverName: 'Pak Budi'
 * }, {
 *   page: 1,
 *   limit: 20
 * })
 * 
 * if (data) {
 *   console.log(`Total deliveries: ${data.pagination.total}`)
 *   console.log(`In progress: ${data.statistics.inProgress}`)
 * }
 * ```
 */
export function useAllDeliveries(
  filters?: {
    status?: string | string[]
    driverName?: string
    dateFrom?: Date
    dateTo?: Date
    search?: string
  },
  paginationOptions?: {
    page?: number
    limit?: number
    sortField?: string
    sortDirection?: 'asc' | 'desc'
  },
  options?: Omit<
    UseQueryOptions<DeliveryListResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: deliveryKeys.allDeliveries(filters),
    queryFn: async () => {
      const result = await deliveryApi.getAll(filters, paginationOptions)
      
      if (!result.success || !result.data) {
        throw new Error('Gagal mengambil data semua pengiriman')
      }
      
      return result
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  })
}

/**
 * Fetch deliveries by execution ID with optional filters
 * 
 * @param executionId - FoodDistribution execution ID
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useDeliveries('exec_123', {
 *   status: ['IN_TRANSIT', 'ARRIVED'],
 *   hasIssues: true
 * })
 * ```
 */
export function useDeliveries(
  executionId: string,
  filters?: DeliveryFilters,
  options?: Omit<
    UseQueryOptions<DeliveryListResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: deliveryKeys.list(executionId, filters),
    queryFn: async () => {
      const result = await deliveryApi.getByExecution(executionId, filters)
      
      if (!result.success || !result.data) {
        throw new Error('Gagal mengambil data pengiriman')
      }
      
      return result
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  })
}

/**
 * Fetch single delivery detail with full relations
 * 
 * @param id - Delivery ID
 * @param options - TanStack Query options
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useDelivery('delivery_123')
 * 
 * if (data?.data) {
 *   console.log(data.data.metrics.isOnTime)
 *   console.log(data.data.parsedLocations.departure)
 * }
 * ```
 */
export function useDelivery(
  id: string,
  options?: Omit<
    UseQueryOptions<DeliveryDetailResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn: async () => {
      const result = await deliveryApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error('Gagal mengambil detail pengiriman')
      }
      
      return result
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  })
}

/**
 * Fetch GPS tracking history for a delivery
 * 
 * @param id - Delivery ID
 * @param options - TanStack Query options
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useDeliveryTracking('delivery_123')
 * 
 * if (data) {
 *   console.log(`Total distance: ${data.statistics.totalDistance} km`)
 *   console.log(`Tracking points: ${data.data.length}`)
 * }
 * ```
 */
export function useDeliveryTracking(
  id: string,
  options?: Omit<
    UseQueryOptions<TrackingHistoryResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: deliveryKeys.tracking(id),
    queryFn: async () => {
      const result = await deliveryApi.getTrackingHistory(id)
      
      if (!result.success || !result.data) {
        throw new Error('Gagal mengambil riwayat tracking')
      }
      
      return result
    },
    staleTime: 15 * 1000, // 15 seconds - more frequent for real-time tracking
    ...options,
  })
}

/**
 * Fetch active deliveries (IN_TRANSIT or ARRIVED status)
 * 
 * @param executionId - FoodDistribution execution ID
 * @param options - TanStack Query options
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useActiveDeliveries('exec_123')
 * 
 * // Auto-filtered for IN_TRANSIT and ARRIVED status
 * const activeCount = data?.data.length || 0
 * ```
 */
export function useActiveDeliveries(
  executionId: string,
  options?: Omit<
    UseQueryOptions<DeliveryListResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: deliveryKeys.active(executionId),
    queryFn: async () => {
      const result = await deliveryApi.getByExecution(executionId, {
        status: 'DEPARTED',
      })
      
      if (!result.success || !result.data) {
        throw new Error('Gagal mengambil pengiriman aktif')
      }
      
      return result
    },
    staleTime: 15 * 1000, // 15 seconds (more frequent for active monitoring)
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    ...options,
  })
}
