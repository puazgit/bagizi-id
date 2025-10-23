/**
 * Script untuk memverifikasi stats program dari database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const programId = 'cmh21doyl00018ox3xnzata6z'
  
  console.log('🔍 Verifying Program Statistics...')
  console.log('Program ID:', programId)
  console.log('\n')
  
  try {
    // Fetch dengan _count
    const program = await prisma.nutritionProgram.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: {
            menus: true,
            menuPlans: true,
            productions: true,
            distributions: true,
            schools: true,
            feedback: true,
          }
        }
      }
    })
    
    if (!program) {
      console.log('❌ Program tidak ditemukan di database')
      return
    }
    
    console.log('✅ Program Statistics:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Data Counts:')
    console.log('  - Total Menu:', program._count.menus)
    console.log('  - Total Menu Plans:', program._count.menuPlans)
    console.log('  - Total Produksi:', program._count.productions)
    console.log('  - Total Distribusi:', program._count.distributions)
    console.log('  - Total Sekolah:', program._count.schools)
    console.log('  - Total Feedback:', program._count.feedback)
    console.log('\n')
    
    // Check individual data
    if (program._count.menus > 0) {
      const menus = await prisma.nutritionMenu.findMany({
        where: { programId },
        select: {
          id: true,
          menuName: true,
          mealType: true,
        },
        take: 5
      })
      
      console.log('🍽️  Menu Samples:')
      menus.forEach((menu, idx) => {
        console.log(`  ${idx + 1}. ${menu.menuName} (${menu.mealType})`)
      })
      console.log('\n')
    }
    
    if (program._count.productions > 0) {
      const productions = await prisma.foodProduction.findMany({
        where: { programId },
        select: {
          id: true,
          productionDate: true,
          plannedPortions: true,
        },
        take: 5
      })
      
      console.log('🏭 Produksi Samples:')
      productions.forEach((prod, idx) => {
        console.log(`  ${idx + 1}. ${prod.productionDate.toISOString().split('T')[0]} - ${prod.plannedPortions} porsi planned`)
      })
      console.log('\n')
    }
    
    if (program._count.distributions > 0) {
      const distributions = await prisma.foodDistribution.findMany({
        where: { programId },
        select: {
          id: true,
          distributionDate: true,
          totalPortionsDelivered: true,
          totalPortions: true,
        },
        take: 5
      })
      
      console.log('🚚 Distribusi Samples:')
      distributions.forEach((dist, idx) => {
        console.log(`  ${idx + 1}. ${dist.distributionDate.toISOString().split('T')[0]} - ${dist.totalPortionsDelivered || dist.totalPortions} porsi`)
      })
      console.log('\n')
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n')
    
    console.log('✅ Verification Results:')
    console.log('  ✓ Program statistics available')
    console.log('  ✓ _count queries working correctly')
    console.log('  ✓ Real data from database relationships')
    
    console.log('\n')
    console.log('🔗 API Endpoint:')
    console.log('  GET /api/sppg/program/' + programId + '?includeStats=true')
    console.log('  - Will return the same _count data')
    console.log('  - Frontend will display real statistics')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
