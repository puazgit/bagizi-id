/**
 * @fileoverview Regional Data TanStack Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  provinceApi,
  regencyApi,
  districtApi,
  villageApi,
  regionalStatsApi
} from '../api'
import type {
  CreateProvinceInput,
  UpdateProvinceInput,
  CreateRegencyInput,
  UpdateRegencyInput,
  CreateDistrictInput,
  UpdateDistrictInput,
  CreateVillageInput,
  UpdateVillageInput,
  RegionalFilters
} from '../types'

/**
 * Query keys for cache management
 */
export const regionalKeys = {
  all: ['regional'] as const,
  
  // Provinces
  provinces: () => [...regionalKeys.all, 'provinces'] as const,
  provincesList: (filters?: RegionalFilters) => [...regionalKeys.provinces(), 'list', filters] as const,
  province: (id: string) => [...regionalKeys.provinces(), 'detail', id] as const,
  provinceOptions: () => [...regionalKeys.provinces(), 'options'] as const,
  
  // Regencies
  regencies: () => [...regionalKeys.all, 'regencies'] as const,
  regenciesList: (filters?: RegionalFilters) => [...regionalKeys.regencies(), 'list', filters] as const,
  regency: (id: string) => [...regionalKeys.regencies(), 'detail', id] as const,
  regenciesByProvince: (provinceId: string) => [...regionalKeys.regencies(), 'by-province', provinceId] as const,
  
  // Districts
  districts: () => [...regionalKeys.all, 'districts'] as const,
  districtsList: (filters?: RegionalFilters) => [...regionalKeys.districts(), 'list', filters] as const,
  district: (id: string) => [...regionalKeys.districts(), 'detail', id] as const,
  districtsByRegency: (regencyId: string) => [...regionalKeys.districts(), 'by-regency', regencyId] as const,
  
  // Villages
  villages: () => [...regionalKeys.all, 'villages'] as const,
  villagesList: (filters?: RegionalFilters) => [...regionalKeys.villages(), 'list', filters] as const,
  village: (id: string) => [...regionalKeys.villages(), 'detail', id] as const,
  villagesByDistrict: (districtId: string) => [...regionalKeys.villages(), 'by-district', districtId] as const,
  
  // Statistics
  statistics: () => [...regionalKeys.all, 'statistics'] as const,
}

// ==================== PROVINCE HOOKS ====================

/**
 * Fetch provinces with filters
 */
export function useProvinces(filters?: RegionalFilters) {
  return useQuery({
    queryKey: regionalKeys.provincesList(filters),
    queryFn: async () => {
      const result = await provinceApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch provinces')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (master data changes infrequently)
    retry: 2
  })
}

/**
 * Fetch single province
 */
export function useProvince(id: string, enabled = true) {
  return useQuery({
    queryKey: regionalKeys.province(id),
    queryFn: async () => {
      const result = await provinceApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch province')
      }
      
      return result.data
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

/**
 * Fetch province options for cascade select
 */
export function useProvinceOptions() {
  return useQuery({
    queryKey: regionalKeys.provinceOptions(),
    queryFn: async () => {
      console.log('[useProvinceOptions] Fetching provinces...')
      const result = await provinceApi.getOptions()
      console.log('[useProvinceOptions] Result:', result)
      
      if (!result.success || !result.data) {
        console.error('[useProvinceOptions] Error:', result.error)
        throw new Error(result.error || 'Failed to fetch province options')
      }
      
      console.log('[useProvinceOptions] Success! Provinces count:', result.data.length)
      return result.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  })
}

/**
 * Create province mutation
 */
export function useCreateProvince() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProvinceInput) => {
      const result = await provinceApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create province')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.provinces() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success(`Province "${data.name}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create province')
    }
  })
}

/**
 * Update province mutation
 */
export function useUpdateProvince() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProvinceInput }) => {
      const result = await provinceApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update province')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.provinces() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.province(data.id) })
      toast.success(`Province "${data.name}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update province')
    }
  })
}

/**
 * Delete province mutation
 */
export function useDeleteProvince() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await provinceApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete province')
      }
      
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.provinces() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success('Province deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete province')
    }
  })
}

// ==================== REGENCY HOOKS ====================

/**
 * Fetch regencies with filters
 */
export function useRegencies(filters?: RegionalFilters) {
  return useQuery({
    queryKey: regionalKeys.regenciesList(filters),
    queryFn: async () => {
      const result = await regencyApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch regencies')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

/**
 * Fetch single regency
 */
export function useRegency(id: string, enabled = true) {
  return useQuery({
    queryKey: regionalKeys.regency(id),
    queryFn: async () => {
      const result = await regencyApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch regency')
      }
      
      return result.data
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

/**
 * Fetch regencies by province for cascade select
 */
export function useRegenciesByProvince(provinceId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: regionalKeys.regenciesByProvince(provinceId || ''),
    queryFn: async () => {
      if (!provinceId) return []
      
      const result = await regencyApi.getByProvince(provinceId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch regencies')
      }
      
      return result.data
    },
    enabled: enabled && !!provinceId,
    staleTime: 15 * 60 * 1000,
    retry: 2
  })
}

/**
 * Create regency mutation
 */
export function useCreateRegency() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateRegencyInput) => {
      const result = await regencyApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create regency')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.regencies() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success(`Regency "${data.name}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create regency')
    }
  })
}

