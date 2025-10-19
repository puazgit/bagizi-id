/**
 * Script to test Procurement API directly
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Procurement API Data...\n')

  try {
    // Find SPPG Purwakarta
    const sppg = await prisma.sPPG.findFirst({
      where: {
        OR: [
          { name: { contains: 'Purwakarta' } },
          { code: 'SPPG-PWK-001' }
        ]
      }
    })

    if (!sppg) {
      console.log('❌ SPPG Purwakarta not found!')
      return
    }

    console.log(`✅ Found SPPG: ${sppg.name} (${sppg.id})`)
    console.log('')

    // Test 1: Get all procurements for this SPPG
    const procurements = await prisma.procurement.findMany({
      where: { sppgId: sppg.id },
      include: {
        supplier: {
          select: {
            supplierName: true,
            supplierCode: true
          }
        },
        plan: {
          select: {
            planName: true
          }
        },
        items: {
          select: {
            itemName: true,
            orderedQuantity: true,
            unit: true
          }
        }
      }
    })

    console.log(`📊 Procurements found: ${procurements.length}`)
    console.log('─────────────────────────────────────────────')
    
    procurements.forEach((proc, index) => {
      console.log(`\n${index + 1}. ${proc.procurementCode}`)
      console.log(`   Status: ${proc.status}`)
      console.log(`   Supplier: ${proc.supplier.supplierName}`)
      console.log(`   Total: Rp ${proc.totalAmount.toLocaleString('id-ID')}`)
      console.log(`   Items: ${proc.items.length}`)
      if (proc.items.length > 0) {
        console.log(`   - ${proc.items[0].itemName} (${proc.items[0].orderedQuantity} ${proc.items[0].unit})`)
      }
    })

    console.log('\n')

    // Test 2: Get all suppliers for this SPPG
    const suppliers = await prisma.supplier.findMany({
      where: { sppgId: sppg.id },
      include: {
        _count: {
          select: {
            procurements: true,
            supplierProducts: true
          }
        }
      }
    })

    console.log(`🏢 Suppliers found: ${suppliers.length}`)
    console.log('─────────────────────────────────────────────')
    
    suppliers.forEach((supplier, index) => {
      console.log(`\n${index + 1}. ${supplier.supplierName}`)
      console.log(`   Code: ${supplier.supplierCode}`)
      console.log(`   Type: ${supplier.supplierType}`)
      console.log(`   Category: ${supplier.category}`)
      console.log(`   Rating: ${supplier.overallRating || 'N/A'}`)
      console.log(`   Procurements: ${supplier._count.procurements}`)
      console.log(`   Products: ${supplier._count.supplierProducts}`)
      console.log(`   Active: ${supplier.isActive ? 'Yes' : 'No'}`)
      console.log(`   Preferred: ${supplier.isPreferred ? 'Yes' : 'No'}`)
    })

    console.log('\n')

    // Test 3: Get procurement plans
    const plans = await prisma.procurementPlan.findMany({
      where: { sppgId: sppg.id },
      include: {
        _count: {
          select: {
            procurements: true
          }
        }
      }
    })

    console.log(`📅 Procurement Plans found: ${plans.length}`)
    console.log('─────────────────────────────────────────────')
    
    plans.forEach((plan, index) => {
      console.log(`\n${index + 1}. ${plan.planName}`)
      console.log(`   Period: ${plan.planMonth} (${plan.planYear})`)
      console.log(`   Budget: Rp ${plan.totalBudget.toLocaleString('id-ID')}`)
      console.log(`   Used: Rp ${plan.usedBudget.toLocaleString('id-ID')}`)
      console.log(`   Remaining: Rp ${plan.remainingBudget.toLocaleString('id-ID')}`)
      console.log(`   Status: ${plan.approvalStatus}`)
      console.log(`   Procurements: ${plan._count.procurements}`)
    })

    console.log('\n')
    console.log('✅ All procurement data is available in database!')
    console.log('')
    console.log('🔍 Next steps:')
    console.log('   1. Open http://localhost:3000/login')
    console.log('   2. Login with: gizi@sppg-purwakarta.com / password123')
    console.log('   3. Navigate to /procurement')
    console.log('   4. Check browser console for any errors')
    console.log('   5. Check Network tab for API calls')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
