/**
 * Fix #2 Step 2: Check Existing InventoryItems
 * 
 * This script checks which InventoryItems already exist
 * and suggests mappings for orphaned ProcurementItems
 * 
 * @see docs/fixes/FIX02_PROCUREMENT_ITEM_INVENTORY_LINK.md
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExistingInventory() {
  console.log('🔍 Checking existing InventoryItems for mapping...\n')

  try {
    // Step 1: Get all existing inventory items
    const allInventoryItems = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        itemName: true,
        itemCode: true,
        category: true,
        unit: true,
        costPerUnit: true,
        lastPrice: true,
        averagePrice: true,
        currentStock: true,
        isActive: true
      },
      orderBy: {
        itemName: 'asc'
      }
    })

    console.log(`📦 Total InventoryItems in database: ${allInventoryItems.length}\n`)

    // Step 2: Get orphaned procurement items
    const orphanedItems = [
      { itemName: 'Bayam Hijau', unit: 'KG', avgPrice: 8000 },
      { itemName: 'Beras Premium Cianjur', unit: 'KARUNG', avgPrice: 375000 },
      { itemName: 'Ikan Nila Segar', unit: 'KG', avgPrice: 32000 },
      { itemName: 'Susu UHT 1 Liter', unit: 'LITER', avgPrice: 14000 },
      { itemName: 'Tomat', unit: 'KG', avgPrice: 15000 },
      { itemName: 'Wortel', unit: 'KG', avgPrice: 12000 }
    ]

    console.log('🔍 Searching for matches...\n')
    console.log('='.repeat(120))

    const mappingSuggestions: any[] = []
    const needsCreation: any[] = []

    for (const orphan of orphanedItems) {
      console.log(`\n📋 Orphaned Item: ${orphan.itemName} (${orphan.unit})`)
      console.log('─'.repeat(120))

      // Try exact match
      const exactMatch = allInventoryItems.find(
        inv => inv.itemName.toLowerCase() === orphan.itemName.toLowerCase() &&
               inv.unit.toLowerCase() === orphan.unit.toLowerCase()
      )

      if (exactMatch) {
        console.log(`✅ EXACT MATCH FOUND!`)
        console.log(`   → InventoryItem: ${exactMatch.itemName} (${exactMatch.unit})`)
        console.log(`   → ID: ${exactMatch.id}`)
        console.log(`   → Category: ${exactMatch.category}`)
        console.log(`   → Current Price: Rp ${(exactMatch.costPerUnit || exactMatch.lastPrice || 0).toLocaleString('id-ID')}`)
        console.log(`   → Procurement Price: Rp ${orphan.avgPrice.toLocaleString('id-ID')}`)
        console.log(`   → Current Stock: ${exactMatch.currentStock} ${exactMatch.unit}`)
        
        mappingSuggestions.push({
          procurementItemName: orphan.itemName,
          procurementUnit: orphan.unit,
          inventoryItemId: exactMatch.id,
          inventoryItemName: exactMatch.itemName,
          matchType: 'EXACT',
          confidence: 100
        })
        continue
      }

      // Try fuzzy match (similar name)
      const fuzzyMatches = allInventoryItems.filter(inv => {
        const invNameLower = inv.itemName.toLowerCase()
        const orphanNameLower = orphan.itemName.toLowerCase()
        
        // Check if one contains the other
        if (invNameLower.includes(orphanNameLower) || orphanNameLower.includes(invNameLower)) {
          return inv.unit.toLowerCase() === orphan.unit.toLowerCase()
        }
        
        // Check for similar words
        const invWords = invNameLower.split(/\s+/)
        const orphanWords = orphanNameLower.split(/\s+/)
        const commonWords = invWords.filter(w => orphanWords.includes(w))
        
        return commonWords.length >= 1 && inv.unit.toLowerCase() === orphan.unit.toLowerCase()
      })

      if (fuzzyMatches.length > 0) {
        // Sort by confidence score (highest first)
        const matchesWithConfidence = fuzzyMatches.map(match => ({
          ...match,
          confidence: calculateConfidence(orphan.itemName, match.itemName)
        })).sort((a, b) => b.confidence - a.confidence)
        
        console.log(`🔍 FUZZY MATCHES FOUND (${matchesWithConfidence.length}):`)
        matchesWithConfidence.forEach((match, idx) => {
          console.log(`   ${idx + 1}. ${match.itemName} (${match.unit})`)
          console.log(`      → ID: ${match.id}`)
          console.log(`      → Category: ${match.category}`)
          console.log(`      → Price: Rp ${(match.costPerUnit || match.lastPrice || 0).toLocaleString('id-ID')} vs Rp ${orphan.avgPrice.toLocaleString('id-ID')}`)
          console.log(`      → Confidence: ${match.confidence}%`)
        })
        
        // Use best match (highest confidence)
        const bestMatch = matchesWithConfidence[0]
        mappingSuggestions.push({
          procurementItemName: orphan.itemName,
          procurementUnit: orphan.unit,
          inventoryItemId: bestMatch.id,
          inventoryItemName: bestMatch.itemName,
          matchType: 'FUZZY',
          confidence: bestMatch.confidence
        })
      } else {
        console.log(`❌ NO MATCH FOUND - Needs to create new InventoryItem`)
        needsCreation.push({
          itemName: orphan.itemName,
          unit: orphan.unit,
          suggestedPrice: orphan.avgPrice,
          suggestedCategory: guessCategory(orphan.itemName)
        })
      }
    }

    // Summary
    console.log('\n\n' + '='.repeat(120))
    console.log('📊 MAPPING SUMMARY')
    console.log('='.repeat(120))
    console.log(`✅ Items with existing matches: ${mappingSuggestions.length}`)
    console.log(`❌ Items needing creation: ${needsCreation.length}`)

    if (mappingSuggestions.length > 0) {
      console.log('\n📋 Suggested Mappings:')
      console.log('─'.repeat(120))
      mappingSuggestions.forEach((mapping, idx) => {
        console.log(`${idx + 1}. ${mapping.procurementItemName} → ${mapping.inventoryItemName}`)
        console.log(`   Match Type: ${mapping.matchType} | Confidence: ${mapping.confidence}% | ID: ${mapping.inventoryItemId}`)
      })
    }

    if (needsCreation.length > 0) {
      console.log('\n📦 Items to Create:')
      console.log('─'.repeat(120))
      needsCreation.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.itemName} (${item.unit})`)
        console.log(`   Category: ${item.suggestedCategory} | Price: Rp ${item.suggestedPrice.toLocaleString('id-ID')}`)
      })
    }

    // Export results
    const fs = await import('fs/promises')
    await fs.mkdir('./scripts/fix02/data', { recursive: true })
    
    const mappingData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalOrphaned: orphanedItems.length,
        withMatches: mappingSuggestions.length,
        needsCreation: needsCreation.length,
        totalInventoryItems: allInventoryItems.length
      },
      mappings: mappingSuggestions,
      needsCreation,
      allInventoryItems
    }

    await fs.writeFile(
      './scripts/fix02/data/inventory-mapping.json',
      JSON.stringify(mappingData, null, 2)
    )

    console.log('\n💾 Mapping suggestions exported to: ./scripts/fix02/data/inventory-mapping.json')
    console.log('\n✅ Next Steps:')
    console.log('   1. Review suggested mappings above')
    console.log('   2. Run: npm run fix02:create-missing (creates new InventoryItems)')
    console.log('   3. Run: npm run fix02:apply-mappings (links ProcurementItems)')
    console.log('='.repeat(120))

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to calculate confidence score
function calculateConfidence(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  // Exact match
  if (s1 === s2) return 100
  
  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 90
  
  // Word overlap
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  const commonWords = words1.filter(w => words2.includes(w))
  const wordOverlap = (commonWords.length / Math.max(words1.length, words2.length)) * 100
  
  if (wordOverlap > 0) return Math.round(wordOverlap)
  
  // Character similarity (Levenshtein-like)
  let matches = 0
  const minLen = Math.min(s1.length, s2.length)
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) matches++
  }
  
  return Math.round((matches / Math.max(s1.length, s2.length)) * 100)
}

// Helper function to guess category
function guessCategory(itemName: string): string {
  const name = itemName.toLowerCase()
  
  if (name.includes('beras') || name.includes('nasi')) return 'KARBOHIDRAT'
  if (name.includes('ayam') || name.includes('daging') || name.includes('ikan')) return 'PROTEIN_HEWANI'
  if (name.includes('tempe') || name.includes('tahu') || name.includes('kacang')) return 'PROTEIN_NABATI'
  if (name.includes('bayam') || name.includes('sayur') || name.includes('wortel') || name.includes('tomat')) return 'SAYURAN'
  if (name.includes('susu') || name.includes('keju') || name.includes('yogurt')) return 'SUSU_PRODUK'
  if (name.includes('buah')) return 'BUAH_BUAHAN'
  if (name.includes('minyak') || name.includes('mentega')) return 'MINYAK_LEMAK'
  
  return 'LAINNYA'
}

// Run check
checkExistingInventory()
  .then(() => {
    console.log('\n✅ Check completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error)
    process.exit(1)
  })
