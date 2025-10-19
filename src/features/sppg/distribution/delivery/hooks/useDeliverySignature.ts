/**
 * @fileoverview Delivery Signature Hooks
 * @version TanStack Query v5 + React 19
 * @see {@link /docs/copilot-instructions.md} Hook Guidelines
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deliveryApi } from '../api'
import { toast } from 'sonner'

/**
 * Add signature to delivery mutation hook
 * 
 * Features:
 * - Adds recipient signature to delivery
 * - Updates delivery status to DELIVERED
 * - Invalidates related queries
 * - Shows success/error toasts
 * 
 * @param deliveryId - Delivery ID
 * @returns Mutation object
 * 
 * @example
 * ```typescript
 * const { mutate: addSignature, isPending } = useAddSignature('delivery-123')
 * 
 * const handleSignature = (data: SignatureData) => {
 *   addSignature({
 *     signatureDataUrl: data.signatureDataUrl,
 *     recipientName: data.recipientName,
 *     recipientTitle: data.recipientTitle,
 *   })
 * }
 * ```
 */
export function useAddSignature(deliveryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      signatureDataUrl: string
      recipientName: string
      recipientTitle?: string
    }) => {
      const result = await deliveryApi.addSignature(deliveryId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to add signature')
      }
      
      return result.data
    },
    
    onSuccess: (data) => {
      // Invalidate delivery queries
      queryClient.invalidateQueries({
        queryKey: ['sppg', 'deliveries'],
      })
      queryClient.invalidateQueries({
        queryKey: ['sppg', 'delivery', deliveryId],
      })
      
      // Invalidate execution queries if delivery is linked to execution
      if (data.distributionId) {
        queryClient.invalidateQueries({
          queryKey: ['sppg', 'execution', data.distributionId],
        })
        queryClient.invalidateQueries({
          queryKey: ['sppg', 'execution', data.distributionId, 'deliveries'],
        })
      }
      
      toast.success('Tanda tangan berhasil ditambahkan', {
        description: 'Delivery telah dikonfirmasi dengan tanda tangan penerima',
      })
    },
    
    onError: (error: Error) => {
      toast.error('Gagal menambahkan tanda tangan', {
        description: error.message || 'Terjadi kesalahan saat menyimpan tanda tangan',
      })
    },
  })
}

/**
 * Remove signature from delivery mutation hook
 * 
 * Features:
 * - Removes recipient signature
 * - Clears recipient information
 * - Invalidates related queries
 * - Shows success/error toasts
 * 
 * @param deliveryId - Delivery ID
 * @returns Mutation object
 * 
 * @example
 * ```typescript
 * const { mutate: removeSignature, isPending } = useRemoveSignature('delivery-123')
 * 
 * const handleRemove = () => {
 *   if (confirm('Remove signature?')) {
 *     removeSignature()
 *   }
 * }
 * ```
 */
export function useRemoveSignature(deliveryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await deliveryApi.removeSignature(deliveryId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to remove signature')
      }
      
      return result.data
    },
    
    onSuccess: (data) => {
      // Invalidate delivery queries
      queryClient.invalidateQueries({
        queryKey: ['sppg', 'deliveries'],
      })
      queryClient.invalidateQueries({
        queryKey: ['sppg', 'delivery', deliveryId],
      })
      
      // Invalidate execution queries if delivery is linked to execution
      if (data.distributionId) {
        queryClient.invalidateQueries({
          queryKey: ['sppg', 'execution', data.distributionId],
        })
      }
      
      toast.success('Tanda tangan berhasil dihapus')
    },
    
    onError: (error: Error) => {
      toast.error('Gagal menghapus tanda tangan', {
        description: error.message || 'Terjadi kesalahan saat menghapus tanda tangan',
      })
    },
  })
}
