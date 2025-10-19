/**
 * @fileoverview React Mutation hooks for delivery operations
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Provides mutation hooks for delivery lifecycle management:
 * - useUpdateDeliveryStatus: Update status with GPS
 * - useStartDelivery: Start delivery (departure)
 * - useArriveDelivery: Mark arrival at destination
 * - useCompleteDelivery: Complete delivery with quality check
 * - useFailDelivery: Mark delivery as failed
 * - useUploadDeliveryPhoto: Upload photo with GPS tagging
 * - useReportDeliveryIssue: Report delivery issue
 * - useTrackDeliveryLocation: Live GPS tracking
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deliveryApi } from '@/features/sppg/distribution/delivery/api'
import { deliveryKeys } from './useDeliveryQueries'
import type {
  UpdateDeliveryStatusInput,
  StartDeliveryInput,
  ArriveDeliveryInput,
  CompleteDeliveryInput,
  UploadPhotoInput,
  ReportIssueInput,
  TrackLocationInput,
} from '@/features/sppg/distribution/delivery/types'
import type { ApiResponse } from '@/lib/api-utils'
import type { DistributionDelivery } from '@prisma/client'

// ============================================================================
// Status Update Mutation
// ============================================================================

/**
 * Update delivery status with optional GPS location
 * 
 * @example
 * ```tsx
 * const { mutate: updateStatus, isPending } = useUpdateDeliveryStatus()
 * 
 * updateStatus({
 *   id: 'delivery_123',
 *   data: {
 *     status: 'IN_TRANSIT',
 *     currentLocation: '-6.2088,106.8456',
 *     notes: 'Mulai perjalanan'
 *   }
 * })
 * ```
 */
export function useUpdateDeliveryStatus(
  options?: UseMutationOptions<
    ApiResponse<DistributionDelivery>,
    Error,
    { id: string; data: UpdateDeliveryStatusInput }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await deliveryApi.updateStatus(id, data)
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      
      toast.success('Status pengiriman berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui status pengiriman')
    },
    ...options,
  })
}

// ============================================================================
// Start Delivery Mutation
// ============================================================================

/**
 * Start delivery - mark departure with GPS location
 * 
 * @example
 * ```tsx
 * const { mutate: startDelivery, isPending } = useStartDelivery()
 * 
 * startDelivery({
 *   id: 'delivery_123',
 *   data: {
 *     departureTime: new Date(),
 *     departureLocation: '-6.2088,106.8456',
 *     vehicleInfo: 'Mobil Box ABC 1234',
 *     driverName: 'Budi Santoso',
 *     helperNames: ['Ahmad', 'Siti']
 *   }
 * })
 * ```
 */
export function useStartDelivery(
  options?: UseMutationOptions<
    ApiResponse<DistributionDelivery>,
    Error,
    { id: string; data: StartDeliveryInput }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await deliveryApi.start(id, data)
    },
    onSuccess: (result, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      
      toast.success('Pengiriman berhasil dimulai')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memulai pengiriman')
    },
    ...options,
  })
}

// ============================================================================
// Arrive Delivery Mutation
// ============================================================================

/**
 * Mark arrival at destination with GPS location
 * 
 * @example
 * ```tsx
 * const { mutate: arrive, isPending } = useArriveDelivery()
 * 
 * arrive({
 *   id: 'delivery_123',
 *   data: {
 *     arrivalTime: new Date(),
 *     arrivalLocation: '-6.2188,106.8556',
 *     notes: 'Tiba di lokasi'
 *   }
 * })
 * ```
 */
export function useArriveDelivery(
  options?: UseMutationOptions<
    ApiResponse<DistributionDelivery>,
    Error,
    { id: string; data: ArriveDeliveryInput }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await deliveryApi.arrive(id, data)
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      
      toast.success('Pengiriman berhasil ditandai sampai di tujuan')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menandai kedatangan')
    },
    ...options,
  })
}

// ============================================================================
// Complete Delivery Mutation
// ============================================================================

/**
 * Complete delivery with recipient signature and quality check
 * 
 * @example
 * ```tsx
 * const { mutate: complete, isPending } = useCompleteDelivery()
 * 
 * complete({
 *   id: 'delivery_123',
 *   data: {
 *     deliveryCompletedAt: new Date(),
 *     portionsDelivered: 100,
 *     recipientName: 'Ibu Kepala Sekolah',
 *     recipientTitle: 'Kepala Sekolah',
 *     recipientSignature: 'data:image/png;base64,...',
 *     foodQualityChecked: true,
 *     foodQualityNotes: 'Makanan dalam kondisi baik',
 *     foodTemperature: 75,
 *     deliveryPhoto: 'https://...'
 *   }
 * })
 * ```
 */
