/**
 * @fileoverview Menu Planning TypeScript Type Definitions
 * @version Next.js 15.5.4 / TypeScript Strict Mode
 * @see {@link /docs/copilot-instructions.md} Enterprise type safety patterns
 */

import { MenuPlan, MenuAssignment, NutritionMenu, NutritionProgram, User, MealType, MenuPlanStatus } from '@prisma/client'

/**
 * Menu Plan with related entities
 */
export type MenuPlanWithRelations = MenuPlan & {
  program: Pick<NutritionProgram, 'id' | 'name' | 'programCode'> & {
    targetRecipients?: number | null
  }
  creator: Pick<User, 'id' | 'name' | 'email' | 'userRole'>
  approver?: Pick<User, 'id' | 'name' | 'email' | 'userRole'> | null
  submittedByUser?: Pick<User, 'id' | 'name' | 'email' | 'userRole'> | null
  rejectedByUser?: Pick<User, 'id' | 'name' | 'email' | 'userRole'> | null
  publishedByUser?: Pick<User, 'id' | 'name' | 'email' | 'userRole'> | null
  _count?: {
    assignments: number
  }
}

/**
 * Menu Plan Metrics (calculated from assignments)
 */
export interface MenuPlanMetrics {
  totalAssignments: number
  totalPlannedPortions: number
  totalEstimatedCost: number
  averageCostPerPortion: number
  dateRange: {
    start: Date
    end: Date
    days: number
  }
  coverage: {
    daysWithAssignments: number
    coveragePercentage: number
  }
}

/**
 * Menu Plan Detail with assignments
 */
export type MenuPlanDetail = MenuPlanWithRelations & {
  assignments: MenuAssignmentWithMenu[]
  metrics?: MenuPlanMetrics
}

/**
 * Menu Assignment with related entities
 */
export type MenuAssignmentWithMenu = MenuAssignment & {
  menu: Pick<
    NutritionMenu,
    | 'id'
    | 'menuName'
    | 'menuCode'
    | 'mealType'
    | 'costPerServing'
    | 'servingSize'
  > & {
    nutritionCalc?: {
      calories: number
      protein: number
      carbohydrates: number
      fat: number
      fiber: number
    } | null
  }
}

/**
 * Menu Assignment with plan context
 */
export type MenuAssignmentWithPlan = MenuAssignment & {
  menu: Pick<NutritionMenu, 'id' | 'menuName' | 'menuCode' | 'mealType' | 'costPerServing'>
  plan: {
    id: string
    planName: string
    status: MenuPlanStatus
    program: {
      id: string
      name: string
    }
  }
}

/**
 * Nutrition Analytics by Meal Type
 */
export interface NutritionByMealType {
  mealType: string
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
  avgFiber: number
  totalMeals: number
}

/**
 * Nutrition Analytics by Day
 */
export interface NutritionByDay {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  mealTypes: string[]
}

/**
 * Cost Analytics by Meal Type
 */
export interface CostByMealType {
  mealType: string
  totalCost: number
  avgCostPerMeal: number
  mealCount: number
}

/**
 * Cost Analytics by Day
 */
export interface CostByDay {
  date: string
  totalCost: number
  perBeneficiaryCost: number
}

/**
 * Daily Nutrition Compliance Check
 */
export interface DailyComplianceCheck {
  date: string
  caloriesInRange: boolean
  proteinSufficient: boolean
  mealTypesCovered: number
  isCompliant: boolean
}

/**
 * Menu Plan Analytics Response
 */
export interface MenuPlanAnalytics {
  planId: string
  planName: string
  dateRange: {
    startDate: Date
    endDate: Date
    totalDays: number
  }
  program: {
    name: string
    targetBeneficiaries: number
    ageGroup: string
  }
  nutrition: {
    byMealType: NutritionByMealType[]
    byDay: NutritionByDay[]
    summary: {
      totalMeals: number
      mealTypesUsed: string[]
    }
  }
  cost: {
    byMealType: CostByMealType[]
    byDay: CostByDay[]
    summary: {
      totalPlanCost: number
      avgDailyCost: number
      avgCostPerBeneficiary: number
      targetBeneficiaries: number
    }
  }
  variety: {
    uniqueMenus: number
    totalAssignments: number
    varietyScore: number
    ingredientDiversity: number
    recommendation: string
  }
  compliance: {
    dailyChecks: DailyComplianceCheck[]
    overallRate: number
    passedDays: number
    totalDays: number
  }
}

/**
 * Menu Plan List Summary
 */
export interface MenuPlanSummary {
  totalPlans: number
  byStatus: {
    draft: number
    submitted: number
    approved: number
    published: number
    archived: number
    rejected: number
  }
  avgBeneficiaries: number
  totalBeneficiaries: number
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
  message?: string
}

export interface ApiListResponse<T> extends ApiResponse<T> {
  meta?: {
    total: number
    page?: number
    limit?: number
    filters?: Record<string, unknown>
  }
  summary?: MenuPlanSummary
}

/**
 * Calendar Event for Menu Planning
 */
export interface CalendarEvent {
  id: string
  date: Date
  mealType: MealType
  menuName: string
  menuCode: string
  calories: number
  protein: number
  portions: number
  notes?: string | null
}

/**
 * Planning Statistics
 */
export interface PlanningStats {
  totalDays: number
  assignedDays: number
  unassignedDays: number
  coveragePercentage: number
  totalMeals: number
  estimatedCost: number
}
