/**
 * @fileoverview React Query Hooks for Distribution Schedule
 * @version Next.js 15.5.4 / TanStack Query v5
 * @description Comprehensive hooks for schedule CRUD operations and status management
 * @author Bagizi-ID Development Team
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { scheduleApi } from '../api'
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
  UpdateScheduleStatusInput,
  AssignVehicleInput,
  ScheduleFilters,
  ScheduleSortOptions,
} from '../types'

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for schedules
 */
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters?: ScheduleFilters) => 
    [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  statistics: () => [...scheduleKeys.all, 'statistics'] as const,
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch schedules with filters and pagination
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useSchedules({
 *   status: 'PLANNED',
 *   dateFrom: new Date('2025-01-01'),
 * })
 * ```
 */
export function useSchedules(
  filters?: ScheduleFilters,
  options?: {
    page?: number
    limit?: number
    sort?: ScheduleSortOptions
  }
) {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => scheduleApi.getAll(filters, options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single schedule by ID
 * 
 * @example
 * ```typescript
 * const { data: schedule, isLoading } = useSchedule('schedule_id')
 * ```
 */
export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => scheduleApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch schedule statistics
 * 
 * @example
 * ```typescript
 * const { data: stats } = useScheduleStatistics()
 * ```
 */
export function useScheduleStatistics() {
  return useQuery({
    queryKey: scheduleKeys.statistics(),
    queryFn: () => scheduleApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create new schedule mutation
 * 
 * @example
 * ```typescript
 * const { mutate: createSchedule, isPending } = useCreateSchedule()
 * 
 * createSchedule({
 *   distributionDate: new Date('2025-10-20'),
 *   wave: 'MORNING',
 *   menuName: 'Nasi Gudeg',
 *   // ... other fields
 * })
 * ```
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScheduleInput) => scheduleApi.create(data),
    onSuccess: (response) => {
      // Invalidate schedules list
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() })

      // Show success message
      toast.success('Jadwal distribusi berhasil dibuat', {
        description: `Kode: ${response.data.id}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat jadwal distribusi', {
        description: error.message,
      })
    },
  })
}

/**
 * Update existing schedule mutation
 * 
 * @example
 * ```typescript
 * const { mutate: updateSchedule } = useUpdateSchedule()
 * 
 * updateSchedule({
 *   id: 'schedule_id',
 *   data: { totalPortions: 1500 }
 * })
 * ```
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleInput }) =>
      scheduleApi.update(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific schedule
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.detail(variables.id) 
      })
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() })

      toast.success('Jadwal distribusi berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui jadwal distribusi', {
        description: error.message,
      })
    },
  })
}

/**
 * Delete schedule mutation
 * 
 * @example
 * ```typescript
 * const { mutate: deleteSchedule } = useDeleteSchedule()
 * 
 * deleteSchedule('schedule_id')
 * ```
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: scheduleKeys.detail(deletedId) 
      })
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() })

      toast.success('Jadwal distribusi berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus jadwal distribusi', {
        description: error.message,
      })
    },
  })
}

/**
 * Update schedule status mutation
 * 
 * @example
 * ```typescript
 * const { mutate: updateStatus } = useUpdateScheduleStatus()
 * 
 * updateStatus({
 *   id: 'schedule_id',
 *   data: {
 *     status: 'ASSIGNED',
 *     reason: 'Semua kendaraan sudah ditugaskan'
 *   }
 * })
 * ```
 */
export function useUpdateScheduleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string
      data: UpdateScheduleStatusInput 
    }) => scheduleApi.updateStatus(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific schedule
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.detail(variables.id) 
      })
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() })

      toast.success('Status jadwal berhasil diperbarui', {
        description: `Status baru: ${variables.data.status}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui status jadwal', {
        description: error.message,
      })
    },
  })
}

/**
 * Assign vehicle to schedule mutation
 * 
 * @example
 * ```typescript
 * const { mutate: assignVehicle } = useAssignVehicle()
 * 
 * assignVehicle({
 *   id: 'schedule_id',
 *   data: {
 *     vehicleId: 'vehicle_id',
 *     driverId: 'driver_id',
 *     estimatedDeparture: new Date(),
 *     estimatedArrival: new Date()
 *   }
 * })
 * ```
 */
export function useAssignVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string
      data: AssignVehicleInput 
    }) => scheduleApi.assignVehicle(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific schedule
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.detail(variables.id) 
      })
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })

      toast.success('Kendaraan berhasil ditugaskan', {
        description: 'Kendaraan telah ditambahkan ke jadwal',
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menugaskan kendaraan', {
        description: error.message,
      })
    },
  })
}

/**
 * Remove vehicle assignment from schedule mutation
 * 
 * @example
 * ```typescript
 * const { mutate: removeVehicle } = useRemoveVehicle()
 * 
 * removeVehicle({
 *   scheduleId: 'schedule_id',
 *   vehicleAssignmentId: 'assignment_id'
 * })
 * ```
 */
export function useRemoveVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      scheduleId, 
      vehicleAssignmentId 
    }: { 
      scheduleId: string
      vehicleAssignmentId: string 
    }) => scheduleApi.removeVehicle(scheduleId, vehicleAssignmentId),
    onSuccess: (response, variables) => {
      // Invalidate specific schedule
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.detail(variables.scheduleId) 
      })
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })

      toast.success('Penugasan kendaraan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus penugasan kendaraan', {
        description: error.message,
      })
    },
  })
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Check if schedule can transition to new status
 * 
 * @example
 * ```typescript
 * const canTransition = useCanTransitionStatus('PLANNED', 'ASSIGNED')
 * ```
 */
export function useCanTransitionStatus(
  currentStatus: string,
  targetStatus: string
): boolean {
  const transitions: Record<string, string[]> = {
    PLANNED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['CONFIRMED', 'PLANNED', 'CANCELLED'],
    CONFIRMED: ['IN_PROGRESS', 'ASSIGNED', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }

  return transitions[currentStatus]?.includes(targetStatus) ?? false
}

/**
 * Get available status transitions for current status
 * 
 * @example
 * ```typescript
 * const availableStatuses = useAvailableStatusTransitions('PLANNED')
 * // Returns: ['ASSIGNED', 'CANCELLED']
 * ```
 */
export function useAvailableStatusTransitions(
  currentStatus: string
): string[] {
  const transitions: Record<string, string[]> = {
    PLANNED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['CONFIRMED', 'PLANNED', 'CANCELLED'],
    CONFIRMED: ['IN_PROGRESS', 'ASSIGNED', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }

  return transitions[currentStatus] ?? []
}
