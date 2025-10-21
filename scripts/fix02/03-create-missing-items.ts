/**
 * Create Missing InventoryItems - Fix #2 Step 3
 * 
 * Creates new InventoryItems for orphaned ProcurementItems that have no matches.
 * Based on analysis from 02-check-existing-inventory.ts
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @see scripts/fix02/data/inventory-mapping.json
 */

import { PrismaClient, InventoryCategory } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Items that need new InventoryItems created
 * From analysis: 1 item (Beras Premium Cianjur)
 */
const itemsToCreate = [
  {
    itemName: 'Beras Premium Cianjur',
    unit: 'KARUNG',
    suggestedPrice: 375000,
    suggestedCategory: 'KARBOHIDRAT' as InventoryCategory,
    // Additional fields for InventoryItem
    itemCode: 'BERAS-PREM-CJR',
    minStock: 5,
    maxStock: 50,
    reorderQuantity: 10,
    storageLocation: 'Gudang Kering',
    isActive: true
  }
]

async function createMissingItems() {
  console.log('🏗️ Creating missing InventoryItems...\n')
  
  // Get SPPG ID from existing inventory items
  const existingItem = await prisma.inventoryItem.findFirst({
    select: { sppgId: true }
  })
  
  if (!existingItem) {
    throw new Error('No existing InventoryItems found. Cannot determine sppgId.')
  }
  
  const sppgId = existingItem.sppgId
  console.log(`📍 Using sppgId: ${sppgId}\n`)
  
  const createdItems = []
  
  for (const item of itemsToCreate) {
    console.log(`Creating: ${item.itemName} (${item.unit})`)
    console.log(`  Category: ${item.suggestedCategory}`)
    console.log(`  Price: Rp ${item.suggestedPrice.toLocaleString('id-ID')}`)
    
    try {
      const created = await prisma.inventoryItem.create({
        data: {
          sppgId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          category: item.suggestedCategory,
          unit: item.unit,
          currentStock: 0, // Will be updated by stock movements
          costPerUnit: item.suggestedPrice,
          lastPrice: item.suggestedPrice,
          averagePrice: item.suggestedPrice,
          minStock: item.minStock,
          maxStock: item.maxStock,
          reorderQuantity: item.reorderQuantity,
          storageLocation: item.storageLocation,
          isActive: item.isActive
        }
      })
      
      createdItems.push(created)
      console.log(`  ✅ Created with ID: ${created.id}\n`)
    } catch (error) {
      console.error(`  ❌ Failed to create ${item.itemName}:`, error)
      throw error
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`✅ Created ${createdItems.length} new InventoryItem(s)`)
  console.log('═══════════════════════════════════════════════════════════════')
  
  // Export created items for reference
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const exportData = {
    createdAt: new Date().toISOString(),
    totalCreated: createdItems.length,
    items: createdItems.map(item => ({
      id: item.id,
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: item.category,
      unit: item.unit,
      costPerUnit: item.costPerUnit
    }))
  }
  
  const dataDir = path.join(process.cwd(), 'scripts', 'fix02', 'data')
  const exportPath = path.join(dataDir, 'created-items.json')
  
  await fs.writeFile(
    exportPath,
    JSON.stringify(exportData, null, 2),
    'utf-8'
  )
  
  console.log(`\n💾 Created items exported to: ${exportPath}`)
  
  return createdItems
}

// Execute
createMissingItems()
  .then(() => {
    console.log('\n✅ All missing items created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error creating items:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
