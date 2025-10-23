/**
 * @fileoverview React Query hooks for fetching school data (Autocomplete)
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * NOTE: This hook is specifically for autocomplete/dropdown usage.
 * For full school management, use hooks from @/features/sppg/school/hooks
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { schoolApi } from '@/features/sppg/school/api'

/**
 * School data (with student count for program calculations)
 */
export interface School {
  id: string
  schoolName: string
  schoolCode: string | null
  schoolType: string
  totalStudents: number
}

/**
 * React Query hook to fetch schools for autocomplete/selection
 * 
 * CRITICAL: Uses centralized schoolsApi with mode='autocomplete'
 * This ensures consistency across the application
 * 
 * Features:
 * - Automatic caching (5 minutes stale time)
 * - Loading and error states
 * - Filtered by user's SPPG (multi-tenancy)
 * - Only active schools ordered alphabetically
 * - Minimal fields for performance
 * 
 * @example
 * ```tsx
 * function SchoolSelector() {
 *   const { data: schools, isLoading, error } = useSchools()
 *   
 *   if (isLoading) return <div>Loading schools...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   
 *   return (
 *     <Select>
 *       {schools?.map(school => (
 *         <SelectItem key={school.id} value={school.schoolName}>
 *           {school.schoolName} {school.schoolCode && `(${school.schoolCode})`}
 *         </SelectItem>
 *       ))}
 *     </Select>
 *   )
 * }
 * ```
 * 
 * @returns React Query result with schools data, loading, and error states
 */
export function useSchools() {
  return useQuery({
    queryKey: ['schools', 'program-form'], // Changed key to reflect full data
    queryFn: async () => {
      // Fetch with 'standard' mode to get totalStudents field
      const result = await schoolApi.getAll({ mode: 'standard', isActive: true })
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch schools')
      }
      
      return result.data as School[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (previously cacheTime)
  })
}
