/**
 * Script to check database data counts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database data...\n')

  try {
    const sppgCount = await prisma.sPPG.count()
    const userCount = await prisma.user.count()
    const programCount = await prisma.nutritionProgram.count()
    const menuCount = await prisma.nutritionMenu.count()
    const inventoryCount = await prisma.inventoryItem.count()
    const supplierCount = await prisma.supplier.count()
    const procurementCount = await prisma.procurement.count()
    const productionCount = await prisma.foodProduction.count()
    const distributionCount = await prisma.foodDistribution.count()
    const menuPlanCount = await prisma.menuPlan.count()

    console.log('📊 Data Count Summary:')
    console.log('─────────────────────────────────')
    console.log(`SPPG: ${sppgCount}`)
    console.log(`Users: ${userCount}`)
    console.log(`Nutrition Programs: ${programCount}`)
    console.log(`Nutrition Menus: ${menuCount}`)
    console.log(`Inventory Items: ${inventoryCount}`)
    console.log(`Suppliers: ${supplierCount}`)
    console.log(`Procurements: ${procurementCount}`)
    console.log(`Food Production: ${productionCount}`)
    console.log(`Food Distribution: ${distributionCount}`)
    console.log(`Menu Plans: ${menuPlanCount}`)
    console.log('─────────────────────────────────')

    if (sppgCount === 0) {
      console.log('\n⚠️  No data found! Database might not be seeded.')
    } else {
      console.log('\n✅ Database has data!')
      
      // Show sample SPPG
      const sppgs = await prisma.sPPG.findMany({ take: 2 })
      console.log('\n📍 Sample SPPG:')
      sppgs.forEach(sppg => {
        console.log(`   - ${sppg.name} (${sppg.code})`)
      })

      // Show sample suppliers
      const suppliers = await prisma.supplier.findMany({ take: 3 })
      console.log('\n🏢 Sample Suppliers:')
      suppliers.forEach(supplier => {
        console.log(`   - ${supplier.supplierName} (${supplier.supplierCode})`)
      })

      // Show sample procurements
      const procurements = await prisma.procurement.findMany({ 
        take: 3,
        include: { supplier: true }
      })
      console.log('\n🛒 Sample Procurements:')
      procurements.forEach(proc => {
        console.log(`   - ${proc.procurementCode} - ${proc.status} (${proc.supplier.supplierName})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
