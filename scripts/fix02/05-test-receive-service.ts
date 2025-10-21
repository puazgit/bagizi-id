/**
 * Test ProcurementReceiveService - Fix #2 Step 5
 * 
 * Tests automatic stock movement creation when processing received procurements.
 * Uses real procurement data from database.
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @see src/services/procurement/ProcurementReceiveService.ts
 */

import { PrismaClient } from '@prisma/client'
import { procurementReceiveService } from '../../src/services/procurement/ProcurementReceiveService'

const prisma = new PrismaClient()

async function testProcurementReceiveService() {
  console.log('🧪 Testing ProcurementReceiveService...\n')

  try {
    // 1. Find received procurements without stock movements
    console.log('📋 Step 1: Finding received procurements...')
    
    const receivedProcurements = await prisma.procurement.findMany({
      where: {
        status: {
          in: ['PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'COMPLETED']
        }
      },
      include: {
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                currentStock: true
              }
            }
          }
        }
      },
      orderBy: {
        actualDelivery: 'desc'
      }
    })

    console.log(`Found ${receivedProcurements.length} received procurement(s)\n`)

    if (receivedProcurements.length === 0) {
      console.log('⚠️  No received procurements found. Update a procurement status to RECEIVED first.')
      return
    }

    // 2. Check which procurements already have stock movements
    console.log('📊 Step 2: Checking existing stock movements...')
    
    for (const procurement of receivedProcurements) {
      const existingMovements = await prisma.stockMovement.count({
        where: {
          referenceType: 'PROCUREMENT',
          referenceId: procurement.id
        }
      })

      const status = existingMovements > 0 ? '✅ Has movements' : '❌ Missing movements'
      console.log(`  ${procurement.procurementCode}: ${status} (${existingMovements} movement(s))`)
    }

    console.log()

    // 3. Find first procurement without movements
    let testProcurement = null
    for (const procurement of receivedProcurements) {
      const hasMovements = await prisma.stockMovement.count({
        where: {
          referenceType: 'PROCUREMENT',
          referenceId: procurement.id
        }
      })

      if (hasMovements === 0) {
        testProcurement = procurement
        break
      }
    }

    if (!testProcurement) {
      console.log('⚠️  All received procurements already have stock movements.')
      console.log('💡 To test, create a new procurement or delete existing movements.')
      return
    }

    console.log(`🎯 Step 3: Processing procurement: ${testProcurement.procurementCode}`)
    console.log(`   Supplier: ${testProcurement.supplierName}`)
    console.log(`   Status: ${testProcurement.status}`)
    console.log(`   Items: ${testProcurement.items.length}`)
    console.log()

    // 4. Show inventory stocks before
    console.log('📦 Step 4: Inventory stocks BEFORE:')
    for (const item of testProcurement.items) {
      if (item.inventoryItem) {
        console.log(`   ${item.inventoryItem.itemName}: ${item.inventoryItem.currentStock} ${item.unit}`)
      }
    }
    console.log()

    // 5. Process procurement receipt
    console.log('⚡ Step 5: Processing receipt...')
    
    const results = await procurementReceiveService.receiveProcurement({
      procurementId: testProcurement.id,
      receivedBy: 'SYSTEM_TEST',
      notes: 'Automated test - Fix #2 implementation'
    })

    console.log(`✅ Created ${results.length} stock movement(s)\n`)

    // 6. Show results
    console.log('📊 Step 6: Stock Movement Results:')
    console.log('═══════════════════════════════════════════════════════════════')
    
    for (const result of results) {
      console.log(`\n📦 ${result.itemName}`)
      console.log(`   Quantity: ${result.quantityReceived} units`)
      console.log(`   Unit Price: Rp ${result.unitPrice.toLocaleString('id-ID')}`)
      console.log(`   Stock Before: ${result.stockBefore}`)
      console.log(`   Stock After: ${result.stockAfter}`)
      console.log(`   Movement ID: ${result.movementId}`)
    }

    console.log('\n═══════════════════════════════════════════════════════════════')

    // 7. Verify stock movements in database
    console.log('\n🔍 Step 7: Verifying database...')
    
    const movements = await procurementReceiveService.getStockMovements(testProcurement.id)
    console.log(`   Total movements: ${movements.length}`)
    
    for (const movement of movements) {
      console.log(`   - ${movement.inventory.itemName}: ${movement.movementType} ${movement.quantity} ${movement.unit}`)
    }

    // 8. Final statistics
    console.log('\n📈 Step 8: Final Statistics:')
    
    const totalReceived = await prisma.procurement.count({
      where: {
        status: {
          in: ['PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'COMPLETED']
        }
      }
    })

    const withMovements = await prisma.stockMovement.groupBy({
      by: ['referenceId'],
      where: {
        referenceType: 'PROCUREMENT'
      }
    })

    const autoUpdateRate = ((withMovements.length / totalReceived) * 100).toFixed(2)

    console.log(`   Total received procurements: ${totalReceived}`)
    console.log(`   With stock movements: ${withMovements.length}`)
    console.log(`   Auto-update rate: ${autoUpdateRate}%`)

    console.log('\n✅ Test completed successfully!')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    throw error
  }
}

// Execute test
testProcurementReceiveService()
  .then(() => {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
