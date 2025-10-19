/**
 * @fileoverview Allergen TanStack Query Hooks
 * @version Next.js 15.5.4 / TanStack Query 5.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Client-Side State Management
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { allergensApi } from '@/features/sppg/menu/api'
import type { AllergenFilter } from '@/features/sppg/menu/types/allergen.types'
import type { AllergenCreateInput } from '@/features/sppg/menu/schemas/allergenSchema'

// === QUERY KEYS ===

export const allergenKeys = {
  all: ['allergens'] as const,
  lists: () => [...allergenKeys.all, 'list'] as const,
  list: (filters: AllergenFilter) => [...allergenKeys.lists(), filters] as const,
  details: () => [...allergenKeys.all, 'detail'] as const,
  detail: (id: string) => [...allergenKeys.details(), id] as const,
}

// === API CLIENT FUNCTIONS ===
// Note: All API calls now use centralized allergensApi from @/features/sppg/menu/api

// === QUERY HOOKS ===

/**
 * Hook to fetch all allergens
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useAllergens({ category: 'NUTS' })
 * ```
 */
export function useAllergens(filters?: AllergenFilter) {
  return useQuery({
    queryKey: allergenKeys.list(filters || {}),
    queryFn: async () => {
      const result = await allergensApi.getAll(filters)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch allergens')
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch only platform allergens
 * 
 * @example
 * ```tsx
 * const { data } = usePlatformAllergens()
 * // data.allergens contains only platform allergens (sppgId = null)
 * ```
 */
export function usePlatformAllergens() {
  const { data, ...rest } = useAllergens()
  
  return {
    data: data?.platformAllergens || [],
    total: data?.platformAllergens.length || 0,
    ...rest,
  }
}

/**
 * Hook to fetch only SPPG custom allergens
 * 
 * @example
 * ```tsx
 * const { data } = useCustomAllergens()
 * // data.allergens contains only SPPG custom allergens
 * ```
 */
export function useCustomAllergens() {
  const { data, ...rest } = useAllergens()
  
  return {
    data: data?.customAllergens || [],
    total: data?.customAllergens.length || 0,
    ...rest,
  }
}

/**
 * Hook to fetch common allergens only
 * 
 * @example
 * ```tsx
 * const { data } = useCommonAllergens()
 * ```
 */
export function useCommonAllergens() {
  return useAllergens({ isCommon: true })
}

// === MUTATION HOOKS ===

/**
 * Hook to create custom allergen
 * 
 * @example
 * ```tsx
 * const { mutate: createAllergen, isPending } = useCreateAllergen()
 * 
 * const handleSubmit = (data: AllergenCreateInput) => {
 *   createAllergen(data, {
 *     onSuccess: () => console.log('Allergen created!')
 *   })
 * }
 * ```
 */
export function useCreateAllergen() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: AllergenCreateInput) => {
      const result = await allergensApi.create(data)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create allergen')
      }
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate all allergen queries to refetch
      queryClient.invalidateQueries({ queryKey: allergenKeys.all })
      
      toast.success(`Alergen "${data.name}" berhasil ditambahkan`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan alergen')
    },
  })
}

// === HELPER HOOKS ===

/**
 * Hook to get allergen options for form select
 * 
 * @example
 * ```tsx
 * const { options, isLoading } = useAllergenOptions()
 * 
 * <Select>
 *   {options.map(option => (
 *     <SelectItem key={option.value} value={option.value}>
 *       {option.label}
 *     </SelectItem>
 *   ))}
 * </Select>
 * ```
 */
export function useAllergenOptions() {
  const { data, isLoading } = useAllergens()
  
  const options = (data?.allergens || []).map((allergen) => ({
    value: allergen.name,
    label: allergen.localName || allergen.name,
    category: allergen.category,
    isCommon: allergen.isCommon,
    isPlatform: allergen.sppgId === null,
  }))
  
  return {
    options,
    isLoading,
    platformOptions: options.filter((opt) => opt.isPlatform),
    customOptions: options.filter((opt) => !opt.isPlatform),
  }
}

/**
 * Hook to search allergens
 * 
 * @example
 * ```tsx
 * const { search, results, isSearching } = useAllergenSearch()
 * 
 * <Input 
 *   onChange={(e) => search(e.target.value)}
 *   placeholder="Cari alergen..."
 * />
 * ```
 */
export function useAllergenSearch(initialSearch = '') {
  const [searchTerm, setSearchTerm] = React.useState(initialSearch)
  
  const { data, isLoading } = useAllergens({ search: searchTerm })
  
  return {
    search: setSearchTerm,
    results: data?.allergens || [],
    isSearching: isLoading,
    searchTerm,
  }
}

// Import React for useState in useAllergenSearch
import React from 'react'
