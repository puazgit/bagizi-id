/**
 * @fileoverview Seed Food Production Data for SPPG Purwakarta
 * @description Creates sample food production records integrated with existing data
 */

import { PrismaClient, ProductionStatus } from '@prisma/client'

export async function seedProduction(
  prisma: PrismaClient,
  sppgs: { id: string; name: string; code: string }[],
  programs: { id: string; name: string; sppgId: string }[]
) {
  console.log('  → Creating production data for SPPG Purwakarta...')

  try {
    // Get SPPG Purwakarta from passed data
    const sppg = sppgs.find(s => s.code === 'SPPG-PWK-001')
    if (!sppg) {
      console.warn('  ⚠️  SPPG Purwakarta not found, skipping production seed')
      return []
    }

    console.log(`  ✅ Found SPPG: ${sppg.name}`)

    // Get programs for this SPPG from passed data
    const program = programs.find(p => p.sppgId === sppg.id)
    if (!program) {
      console.warn('  ⚠️  No program found for this SPPG, skipping')
      return []
    }

    console.log(`  ✅ Found Program: ${program.name}`)

    // Get menus for this program
    const menu = await prisma.nutritionMenu.findFirst({
      where: { programId: program.id }
    })

    if (!menu) {
      console.warn('  ⚠️  No menu found for this program, skipping')
      return []
    }

    console.log(`  ✅ Found Menu: ${menu.menuName}`)

    // Get production manager or staff
    const headCook = await prisma.user.findFirst({
      where: {
        sppgId: sppg.id,
        userRole: { in: ['SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR', 'SPPG_KEPALA'] }
      }
    })

    if (!headCook) {
      console.warn('  ⚠️  No suitable user found for head cook, skipping')
      return []
    }

    console.log(`  ✅ Found Head Cook: ${headCook.name}`)

    // Clear existing productions for this SPPG
    await prisma.foodProduction.deleteMany({
      where: { sppgId: sppg.id }
    })

    // Create production records
    const productions = []

    // Production 1: Completed
    const prod1 = await prisma.foodProduction.create({
      data: {
        sppgId: sppg.id,
        programId: program.id,
        menuId: menu.id,
        productionDate: new Date(),
        batchNumber: `BATCH-${Date.now()}-001`,
        status: ProductionStatus.COMPLETED,
        plannedPortions: 100,
        actualPortions: 98,
        plannedStartTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        plannedEndTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        actualStartTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actualEndTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        headCook: headCook.id,
        estimatedCost: 950000,
        actualCost: 920000,
        targetTemperature: 75,
        notes: 'Produksi selesai dengan baik'
      }
    })
    productions.push(prod1)
    console.log(`  ✅ Created completed production: ${prod1.batchNumber}`)

    // Production 2: In Progress (Cooking)
    const prod2 = await prisma.foodProduction.create({
      data: {
        sppgId: sppg.id,
        programId: program.id,
        menuId: menu.id,
        productionDate: new Date(),
        batchNumber: `BATCH-${Date.now()}-002`,
        status: ProductionStatus.COOKING,
        plannedPortions: 150,
        plannedStartTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        plannedEndTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        actualStartTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        headCook: headCook.id,
        estimatedCost: 1425000,
        targetTemperature: 75,
        notes: 'Sedang dalam proses memasak'
      }
    })
    productions.push(prod2)
    console.log(`  ✅ Created cooking production: ${prod2.batchNumber}`)

    // Production 3: Planned (Future)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(8, 0, 0, 0)

    const prod3 = await prisma.foodProduction.create({
      data: {
        sppgId: sppg.id,
        programId: program.id,
        menuId: menu.id,
        productionDate: tomorrow,
        batchNumber: `BATCH-${Date.now()}-003`,
        status: ProductionStatus.PLANNED,
        plannedPortions: 200,
        plannedStartTime: tomorrow,
        plannedEndTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        headCook: headCook.id,
        estimatedCost: 1900000,
        targetTemperature: 75,
        notes: 'Produksi untuk besok'
      }
    })
    productions.push(prod3)
    console.log(`  ✅ Created planned production: ${prod3.batchNumber}`)

    console.log(`  ✓ Created ${productions.length} production records`)
    console.log('  ✓ Production scenarios: Completed, Cooking, Planned')

    return productions

  } catch (error) {
    console.error('  ❌ Error seeding production data:', error)
    throw error
  }
}
