/**
 * @fileoverview Trace Complete Cost Calculation Flow
 * @version Debug why frontend shows different values
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function traceCostCalculation() {
  const menuId = 'cmh0d2v2n003nsv7fdurgpm5e'
  
  console.log('🔍 TRACING COST CALCULATION FLOW\n')
  console.log('=' .repeat(80))
  
  // Step 1: Fetch menu with all data
  const menu = await prisma.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      program: {
        select: {
          name: true,
          sppgId: true
        }
      },
      costCalc: true,
      ingredients: {
        include: {
          inventoryItem: {
            select: {
              itemName: true,
              unit: true,
              costPerUnit: true
            }
          }
        }
      }
    }
  })
  
  if (!menu) {
    console.log('❌ Menu not found!')
    return
  }
  
  console.log('📋 MENU INFO:')
  console.log(`   Name: ${menu.menuName}`)
  console.log(`   Code: ${menu.menuCode}`)
  console.log(`   Serving Size: ${menu.servingSize}g`)
  console.log(`   Batch Size: ${menu.batchSize} portions`)
  console.log(`   Cost Per Serving (menu field): Rp ${Number(menu.costPerServing || 0).toLocaleString('id-ID')}`)
  console.log()
  
  // Step 2: Calculate ingredient costs manually (simulating API logic after fix)
  console.log('🧮 STEP 1: CALCULATE INGREDIENT COSTS (MANUAL SIMULATION)')
  console.log('-'.repeat(80))
  
  let totalIngredientCost = 0
  const ingredientBreakdown = []
  
  for (const ing of menu.ingredients) {
    const item = ing.inventoryItem
    const itemCostPerUnit = Number(item.costPerUnit || 0)
    
    // THIS IS THE FIX: Scale from 100g base to actual serving size
    const actualQuantity = ing.quantity * (menu.servingSize / 100)
    const itemTotalCost = actualQuantity * itemCostPerUnit
    
    totalIngredientCost += itemTotalCost
    
    ingredientBreakdown.push({
      inventoryItemName: item.itemName,
      quantityBase: ing.quantity,
      quantityActual: actualQuantity,
      unit: item.unit,
      costPerUnit: itemCostPerUnit,
      totalCost: itemTotalCost
    })
    
    console.log(`${item.itemName}:`)
    console.log(`  Base (100g): ${ing.quantity} ${item.unit}`)
    console.log(`  Actual (${menu.servingSize}g): ${actualQuantity.toFixed(4)} ${item.unit}`)
    console.log(`  Cost/unit: Rp ${itemCostPerUnit.toLocaleString('id-ID')}`)
    console.log(`  Total cost: Rp ${itemTotalCost.toLocaleString('id-ID')}`)
    console.log()
  }
  
  console.log('=' .repeat(80))
  console.log(`✅ TOTAL INGREDIENT COST (EXPECTED): Rp ${totalIngredientCost.toLocaleString('id-ID')}`)
  console.log()
  
  // Step 3: Check what's in database
  console.log('🔎 STEP 2: CHECK DATABASE COST CALCULATION')
  console.log('-'.repeat(80))
  
  if (!menu.costCalc) {
    console.log('⚠️  NO COST CALCULATION IN DATABASE!')
    console.log()
    console.log('💡 SOLUTION:')
    console.log('   1. Go to menu detail page in browser')
    console.log('   2. Click "Hitung Biaya Sekarang" button')
    console.log('   3. OR call API: POST /api/sppg/menu/' + menuId + '/calculate-cost')
    console.log()
    await prisma.$disconnect()
    return
  }
  
  console.log('Database MenuCostCalculation:')
  console.log(`  Total Ingredient Cost: Rp ${Number(menu.costCalc.totalIngredientCost).toLocaleString('id-ID')}`)
  console.log(`  Total Labor Cost: Rp ${Number(menu.costCalc.totalLaborCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Total Utility Cost: Rp ${Number(menu.costCalc.totalUtilityCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Packaging Cost: Rp ${Number(menu.costCalc.packagingCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Equipment Cost: Rp ${Number(menu.costCalc.equipmentCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Cleaning Cost: Rp ${Number(menu.costCalc.cleaningCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Overhead Cost: Rp ${Number(menu.costCalc.overheadCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Grand Total Cost: Rp ${Number(menu.costCalc.grandTotalCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Planned Portions: ${menu.costCalc.plannedPortions}`)
  console.log(`  Cost Per Portion: Rp ${Number(menu.costCalc.costPerPortion || 0).toLocaleString('id-ID')}`)
  console.log()
  
  // Step 4: Compare expected vs actual
  console.log('⚖️  STEP 3: COMPARISON')
  console.log('-'.repeat(80))
  
  const expectedIngredientCost = totalIngredientCost
  const actualIngredientCost = Number(menu.costCalc.totalIngredientCost)
  const difference = Math.abs(expectedIngredientCost - actualIngredientCost)
  const percentDiff = (difference / expectedIngredientCost) * 100
  
  console.log('Ingredient Cost:')
  console.log(`  Expected (manual calc): Rp ${expectedIngredientCost.toLocaleString('id-ID')}`)
  console.log(`  Actual (database): Rp ${actualIngredientCost.toLocaleString('id-ID')}`)
  console.log(`  Difference: Rp ${difference.toLocaleString('id-ID')} (${percentDiff.toFixed(2)}%)`)
  
  if (difference < 1) {
    console.log(`  ✅ MATCH! Values are identical`)
  } else if (percentDiff < 1) {
    console.log(`  ✅ CLOSE! Difference is less than 1%`)
  } else {
    console.log(`  ❌ MISMATCH! Database needs recalculation`)
  }
  console.log()
  
  // Step 5: Check ingredient breakdown in database
  console.log('📦 STEP 4: CHECK INGREDIENT BREAKDOWN IN DATABASE')
  console.log('-'.repeat(80))
  
  if (menu.costCalc.ingredientBreakdown) {
    const dbBreakdown = menu.costCalc.ingredientBreakdown as any[]
    
    console.log(`Database has ${dbBreakdown.length} ingredients in breakdown:`)
    console.log()
    
    for (const item of dbBreakdown) {
      console.log(`${item.inventoryItemName}:`)
      console.log(`  Quantity: ${item.quantity} ${item.unit}`)
      console.log(`  Cost/unit: Rp ${Number(item.costPerUnit).toLocaleString('id-ID')}`)
      console.log(`  Total: Rp ${Number(item.totalCost).toLocaleString('id-ID')}`)
      
      // Find matching expected item
      const expected = ingredientBreakdown.find(x => x.inventoryItemName === item.inventoryItemName)
      if (expected) {
        const qtyDiff = Math.abs(item.quantity - expected.quantityActual)
        const costDiff = Math.abs(item.totalCost - expected.totalCost)
        
        if (qtyDiff > 0.001) {
          console.log(`  ⚠️  Quantity mismatch! Expected: ${expected.quantityActual.toFixed(4)}`)
        }
        if (costDiff > 1) {
          console.log(`  ⚠️  Cost mismatch! Expected: Rp ${expected.totalCost.toLocaleString('id-ID')}`)
        }
      }
      console.log()
    }
  }
  
  // Step 6: Show what frontend will display
  console.log('=' .repeat(80))
  console.log('🌐 WHAT FRONTEND DISPLAYS (from cost-report API):')
  console.log('-'.repeat(80))
  console.log()
  console.log('CostBreakdownCard will show:')
  console.log(`  Total Biaya Produksi: Rp ${Number(menu.costCalc.grandTotalCost).toLocaleString('id-ID')}`)
  console.log(`  Per Porsi: Rp ${Number(menu.costCalc.costPerPortion).toLocaleString('id-ID')}`)
  console.log()
  console.log('Cost Breakdown:')
  console.log(`  Bahan Baku: Rp ${Number(menu.costCalc.totalIngredientCost).toLocaleString('id-ID')}`)
  console.log(`  Tenaga Kerja: Rp ${Number(menu.costCalc.totalLaborCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Utilitas: Rp ${Number(menu.costCalc.totalUtilityCost || 0).toLocaleString('id-ID')}`)
  console.log(`  Operasional: Rp ${(Number(menu.costCalc.packagingCost || 0) + Number(menu.costCalc.equipmentCost || 0) + Number(menu.costCalc.cleaningCost || 0)).toLocaleString('id-ID')}`)
  console.log(`  Overhead: Rp ${Number(menu.costCalc.overheadCost || 0).toLocaleString('id-ID')}`)
  console.log()
  
  // Step 7: Recommendation
  console.log('=' .repeat(80))
  console.log('💡 RECOMMENDATION:')
  console.log('-'.repeat(80))
  
  if (difference > 1) {
    console.log()
    console.log('❌ Database value is OUTDATED!')
    console.log()
    console.log('ACTION REQUIRED:')
    console.log('1. The API code has been FIXED ✅')
    console.log('2. But database still has OLD calculation ❌')
    console.log('3. You MUST recalculate to update database')
    console.log()
    console.log('HOW TO RECALCULATE:')
    console.log('  Option A (Frontend):')
    console.log('    1. Open menu in browser: http://localhost:3000/menu/' + menuId)
    console.log('    2. Go to "Analisis Biaya" tab')
    console.log('    3. Click "Hitung Ulang" button')
    console.log()
    console.log('  Option B (API):')
    console.log('    curl -X POST http://localhost:3000/api/sppg/menu/' + menuId + '/calculate-cost \\')
    console.log('      -H "Content-Type: application/json" \\')
    console.log('      -d \'{"laborCostPerHour": 25000, "preparationHours": 1, "cookingHours": 2}\'')
    console.log()
  } else {
    console.log()
    console.log('✅ Database value is CORRECT!')
    console.log('   Frontend should display accurate costs.')
    console.log()
  }
  
  console.log('=' .repeat(80))
  
  await prisma.$disconnect()
}

traceCostCalculation().catch(console.error)
