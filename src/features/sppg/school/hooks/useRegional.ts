/**
 * @fileoverview Regional Data Hooks (Provinces, Regencies, Districts)
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { regionalApi } from '../api/regionalApi'

/**
 * Hook to fetch all provinces
 */
export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const result = await regionalApi.getProvinces()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch provinces')
      }
      
      return result.data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (provinces don't change often)
  })
}

/**
 * Hook to fetch regencies by province
 * @param provinceId - Optional province ID to filter
 * @param options - Query options
 */
export function useRegencies(provinceId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['regencies', provinceId],
    queryFn: async () => {
      const result = await regionalApi.getRegencies(provinceId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch regencies')
      }
      
      return result.data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook to fetch districts by regency
 * @param regencyId - Optional regency ID to filter
 * @param options - Query options
 */
export function useDistricts(regencyId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['districts', regencyId],
    queryFn: async () => {
      const result = await regionalApi.getDistricts(regencyId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch districts')
      }
      
      return result.data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook to fetch villages by district (wrapper around existing useVillages)
 * @param districtId - Optional district ID to filter
 * @param options - Query options
 */
export function useVillagesByDistrict(districtId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['villages', districtId],
    queryFn: async () => {
      const result = await regionalApi.getVillages(districtId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch villages')
      }
      
      return result.data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: options?.enabled !== false,
  })
}
