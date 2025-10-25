/**
 * @fileoverview SPPG Management Hooks - TanStack Query
 * @version Next.js 15.5.4 / TanStack Query 5.90.2
 * @author Bagizi-ID Development Team
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sppgApi } from '../api'
import type { SppgFilters, CreateSppgInput, UpdateSppgInput } from '../types'
import { toast } from 'sonner'

/**
 * Query key factory for SPPG queries
 */
export const sppgKeys = {
  all: ['admin', 'sppg'] as const,
  lists: () => [...sppgKeys.all, 'list'] as const,
  list: (filters?: SppgFilters) => [...sppgKeys.lists(), filters] as const,
  details: () => [...sppgKeys.all, 'detail'] as const,
  detail: (id: string) => [...sppgKeys.details(), id] as const,
  statistics: () => [...sppgKeys.all, 'statistics'] as const,
}

/**
 * Hook: Fetch all SPPG with filters and pagination
 */
export function useSppgs(filters?: SppgFilters) {
  return useQuery({
    queryKey: sppgKeys.list(filters),
    queryFn: async () => {
      const result = await sppgApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch SPPG list')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook: Fetch single SPPG by ID
 */
export function useSppg(id: string | undefined) {
  return useQuery({
    queryKey: sppgKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('SPPG ID is required')
      }
      
      const result = await sppgApi.getById(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch SPPG detail')
      }
      
      // Access nested data structure: result.data.data
      if (!result.data?.data) {
        throw new Error('SPPG data not found')
      }
      
      return result.data.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on 404
  })
}

/**
 * Hook: Fetch SPPG statistics
 */
export function useSppgStatistics() {
  return useQuery({
    queryKey: sppgKeys.statistics(),
    queryFn: async () => {
      const result = await sppgApi.getStatistics()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch SPPG statistics')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook: Create new SPPG
 */
export function useCreateSppg() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateSppgInput) => {
      const result = await sppgApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create SPPG')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch SPPG lists
      queryClient.invalidateQueries({ queryKey: sppgKeys.lists() })
      queryClient.invalidateQueries({ queryKey: sppgKeys.statistics() })
      
      toast.success('SPPG berhasil dibuat', {
        description: `${data.name} (${data.code}) telah ditambahkan ke sistem`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat SPPG', {
        description: error.message
      })
    }
  })
}

/**
 * Hook: Update existing SPPG
 */
export function useUpdateSppg() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UpdateSppgInput> }) => {
      const result = await sppgApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update SPPG')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update specific SPPG in cache
      queryClient.setQueryData(sppgKeys.detail(variables.id), (old: unknown) => {
        if (!old) return { data }
        return { ...(old as Record<string, unknown>), data }
      })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: sppgKeys.lists() })
      queryClient.invalidateQueries({ queryKey: sppgKeys.statistics() })
      
      toast.success('SPPG berhasil diperbarui', {
        description: `Perubahan pada ${data.name} telah disimpan`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui SPPG', {
        description: error.message
      })
    }
  })
}

/**
 * Hook: Delete SPPG (soft delete)
 */
export function useDeleteSppg() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await sppgApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete SPPG')
      }
      
      return id
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: sppgKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: sppgKeys.lists() })
      queryClient.invalidateQueries({ queryKey: sppgKeys.statistics() })
      
      toast.success('SPPG berhasil dihapus', {
        description: 'SPPG telah dinonaktifkan dari sistem'
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus SPPG', {
        description: error.message
      })
    }
  })
}

/**
 * Hook: Activate SPPG
 */
export function useActivateSppg() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await sppgApi.activate(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to activate SPPG')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(sppgKeys.detail(data.id), { data })
      queryClient.invalidateQueries({ queryKey: sppgKeys.lists() })
      queryClient.invalidateQueries({ queryKey: sppgKeys.statistics() })
      
      toast.success('SPPG berhasil diaktifkan', {
        description: `${data.name} sekarang aktif`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal mengaktifkan SPPG', {
        description: error.message
      })
    }
  })
}

/**
 * Hook: Suspend SPPG
 */
export function useSuspendSppg() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const result = await sppgApi.suspend(id, reason)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to suspend SPPG')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(sppgKeys.detail(data.id), { data })
      queryClient.invalidateQueries({ queryKey: sppgKeys.lists() })
      queryClient.invalidateQueries({ queryKey: sppgKeys.statistics() })
      
      toast.warning('SPPG berhasil disuspend', {
        description: `${data.name} telah ditangguhkan`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal suspend SPPG', {
        description: error.message
      })
    }
  })
}
