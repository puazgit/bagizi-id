/**
 * Script to get specific menu data and calculate costs
 */

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function getMenuAndCalculate() {
  try {
    const menuId = 'cmh0d2v2n003nsv7fdurgpm5e'
    
    console.log('📊 Fetching menu data...\n')
    
    const menu = await prisma.nutritionMenu.findUnique({
      where: { id: menuId },
      include: {
        program: {
          include: {
            sppg: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        nutritionCalc: true,
        costCalc: true
      }
    })
    
    if (!menu) {
      console.log('❌ Menu not found!')
      return
    }
    
    console.log('='.repeat(80))
    console.log(`📋 ${menu.menuName} (${menu.menuCode})`)
    console.log('='.repeat(80))
    
    console.log('\n📊 BASIC INFO:')
    console.log(`  - SPPG: ${menu.program.sppg.name}`)
    console.log(`  - Program: ${menu.program.name}`)
    console.log(`  - Meal Type: ${menu.mealType}`)
    console.log(`  - Serving Size: ${menu.servingSize}g per porsi`)
    console.log(`  - Batch Size: ${menu.batchSize} porsi`)
    
    console.log('\n💰 COST INFO:')
    console.log(`  - Cost Per Serving: Rp ${Number(menu.costPerServing || 0).toLocaleString('id-ID')}`)
    console.log(`  - Budget Allocation: Rp ${Number(menu.budgetAllocation || 0).toLocaleString('id-ID')}`)
    
    if (menu.budgetAllocation && menu.costPerServing) {
      const margin = Number(menu.budgetAllocation) - Number(menu.costPerServing)
      const efficiency = (Number(menu.costPerServing) / Number(menu.budgetAllocation)) * 100
      console.log(`  - Margin: Rp ${margin.toLocaleString('id-ID')} (${(100 - efficiency).toFixed(1)}% margin)`)
      console.log(`  - Efficiency: ${efficiency.toFixed(1)}%`)
    }
    
    console.log(`\n🥗 INGREDIENTS (${menu.ingredients.length} items):`)
    console.log('Per 100g base → Actual per serving\n')
    
    let totalCostCalculated = new Prisma.Decimal(0)
    
    for (const ing of menu.ingredients) {
      const item = ing.inventoryItem
      
      // Calculate actual quantity for serving size
      const actualQty = ing.quantity * (menu.servingSize / 100)
      
      // Calculate cost
      const costPer100g = ing.quantity * Number(item.costPerUnit || 0)
      const costPerServing = actualQty * Number(item.costPerUnit || 0)
      
      totalCostCalculated = totalCostCalculated.add(new Prisma.Decimal(costPerServing))
      
      console.log(`${item.itemName}:`)
      console.log(`  Base (100g): ${ing.quantity} ${item.unit}`)
      console.log(`  Actual (${menu.servingSize}g): ${actualQty.toFixed(3)} ${item.unit}`)
      console.log(`  Cost/unit: Rp ${Number(item.costPerUnit || 0).toLocaleString('id-ID')}`)
      console.log(`  Cost per 100g base: Rp ${costPer100g.toLocaleString('id-ID')}`)
      console.log(`  Cost per serving: Rp ${costPerServing.toLocaleString('id-ID')}`)
      console.log('')
    }
    
    console.log('='.repeat(80))
    console.log('💵 COST CALCULATION SUMMARY:')
    console.log('='.repeat(80))
    console.log(`\nCalculated Total (from ingredients): Rp ${totalCostCalculated.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Database Value (costPerServing): Rp ${Number(menu.costPerServing || 0).toLocaleString('id-ID')}`)
    
    const difference = Number(totalCostCalculated) - Number(menu.costPerServing || 0)
    if (Math.abs(difference) > 0.01) {
      console.log(`\n⚠️  Difference: Rp ${difference.toLocaleString('id-ID')}`)
      if (difference > 0) {
        console.log(`   Database value is LOWER (possible supplier discount/negotiation)`)
      } else {
        console.log(`   Database value is HIGHER (possible markup/additional costs)`)
      }
    } else {
      console.log(`\n✅ Perfect match! Database value matches calculated value.`)
    }
    
    // Production calculation for batch size
    console.log('\n='.repeat(80))
    console.log(`🏭 PRODUCTION PLANNING (${menu.batchSize} portions):`)
    console.log('='.repeat(80))
    console.log('\nRequired Ingredients:\n')
    
    let totalProductionCost = new Prisma.Decimal(0)
    
    for (const ing of menu.ingredients) {
      const item = ing.inventoryItem
      
      // Step 1: Scale from 100g base to serving size
      const qtyPerServing = ing.quantity * (menu.servingSize / 100)
      
      // Step 2: Scale to batch size
      const qtyForBatch = qtyPerServing * menu.batchSize
      
      // Calculate cost
      const costForBatch = qtyForBatch * Number(item.costPerUnit || 0)
      totalProductionCost = totalProductionCost.add(new Prisma.Decimal(costForBatch))
      
      console.log(`${item.itemName}:`)
      console.log(`  Per serving: ${qtyPerServing.toFixed(3)} ${item.unit}`)
      console.log(`  For ${menu.batchSize} portions: ${qtyForBatch.toFixed(2)} ${item.unit}`)
      console.log(`  Total cost: Rp ${costForBatch.toLocaleString('id-ID')}`)
      console.log('')
    }
    
    console.log('='.repeat(80))
    console.log(`Total Ingredient Cost for ${menu.batchSize} portions: Rp ${totalProductionCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Cost per portion: Rp ${(Number(totalProductionCost) / menu.batchSize).toLocaleString('id-ID')}`)
    console.log('='.repeat(80))
    
    // Full operational cost example
    console.log('\n📈 FULL OPERATIONAL COST EXAMPLE:')
    console.log('(Assuming typical operational costs)\n')
    
    const ingredientCost = totalProductionCost
    const laborCost = new Prisma.Decimal(75000) // 3 hours × Rp 25,000/hour
    const utilityCost = new Prisma.Decimal(100000) // Gas + electric + water
    const packagingCost = new Prisma.Decimal(menu.batchSize * 1000) // Rp 1,000 per portion
    const equipmentCost = new Prisma.Decimal(30000)
    const cleaningCost = new Prisma.Decimal(20000)
    
    const directCost = ingredientCost.add(laborCost).add(utilityCost)
    const overheadCost = directCost.mul(new Prisma.Decimal(0.15)) // 15%
    const indirectCost = packagingCost.add(equipmentCost).add(cleaningCost).add(overheadCost)
    const grandTotal = directCost.add(indirectCost)
    const costPerPortion = grandTotal.div(new Prisma.Decimal(menu.batchSize))
    
    console.log(`Ingredient Cost: Rp ${ingredientCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Labor Cost (3 hours): Rp ${laborCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Utility Cost: Rp ${utilityCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Direct Cost: Rp ${directCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log('')
    console.log(`Packaging (Rp 1,000 × ${menu.batchSize}): Rp ${packagingCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Equipment: Rp ${equipmentCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Cleaning: Rp ${cleaningCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Overhead (15%): Rp ${overheadCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`Indirect Cost: Rp ${indirectCost.toFixed(2).toLocaleString('id-ID')}`)
    console.log('')
    console.log('='.repeat(80))
    console.log(`GRAND TOTAL: Rp ${grandTotal.toFixed(2).toLocaleString('id-ID')}`)
    console.log(`COST PER PORTION: Rp ${costPerPortion.toFixed(2).toLocaleString('id-ID')}`)
    console.log('='.repeat(80))
    
    // Budget analysis
    if (menu.budgetAllocation) {
      console.log('\n💡 BUDGET ANALYSIS:\n')
      console.log(`Budget Allocation: Rp ${Number(menu.budgetAllocation).toLocaleString('id-ID')} per portion`)
      console.log(`Ingredient Cost Only: Rp ${Number(menu.costPerServing || 0).toLocaleString('id-ID')} per portion`)
      console.log(`Full Operational Cost: Rp ${costPerPortion.toFixed(2).toLocaleString('id-ID')} per portion`)
      
      const ingredientMargin = Number(menu.budgetAllocation) - Number(menu.costPerServing || 0)
      const fullCostMargin = Number(menu.budgetAllocation) - Number(costPerPortion)
      
      console.log('')
      console.log(`Margin (ingredient only): Rp ${ingredientMargin.toLocaleString('id-ID')} ${ingredientMargin >= 0 ? '✅' : '❌'}`)
      console.log(`Margin (full operational): Rp ${fullCostMargin.toLocaleString('id-ID')} ${fullCostMargin >= 0 ? '✅' : '❌'}`)
      
      if (ingredientMargin >= 0 && fullCostMargin < 0) {
        console.log('\n⚠️  INSIGHT: Ingredient cost within budget, but operational costs push it over!')
        console.log('    Solutions:')
        console.log('    1. Increase budget allocation')
        console.log('    2. Optimize operational costs (larger batches for economies of scale)')
        console.log('    3. Reduce packaging/overhead costs')
      } else if (ingredientMargin >= 0 && fullCostMargin >= 0) {
        console.log('\n✅ INSIGHT: Menu is profitable even with full operational costs!')
      } else {
        console.log('\n❌ INSIGHT: Ingredient cost already exceeds budget - need immediate action!')
      }
    }
    
    console.log('\n')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getMenuAndCalculate()
