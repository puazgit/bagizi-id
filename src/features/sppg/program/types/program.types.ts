/**
 * @fileoverview TypeScript types untuk domain Program (Nutrition Program)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { ProgramType, TargetGroup } from '@prisma/client'

/**
 * Program status type
 */
export type ProgramStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DRAFT' | 'ARCHIVED'

/**
 * Base Program interface dari Prisma model NutritionProgram
 */
export interface Program {
  id: string
  sppgId: string
  name: string
  description: string | null
  programCode: string
  programType: ProgramType
  targetGroup: TargetGroup
  
  // Nutrition targets
  calorieTarget: number | null
  proteinTarget: number | null
  carbTarget: number | null
  fatTarget: number | null
  fiberTarget: number | null
  
  // Schedule & implementation
  startDate: Date
  endDate: Date | null
  feedingDays: number[] // Array of day numbers (0-6: Sunday-Saturday)
  mealsPerDay: number
  
  // Budget & recipients
  totalBudget: number | null
  budgetPerMeal: number | null
  targetRecipients: number
  currentRecipients: number
  
  // Location & partnerships
  implementationArea: string
  partnerSchools: string[]
  
  // Status & timestamps
  status: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Program dengan relasi SPPG info
 */
export interface ProgramWithSppg extends Program {
  sppg: {
    id: string
    sppgName: string
    sppgCode: string
  }
}

/**
 * Program dengan statistics (menu count, distribution count, dll)
 */
export interface ProgramWithStats extends Program {
  _count: {
    menus: number
    menuPlans: number
    productions: number
    distributions: number
    schools: number
    feedback: number
  }
  // Computed fields
  daysRunning?: number
  completionPercentage?: number
  averageFeedback?: number
}

/**
 * Input untuk create program (sesuai form)
 */
export interface CreateProgramInput {
  name: string
  description?: string
  programType: ProgramType
  targetGroup: TargetGroup
  
  // Nutrition targets (optional)
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  fiberTarget?: number
  
  // Schedule
  startDate: Date
  endDate?: Date
  feedingDays: number[]
  mealsPerDay: number
  
  // Budget
  totalBudget?: number
  budgetPerMeal?: number
  targetRecipients: number
  
  // Implementation
  implementationArea: string
  partnerSchools: string[]
}

/**
 * Input untuk update program (partial)
 */
export interface UpdateProgramInput {
  name?: string
  description?: string
  programType?: ProgramType
  targetGroup?: TargetGroup
  
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  fiberTarget?: number
  
  startDate?: Date
  endDate?: Date
  feedingDays?: number[]
  mealsPerDay?: number
  
  totalBudget?: number
  budgetPerMeal?: number
  targetRecipients?: number
  currentRecipients?: number
  
  implementationArea?: string
  partnerSchools?: string[]
  
  status?: string
}

/**
 * Filter untuk query programs
 */
export interface ProgramFilters {
  status?: string
  programType?: ProgramType
  targetGroup?: TargetGroup
  search?: string
  startDate?: Date
  endDate?: Date
}

/**
 * Program summary untuk cards/tables
 */
export interface ProgramSummary {
  id: string
  name: string
  programCode: string
  programType: ProgramType
  targetGroup: TargetGroup
  status: string
  startDate: Date
  endDate: Date | null
  targetRecipients: number
  currentRecipients: number
  totalBudget: number | null
  mealsPerDay: number
  daysRunning?: number
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, unknown>
}

export type ProgramResponse = ApiResponse<Program>
export type ProgramsResponse = ApiResponse<Program[]>
export type ProgramWithStatsResponse = ApiResponse<ProgramWithStats>
