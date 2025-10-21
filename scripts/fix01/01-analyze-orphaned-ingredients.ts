/**
 * Fix #1 Step 1: Analyze Orphaned MenuIngredients
 * 
 * This script analyzes the current state of MenuIngredients
 * to identify which ones lack InventoryItem links.
 * 
 * @see docs/fixes/FIX01_MENU_INGREDIENT_INVENTORY_LINK.md
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface OrphanedIngredient {
  ingredientName: string
  unit: string
  avgCost: number
  usageCount: number
  minCost: number
  maxCost: number
}

async function analyzeOrphanedIngredients() {
  console.log('🔍 Analyzing MenuIngredients without InventoryItem link...\n')

  try {
    // Step 1: Count total MenuIngredients
    const totalIngredients = await prisma.menuIngredient.count()
    console.log(`📊 Total MenuIngredients: ${totalIngredients}`)

    // Step 2: Count orphaned ingredients (no inventoryItemId)
    const orphanedCount = await prisma.menuIngredient.count({
      where: {
        inventoryItemId: null
      }
    })
    console.log(`❌ Orphaned MenuIngredients: ${orphanedCount}`)
    console.log(`✅ Linked MenuIngredients: ${totalIngredients - orphanedCount}`)
    console.log(`📈 Orphaned Percentage: ${((orphanedCount / totalIngredients) * 100).toFixed(2)}%\n`)

    // Step 3: Get unique orphaned ingredients
    const uniqueOrphaned = await prisma.menuIngredient.groupBy({
      by: ['ingredientName', 'unit'],
      where: {
        inventoryItemId: null
      },
      _count: {
        id: true
      },
      _avg: {
        costPerUnit: true
      },
      _min: {
        costPerUnit: true
      },
      _max: {
        costPerUnit: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    }).then(results => results.map(r => ({
      ingredientName: r.ingredientName,
      unit: r.unit,
      avgCost: r._avg.costPerUnit || 0,
      usageCount: r._count.id,
      minCost: r._min.costPerUnit || 0,
      maxCost: r._max.costPerUnit || 0
    })))

    console.log(`📋 Unique orphaned ingredients: ${uniqueOrphaned.length}\n`)

    // Step 4: Display top 20 most used orphaned ingredients
    console.log('🔝 Top 20 Most Used Orphaned Ingredients:')
    console.log('─'.repeat(100))
    console.log(
      'Ingredient Name'.padEnd(40),
      'Unit'.padEnd(10),
      'Avg Cost'.padEnd(15),
      'Min/Max Cost'.padEnd(20),
      'Usage Count'
    )
    console.log('─'.repeat(100))

    uniqueOrphaned.slice(0, 20).forEach((ing) => {
      console.log(
        ing.ingredientName.padEnd(40),
        ing.unit.padEnd(10),
        `Rp ${Number(ing.avgCost).toLocaleString('id-ID')}`.padEnd(15),
        `${Number(ing.minCost).toLocaleString('id-ID')} - ${Number(ing.maxCost).toLocaleString('id-ID')}`.padEnd(20),
        ing.usageCount.toString()
      )
    })
    console.log('─'.repeat(100))

    // Step 5: Analyze cost inconsistencies
    console.log('\n💰 Cost Inconsistency Analysis:')
    const inconsistentCosts = uniqueOrphaned.filter(
      (ing) => Number(ing.maxCost) > Number(ing.minCost) * 1.2 // More than 20% difference
    )
    console.log(`⚠️  Ingredients with >20% cost variance: ${inconsistentCosts.length}`)

    if (inconsistentCosts.length > 0) {
      console.log('\n🔍 Examples of inconsistent costs:')
      inconsistentCosts.slice(0, 5).forEach((ing) => {
        const variance = ((Number(ing.maxCost) - Number(ing.minCost)) / Number(ing.minCost) * 100).toFixed(1)
        console.log(`   • ${ing.ingredientName} (${ing.unit}): ${variance}% variance`)
        console.log(`     Min: Rp ${Number(ing.minCost).toLocaleString('id-ID')} | Max: Rp ${Number(ing.maxCost).toLocaleString('id-ID')}`)
      })
    }

    // Step 6: Analyze affected menus
    const affectedMenus = await prisma.nutritionMenu.count({
      where: {
        ingredients: {
          some: {
            inventoryItemId: null
          }
        }
      }
    })

    const totalMenus = await prisma.nutritionMenu.count()
    console.log(`\n📋 Menu Analysis:`)
    console.log(`   Total menus: ${totalMenus}`)
    console.log(`   Menus with orphaned ingredients: ${affectedMenus}`)
    console.log(`   Affected percentage: ${((affectedMenus / totalMenus) * 100).toFixed(2)}%`)

    // Step 7: Summary and recommendations
    console.log('\n' + '='.repeat(100))
    console.log('📊 ANALYSIS SUMMARY')
    console.log('='.repeat(100))
    console.log(`Total Issues Found:`)
    console.log(`   • ${orphanedCount} orphaned MenuIngredients (${((orphanedCount / totalIngredients) * 100).toFixed(2)}%)`)
    console.log(`   • ${uniqueOrphaned.length} unique ingredient names need mapping`)
    console.log(`   • ${inconsistentCosts.length} ingredients have inconsistent costs`)
    console.log(`   • ${affectedMenus} menus are affected (${((affectedMenus / totalMenus) * 100).toFixed(2)}%)`)

    console.log(`\n✅ Next Steps:`)
    console.log(`   1. Review the mapping file: scripts/fix01/data/ingredient-mapping.json`)
    console.log(`   2. Create missing InventoryItems: npm run fix01:create-missing`)
    console.log(`   3. Run fuzzy matching: npm run fix01:fuzzy-match`)
    console.log(`   4. Apply links: npm run fix01:apply-links`)
    console.log('='.repeat(100))

    // Step 8: Export data for mapping
    const fs = await import('fs/promises')
    const outputPath = './scripts/fix01/data/orphaned-analysis.json'
    
    await fs.mkdir('./scripts/fix01/data', { recursive: true })
    await fs.writeFile(
      outputPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          summary: {
            totalIngredients,
            orphanedCount,
            linkedCount: totalIngredients - orphanedCount,
            orphanedPercentage: ((orphanedCount / totalIngredients) * 100).toFixed(2),
            uniqueOrphaned: uniqueOrphaned.length,
            affectedMenus,
            totalMenus
          },
          orphanedIngredients: uniqueOrphaned
        },
        null,
        2
      )
    )

    console.log(`\n💾 Analysis exported to: ${outputPath}`)

  } catch (error) {
    console.error('❌ Error during analysis:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run analysis
analyzeOrphanedIngredients()
  .then(() => {
    console.log('\n✅ Analysis completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error)
    process.exit(1)
  })
