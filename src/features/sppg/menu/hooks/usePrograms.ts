/**
 * @fileoverview Programs hook for menu domain
 * @version Next.js 15.5.4 / TanStack Query / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { programsApi } from '../api/programsApi'

/**
 * Hook to fetch all nutrition programs for current SPPG
 */
export function usePrograms() {
  return useQuery({
    queryKey: ['sppg', 'programs'],
    queryFn: () => programsApi.getAll(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch a single program by ID
 */
export function useProgram(id: string) {
  return useQuery({
    queryKey: ['sppg', 'programs', id],
    queryFn: () => programsApi.getById(id),
    select: (data) => data.data,
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch active programs only
 */
export function useActivePrograms() {
  return useQuery({
    queryKey: ['sppg', 'programs', 'active'],
    queryFn: () => programsApi.getAll({ status: 'ACTIVE' }),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}