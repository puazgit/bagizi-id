/**
 * Apply Mappings - Fix #2 Step 4
 * 
 * Links orphaned ProcurementItems to their matched InventoryItems.
 * Uses mapping suggestions from 02-check-existing-inventory.ts
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @see scripts/fix02/data/inventory-mapping.json
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'

const prisma = new PrismaClient()

/**
 * Mapping suggestions from inventory check
 * Total: 5 existing matches + 1 newly created
 */
interface MappingSuggestion {
  procurementItemName: string
  procurementUnit: string
  inventoryItemId: string
  inventoryItemName: string
  matchType: 'EXACT' | 'FUZZY'
  confidence: number
}

async function loadMappings(): Promise<MappingSuggestion[]> {
  const dataDir = path.join(process.cwd(), 'scripts', 'fix02', 'data')
  const mappingPath = path.join(dataDir, 'inventory-mapping.json')
  
  const content = await fs.readFile(mappingPath, 'utf-8')
  const data = JSON.parse(content)
  
  return data.mappings as MappingSuggestion[] // Changed from mappingSuggestions
}

async function loadCreatedItem() {
  const dataDir = path.join(process.cwd(), 'scripts', 'fix02', 'data')
  const createdPath = path.join(dataDir, 'created-items.json')
  
  const content = await fs.readFile(createdPath, 'utf-8')
  const data = JSON.parse(content)
  
  return data.items[0] // Beras Premium Cianjur
}

async function applyMappings() {
  console.log('🔗 Applying ProcurementItem → InventoryItem mappings...\n')
  
  // Load existing mappings (5 items)
  const existingMappings = await loadMappings()
  
  // Load newly created item (1 item)
  const createdItem = await loadCreatedItem()
  
  // Add created item to mappings
  const allMappings: MappingSuggestion[] = [
    ...existingMappings,
    {
      procurementItemName: 'Beras Premium Cianjur',
      procurementUnit: 'KARUNG',
      inventoryItemId: createdItem.id,
      inventoryItemName: createdItem.itemName,
      matchType: 'EXACT',
      confidence: 100
    }
  ]
  
  console.log(`📊 Total mappings to apply: ${allMappings.length}\n`)
  
  const results = {
    successful: 0,
    failed: 0,
    details: [] as Array<{
      mapping: MappingSuggestion
      status: 'SUCCESS' | 'FAILED' | 'SKIPPED'
      count?: number
      reason?: string
      error?: string
    }>
  }
  
  for (const mapping of allMappings) {
    console.log(`Mapping: ${mapping.procurementItemName} → ${mapping.inventoryItemName}`)
    console.log(`  Type: ${mapping.matchType} | Confidence: ${mapping.confidence}%`)
    
    try {
      // Find ProcurementItems to update
      const itemsToUpdate = await prisma.procurementItem.findMany({
        where: {
          itemName: mapping.procurementItemName,
          unit: mapping.procurementUnit,
          inventoryItemId: null // Only update orphaned items
        }
      })
      
      console.log(`  Found ${itemsToUpdate.length} orphaned ProcurementItem(s)`)
      
      if (itemsToUpdate.length === 0) {
        console.log(`  ⚠️ No orphaned items found (already linked?)\n`)
        results.details.push({
          mapping,
          status: 'SKIPPED',
          reason: 'No orphaned items found'
        })
        continue
      }
      
      // Update all matching items
      const updateResult = await prisma.procurementItem.updateMany({
        where: {
          itemName: mapping.procurementItemName,
          unit: mapping.procurementUnit,
          inventoryItemId: null
        },
        data: {
          inventoryItemId: mapping.inventoryItemId
        }
      })
      
      console.log(`  ✅ Updated ${updateResult.count} ProcurementItem(s)\n`)
      results.successful += updateResult.count
      results.details.push({
        mapping,
        status: 'SUCCESS',
        count: updateResult.count
      })
      
    } catch (error) {
      console.error(`  ❌ Failed to update:`, error)
      results.failed++
      results.details.push({
        mapping,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📊 MAPPING RESULTS')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`✅ Successful updates: ${results.successful}`)
  console.log(`❌ Failed updates: ${results.failed}`)
  console.log(`📋 Total mappings processed: ${allMappings.length}`)
  
  // Export results
  const dataDir = path.join(process.cwd(), 'scripts', 'fix02', 'data')
  const resultsPath = path.join(dataDir, 'mapping-results.json')
  
  const exportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalMappings: allMappings.length,
      successfulUpdates: results.successful,
      failedUpdates: results.failed
    },
    details: results.details
  }
  
  await fs.writeFile(
    resultsPath,
    JSON.stringify(exportData, null, 2),
    'utf-8'
  )
  
  console.log(`\n💾 Results exported to: ${resultsPath}`)
  
  return results
}

// Execute
applyMappings()
  .then(async (results) => {
    console.log('\n✅ Mapping application completed!')
    
    // Verify results by re-checking orphaned count
    console.log('\n🔍 Verifying results...')
    const orphanedCount = await prisma.procurementItem.count({
      where: { inventoryItemId: null }
    })
    
    const totalCount = await prisma.procurementItem.count()
    const linkedCount = totalCount - orphanedCount
    const linkedPercentage = ((linkedCount / totalCount) * 100).toFixed(2)
    
    console.log(`\n📊 Final Status:`)
    console.log(`  Total ProcurementItems: ${totalCount}`)
    console.log(`  Linked: ${linkedCount} (${linkedPercentage}%)`)
    console.log(`  Orphaned: ${orphanedCount}`)
    
    if (orphanedCount === 0) {
      console.log(`\n🎉 SUCCESS! All ProcurementItems now linked to InventoryItems!`)
    } else {
      console.log(`\n⚠️ WARNING: ${orphanedCount} items still orphaned`)
    }
    
    process.exit(results.failed > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error('❌ Error applying mappings:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
