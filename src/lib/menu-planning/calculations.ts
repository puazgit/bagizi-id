/**
 * @fileoverview Menu Planning Calculation Utilities
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @description Centralized calculation logic for MenuPlan metrics
 * 
 * Purpose:
 * - Calculate and update MenuPlan database fields (totalDays, totalMenus, totalEstimatedCost, averageCostPerDay)
 * - Ensure data consistency between assignments and plan metrics
 * - Provide reusable calculation functions for triggers
 * 
 * @see {@link /docs/MENU_PLANNING_METRICS_FIX_PHASE1.md} Phase 1 Documentation
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { db } from '@/lib/prisma'
import type { MenuPlan } from '@prisma/client'

/**
 * Recalculate MenuPlan metrics and update database fields
 * 
 * Calculations:
 * - totalDays: Days between startDate and endDate (inclusive)
 * - totalMenus: Count of MenuAssignment records
 * - totalEstimatedCost: Sum of all assignment estimatedCost values
 * - averageCostPerDay: totalEstimatedCost / daysWithAssignments (not totalDays)
 * 
 * @param menuPlanId - MenuPlan ID to recalculate
 * @returns Updated MenuPlan with recalculated fields
 * @throws {Error} If MenuPlan not found or calculation fails
 * 
 * @example
 * ```typescript
 * // After creating/updating/deleting assignment
 * const updatedPlan = await recalculateMenuPlanMetrics(planId)
 * console.log(`Updated metrics: ${updatedPlan.totalEstimatedCost}`)
 * ```
 */
export async function recalculateMenuPlanMetrics(
  menuPlanId: string
): Promise<MenuPlan> {
  try {
    // 1. Fetch MenuPlan with assignments
    const plan = await db.menuPlan.findUnique({
      where: { id: menuPlanId },
      include: {
        assignments: {
          select: {
            id: true,
            assignedDate: true,
            plannedPortions: true,
            estimatedCost: true,
          },
        },
      },
    })

    if (!plan) {
      throw new Error(`MenuPlan not found: ${menuPlanId}`)
    }

    // 2. Calculate totalDays (date range)
    // Use the utility function for consistency
    const totalDays = calculateTotalDays(plan.startDate, plan.endDate)
    
    console.log('📊 Recalculating metrics for plan:', menuPlanId)
    console.log('  - Start Date:', plan.startDate)
    console.log('  - End Date:', plan.endDate)
    console.log('  - Total Days:', totalDays)

    // 3. Calculate totalMenus (assignments count)
    const totalMenus = plan.assignments.length

    // 4. Calculate totalEstimatedCost (sum of assignment costs)
    const totalEstimatedCost = plan.assignments.reduce(
      (sum, assignment) => sum + (assignment.estimatedCost || 0),
      0
    )

    // 5. Calculate averageCostPerDay
    // Use unique days with assignments (not total days)
    const uniqueDays = new Set(
      plan.assignments.map((a) => {
        const date = new Date(a.assignedDate)
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      })
    )
    const daysWithAssignments = uniqueDays.size
    const averageCostPerDay =
      daysWithAssignments > 0 ? totalEstimatedCost / daysWithAssignments : 0

    // 6. Update database with calculated values
    const updatedPlan = await db.menuPlan.update({
      where: { id: menuPlanId },
      data: {
        totalDays,
        totalMenus,
        totalEstimatedCost,
        averageCostPerDay,
        updatedAt: new Date(), // Ensure timestamp updates
      },
    })

    return updatedPlan
  } catch (error) {
    console.error('❌ Calculation Error:', {
      menuPlanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw new Error(
      `Failed to recalculate metrics for MenuPlan ${menuPlanId}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

/**
 * Calculate totalDays from date range (for new plans)
 * 
 * @param startDate - Plan start date
 * @param endDate - Plan end date
 * @returns Number of days (inclusive)
 * 
 * @example
 * ```typescript
 * const days = calculateTotalDays(new Date('2025-01-01'), new Date('2025-01-31'))
 * console.log(days) // 31
 * ```
 */
export function calculateTotalDays(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Normalize to start of day in UTC to avoid timezone issues
  start.setUTCHours(0, 0, 0, 0)
  end.setUTCHours(0, 0, 0, 0)
  
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  // +1 because we want inclusive count (start date + end date both count)
  return Math.round(diffDays) + 1
}

/**
 * Calculate metrics without updating database (for API response)
 * Returns the same structure as Phase 1 API metrics
 * 
 * @param menuPlanId - MenuPlan ID
 * @returns Calculated metrics object
 * 
 * @example
 * ```typescript
 * const metrics = await calculateMetricsOnly(planId)
 * return Response.json({ ...plan, metrics })
 * ```
 */
export async function calculateMetricsOnly(menuPlanId: string) {
  const plan = await db.menuPlan.findUnique({
    where: { id: menuPlanId },
    include: {
      assignments: {
        select: {
          id: true,
          assignedDate: true,
          plannedPortions: true,
          estimatedCost: true,
        },
      },
    },
  })

  if (!plan) {
    throw new Error(`MenuPlan not found: ${menuPlanId}`)
  }

  // Calculate metrics
  const totalAssignments = plan.assignments.length
  const totalPlannedPortions = plan.assignments.reduce(
    (sum: number, a) => sum + (a.plannedPortions || 0),
    0
  )
  const totalEstimatedCost = plan.assignments.reduce(
    (sum: number, a) => sum + (a.estimatedCost || 0),
    0
  )
  const averageCostPerPortion =
    totalPlannedPortions > 0 ? totalEstimatedCost / totalPlannedPortions : 0

  // Date range
  const startDate = new Date(plan.startDate)
  const endDate = new Date(plan.endDate)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  // Coverage
  const uniqueDays = new Set(
    plan.assignments.map((a: { assignedDate: Date | string }) => {
      const date = new Date(a.assignedDate)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    })
  )
  const daysWithAssignments = uniqueDays.size
  const coveragePercentage = days > 0 ? (daysWithAssignments / days) * 100 : 0

  return {
    totalAssignments,
    totalPlannedPortions,
    totalEstimatedCost,
    averageCostPerPortion,
    dateRange: {
      start: startDate,
      end: endDate,
      days,
    },
    coverage: {
      daysWithAssignments,
      coveragePercentage,
    },
  }
}
