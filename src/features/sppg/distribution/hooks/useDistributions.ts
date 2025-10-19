/**
 * @fileoverview Distribution Hooks - TanStack Query hooks for distribution operations
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * 
 * @description
 * React hooks for distribution data fetching and mutations.
 * Uses TanStack Query for caching, optimistic updates, and real-time sync.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

interface DistributionFilters {
  search?: string
  status?: string
  mealType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

interface DistributionSummary {
  total: number
  scheduled: number
  preparing: number
  inTransit: number
  distributing: number
  completed: number
  cancelled: number
}

interface Distribution {
  id: string
  sppgId: string
  programId: string | null
  schoolId: string | null
  scheduleId: string | null
  distributionCode: string
  distributionDate: string
  mealType: string
  status: string
  distributionPoint: string
  distributionMethod: string | null
  plannedRecipients: number | null
  actualRecipients: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  program?: {
    id: string
    name: string
    sppgId: string
  } | null
  school?: {
    schoolName: string
    schoolAddress: string
  } | null
}

interface DistributionsResponse {
  success: boolean
  data?: {
    distributions: Distribution[]
    total: number
    page: number
    limit: number
    totalPages: number
    summary: DistributionSummary
  }
  error?: string
}

interface DistributionDetailResponse {
  success: boolean
  data?: unknown // Distribution detail with all relations
  error?: string
}

// ============================================================================
// Query Keys Factory
// ============================================================================

export const distributionKeys = {
  all: ['distributions'] as const,
  lists: () => [...distributionKeys.all, 'list'] as const,
  list: (filters?: DistributionFilters) => 
    [...distributionKeys.lists(), filters] as const,
  details: () => [...distributionKeys.all, 'detail'] as const,
  detail: (id: string) => [...distributionKeys.details(), id] as const,
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Fetch single distribution by ID
 */
async function fetchDistribution(id: string): Promise<DistributionDetailResponse> {
  const response = await fetch(`/api/sppg/distribution/${id}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch distribution')
  }
  
  return response.json()
}

/**
 * Fetch distributions list with filters
 */
async function fetchDistributions(
  filters?: DistributionFilters
): Promise<DistributionsResponse> {
  const params = new URLSearchParams()
  
  if (filters?.search) params.append('search', filters.search)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.mealType) params.append('mealType', filters.mealType)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  
  const queryString = params.toString()
  const url = queryString 
    ? `/api/sppg/distribution?${queryString}`
    : '/api/sppg/distribution'
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch distributions')
  }
  
  return response.json()
}

/**
 * Delete a distribution
 */
async function deleteDistribution(id: string): Promise<void> {
  const response = await fetch(`/api/sppg/distribution/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete distribution')
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch distributions list with filters
 * 
 * @param filters - Filter parameters
 * @returns TanStack Query result with distributions data
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useDistributions({
 *   search: 'Jakarta',
 *   status: 'SCHEDULED',
 *   page: 1,
 *   limit: 20,
 * })
 * ```
 */
export function useDistributions(filters?: DistributionFilters) {
  return useQuery({
    queryKey: distributionKeys.list(filters),
    queryFn: () => fetchDistributions(filters),
    select: (response) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid response')
      }
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch single distribution by ID
 * 
 * @param id - Distribution ID
 * @returns TanStack Query result with distribution detail
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useDistribution('dist_123')
 * ```
 */
export function useDistribution(id: string) {
  return useQuery({
    queryKey: distributionKeys.detail(id),
    queryFn: () => fetchDistribution(id),
    select: (response) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid response')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Delete distribution mutation
 * 
 * @returns TanStack Query mutation for deleting distribution
 * 
 * @example
 * ```tsx
 * const { mutate: deleteDistribution } = useDeleteDistribution()
 * 
 * deleteDistribution('dist_123')
 * ```
 */
export function useDeleteDistribution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteDistribution,
    onSuccess: () => {
      // Invalidate all distribution queries
      queryClient.invalidateQueries({ 
        queryKey: distributionKeys.lists() 
      })
      
      toast.success('Distribusi berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus distribusi')
    },
  })
}
