/**
 * Check Inventory Items in Database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkInventory() {
  console.log('🔍 Checking Inventory Items...\n')

  // 1. Count total inventory items
  const totalItems = await prisma.inventoryItem.count()
  console.log(`📊 Total InventoryItems: ${totalItems}`)

  // 2. Group by SPPG
  const itemsBySppg = await prisma.inventoryItem.groupBy({
    by: ['sppgId'],
    _count: true,
  })

  console.log('\n📦 Items per SPPG:')
  for (const group of itemsBySppg) {
    const sppg = await prisma.sPPG.findUnique({
      where: { id: group.sppgId },
      select: { name: true, code: true }
    })
    console.log(`  - ${sppg?.name} (${sppg?.code}): ${group._count} items`)
  }

  // 3. List all active SPPGs
  console.log('\n🏢 All Active SPPGs:')
  const activeSppgs = await prisma.sPPG.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, code: true }
  })
  
  for (const sppg of activeSppgs) {
    const itemCount = await prisma.inventoryItem.count({
      where: { 
        sppgId: sppg.id,
        isActive: true 
      }
    })
    console.log(`  ✓ ${sppg.name} (${sppg.code}): ${itemCount} active items`)
    console.log(`    sppgId: ${sppg.id}`)
  }

  // 4. Sample inventory items
  console.log('\n📋 Sample Inventory Items (first 5):')
  const sampleItems = await prisma.inventoryItem.findMany({
    take: 5,
    select: {
      itemName: true,
      currentStock: true,
      unit: true,
      isActive: true,
      sppgId: true,
      sppg: {
        select: { name: true }
      }
    }
  })

  for (const item of sampleItems) {
    console.log(`  - ${item.itemName} (${item.currentStock} ${item.unit}) - ${item.sppg.name}`)
    console.log(`    sppgId: ${item.sppgId}, active: ${item.isActive}`)
  }

  await prisma.$disconnect()
}

checkInventory()
  .catch(console.error)
  .finally(() => process.exit(0))
