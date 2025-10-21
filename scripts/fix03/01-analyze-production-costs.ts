/**
 * Analyze Production Cost Storage - Fix #3 Step 1
 * 
 * Analyzes FoodProduction records to understand current cost storage:
 * 1. How many productions have stored costs vs null
 * 2. Relationship between MenuIngredients and actual costs
 * 3. Whether ProductionStockUsage model exists
 * 4. Cost calculation accuracy issues
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @see /docs/SPPG_PHASE1_IMPLEMENTATION_PLAN.md - Fix #3
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'

const prisma = new PrismaClient()

async function analyzeProductionCosts() {
  console.log('🔍 Analyzing FoodProduction cost storage...\n')

  try {
    // 1. Get all food productions
    console.log('📊 Step 1: Loading FoodProduction data...')
    
    const productions = await prisma.foodProduction.findMany({
      include: {
        menu: {
          include: {
            ingredients: {
              include: {
                inventoryItem: {
                  select: {
                    itemName: true,
                    costPerUnit: true,
                    lastPrice: true,
                    averagePrice: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log(`Found ${productions.length} production record(s)\n`)

    if (productions.length === 0) {
      console.log('⚠️  No production records found. Create some productions first.')
      return
    }

    // 2. Analyze cost field usage
    console.log('📊 Step 2: Analyzing stored cost fields...')
    
    const withEstimatedCost = productions.filter(p => p.estimatedCost > 0).length
    const withActualCost = productions.filter(p => p.actualCost && p.actualCost > 0).length
    const withCostPerPortion = productions.filter(p => p.costPerPortion && p.costPerPortion > 0).length

    console.log(`  Total productions: ${productions.length}`)
    console.log(`  With estimatedCost: ${withEstimatedCost} (${((withEstimatedCost/productions.length)*100).toFixed(2)}%)`)
    console.log(`  With actualCost: ${withActualCost} (${((withActualCost/productions.length)*100).toFixed(2)}%)`)
    console.log(`  With costPerPortion: ${withCostPerPortion} (${((withCostPerPortion/productions.length)*100).toFixed(2)}%)`)
    console.log()

    // 3. Check if ProductionStockUsage model exists
    console.log('📊 Step 3: Checking for ProductionStockUsage tracking...')
    
    // Try to query the model (will fail if doesn't exist)
    let hasStockUsageModel = false
    try {
      // @ts-ignore - checking if model exists
      await prisma.productionStockUsage?.count()
      hasStockUsageModel = true
      console.log('  ✅ ProductionStockUsage model EXISTS')
    } catch (error) {
      console.log('  ❌ ProductionStockUsage model DOES NOT EXIST')
      console.log('  → Need to create new model for tracking actual usage')
    }
    console.log()

    // 4. Analyze MenuIngredient relationships
    console.log('📊 Step 4: Analyzing MenuIngredient cost calculation...')
    
    const productionsWithIngredients = productions.filter(p => 
      p.menu.ingredients && p.menu.ingredients.length > 0
    )

    console.log(`  Productions with menu ingredients: ${productionsWithIngredients.length}/${productions.length}`)
    
    if (productionsWithIngredients.length > 0) {
      const sampleProduction = productionsWithIngredients[0]
      
      console.log(`\n  📋 Sample Production: ${sampleProduction.batchNumber}`)
      console.log(`     Menu: ${sampleProduction.menu.menuName}`)
      console.log(`     Portions: ${sampleProduction.plannedPortions}`)
      console.log(`     Stored estimatedCost: Rp ${sampleProduction.estimatedCost.toLocaleString('id-ID')}`)
      console.log(`     Stored actualCost: Rp ${(sampleProduction.actualCost || 0).toLocaleString('id-ID')}`)
      console.log(`     Stored costPerPortion: Rp ${(sampleProduction.costPerPortion || 0).toLocaleString('id-ID')}`)
      
      // Calculate theoretical cost from MenuIngredients
      let calculatedCost = 0
      console.log(`\n     Menu Ingredients (${sampleProduction.menu.ingredients.length}):`)
      
      for (const ingredient of sampleProduction.menu.ingredients) {
        if (ingredient.inventoryItem) {
          const unitCost = ingredient.inventoryItem.costPerUnit || 
                          ingredient.inventoryItem.lastPrice || 
                          ingredient.inventoryItem.averagePrice || 
                          0
          const ingredientCost = ingredient.quantity * unitCost
          calculatedCost += ingredientCost
          
          console.log(`       - ${ingredient.inventoryItem.itemName}: ${ingredient.quantity} ${ingredient.unit} @ Rp ${unitCost.toLocaleString('id-ID')} = Rp ${ingredientCost.toLocaleString('id-ID')}`)
        } else {
          console.log(`       - ${ingredient.ingredientName}: ${ingredient.quantity} ${ingredient.unit} (NO INVENTORY LINK)`)
        }
      }
      
      const calculatedCostPerPortion = calculatedCost / sampleProduction.plannedPortions
      
      console.log(`\n     Calculated from ingredients:`)
      console.log(`       Total Cost: Rp ${calculatedCost.toLocaleString('id-ID')}`)
      console.log(`       Cost per Portion: Rp ${calculatedCostPerPortion.toLocaleString('id-ID')}`)
      
      console.log(`\n     💡 Comparison:`)
      console.log(`       Stored vs Calculated Total: ${sampleProduction.estimatedCost === calculatedCost ? '✅ MATCH' : '❌ DIFFERENT'}`)
      
      if (sampleProduction.estimatedCost !== calculatedCost) {
        const diff = Math.abs(sampleProduction.estimatedCost - calculatedCost)
        const diffPercent = ((diff / calculatedCost) * 100).toFixed(2)
        console.log(`       Difference: Rp ${diff.toLocaleString('id-ID')} (${diffPercent}%)`)
      }
    }
    console.log()

    // 5. Identify issues with stored costs
    console.log('📊 Step 5: Identifying cost calculation issues...')
    
    const issues = []
    
    // Issue 1: Stored costs become stale when inventory prices change
    issues.push({
      issue: 'Stale Cost Data',
      description: 'Stored costs don\'t update when inventory prices change',
      severity: 'HIGH',
      impact: 'Financial reporting inaccuracy over time'
    })
    
    // Issue 2: No tracking of actual inventory usage
    if (!hasStockUsageModel) {
      issues.push({
        issue: 'No Stock Usage Tracking',
        description: 'Cannot track which inventory items were actually used',
        severity: 'HIGH',
        impact: 'Cannot verify actual costs vs estimated costs'
      })
    }
    
    // Issue 3: Cost calculation logic scattered
    issues.push({
      issue: 'Scattered Cost Logic',
      description: 'Cost calculation duplicated across different parts of code',
      severity: 'MEDIUM',
      impact: 'Maintenance difficulty, inconsistent calculations'
    })

    console.log(`  Found ${issues.length} issue(s):\n`)
    
    issues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue.issue} (${issue.severity})`)
      console.log(`     → ${issue.description}`)
      console.log(`     → Impact: ${issue.impact}\n`)
    })

    // 6. Generate recommendations
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('📋 FIX #3 RECOMMENDATIONS')
    console.log('═══════════════════════════════════════════════════════════════')
    
    console.log('\n✅ RECOMMENDED SOLUTION:')
    console.log('   1. Create ProductionStockUsage model')
    console.log('      - Track actual inventory items used in each production')
    console.log('      - Store quantity, unit cost at time of use')
    console.log('      - Link to FoodProduction and InventoryItem')
    console.log()
    console.log('   2. Remove stored cost fields from FoodProduction')
    console.log('      - Remove: estimatedCost, actualCost, costPerPortion')
    console.log('      - Calculate dynamically from ProductionStockUsage')
    console.log()
    console.log('   3. Create ProductionCostCalculator service')
    console.log('      - Dynamic cost calculation from actual usage')
    console.log('      - Real-time cost updates when inventory prices change')
    console.log('      - Support for historical cost queries')
    console.log()

    // 7. Export analysis
    const dataDir = path.join(process.cwd(), 'scripts', 'fix03', 'data')
    await fs.mkdir(dataDir, { recursive: true })
    
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProductions: productions.length,
        withEstimatedCost,
        withActualCost,
        withCostPerPortion,
        hasStockUsageModel,
        productionsWithIngredients: productionsWithIngredients.length
      },
      issues,
      recommendations: [
        'Create ProductionStockUsage model',
        'Remove stored cost fields',
        'Implement dynamic cost calculation service'
      ]
    }
    
    const exportPath = path.join(dataDir, 'production-cost-analysis.json')
    await fs.writeFile(
      exportPath,
      JSON.stringify(exportData, null, 2),
      'utf-8'
    )
    
    console.log(`💾 Analysis exported to: ${exportPath}`)
    console.log('\n✅ Analysis completed successfully!')

  } catch (error) {
    console.error('\n❌ Analysis failed:', error)
    throw error
  }
}

// Execute
analyzeProductionCosts()
  .then(() => {
    console.log('\n🎉 Production cost analysis complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Analysis error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
