/**
 * @fileoverview Production domain TypeScript types based on Prisma models
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import type { ProductionStatus, FoodProduction, QualityControl, NutritionMenu, NutritionProgram } from '@prisma/client'

// ================================ RE-EXPORT PRISMA TYPES ================================

export type { ProductionStatus, FoodProduction, QualityControl, NutritionMenu, NutritionProgram }

// ================================ PRODUCTION TYPES ================================

/**
 * Food Production with full relations
 */
export interface ProductionWithRelations extends FoodProduction {
  sppg?: {
    id: string
    sppgName: string
    sppgCode: string
  }
  program?: {
    id: string
    programName: string
  }
  menu?: {
    id: string
    menuName: string
    menuCode: string
    mealType: string
    servingSize: number
  }
  qualityChecks?: QualityControl[]
  _count?: {
    qualityChecks: number
  }
}

/**
 * Production statistics type
 */
export interface ProductionStatistics {
  total: number
  planned: number
  inProgress: number
  completed: number
  cancelled: number
  byStatus: Record<ProductionStatus, number>
  totalPortions: number
  avgCost: number
  qualityPassRate: number
}

/**
 * Production filter options
 */
export interface ProductionFilterOptions {
  search?: string
  status?: ProductionStatus | 'ALL'
  startDate?: string
  endDate?: string
  menuId?: string
  programId?: string
  page?: number
  limit?: number
}

/**
 * Production timeline event
 */
export interface ProductionTimelineEvent {
  status: ProductionStatus
  timestamp: Date
  user?: string
  notes?: string
  duration?: number // in minutes
}

// ================================ QUALITY CHECK TYPES ================================

/**
 * Quality check type enum
 */
export type QualityCheckType = 'HYGIENE' | 'TEMPERATURE' | 'TASTE' | 'APPEARANCE' | 'SAFETY'

/**
 * Severity level enum
 */
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/**
 * Quality check with production info
 */
export interface QualityCheckWithProduction extends QualityControl {
  production?: {
    id: string
    batchNumber: string
    menu?: {
      menuName: string
    }
  }
}

/**
 * Quality check summary
 */
export interface QualityCheckSummary {
  totalChecks: number
  passedChecks: number
  failedChecks: number
  overallScore: number
  criticalIssues: number
  checksByType: Record<QualityCheckType, number>
}

// ================================ RECIPE TYPES ================================

/**
 * Recipe ingredient with adjusted quantity for production
 */
export interface RecipeIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  cost: number
  inventoryItem?: {
    id: string
    currentStock: number
    unit: string
  }
}

/**
 * Recipe step
 */
export interface RecipeStep {
  stepNumber: number
  instruction: string
  duration?: number // in minutes
  temperature?: number // in celsius
  critical: boolean
  tips?: string
}

/**
 * Recipe with full details
 */
export interface Recipe {
  menuId: string
  menuName: string
  servingSize: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  totalCost: number
  prepTime: number
  cookTime: number
  nutrition: {
    calories: number
    protein: number
    carbohydrates: number
    fat: number
    fiber: number
  }
  allergens: string[]
  dietary: string[]
}

// ================================ STAFF TYPES ================================

/**
 * Production staff member
 */
export interface ProductionStaff {
  id: string
  name: string
  role: 'HEAD_COOK' | 'ASSISTANT' | 'SUPERVISOR'
  isAvailable: boolean
}

// ================================ API RESPONSE TYPES ================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean
  data?: T[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}

// ================================ FORM TYPES ================================

/**
 * Production form input
 */
export interface ProductionFormInput {
  programId: string
  menuId: string
  productionDate: Date
  batchNumber?: string
  plannedPortions: number
  plannedStartTime: Date
  plannedEndTime: Date
  headCook: string
  assistantCooks?: string[]
  supervisorId?: string
  estimatedCost: number
  targetTemperature?: number
  notes?: string
}

/**
 * Complete production form input
 */
export interface CompleteProductionFormInput {
  actualPortions: number
  actualCost?: number
  actualTemperature?: number
  wasteAmount?: number
  wasteNotes?: string
}

/**
 * Quality check form input
 */
export interface QualityCheckFormInput {
  checkType: QualityCheckType
  parameter: string
  expectedValue?: string
  actualValue: string
  passed: boolean
  score?: number
  severity?: SeverityLevel
  notes?: string
  recommendations?: string
  actionRequired?: boolean
  actionTaken?: string
}

// ================================ VIEW MODEL TYPES ================================

/**
 * Production card view model
 */
export interface ProductionCardViewModel {
  id: string
  batchNumber: string
  status: ProductionStatus
  productionDate: Date
  menuName: string
  mealType: string
  plannedPortions: number
  actualPortions?: number
  estimatedCost: number
  actualCost?: number
  actualTemperature?: number
  qualityCheckCount: number
  canEdit: boolean
  canDelete: boolean
}

/**
 * Production list view model
 */
export interface ProductionListViewModel {
  productions: ProductionCardViewModel[]
  statistics: ProductionStatistics
  filters: ProductionFilterOptions
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
