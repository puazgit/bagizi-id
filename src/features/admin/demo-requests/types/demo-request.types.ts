/**
 * @fileoverview Demo Request Types & Interfaces
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * TypeScript types for Demo Request management
 * Based on Prisma schema model DemoRequest
 */

import type { 
  DemoRequest, 
  DemoRequestStatus, 
  OrganizationType,
  DemoType,
  SPPG 
} from '@prisma/client'

/**
 * Demo Request with relations
 */
export interface DemoRequestWithRelations extends DemoRequest {
  demoSppg: Pick<SPPG, 'id' | 'name' | 'code'> | null
  productionSppg: Pick<SPPG, 'id' | 'name'> | null
}

/**
 * Demo Request list item (optimized for tables)
 */
export interface DemoRequestListItem {
  id: string
  organizationName: string
  picName: string
  picEmail: string
  picPhone: string
  organizationType: OrganizationType
  status: DemoRequestStatus
  demoType: DemoType
  targetBeneficiaries: number | null
  operationalArea: string | null
  conversionProbability: number | null
  assignedTo: string | null
  assignedAt: Date | null
  createdAt: Date
  updatedAt: Date
  demoSppg: {
    id: string
    name: string
    code: string
  } | null
}

/**
 * Demo Request form input (create/update)
 */
export interface DemoRequestFormInput {
  // Contact Information
  organizationName: string
  picName: string
  firstName?: string
  lastName?: string
  picEmail: string
  picPhone: string
  picWhatsapp?: string
  picPosition?: string
  
  // Organization Details
  organizationType: OrganizationType
  targetBeneficiaries?: number
  operationalArea?: string
  currentSystem?: string
  currentChallenges?: string[]
  expectedGoals?: string[]
  
  // Demo Details
  demoType: DemoType
  requestedFeatures?: string[]
  specialRequirements?: string
  preferredStartDate?: Date
  estimatedDuration?: number
  demoDuration?: number
  demoMode?: 'ONLINE' | 'OFFLINE' | 'HYBRID'
  preferredTime?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE'
  timezone?: string
  
  // Status & Assignment
  status?: DemoRequestStatus
  assignedTo?: string
  notes?: string
  
  // Follow-up
  followUpRequired?: boolean
  followUpDate?: Date
}

/**
 * Demo Request filters for list queries
 */
export interface DemoRequestFilters {
  status?: DemoRequestStatus
  organizationType?: OrganizationType
  startDate?: string
  endDate?: string
  search?: string
  assignedTo?: string
  isConverted?: boolean
}

/**
 * Demo Request approval input
 */
export interface DemoRequestApprovalInput {
  notes?: string
}

/**
 * Demo Request rejection input
 */
export interface DemoRequestRejectionInput {
  rejectionReason: string
  notes?: string
}

/**
 * Demo Request assignment input
 */
export interface DemoRequestAssignmentInput {
  assignedTo: string
  notes?: string
}

/**
 * Demo Request conversion input
 */
export interface DemoRequestConversionInput {
  convertedSppgId: string
  notes?: string
}

/**
 * Demo Request analytics response
 */
export interface DemoRequestAnalytics {
  period: {
    startDate: string
    endDate: string
  }
  conversionFunnel: {
    submitted: number
    underReview: number
    approved: number
    demoActive: number
    converted: number
    rejected: number
    expired: number
    cancelled: number
  }
  conversionMetrics: {
    totalRequests: number
    attendedDemos: number
    convertedToSppg: number
    approvalRate: string
    attendanceRate: string
    conversionRate: string
    overallConversionRate: string
    noShowRate: string
  }
  timeMetrics: {
    avgTimeToApproval: number // hours
    avgTimeToDemo: number // days
    avgTimeToConversion: number // days
  }
  orgTypeBreakdown: Array<{
    organizationType: OrganizationType
    count: number
    converted: number
    conversionRate: string
  }>
  monthlyTrends: Array<{
    month: string
    total: number
    approved: number
    converted: number
    conversionRate: string
  }>
  attendanceBreakdown: {
    attended: number
    noShow: number
    rescheduled: number
  }
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: unknown
}

/**
 * Demo Request status badge variants
 */
export const DEMO_REQUEST_STATUS_VARIANTS = {
  SUBMITTED: 'default',
  UNDER_REVIEW: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
  DEMO_ACTIVE: 'info',
  EXPIRED: 'warning',
  CONVERTED: 'success',
  CANCELLED: 'destructive',
} as const

/**
 * Organization type labels
 */
export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  PEMERINTAH: 'Pemerintah',
  SWASTA: 'Swasta',
  YAYASAN: 'Yayasan',
  KOMUNITAS: 'Komunitas',
  LAINNYA: 'Lainnya',
}

/**
 * Demo type labels
 */
export const DEMO_TYPE_LABELS: Record<DemoType, string> = {
  STANDARD: 'Standard (14 hari)',
  EXTENDED: 'Extended (30 hari)',
  GUIDED: 'Guided',
  SELF_SERVICE: 'Self Service',
}

/**
 * Demo request status labels
 */
export const DEMO_REQUEST_STATUS_LABELS: Record<DemoRequestStatus, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DEMO_ACTIVE: 'Demo Active',
  EXPIRED: 'Expired',
  CONVERTED: 'Converted',
  CANCELLED: 'Cancelled',
}
