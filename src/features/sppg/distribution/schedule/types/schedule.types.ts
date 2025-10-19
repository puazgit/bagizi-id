/**
 * @fileoverview DistributionSchedule Type Definitions
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @description Type definitions for distribution schedule module (planning phase)
 * @author Bagizi-ID Development Team
 */

import {
  DistributionSchedule,
  DistributionDelivery,
  VehicleAssignment,
  DistributionWave,
  BeneficiaryCategory,
  DistributionScheduleStatus, // Use Prisma-generated enum
} from '@prisma/client'

// ============================================================================
// SCHEDULE STATUS (Use Prisma-generated enum)
// ============================================================================

/**
 * Schedule Status enum - imported from Prisma
 * Flow: PLANNED → PREPARED → IN_PROGRESS → COMPLETED
 * Alternative: CANCELLED, DELAYED
 */
export { DistributionScheduleStatus as ScheduleStatus } from '@prisma/client'

// ============================================================================
// CORE SCHEDULE TYPES
// ============================================================================

/**
 * Schedule with all relations populated
 */
export interface ScheduleWithRelations extends DistributionSchedule {
  sppg: {
    id: string
    sppgName: string
    sppgCode: string
  }
  deliveries: DistributionDelivery[]
  vehicleAssignments: (VehicleAssignment & {
    vehicle: {
      id: string
      licensePlate: string
      vehicleType: string
      capacity: number
    }
  })[]
}

/**
 * Schedule list item (simplified for table view)
 */
export interface ScheduleListItem {
  id: string
  distributionDate: Date
  wave: DistributionWave
  menuName: string
  totalPortions: number
  estimatedBeneficiaries: number
  status: DistributionScheduleStatus
  deliveryMethod: string
  vehicleCount: number
  deliveryCount: number
  createdAt: Date
}

/**
 * Schedule detail (full information)
 */
export interface ScheduleDetail extends ScheduleWithRelations {
  stats: {
    totalDeliveries: number
    completedDeliveries: number
    totalPortions: number
    deliveredPortions: number
    totalBeneficiaries: number
    assignedVehicles: number
    estimatedCost: number
  }
}

// ============================================================================
// SCHEDULE STATUS TRANSITIONS & LABELS
// ============================================================================

/**
 * Status transition validation
 */
export const SCHEDULE_STATUS_TRANSITIONS: Record<
  DistributionScheduleStatus,
  DistributionScheduleStatus[]
> = {
  PLANNED: ['PREPARED', 'CANCELLED'],
  PREPARED: ['IN_PROGRESS', 'CANCELLED', 'DELAYED'],
  IN_PROGRESS: ['COMPLETED', 'DELAYED'],
  COMPLETED: [],
  CANCELLED: [],
  DELAYED: ['PREPARED', 'CANCELLED'],
}

/**
 * Status labels for UI
 */
export const SCHEDULE_STATUS_LABELS: Record<DistributionScheduleStatus, string> = {
  PLANNED: 'Direncanakan',
  PREPARED: 'Disiapkan',
  IN_PROGRESS: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  DELAYED: 'Tertunda',
}

/**
 * Status colors for badges
 */
export const SCHEDULE_STATUS_COLORS: Record<
  DistributionScheduleStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PLANNED: 'outline',
  PREPARED: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  DELAYED: 'outline',
}

// ============================================================================
// FORM INPUTS
// ============================================================================

/**
 * Create schedule input
 */
export interface CreateScheduleInput {
  // Schedule Details
  distributionDate: Date
  wave: DistributionWave

  // Target Information
  targetCategories: BeneficiaryCategory[]
  estimatedBeneficiaries: number

  // Menu & Portion
  menuName: string
  menuDescription?: string
  portionSize: number
  totalPortions: number

  // Packaging
  packagingType: string
  packagingCost?: number

  // Distribution Method
  deliveryMethod: string
  distributionTeam: string[]

  // Logistics
  estimatedTravelTime?: number
  fuelCost?: number
}

/**
 * Update schedule input (partial of create input)
 */
export type UpdateScheduleInput = Partial<CreateScheduleInput>


/**
 * Schedule status update input
 */
export interface UpdateScheduleStatusInput {
  status: DistributionScheduleStatus
  reason?: string
  notes?: string
}

/**
 * Vehicle assignment input
 */
export interface AssignVehicleInput {
  vehicleId: string
  driverId: string
  helpers?: string[]
  estimatedDeparture: Date
  estimatedArrival: Date
  notes?: string
}

// ============================================================================
// FILTER & SEARCH
// ============================================================================

/**
 * Schedule list filters
 */
export interface ScheduleFilters {
  status?: DistributionScheduleStatus | DistributionScheduleStatus[]
  dateFrom?: Date
  dateTo?: Date
  wave?: DistributionWave
  deliveryMethod?: string
  search?: string // Search by menu name, target, etc.
}

/**
 * Schedule sort options
 */
export interface ScheduleSortOptions {
  field:
    | 'distributionDate'
    | 'wave'
    | 'totalPortions'
    | 'status'
    | 'createdAt'
  direction: 'asc' | 'desc'
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for schedule list
 */
export interface ScheduleListResponse {
  success: boolean
  data: ScheduleListItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * API response for schedule detail
 */
export interface ScheduleDetailResponse {
  success: boolean
  data: ScheduleDetail
}

/**
 * API response for schedule creation
 */
export interface CreateScheduleResponse {
  success: boolean
  data: ScheduleWithRelations
  message: string
}

/**
 * API error response
 */
export interface ScheduleApiError {
  success: false
  error: string
  details?: Record<string, unknown>
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

/**
 * Schedule validation result
 */
export interface ScheduleValidationResult {
  isValid: boolean
  errors: {
    field: string
    message: string
  }[]
  warnings?: {
    field: string
    message: string
  }[]
}

/**
 * Vehicle assignment validation
 */
export interface VehicleAssignmentValidation {
  canAssign: boolean
  reason?: string
  conflicts?: {
    vehicleId: string
    conflictingScheduleId: string
    conflictingDate: Date
  }[]
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Schedule statistics
 */
export interface ScheduleStatistics {
  total: number
  byStatus: Record<DistributionScheduleStatus, number>
  byWave: Record<DistributionWave, number>
  byDeliveryMethod: Record<string, number>
  totalBeneficiaries: number
  totalPortions: number
  totalVehicles: number
  estimatedCosts: {
    packaging: number
    fuel: number
    total: number
  }
}

/**
 * Schedule timeline event
 */
export interface ScheduleTimelineEvent {
  id: string
  timestamp: Date
  type:
    | 'created'
    | 'status_changed'
    | 'vehicle_assigned'
    | 'vehicle_removed'
    | 'updated'
    | 'cancelled'
  title: string
  description: string
  actor?: {
    id: string
    name: string
    role: string
  }
  metadata?: Record<string, unknown>
}