/**
 * Update regency mutation
 */
export function useUpdateRegency() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRegencyInput }) => {
      const result = await regencyApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update regency')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.regencies() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.regency(data.id) })
      toast.success(`Regency "${data.name}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update regency')
    }
  })
}

/**
 * Delete regency mutation
 */
export function useDeleteRegency() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await regencyApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete regency')
      }
      
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.regencies() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success('Regency deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete regency')
    }
  })
}

// ==================== DISTRICT HOOKS ====================

/**
 * Fetch districts with filters
 */
export function useDistricts(filters?: RegionalFilters) {
  return useQuery({
    queryKey: regionalKeys.districtsList(filters),
    queryFn: async () => {
      const result = await districtApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch districts')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

/**
 * Fetch single district
 */
export function useDistrict(id: string, enabled = true) {
  return useQuery({
    queryKey: regionalKeys.district(id),
    queryFn: async () => {
      const result = await districtApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch district')
      }
      
      return result.data
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

/**
 * Fetch districts by regency for cascade select
 */
export function useDistrictsByRegency(regencyId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: regionalKeys.districtsByRegency(regencyId || ''),
    queryFn: async () => {
      if (!regencyId) return []
      
      const result = await districtApi.getByRegency(regencyId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch districts')
      }
      
      return result.data
    },
    enabled: enabled && !!regencyId,
    staleTime: 15 * 60 * 1000,
    retry: 2
  })
}

/**
 * Create district mutation
 */
export function useCreateDistrict() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateDistrictInput) => {
      const result = await districtApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create district')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.districts() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success(`District "${data.name}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create district')
    }
  })
}

/**
 * Update district mutation
 */
export function useUpdateDistrict() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDistrictInput }) => {
      const result = await districtApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update district')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.districts() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.district(data.id) })
      toast.success(`District "${data.name}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update district')
    }
  })
}

/**
 * Delete district mutation
 */
export function useDeleteDistrict() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await districtApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete district')
      }
      
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.districts() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success('District deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete district')
    }
  })
}

// ==================== VILLAGE HOOKS ====================

/**
 * Fetch villages with filters
 */
export function useVillages(filters?: RegionalFilters) {
  return useQuery({
    queryKey: regionalKeys.villagesList(filters),
    queryFn: async () => {
      const result = await villageApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch villages')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

/**
 * Fetch single village
 */
export function useVillage(id: string, enabled = true) {
  return useQuery({
    queryKey: regionalKeys.village(id),
    queryFn: async () => {
      const result = await villageApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch village')
      }
      
      return result.data
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

/**
 * Fetch villages by district for cascade select
 */
export function useVillagesByDistrict(districtId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: regionalKeys.villagesByDistrict(districtId || ''),
    queryFn: async () => {
      if (!districtId) return []
      
      const result = await villageApi.getByDistrict(districtId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch villages')
      }
      
      return result.data
    },
    enabled: enabled && !!districtId,
    staleTime: 15 * 60 * 1000,
    retry: 2
  })
}

/**
 * Create village mutation
 */
export function useCreateVillage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateVillageInput) => {
      const result = await villageApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create village')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.villages() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success(`Village "${data.name}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create village')
    }
  })
}

/**
 * Update village mutation
 */
export function useUpdateVillage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVillageInput }) => {
      const result = await villageApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update village')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.villages() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.village(data.id) })
      toast.success(`Village "${data.name}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update village')
    }
  })
}

/**
 * Delete village mutation
 */
export function useDeleteVillage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await villageApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete village')
      }
      
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionalKeys.villages() })
      queryClient.invalidateQueries({ queryKey: regionalKeys.statistics() })
      toast.success('Village deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete village')
    }
  })
}

// ==================== STATISTICS HOOKS ====================

/**
 * Fetch regional statistics
 */
export function useRegionalStatistics() {
  return useQuery({
    queryKey: regionalKeys.statistics(),
    queryFn: async () => {
      const result = await regionalStatsApi.getStatistics()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch statistics')
      }
      
      return result.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  })
}
