/**
 * @fileoverview SPPG Management Types
 * @version Next.js 15.5.4 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import type { OrganizationType, SppgStatus, Timezone } from '@prisma/client'

/**
 * SPPG with related data for list display
 */
export interface SppgListItem {
  id: string
  code: string
  name: string
  description: string | null
  organizationType: OrganizationType
  status: SppgStatus
  phone: string
  email: string
  picName: string
  picPosition: string
  targetRecipients: number
  establishedYear: number | null
  operationStartDate: Date
  isDemoAccount: boolean
  demoExpiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  // Regional info
  province: {
    id: string
    name: string
  }
  regency: {
    id: string
    name: string
  }
  district: {
    id: string
    name: string
  }
  village: {
    id: string
    name: string
  }
  // Stats
  _count: {
    users: number
    nutritionPrograms: number
    schoolBeneficiaries: number
  }
}

/**
 * Full SPPG detail with all relations
 */
export interface SppgDetail extends SppgListItem {
  addressDetail: string
  postalCode: string | null
  coordinates: string | null
  timezone: Timezone
  picEmail: string
  picPhone: string
  picWhatsapp: string | null
  maxRadius: number
  maxTravelTime: number
  operationEndDate: Date | null
  monthlyBudget: number | null
  yearlyBudget: number | null
  budgetStartDate: Date | null
  budgetEndDate: Date | null
  budgetCurrency: string
  budgetAllocation: Record<string, unknown> | null
  budgetAutoReset: boolean
  budgetAlertThreshold: number
  demoStartedAt: Date | null
  demoParentId: string | null
  demoMaxBeneficiaries: number | null
  demoAllowedFeatures: string[]
  // Users list
  users: Array<{
    id: string
    name: string
    email: string
    userRole: string | null
    userType: string
    isActive: boolean
    lastLogin: Date | null
  }>
}

/**
 * Input for creating new SPPG
 */
export interface CreateSppgInput {
  // Basic Info
  code: string
  name: string
  description?: string
  organizationType: OrganizationType
  establishedYear?: number
  targetRecipients: number
  
  // Location
  addressDetail: string
  provinceId: string
  regencyId: string
  districtId: string
  villageId: string
  postalCode?: string
  coordinates?: string
  timezone: Timezone
  
  // Contact
  phone: string
  email: string
  
  // PIC (Person In Charge)
  picName: string
  picPosition: string
  picEmail: string
  picPhone: string
  picWhatsapp?: string
  
  // Operations
  maxRadius: number
  maxTravelTime: number
  operationStartDate: Date | string
  operationEndDate?: Date | string | null
  
  // Budget
  monthlyBudget?: number
  yearlyBudget?: number
  budgetCurrency?: string
  budgetStartDate?: Date | string
  budgetEndDate?: Date | string | null
  
  // Demo Settings
  isDemoAccount?: boolean
  demoExpiresAt?: Date | string | null
  demoMaxBeneficiaries?: number
  demoAllowedFeatures?: string[]
  
  // Status
  status?: SppgStatus
}

/**
 * Input for updating existing SPPG
 */
export interface UpdateSppgInput extends Partial<CreateSppgInput> {
  id: string
}

/**
 * Filters for SPPG list
 */
export interface SppgFilters {
  search?: string
  status?: SppgStatus
  organizationType?: OrganizationType
  provinceId?: string
  regencyId?: string
  isDemoAccount?: boolean
  sortBy?: 'name' | 'code' | 'createdAt' | 'targetRecipients'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * API Response types
 */
export interface SppgListResponse {
  data: SppgListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SppgDetailResponse {
  data: SppgDetail
}

export interface SppgCreateResponse {
  data: SppgDetail
}

export interface SppgUpdateResponse {
  data: SppgDetail
}

/**
 * SPPG Statistics for admin dashboard
 */
export interface SppgStatistics {
  totals: {
    totalSppg: number
    activeSppg: number
    inactiveSppg: number
    suspendedSppg: number
    demoSppg: number
    productionSppg: number
  }
  byOrganizationType: Array<{
    organizationType: OrganizationType
    count: number
  }>
  byProvince: Array<{
    provinceId: string
    provinceName: string
    count: number
  }>
  aggregates: {
    totalUsers: number
    totalPrograms: number
    totalBeneficiaries: number
    averageUsersPerSppg: number
    averageProgramsPerSppg: number
    averageBeneficiariesPerSppg: number
  }
  recent: Array<{
    id: string
    code: string
    name: string
    organizationType: OrganizationType
    status: SppgStatus
    createdAt: Date
    province: {
      name: string
    }
  }>
  generatedAt: string
}
