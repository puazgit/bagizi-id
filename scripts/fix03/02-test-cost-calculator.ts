/**
 * @fileoverview Test ProductionCostCalculator Service
 * @description
 * Tests the production cost calculator with real database data
 * Creates sample ProductionStockUsage records and calculates costs
 */

import { PrismaClient } from '@prisma/client'
import { productionCostCalculator } from '../../src/services/production/ProductionCostCalculator'

const prisma = new PrismaClient()

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

async function main() {
  console.log('🧪 Testing ProductionCostCalculator Service\n')
  console.log('='.repeat(80))
  
  const results: TestResult[] = []
  
  try {
    // ========================================================================
    // Test 1: Load a production record
    // ========================================================================
    console.log('\n📊 Test 1: Load Production Record')
    console.log('-'.repeat(80))
    
    const production = await prisma.foodProduction.findFirst({
      include: {
        menu: {
          include: {
            ingredients: {
              include: {
                inventoryItem: true
              }
            }
          }
        }
      }
    })
    
    if (!production) {
      throw new Error('No production records found in database')
    }
    
    console.log(`✅ Found production: ${production.batchNumber}`)
    console.log(`   Menu: ${production.menu.menuName}`)
    console.log(`   Planned portions: ${production.plannedPortions}`)
    console.log(`   Ingredients: ${production.menu.ingredients.length}`)
    
    results.push({
      success: true,
      message: 'Successfully loaded production record',
      data: {
        productionId: production.id,
        batchNumber: production.batchNumber,
        menuName: production.menu.menuName
      }
    })
    
    // ========================================================================
    // Test 2: Calculate estimated cost from menu ingredients
    // ========================================================================
    console.log('\n💰 Test 2: Calculate Estimated Cost')
    console.log('-'.repeat(80))
    
    const estimatedCost = await productionCostCalculator.calculateEstimatedCost(
      production.menuId,
      production.plannedPortions
    )
    
    console.log(`✅ Estimated cost calculated`)
    console.log(`   Menu: ${production.menu.menuName}`)
    console.log(`   Portions: ${production.plannedPortions}`)
    console.log(`   Total estimated cost: Rp ${estimatedCost.toLocaleString('id-ID')}`)
    console.log(`   Cost per portion: Rp ${(estimatedCost / production.plannedPortions).toLocaleString('id-ID')}`)
    
    results.push({
      success: true,
      message: 'Estimated cost calculation successful',
      data: {
        totalCost: estimatedCost,
        costPerPortion: estimatedCost / production.plannedPortions
      }
    })
    
    // ========================================================================
    // Test 3: Create sample ProductionStockUsage records
    // ========================================================================
    console.log('\n📝 Test 3: Record Stock Usage')
    console.log('-'.repeat(80))
    
    // Check if usage records already exist
    const existingUsage = await prisma.productionStockUsage.findMany({
      where: { productionId: production.id }
    })
    
    if (existingUsage.length > 0) {
      console.log(`⚠️  Production already has ${existingUsage.length} usage records`)
      console.log('   Skipping creation to avoid duplicates')
    } else {
      // Create usage records based on menu ingredients
      const usageRecords = production.menu.ingredients
        .filter(ing => ing.inventoryItem !== null)
        .map(ingredient => {
          // Convert to base units and multiply by portions
          let quantityInBaseUnit = ingredient.quantity
          let unit = ingredient.unit
          
          // Convert gram to kg
          if (ingredient.unit.toLowerCase() === 'gram' || ingredient.unit.toLowerCase() === 'g') {
            quantityInBaseUnit = (ingredient.quantity * production.plannedPortions) / 1000
            unit = 'kg'
          }
          // Convert ml to liter
          else if (ingredient.unit.toLowerCase() === 'ml') {
            quantityInBaseUnit = (ingredient.quantity * production.plannedPortions) / 1000
            unit = 'liter'
          }
          // Other units: multiply by portions
          else {
            quantityInBaseUnit = ingredient.quantity * production.plannedPortions
          }
          
          const unitCost = ingredient.inventoryItem!.costPerUnit || 0
          
          return {
            inventoryItemId: ingredient.inventoryItemId!,
            quantityUsed: quantityInBaseUnit,
            unit: unit,
            unitCostAtUse: unitCost,
            recordedBy: 'test-script',
            notes: `Auto-created from menu ingredient: ${ingredient.inventoryItem!.itemName}`
          }
        })
      
      console.log(`📋 Creating ${usageRecords.length} usage records...`)
      
      await productionCostCalculator.recordStockUsage(
        production.id,
        usageRecords
      )
      
      console.log(`✅ Stock usage recorded successfully`)
      console.log(`   Records created: ${usageRecords.length}`)
      
      // Show sample
      if (usageRecords.length > 0) {
        const sample = usageRecords[0]
        const item = production.menu.ingredients[0].inventoryItem!
        console.log(`\n   Sample record:`)
        console.log(`   - Item: ${item.itemName}`)
        console.log(`   - Quantity: ${sample.quantityUsed} ${sample.unit}`)
        console.log(`   - Unit cost: Rp ${sample.unitCostAtUse.toLocaleString('id-ID')}`)
        console.log(`   - Total: Rp ${(sample.quantityUsed * sample.unitCostAtUse).toLocaleString('id-ID')}`)
      }
      
      results.push({
        success: true,
        message: 'Stock usage recording successful',
        data: {
          recordsCreated: usageRecords.length
        }
      })
    }
    
    // ========================================================================
    // Test 4: Calculate actual production cost
    // ========================================================================
    console.log('\n💵 Test 4: Calculate Actual Production Cost')
    console.log('-'.repeat(80))
    
    const actualCost = await productionCostCalculator.calculateProductionCost(production.id)
    
    console.log(`✅ Actual cost calculated`)
    console.log(`   Production ID: ${actualCost.productionId}`)
    console.log(`   Total cost: Rp ${actualCost.totalCost.toLocaleString('id-ID')}`)
    console.log(`   Cost per portion: Rp ${actualCost.costPerPortion.toLocaleString('id-ID')}`)
    console.log(`   Portions: ${actualCost.actualPortions}`)
    console.log(`   Usage records: ${actualCost.usageRecordCount}`)
    
    results.push({
      success: true,
      message: 'Actual cost calculation successful',
      data: actualCost
    })
    
    // ========================================================================
    // Test 5: Get cost breakdown
    // ========================================================================
    console.log('\n📊 Test 5: Get Cost Breakdown')
    console.log('-'.repeat(80))
    
    const breakdown = await productionCostCalculator.getCostBreakdown(production.id)
    
    console.log(`✅ Cost breakdown retrieved`)
    console.log(`   Total items: ${breakdown.length}\n`)
    
    console.log('   Top 5 most expensive ingredients:')
    breakdown.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.itemName}`)
      console.log(`      Quantity: ${item.quantityUsed} ${item.unit}`)
      console.log(`      Unit cost: Rp ${item.unitCostAtUse.toLocaleString('id-ID')}`)
      console.log(`      Total: Rp ${item.totalCost.toLocaleString('id-ID')} (${item.percentage.toFixed(1)}%)`)
    })
    
    results.push({
      success: true,
      message: 'Cost breakdown retrieval successful',
      data: {
        itemCount: breakdown.length,
        topItems: breakdown.slice(0, 3)
      }
    })
    
    // ========================================================================
    // Test Summary
    // ========================================================================
    console.log('\n')
    console.log('='.repeat(80))
    console.log('📈 TEST SUMMARY')
    console.log('='.repeat(80))
    
    const successCount = results.filter(r => r.success).length
    const totalTests = results.length
    
    console.log(`\nTotal tests: ${totalTests}`)
    console.log(`Passed: ${successCount}`)
    console.log(`Failed: ${totalTests - successCount}`)
    console.log(`Success rate: ${((successCount / totalTests) * 100).toFixed(1)}%`)
    
    if (successCount === totalTests) {
      console.log('\n✅ All tests passed!')
    } else {
      console.log('\n❌ Some tests failed')
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:')
    console.error(error)
    
    results.push({
      success: false,
      message: 'Test suite failed',
      error: error instanceof Error ? error.message : String(error)
    })
  } finally {
    await prisma.$disconnect()
  }
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.success)
  process.exit(allPassed ? 0 : 1)
}

main()
