/**
 * Check nutrition data in menu cards
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function checkMenuNutrition() {
  console.log('🔍 Checking Menu Nutrition Data...\n')

  try {
    const menus = await db.nutritionMenu.findMany({
      include: {
        nutritionCalc: true,
        costCalc: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log(`📊 Checking first ${menus.length} menus\n`)

    for (const menu of menus) {
      console.log(`📋 ${menu.menuName}`)
      console.log(`   Menu Code: ${menu.menuCode}`)
      console.log(`   Serving: ${menu.servingSize}g`)
      
      // Direct nutrition values (from NutritionMenu table)
      console.log(`\n   📊 Direct Nutrition Values (NutritionMenu table):`)
      console.log(`   - Calories: ${menu.calories || 0} kal`)
      console.log(`   - Protein: ${menu.protein || 0}g`)
      console.log(`   - Carbs: ${menu.carbohydrates || 0}g`)
      console.log(`   - Fat: ${menu.fat || 0}g`)
      console.log(`   - Fiber: ${menu.fiber || 0}g`)
      
      // Calculated nutrition (from NutritionCalculation table)
      if (menu.nutritionCalc) {
        console.log(`\n   ✅ NutritionCalculation exists:`)
        console.log(`   - Total Calories: ${menu.nutritionCalc.totalCalories || 0} kal`)
        console.log(`   - Total Protein: ${menu.nutritionCalc.totalProtein || 0}g`)
        console.log(`   - Total Carbs: ${menu.nutritionCalc.totalCarbohydrates || 0}g`)
      } else {
        console.log(`\n   ⚠️  No NutritionCalculation saved yet`)
      }
      
      // Cost data
      console.log(`\n   💰 Cost Data:`)
      console.log(`   - costPerServing (direct): Rp ${menu.costPerServing?.toLocaleString() || 0}`)
      if (menu.costCalc) {
        console.log(`   ✅ CostCalculation exists: Rp ${menu.costCalc.costPerPortion?.toLocaleString() || 0}`)
      } else {
        console.log(`   ⚠️  No CostCalculation saved yet`)
      }
      
      console.log(`\n${'─'.repeat(80)}\n`)
    }
    
    // Summary
    const totalMenus = menus.length
    const menusWithDirectNutrition = menus.filter(m => 
      (m.calories || 0) > 0 || 
      (m.protein || 0) > 0 || 
      (m.carbohydrates || 0) > 0
    ).length
    const menusWithNutritionCalc = menus.filter(m => m.nutritionCalc).length
    const menusWithCostCalc = menus.filter(m => m.costCalc).length
    
    console.log('📈 Summary:')
    console.log(`   Total Menus Checked: ${totalMenus}`)
    console.log(`   Menus with direct nutrition values: ${menusWithDirectNutrition}/${totalMenus}`)
    console.log(`   Menus with NutritionCalculation: ${menusWithNutritionCalc}/${totalMenus}`)
    console.log(`   Menus with CostCalculation: ${menusWithCostCalc}/${totalMenus}`)
    
    console.log(`\n💡 Interpretation:`)
    if (menusWithDirectNutrition === 0 && menusWithNutritionCalc === 0) {
      console.log(`   ⚠️  No nutrition data found - THIS IS EXPECTED!`)
      console.log(`   📝 Nutrition values are 0 because calculations haven't been run yet.`)
      console.log(`   ✅ User needs to click "Hitung Nutrisi Sekarang" for each menu.`)
      console.log(`   ✅ This is NORMAL behavior - not a bug!`)
    } else if (menusWithDirectNutrition > 0 && menusWithNutritionCalc === 0) {
      console.log(`   ℹ️  Direct values exist but no calculations saved.`)
      console.log(`   📝 This means values were set manually or from old data.`)
    } else if (menusWithNutritionCalc > 0) {
      console.log(`   ✅ Nutrition calculations have been performed!`)
      console.log(`   📝 ${menusWithNutritionCalc} menu(s) have calculated nutrition data.`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkMenuNutrition()
