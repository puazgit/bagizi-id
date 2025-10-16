/**
 * Check menu plan dates in database
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const planId = 'cmgsbngat00018ofbhdt4htzi'
  
  const plan = await db.menuPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      totalDays: true,
      totalMenus: true,
      totalEstimatedCost: true,
      averageCostPerDay: true,
      assignments: {
        select: {
          id: true,
          assignedDate: true,
          estimatedCost: true,
        }
      }
    }
  })

  if (!plan) {
    console.error('Plan not found')
    return
  }

  console.log('📅 Menu Plan Details:')
  console.log('  Name:', plan.name)
  console.log('  Start Date (UTC):', plan.startDate.toISOString())
  console.log('  End Date (UTC):', plan.endDate.toISOString())
  console.log('  Start Date (WIB):', plan.startDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))
  console.log('  End Date (WIB):', plan.endDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))
  console.log('\n📊 Calculated Metrics:')
  console.log('  Total Days:', plan.totalDays)
  console.log('  Total Menus:', plan.totalMenus)
  console.log('  Total Estimated Cost:', plan.totalEstimatedCost.toLocaleString('id-ID'))
  console.log('  Average Cost Per Day:', plan.averageCostPerDay.toLocaleString('id-ID'))
  
  console.log('\n📋 Assignments:')
  plan.assignments.forEach((assignment, index) => {
    console.log(`  ${index + 1}. ${assignment.assignedDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} - Rp ${assignment.estimatedCost.toLocaleString('id-ID')}`)
  })
  
  await db.$disconnect()
}

main()
