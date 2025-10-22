/**
 * @fileoverview Script to get real menu data from database
 */

import { db } from '../src/lib/prisma'

async function getRealMenuData() {
  console.log('🔍 Fetching real menu data from database...\n')
  
  // Get a complete menu with all ingredients
  const menus = await db.nutritionMenu.findMany({
    take: 2,
    include: {
      program: {
        select: {
          name: true,
          sppg: {
            select: {
              name: true
            }
          }
        }
      },
      ingredients: {
        include: {
          inventoryItem: {
            select: {
              itemName: true,
              unit: true,
              costPerUnit: true,
              calories: true,
              protein: true,
              carbohydrates: true,
              fat: true,
              fiber: true,
              vitaminA: true,
              calcium: true,
              iron: true
            }
          }
        }
      },
      nutritionCalc: true,
      costCalc: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  if (menus.length === 0) {
    console.log('❌ No menus found in database')
    return
  }
  
  menus.forEach((menu, idx) => {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📋 MENU ${idx + 1}: ${menu.menuName}`)
    console.log('='.repeat(80))
    
    console.log('\n📊 BASIC INFO:')
    console.log(`  - Menu Code: ${menu.menuCode}`)
    console.log(`  - SPPG: ${menu.program.sppg.name}`)
    console.log(`  - Program: ${menu.program.name}`)
    console.log(`  - Jenis: ${menu.mealType}`)
    console.log(`  - Serving Size: ${menu.servingSize}g per porsi`)
    console.log(`  - Batch Size: ${menu.batchSize} porsi`)
    
    console.log('\n💰 COST INFO:')
    console.log(`  - Cost Per Serving: Rp ${menu.costPerServing?.toLocaleString('id-ID') || 0}`)
    console.log(`  - Budget Allocation: Rp ${menu.budgetAllocation?.toLocaleString('id-ID') || 0}`)
    if (menu.budgetAllocation && menu.costPerServing) {
      const margin = Number(menu.budgetAllocation) - Number(menu.costPerServing)
      const efficiency = (Number(menu.costPerServing) / Number(menu.budgetAllocation)) * 100
      console.log(`  - Margin: Rp ${margin.toLocaleString('id-ID')} (${efficiency.toFixed(1)}% efficient)`)
    }
    
    console.log('\n🥗 INGREDIENTS (100g base):')
    menu.ingredients.forEach((ing, i) => {
      const item = ing.inventoryItem
      console.log(`\n  ${i + 1}. ${item.itemName}`)
      console.log(`     - Quantity: ${ing.quantity} ${item.unit} (per 100g base)`)
      
      // Calculate actual quantity for serving size
      const actualQty = ing.quantity * (menu.servingSize / 100)
      console.log(`     - Actual per serving (${menu.servingSize}g): ${actualQty.toFixed(3)} ${item.unit}`)
      
      if (item.costPerUnit) {
        const costPer100g = ing.quantity * Number(item.costPerUnit)
        const costPerServing = actualQty * Number(item.costPerUnit)
        console.log(`     - Cost per 100g: Rp ${costPer100g.toLocaleString('id-ID')}`)
        console.log(`     - Cost per serving: Rp ${costPerServing.toLocaleString('id-ID')}`)
      }
      
      console.log(`     - Nutrition (per kg/liter):`)
      console.log(`       * Calories: ${item.calories} kcal`)
      console.log(`       * Protein: ${item.protein}g`)
      console.log(`       * Carbs: ${item.carbohydrates}g`)
      console.log(`       * Fat: ${item.fat}g`)
      if (item.vitaminA) console.log(`       * Vitamin A: ${item.vitaminA} mcg`)
      if (item.calcium) console.log(`       * Calcium: ${item.calcium} mg`)
      if (item.iron) console.log(`       * Iron: ${item.iron} mg`)
    })
    
    if (menu.nutritionCalc) {
      console.log('\n📈 NUTRITION CALCULATION:')
      console.log(`  - Total Calories: ${menu.nutritionCalc.totalCalories} kcal`)
      console.log(`  - Total Protein: ${menu.nutritionCalc.totalProtein}g`)
      console.log(`  - Total Carbs: ${menu.nutritionCalc.totalCarbohydrates}g`)
      console.log(`  - Total Fat: ${menu.nutritionCalc.totalFat}g`)
      console.log(`  - Compliance Score: ${menu.nutritionCalc.complianceScore}%`)
    }
    
    if (menu.costCalc) {
      console.log('\n💵 COST CALCULATION:')
      console.log(`  - Total Ingredient Cost: Rp ${Number(menu.costCalc.totalIngredientCost).toLocaleString('id-ID')}`)
      console.log(`  - Total Labor Cost: Rp ${Number(menu.costCalc.totalLaborCost).toLocaleString('id-ID')}`)
      console.log(`  - Grand Total Cost: Rp ${Number(menu.costCalc.grandTotalCost).toLocaleString('id-ID')}`)
      console.log(`  - Cost Per Portion: Rp ${Number(menu.costCalc.costPerPortion).toLocaleString('id-ID')}`)
      console.log(`  - Planned Portions: ${menu.costCalc.plannedPortions}`)
    }
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Data fetched successfully!')
  console.log('='.repeat(80) + '\n')
  
  await db.$disconnect()
}

getRealMenuData().catch(console.error)
