/**
 * Manual script to trigger recalculation for a specific menu plan
 * Usage: npx tsx scripts/recalculate-plan.ts <planId>
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Import the calculation function
async function recalculateMenuPlanMetrics(menuPlanId: string) {
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

    // 2. Calculate totalDays (date range) using UTC
    const startDate = new Date(plan.startDate)
    const endDate = new Date(plan.endDate)
    startDate.setUTCHours(0, 0, 0, 0)
    endDate.setUTCHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    const totalDays = Math.round(diffDays) + 1

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
    const uniqueDays = new Set(
      plan.assignments.map((a) => {
        const date = new Date(a.assignedDate)
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      })
    )
    const daysWithAssignments = uniqueDays.size
    const averageCostPerDay =
      daysWithAssignments > 0 ? totalEstimatedCost / daysWithAssignments : 0

    console.log('  - Total Menus:', totalMenus)
    console.log('  - Total Estimated Cost:', totalEstimatedCost)
    console.log('  - Days with Assignments:', daysWithAssignments)
    console.log('  - Average Cost Per Day:', averageCostPerDay)

    // 6. Update database with calculated values
    const updatedPlan = await db.menuPlan.update({
      where: { id: menuPlanId },
      data: {
        totalDays,
        totalMenus,
        totalEstimatedCost,
        averageCostPerDay,
        updatedAt: new Date(),
      },
    })

    console.log('\n✅ Metrics updated successfully!')
    return updatedPlan
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

async function main() {
  const planId = process.argv[2]
  
  if (!planId) {
    console.error('❌ Please provide a plan ID')
    console.log('Usage: npx tsx scripts/recalculate-plan.ts <planId>')
    process.exit(1)
  }

  console.log('🔄 Starting recalculation for plan:', planId)
  await recalculateMenuPlanMetrics(planId)
  await db.$disconnect()
}

main()