export function useCompleteDelivery(
  options?: UseMutationOptions<
    ApiResponse<DistributionDelivery>,
    Error,
    { id: string; data: CompleteDeliveryInput }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await deliveryApi.complete(id, data)
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      
      const message = result.message || 'Pengiriman berhasil diselesaikan'
      toast.success(message)
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menyelesaikan pengiriman')
    },
    ...options,
  })
}

// ============================================================================
// Fail Delivery Mutation
// ============================================================================

/**
 * Mark delivery as failed with reason
 * 
 * @example
 * ```tsx
 * const { mutate: failDelivery, isPending } = useFailDelivery()
 * 
 * failDelivery({
 *   id: 'delivery_123',
 *   reason: 'Kendaraan rusak di jalan'
 * })
 * ```
 */
export function useFailDelivery(
  options?: UseMutationOptions<
    ApiResponse<DistributionDelivery>,
    Error,
    { id: string; reason: string }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      return await deliveryApi.fail(id, reason)
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      
      toast.error('Pengiriman ditandai gagal')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui status')
    },
    ...options,
  })
}

// ============================================================================
// Upload Photo Mutation
// ============================================================================

/**
 * Upload delivery photo with GPS tagging
 * 
 * @example
 * ```tsx
 * const { mutate: uploadPhoto, isPending } = useUploadDeliveryPhoto()
 * 
 * uploadPhoto({
 *   id: 'delivery_123',
 *   data: {
 *     photoUrl: 'https://...',
 *     photoType: 'DELIVERY_PROOF',
 *     caption: 'Makanan terkirim',
 *     locationTaken: '-6.2088,106.8456',
 *     fileSize: 2048000,
 *     mimeType: 'image/jpeg'
 *   }
 * })
 * ```
 */
export function useUploadDeliveryPhoto(
  options?: UseMutationOptions<
    ApiResponse<void>,
    Error,
    { id: string; data: UploadPhotoInput }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await deliveryApi.uploadPhoto(id, data)
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      
      toast.success('Foto berhasil diunggah')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal mengunggah foto')
    },
    ...options,
  })
}

// ============================================================================
// Report Issue Mutation
// ============================================================================

/**
 * Report delivery issue (traffic, damage, etc.)
 * 
 * @example
 * ```tsx
 * const { mutate: reportIssue, isPending } = useReportDeliveryIssue()
 * 
 * reportIssue({
 *   id: 'delivery_123',
 *   data: {
 *     issueType: 'TRAFFIC',
 *     severity: 'MEDIUM',
 *     description: 'Terjebak macet 1 jam di tol'
 *   }
 * })
 * ```
 */
export function useReportDeliveryIssue(
  options?: UseMutationOptions<
    ApiResponse<void>,
    Error,
    { id: string; data: ReportIssueInput }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await deliveryApi.reportIssue(id, data)
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
      
      toast.warning('Masalah berhasil dilaporkan')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal melaporkan masalah')
    },
    ...options,
  })
}

// ============================================================================
// Track Location Mutation
// ============================================================================

/**
 * Track live GPS location for delivery
 * 
 * @example
 * ```tsx
 * const { mutate: trackLocation, isPending } = useTrackDeliveryLocation()
 * 
 * // Track location every 30 seconds
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     navigator.geolocation.getCurrentPosition((position) => {
 *       trackLocation({
 *         id: 'delivery_123',
 *         data: {
 *           latitude: position.coords.latitude,
 *           longitude: position.coords.longitude,
 *           accuracy: position.coords.accuracy,
 *           status: 'IN_TRANSIT'
 *         }
 *       })
 *     })
 *   }, 30000)
 *   
 *   return () => clearInterval(interval)
 * }, [])
 * ```
 */
export function useTrackDeliveryLocation(
  options?: UseMutationOptions<
    ApiResponse<void>,
    Error,
    { id: string; data: TrackLocationInput }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await deliveryApi.trackLocation(id, data)
    },
    onSuccess: (result, variables) => {
      // Silently update tracking data
      queryClient.invalidateQueries({ queryKey: deliveryKeys.tracking(variables.id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(variables.id) })
      
      // No toast for tracking (happens frequently)
    },
    onError: (error) => {
      // Silent error for tracking (don't spam user)
      console.error('GPS tracking error:', error)
    },
    ...options,
  })
}
