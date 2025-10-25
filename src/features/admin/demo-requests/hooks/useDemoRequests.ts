/**
 * @fileoverview Demo Request TanStack Query Hooks
 * @version Next.js 15.5.4 / TanStack Query 5.x
 * @author Bagizi-ID Development Team
 * 
 * React hooks for Demo Request data fetching and mutations
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { demoRequestApi } from '../api/demoRequestApi'
import type {
  DemoRequestFormInput,
  DemoRequestFilters,
  DemoRequestApprovalInput,
  DemoRequestRejectionInput,
  DemoRequestAssignmentInput,
  DemoRequestConversionInput,
} from '../types/demo-request.types'

/**
 * Query keys for demo requests
 */
export const DEMO_REQUEST_KEYS = {
  all: ['admin', 'demo-requests'] as const,
  lists: () => [...DEMO_REQUEST_KEYS.all, 'list'] as const,
  list: (filters?: DemoRequestFilters) => [...DEMO_REQUEST_KEYS.lists(), filters] as const,
  details: () => [...DEMO_REQUEST_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DEMO_REQUEST_KEYS.details(), id] as const,
  analytics: () => [...DEMO_REQUEST_KEYS.all, 'analytics'] as const,
}

/**
 * Fetch all demo requests with optional filters
 */
export function useDemoRequests(filters?: DemoRequestFilters) {
  return useQuery({
    queryKey: DEMO_REQUEST_KEYS.list(filters),
    queryFn: async () => {
      const result = await demoRequestApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch demo requests')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch demo request by ID
 */
export function useDemoRequest(id: string) {
  return useQuery({
    queryKey: DEMO_REQUEST_KEYS.detail(id),
    queryFn: async () => {
      const result = await demoRequestApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch demo request')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch demo request analytics
 */
export function useDemoRequestAnalytics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...DEMO_REQUEST_KEYS.analytics(), startDate, endDate],
    queryFn: async () => {
      const result = await demoRequestApi.getAnalytics(startDate, endDate)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch analytics')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Create new demo request
 */
export function useCreateDemoRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: DemoRequestFormInput) => {
      const result = await demoRequestApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create demo request')
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch demo requests list
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.analytics() })
      toast.success('Demo request berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat demo request')
    }
  })
}

/**
 * Update existing demo request
 */
export function useUpdateDemoRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: Partial<DemoRequestFormInput> 
    }) => {
      const result = await demoRequestApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update demo request')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update specific demo request in cache
      queryClient.setQueryData(
        DEMO_REQUEST_KEYS.detail(variables.id),
        data
      )
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.analytics() })
      toast.success('Demo request berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui demo request')
    }
  })
}

/**
 * Delete demo request (soft delete)
 */
export function useDeleteDemoRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await demoRequestApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete demo request')
      }
      
      return result
    },
    onSuccess: (_, deletedId) => {
      // Remove from lists
      queryClient.setQueriesData<unknown>(
        { queryKey: DEMO_REQUEST_KEYS.lists() },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData
          return oldData.filter((item) => 'id' in item && item.id !== deletedId)
        }
      )
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.analytics() })
      toast.success('Demo request berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus demo request')
    }
  })
}

/**
 * Approve demo request
 */
export function useApproveDemoRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data?: DemoRequestApprovalInput 
    }) => {
      const result = await demoRequestApi.approve(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to approve demo request')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update in cache
      queryClient.setQueryData(DEMO_REQUEST_KEYS.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.analytics() })
      toast.success('Demo request berhasil disetujui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menyetujui demo request')
    }
  })
}

/**
 * Reject demo request
 */
export function useRejectDemoRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: DemoRequestRejectionInput 
    }) => {
      const result = await demoRequestApi.reject(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to reject demo request')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(DEMO_REQUEST_KEYS.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.analytics() })
      toast.success('Demo request berhasil ditolak')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menolak demo request')
    }
  })
}

/**
 * Assign demo request to platform user
 */
export function useAssignDemoRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: DemoRequestAssignmentInput 
    }) => {
      const result = await demoRequestApi.assign(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to assign demo request')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(DEMO_REQUEST_KEYS.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.lists() })
      toast.success('Demo request berhasil di-assign')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal assign demo request')
    }
  })
}

/**
 * Convert demo request to SPPG
 */
export function useConvertDemoRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: DemoRequestConversionInput 
    }) => {
      const result = await demoRequestApi.convert(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to convert demo request')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(DEMO_REQUEST_KEYS.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DEMO_REQUEST_KEYS.analytics() })
      toast.success('Demo request berhasil dikonversi ke SPPG')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal konversi demo request')
    }
  })
}
