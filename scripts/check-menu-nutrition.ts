import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMenuNutrition() {
  const menuId = 'cmgrr2te70048svcoj9lmsn5v'
  
  console.log('\n🔍 CHECKING MENU NUTRITION DATA\n')
  console.log('Menu ID:', menuId)
  console.log('='.repeat(70))
  
  // Get menu with nutrition calculation
  const menu = await prisma.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      nutritionCalc: true,
      ingredients: {
        include: {
          inventoryItem: true
        }
      }
    }
  })
  
  if (!menu) {
    console.log('❌ Menu not found!')
    return
  }
  
  console.log('\n📋 Menu:', menu.menuName)
  console.log('Code:', menu.menuCode)
  console.log('Type:', menu.mealType)
  
  console.log('\n🥘 Ingredients:', menu.ingredients.length)
  menu.ingredients.forEach((ing, i) => {
    console.log(`  ${i+1}. ${ing.ingredientName} - ${ing.quantity}${ing.unit}`)
  })
  
  if (!menu.nutritionCalc) {
    console.log('\n❌ NO NUTRITION CALCULATION FOUND!')
    console.log('This menu needs nutrition calculation seed data.')
  } else {
    const nutr = menu.nutritionCalc
    console.log('\n📊 NUTRITION CALCULATION:')
    console.log('-'.repeat(70))
    
    console.log('\n📈 Macronutrients:')
    console.log(`  Calories: ${nutr.totalCalories} kcal`)
    console.log(`  Protein: ${nutr.totalProtein}g`)
    console.log(`  Carbs: ${nutr.totalCarbs}g`)
    console.log(`  Fat: ${nutr.totalFat}g`)
    console.log(`  Fiber: ${nutr.totalFiber}g`)
    
    console.log('\n💊 Vitamins:')
    console.log(`  Vitamin A: ${nutr.totalVitaminA} mcg`)
    console.log(`  Vitamin B1: ${nutr.totalVitaminB1} mg`)
    console.log(`  Vitamin B2: ${nutr.totalVitaminB2} mg`)
    console.log(`  Vitamin B3: ${nutr.totalVitaminB3} mg`)
    console.log(`  Vitamin B6: ${nutr.totalVitaminB6} mg`)
    console.log(`  Vitamin B12: ${nutr.totalVitaminB12} mcg`)
    console.log(`  Vitamin C: ${nutr.totalVitaminC} mg`)
    console.log(`  Vitamin D: ${nutr.totalVitaminD} mcg`)
    console.log(`  Vitamin E: ${nutr.totalVitaminE} mg`)
    console.log(`  Vitamin K: ${nutr.totalVitaminK} mcg`)
    console.log(`  Folate: ${nutr.totalFolate} mcg`)
    
    console.log('\n⚡ Minerals:')
    console.log(`  Calcium: ${nutr.totalCalcium} mg`)
    console.log(`  Iron: ${nutr.totalIron} mg`)
    console.log(`  Magnesium: ${nutr.totalMagnesium} mg`)
    console.log(`  Phosphorus: ${nutr.totalPhosphorus} mg`)
    console.log(`  Potassium: ${nutr.totalPotassium} mg`)
    console.log(`  Sodium: ${nutr.totalSodium} mg`)
    console.log(`  Zinc: ${nutr.totalZinc} mg`)
    console.log(`  Selenium: ${nutr.totalSelenium} mcg`)
    
    console.log('\n✅ AKG Compliance:')
    console.log(`  Meets AKG: ${nutr.meetsAKG ? '✅ YES' : '❌ NO'}`)
    console.log(`  Adequate Nutrients: ${nutr.adequateNutrients}`)
    console.log(`  Excess Nutrients: ${nutr.excessNutrients}`)
    console.log(`  Deficient Nutrients: ${nutr.deficientNutrients}`)
    
    // Check for zeros
    const zeroFields = []
    if (nutr.totalCalories === 0) zeroFields.push('Calories')
    if (nutr.totalProtein === 0) zeroFields.push('Protein')
    if (nutr.totalCarbs === 0) zeroFields.push('Carbs')  // Field is totalCarbs, not totalCarbohydrate
    if (nutr.totalFat === 0) zeroFields.push('Fat')
    if (nutr.totalVitaminA === 0) zeroFields.push('Vitamin A')  // totalVitaminA not vitaminA
    if (nutr.totalCalcium === 0) zeroFields.push('Calcium')  // totalCalcium not calcium
    if (nutr.totalIron === 0) zeroFields.push('Iron')  // totalIron not iron
    
    if (zeroFields.length > 0) {
      console.log('\n⚠️  ZERO VALUES FOUND:')
      zeroFields.forEach(field => console.log(`  - ${field}`))
    } else {
      console.log('\n✅ All major nutrients have values!')
    }
  }
  
  await prisma.$disconnect()
}

checkMenuNutrition()