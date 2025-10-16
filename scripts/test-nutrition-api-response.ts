/**
 * Test script to check actual API response structure
 */

import { db } from '@/lib/prisma'

async function testNutritionAPIResponse() {
  console.log('🔍 Testing Nutrition API Response Structure\n')
  
  const menuId = 'cmgrr2te70048svcoj9lmsn5v'
  
  // Simulate what the API does
  const menu = await db.nutritionMenu.findFirst({
    where: { id: menuId },
    include: {
      nutritionCalc: true,
      ingredients: {
        include: {
          inventoryItem: {
            select: {
              id: true,
              itemName: true,
              calories: true,
              protein: true,
              carbohydrates: true,
              fat: true,
              fiber: true
            }
          }
        }
      }
    }
  })

  if (!menu?.nutritionCalc) {
    console.log('❌ No nutrition calculation found')
    return
  }

  console.log('📊 Raw Database Fields (from nutritionCalc):')
  console.log('─'.repeat(70))
  console.log('totalCalories:', menu.nutritionCalc.totalCalories)
  console.log('totalProtein:', menu.nutritionCalc.totalProtein)
  console.log('totalCarbs:', menu.nutritionCalc.totalCarbs)
  console.log('totalFat:', menu.nutritionCalc.totalFat)
  console.log('totalFiber:', menu.nutritionCalc.totalFiber)
  console.log('totalVitaminA:', menu.nutritionCalc.totalVitaminA)
  console.log('totalVitaminC:', menu.nutritionCalc.totalVitaminC)
  console.log('totalCalcium:', menu.nutritionCalc.totalCalcium)
  console.log('totalIron:', menu.nutritionCalc.totalIron)

  console.log('\n🔌 API Response Structure (what gets sent to frontend):')
  console.log('─'.repeat(70))
  
  // This is what the API route.ts creates
  const apiResponse = {
    nutrition: {
      calories: menu.nutritionCalc.totalCalories || 0,
      protein: menu.nutritionCalc.totalProtein || 0,
      carbohydrates: menu.nutritionCalc.totalCarbs || 0,
      fat: menu.nutritionCalc.totalFat || 0,
      fiber: menu.nutritionCalc.totalFiber || 0,
      vitaminA: menu.nutritionCalc.totalVitaminA || 0,
      vitaminC: menu.nutritionCalc.totalVitaminC || 0,
      calcium: menu.nutritionCalc.totalCalcium || 0,
      iron: menu.nutritionCalc.totalIron || 0,
    },
    dailyValuePercentages: {
      calories: menu.nutritionCalc.caloriesDV || 0,
      protein: menu.nutritionCalc.proteinDV || 0,
      carbohydrates: menu.nutritionCalc.carbsDV || 0,
      fat: menu.nutritionCalc.fatDV || 0,
      fiber: menu.nutritionCalc.fiberDV || 0,
    }
  }

  console.log('nutrition.calories:', apiResponse.nutrition.calories)
  console.log('nutrition.protein:', apiResponse.nutrition.protein)
  console.log('nutrition.carbohydrates:', apiResponse.nutrition.carbohydrates)
  console.log('nutrition.fat:', apiResponse.nutrition.fat)
  console.log('nutrition.fiber:', apiResponse.nutrition.fiber)
  console.log('\nnutrition.vitaminA:', apiResponse.nutrition.vitaminA)
  console.log('nutrition.vitaminC:', apiResponse.nutrition.vitaminC)
  console.log('nutrition.calcium:', apiResponse.nutrition.calcium)
  console.log('nutrition.iron:', apiResponse.nutrition.iron)

  console.log('\n📈 Daily Value Percentages:')
  console.log('─'.repeat(70))
  console.log('dailyValuePercentages.calories:', apiResponse.dailyValuePercentages.calories)
  console.log('dailyValuePercentages.protein:', apiResponse.dailyValuePercentages.protein)
  console.log('dailyValuePercentages.carbohydrates:', apiResponse.dailyValuePercentages.carbohydrates)

  console.log('\n🧪 Ingredients Nutrition Contribution:')
  console.log('─'.repeat(70))
  menu.ingredients.forEach((ing, i) => {
    console.log(`\n${i + 1}. ${ing.ingredientName}:`)
    console.log('   inventoryItem.calories:', ing.inventoryItem?.calories)
    console.log('   inventoryItem.protein:', ing.inventoryItem?.protein)
    console.log('   inventoryItem.carbohydrates:', ing.inventoryItem?.carbohydrates)
    console.log('   inventoryItem.fat:', ing.inventoryItem?.fat)
  })

  console.log('\n✅ Test complete!')
}

testNutritionAPIResponse()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
