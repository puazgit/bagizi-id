/**
 * Test Cost & Nutrition Calculation APIs
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testCalculations() {
  console.log('🧪 Testing Cost & Nutrition Calculations...\n')

  try {
    // Get a menu with ingredients
    const menu = await db.nutritionMenu.findFirst({
      where: {
        ingredients: {
          some: {}
        }
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        costCalc: true,
        nutritionCalc: true
      }
    })

    if (!menu) {
      console.log('❌ No menu with ingredients found')
      return
    }

    console.log(`📋 Testing Menu: ${menu.menuName}`)
    console.log(`   Ingredients: ${menu.ingredients.length}`)
    console.log(`   Has Cost Calc: ${menu.costCalc ? '✅' : '❌'}`)
    console.log(`   Has Nutrition Calc: ${menu.nutritionCalc ? '✅' : '❌'}\n`)

    // Test calculate cost API
    console.log('🧮 Testing Calculate Cost API...')
    const costResponse = await fetch(`http://localhost:3000/api/sppg/menu/${menu.id}/calculate-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'authjs.session-token=test' // You need real session token
      },
      body: JSON.stringify({
        laborCostPerHour: 15000,
        preparationHours: 2,
        cookingHours: 1,
        gasCost: 5000,
        electricityCost: 3000,
        waterCost: 1000,
        packagingCost: 2000,
        overheadPercentage: 10
      })
    })

    if (costResponse.ok) {
      const costData = await costResponse.json()
      console.log('✅ Cost calculation successful')
      console.log(`   Total Cost: Rp ${costData.data?.costBreakdown?.totalCost?.toLocaleString() || 'N/A'}`)
    } else {
      console.log(`❌ Cost calculation failed: ${costResponse.status}`)
      const error = await costResponse.json()
      console.log(`   Error: ${error.error}`)
    }

    // Test calculate nutrition API
    console.log('\n🥗 Testing Calculate Nutrition API...')
    const nutritionResponse = await fetch(`http://localhost:3000/api/sppg/menu/${menu.id}/calculate-nutrition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'authjs.session-token=test'
      },
      body: JSON.stringify({})
    })

    if (nutritionResponse.ok) {
      const nutritionData = await nutritionResponse.json()
      console.log('✅ Nutrition calculation successful')
      console.log(`   Total Calories: ${nutritionData.data?.nutrition?.calories?.toFixed(1) || 'N/A'} kcal`)
      console.log(`   Total Protein: ${nutritionData.data?.nutrition?.protein?.toFixed(1) || 'N/A'} g`)
    } else {
      console.log(`❌ Nutrition calculation failed: ${nutritionResponse.status}`)
      const error = await nutritionResponse.json()
      console.log(`   Error: ${error.error}`)
    }

    // Check ingredients have proper inventory data
    console.log('\n📦 Verifying Ingredient Data:')
    for (const ing of menu.ingredients) {
      const hasInventory = !!ing.inventoryItem
      const hasNutrition = ing.inventoryItem?.calories !== null
      const hasCost = ing.inventoryItem?.costPerUnit !== null
      
      console.log(`   ${ing.inventoryItem?.itemName || 'Unknown'}:`)
      console.log(`     - Has Inventory: ${hasInventory ? '✅' : '❌'}`)
      console.log(`     - Has Nutrition: ${hasNutrition ? '✅' : '❌'}`)
      console.log(`     - Has Cost: ${hasCost ? '✅' : '❌'}`)
    }

    console.log('\n✅ Calculation test complete!')

  } catch (error) {
    console.error('❌ Test error:', error)
  } finally {
    await db.$disconnect()
  }
}

testCalculations()
