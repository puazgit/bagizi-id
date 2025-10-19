/**
 * @fileoverview Distribution Type Definitions
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Core type definitions for Distribution domain
 */

// ============================================================================
// Core Distribution Types
// ============================================================================

export interface Distribution {
  id: string
  sppgId: string
  programId: string | null
  schoolId: string | null
  scheduleId: string | null
  distributionCode: string
  distributionDate: Date
  mealType: string
  status: string
  distributionPoint: string
  distributionMethod: string | null
  plannedRecipients: number | null
  actualRecipients: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface DistributionWithRelations extends Distribution {
  program?: {
    id: string
    name: string
    sppgId: string
  } | null
  school?: {
    schoolName: string
    schoolAddress: string
  } | null
  issues?: Array<{
    id: string
    reportedAt: Date
    issueDescription: string
  }>
  vehicleAssignments?: Array<{
    id: string
    vehicle: {
      vehicleName: string
      licensePlate: string
    }
  }>
  deliveries?: Array<{
    id: string
    createdAt: Date
  }>
  schedule?: {
    id: string
  } | null
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DistributionSummary {
  total: number
  scheduled: number
  preparing: number
  inTransit: number
  distributing: number
  completed: number
  cancelled: number
  totalDistributions?: number
  totalRecipients?: number
  byStatus?: Record<string, number>
  byMealType?: Record<string, number>
}

export interface DistributionsListResponse {
  distributions: Distribution[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: DistributionSummary
}

export interface DistributionDetailResponse {
  distribution: DistributionWithRelations
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface DistributionFilters {
  search?: string
  status?: string
  mealType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface DistributionInput {
  programId?: string
  schoolId?: string
  scheduleId?: string
  distributionDate: Date
  mealType: string
  status: string
  distributionPoint: string
  distributionMethod?: string
  plannedRecipients?: number
  actualRecipients?: number
  notes?: string
}

export interface DistributionUpdateInput extends Partial<DistributionInput> {
  id: string
}
