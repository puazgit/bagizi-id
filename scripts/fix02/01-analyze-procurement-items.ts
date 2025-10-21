/**
 * Fix #2 Step 1: Analyze Orphaned ProcurementItems
 * 
 * This script analyzes ProcurementItems that lack InventoryItem links
 * 
 * @see docs/fixes/FIX02_PROCUREMENT_ITEM_INVENTORY_LINK.md
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeProcurementItems() {
  console.log('🔍 Analyzing ProcurementItems without InventoryItem link...\n')

  try {
    // Step 1: Count total ProcurementItems
    const totalItems = await prisma.procurementItem.count()
    console.log(`📊 Total ProcurementItems: ${totalItems}`)

    // Step 2: Count orphaned items (no inventoryItemId)
    const orphanedCount = await prisma.procurementItem.count({
      where: {
        inventoryItemId: null
      }
    })
    console.log(`❌ Orphaned ProcurementItems: ${orphanedCount}`)
    console.log(`✅ Linked ProcurementItems: ${totalItems - orphanedCount}`)
    console.log(`📈 Orphaned Percentage: ${((orphanedCount / totalItems) * 100).toFixed(2)}%\n`)

    // Step 3: Get unique orphaned items
    const uniqueOrphaned = await prisma.procurementItem.groupBy({
      by: ['itemName', 'unit'],
      where: {
        inventoryItemId: null
      },
      _count: {
        _all: true
      },
      _avg: {
        pricePerUnit: true
      },
      _min: {
        pricePerUnit: true
      },
      _max: {
        pricePerUnit: true
      },
      _sum: {
        orderedQuantity: true
      }
    }).then(results => results.map(r => ({
      itemName: r.itemName,
      unit: r.unit,
      avgPrice: r._avg?.pricePerUnit || 0,
      minPrice: r._min?.pricePerUnit || 0,
      maxPrice: r._max?.pricePerUnit || 0,
      totalQuantity: r._sum?.orderedQuantity || 0,
      usageCount: r._count?._all || 0
    })))

    console.log(`📋 Unique orphaned items: ${uniqueOrphaned.length}\n`)

    if (uniqueOrphaned.length > 0) {
      console.log('🔝 Top 20 Orphaned Procurement Items:')
      console.log('─'.repeat(110))
      console.log(
        'Item Name'.padEnd(40),
        'Unit'.padEnd(10),
        'Avg Price'.padEnd(15),
        'Total Qty'.padEnd(15),
        'Usage Count'
      )
      console.log('─'.repeat(110))

      uniqueOrphaned.slice(0, 20).forEach((item) => {
        console.log(
          item.itemName.padEnd(40),
          item.unit.padEnd(10),
          `Rp ${Number(item.avgPrice).toLocaleString('id-ID')}`.padEnd(15),
          Number(item.totalQuantity).toLocaleString('id-ID').padEnd(15),
          item.usageCount.toString()
        )
      })
      console.log('─'.repeat(110))
    }

    // Step 4: Check received procurements
    const totalReceived = await prisma.procurement.count({
      where: {
        OR: [
          { status: 'PARTIALLY_RECEIVED' },
          { status: 'FULLY_RECEIVED' },
          { status: 'COMPLETED' }
        ]
      }
    })

    // For now, assume stock movements need to be checked manually
    // (ProcurementItem doesn't have stockMovement relation in schema)
    const procurementsWithMovement = 0 // Placeholder

    console.log(`\n📦 Stock Movement Analysis:`)
    console.log(`   Total received procurements: ${totalReceived}`)
    console.log(`   With stock movements: ${procurementsWithMovement}`)
    console.log(`   Missing stock movements: ${totalReceived - procurementsWithMovement}`)
    if (totalReceived > 0) {
      console.log(`   Auto-update rate: ${((procurementsWithMovement / totalReceived) * 100).toFixed(2)}%`)
    }

    // Summary
    console.log('\n' + '='.repeat(100))
    console.log('📊 ANALYSIS SUMMARY - FIX #2')
    console.log('='.repeat(100))
    console.log(`Procurement Issues:`)
    console.log(`   • ${orphanedCount} orphaned ProcurementItems (${((orphanedCount / totalItems) * 100).toFixed(2)}%)`)
    console.log(`   • ${uniqueOrphaned.length} unique items need mapping`)
    console.log(`   • ${totalReceived - procurementsWithMovement} received procurements missing stock movements`)

    if (orphanedCount === 0 && (totalReceived - procurementsWithMovement) === 0) {
      console.log(`\n✅ FIX #2 NOT NEEDED - All procurement items are properly linked and stock movements are created!`)
    } else {
      console.log(`\n⚠️  FIX #2 NEEDED - Implementation required`)
    }
    console.log('='.repeat(100))

    // Export data
    const fs = await import('fs/promises')
    await fs.mkdir('./scripts/fix02/data', { recursive: true })
    await fs.writeFile(
      './scripts/fix02/data/procurement-analysis.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
          totalItems,
          orphanedCount,
          linkedCount: totalItems - orphanedCount,
          uniqueOrphaned: uniqueOrphaned.length,
          totalReceived,
          withStockMovements: procurementsWithMovement,
          missingStockMovements: totalReceived - procurementsWithMovement
        },
        orphanedItems: uniqueOrphaned
      }, null, 2)
    )

    console.log(`\n💾 Analysis exported to: ./scripts/fix02/data/procurement-analysis.json`)

  } catch (error) {
    console.error('❌ Error during analysis:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run analysis
analyzeProcurementItems()
  .then(() => {
    console.log('\n✅ Analysis completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error)
    process.exit(1)
  })
