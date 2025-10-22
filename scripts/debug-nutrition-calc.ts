/**
 * @fileoverview Debug script to check nutrition calculation data
 * @usage npx tsx scripts/debug-nutrition-calc.ts <menuId>
 */

import { db } from '../src/lib/prisma'

async function checkNutritionCalc() {
  // Get menuId from command line args, or use default
  const menuId = process.argv[2] || 'cmh0d2v2n003psv7fxyxgkc6y'
  
  console.log('🔍 Checking menu nutrition calculation...')
  console.log('📍 Menu ID:', menuId)
  console.log('')
  
  const menu = await db.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      nutritionCalc: true,
      ingredients: {
        include: {
          inventoryItem: {
            select: {
              itemName: true,
              unit: true,
              calories: true,
              protein: true,
              carbohydrates: true,
              fat: true,
              fiber: true,
              vitaminA: true,
              vitaminB1: true,
              vitaminB2: true,
              vitaminC: true,
              vitaminD: true,
              calcium: true,
              iron: true,
              zinc: true,
              magnesium: true,
              phosphorus: true,
              potassium: true,
              sodium: true
            }
          }
        }
      }
    }
  })
  
  if (!menu) {
    console.log('❌ Menu not found!')
    console.log('💡 Please check if the menu ID is correct')
    return
  }
  
  console.log('📋 Menu Information:')
  console.log('   Name:', menu.menuName)
  console.log('   Code:', menu.menuCode)
  console.log('   Serving Size:', menu.servingSize, 'g')
  console.log('   Batch Size:', menu.batchSize, 'portions')
  console.log('   Total Ingredients:', menu.ingredients.length)
  console.log('')
  
  if (menu.ingredients.length === 0) {
    console.log('⚠️  NO INGREDIENTS FOUND!')
    console.log('💡 Add ingredients first before calculating nutrition')
    return
  }
  
  console.log('🧪 Ingredient Details:')
  console.log('─'.repeat(80))
  menu.ingredients.forEach((ing, idx) => {
    const item = ing.inventoryItem
    console.log(`\n${idx + 1}. ${item.itemName}`)
    console.log(`   Quantity: ${ing.quantity} ${item.unit}`)
    console.log(`   Nutritional Values (per 100g):`)
    console.log(`     • Calories: ${item.calories || 0} kcal`)
    console.log(`     • Protein: ${item.protein || 0} g`)
    console.log(`     • Carbs: ${item.carbohydrates || 0} g`)
    console.log(`     • Fat: ${item.fat || 0} g`)
    console.log(`     • Fiber: ${item.fiber || 0} g`)
    console.log(`     • Vitamin A: ${item.vitaminA || 0} mcg`)
    console.log(`     • Vitamin C: ${item.vitaminC || 0} mg`)
    console.log(`     • Calcium: ${item.calcium || 0} mg`)
    console.log(`     • Iron: ${item.iron || 0} mg`)
    console.log(`     • Zinc: ${item.zinc || 0} mg`)
  })
  console.log('\n' + '─'.repeat(80))
  console.log('')
  
  // Check if nutrition calculation exists
  if (!menu.nutritionCalc) {
    console.log('❌ NO NUTRITION CALCULATION FOUND!')
    console.log('')
    console.log('💡 Solutions:')
    console.log('   1. Open browser: http://localhost:3000/menu/' + menuId)
    console.log('   2. Go to "Nutrisi" tab')
    console.log('   3. Click "Hitung Nutrisi Sekarang" button')
    console.log('')
    console.log('   Or use API:')
    console.log('   curl -X POST http://localhost:3000/api/sppg/menu/' + menuId + '/calculate-nutrition \\')
    console.log('     -H "Content-Type: application/json" \\')
    console.log('     -d "{}"')
    console.log('')
    return
  }
  
  // Display nutrition calculation results
  console.log('✅ NUTRITION CALCULATION EXISTS:')
  console.log('')
  console.log('📊 Macronutrients (Total):')
  console.log('   • Calories:', menu.nutritionCalc.totalCalories, 'kcal')
  console.log('   • Protein:', menu.nutritionCalc.totalProtein, 'g')
  console.log('   • Carbohydrates:', menu.nutritionCalc.totalCarbs, 'g')
  console.log('   • Fat:', menu.nutritionCalc.totalFat, 'g')
  console.log('   • Fiber:', menu.nutritionCalc.totalFiber, 'g')
  console.log('')
  
  console.log('💊 Vitamins (Total):')
  console.log('   • Vitamin A:', menu.nutritionCalc.totalVitaminA, 'mcg')
  console.log('   • Vitamin B1:', menu.nutritionCalc.totalVitaminB1, 'mg')
  console.log('   • Vitamin B2:', menu.nutritionCalc.totalVitaminB2, 'mg')
  console.log('   • Vitamin B3:', menu.nutritionCalc.totalVitaminB3, 'mg')
  console.log('   • Vitamin B6:', menu.nutritionCalc.totalVitaminB6, 'mg')
  console.log('   • Vitamin B12:', menu.nutritionCalc.totalVitaminB12, 'mcg')
  console.log('   • Vitamin C:', menu.nutritionCalc.totalVitaminC, 'mg')
  console.log('   • Vitamin D:', menu.nutritionCalc.totalVitaminD, 'mcg')
  console.log('   • Vitamin E:', menu.nutritionCalc.totalVitaminE, 'mg')
  console.log('   • Vitamin K:', menu.nutritionCalc.totalVitaminK, 'mcg')
  console.log('   • Folate:', menu.nutritionCalc.totalFolate, 'mcg')
  console.log('')
  
  console.log('⚗️  Minerals (Total):')
  console.log('   • Calcium:', menu.nutritionCalc.totalCalcium, 'mg')
  console.log('   • Iron:', menu.nutritionCalc.totalIron, 'mg')
  console.log('   • Magnesium:', menu.nutritionCalc.totalMagnesium, 'mg')
  console.log('   • Phosphorus:', menu.nutritionCalc.totalPhosphorus, 'mg')
  console.log('   • Potassium:', menu.nutritionCalc.totalPotassium, 'mg')
  console.log('   • Sodium:', menu.nutritionCalc.totalSodium, 'mg')
  console.log('   • Zinc:', menu.nutritionCalc.totalZinc, 'mg')
  console.log('   • Selenium:', menu.nutritionCalc.totalSelenium, 'mcg')
  console.log('   • Iodine:', menu.nutritionCalc.totalIodine, 'mcg')
  console.log('')
  
  console.log('📈 Daily Value Percentages:')
  console.log('   • Calories DV:', menu.nutritionCalc.caloriesDV?.toFixed(1) || 0, '%')
  console.log('   • Protein DV:', menu.nutritionCalc.proteinDV?.toFixed(1) || 0, '%')
  console.log('   • Carbs DV:', menu.nutritionCalc.carbsDV?.toFixed(1) || 0, '%')
  console.log('   • Fat DV:', menu.nutritionCalc.fatDV?.toFixed(1) || 0, '%')
  console.log('   • Fiber DV:', menu.nutritionCalc.fiberDV?.toFixed(1) || 0, '%')
  console.log('')
  
  console.log('🎯 AKG Compliance:')
  console.log('   • Meets AKG:', menu.nutritionCalc.meetsAKG ? '✅ YES' : '❌ NO')
  console.log('   • Calculated At:', menu.nutritionCalc.calculatedAt?.toISOString())
  console.log('   • Calculated By:', menu.nutritionCalc.calculatedBy)
  console.log('')
  
  // Check for potential issues
  console.log('🔍 Issue Detection:')
  const issues: string[] = []
  
  if (menu.nutritionCalc.totalCalories === 0) {
    issues.push('⚠️  Total Calories is 0 - Check if ingredient calories data exists')
  }
  if (menu.nutritionCalc.totalProtein === 0) {
    issues.push('⚠️  Total Protein is 0 - Check if ingredient protein data exists')
  }
  if (menu.nutritionCalc.totalVitaminA === 0) {
    issues.push('⚠️  Vitamin A is 0 - Check if ingredient vitamin A data exists')
  }
  if (menu.nutritionCalc.totalCalcium === 0) {
    issues.push('⚠️  Calcium is 0 - Check if ingredient calcium data exists')
  }
  if (menu.nutritionCalc.caloriesDV === 0 && menu.nutritionCalc.totalCalories > 0) {
    issues.push('⚠️  Calories DV is 0 but total calories > 0 - Calculation error?')
  }
  
  if (issues.length > 0) {
    issues.forEach(issue => console.log(issue))
    console.log('')
    console.log('💡 Recommendation: Re-calculate nutrition or check ingredient data')
  } else {
    console.log('✅ No issues detected - Nutrition data looks good!')
  }
  console.log('')
}

// Run the check
checkNutritionCalc()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(() => {
    db.$disconnect()
    process.exit(0)
  })
