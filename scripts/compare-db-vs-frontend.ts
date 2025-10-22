import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function compareMenuData() {
  const menuId = 'cmh06cjox004hsvynnplmt7hq'
  
  console.log('🔍 COMPARING DATABASE vs FRONTEND DISPLAY')
  console.log('Menu ID:', menuId)
  console.log('=' .repeat(60))
  
  // 1. Get menu from database
  const menu = await prisma.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
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
  
  console.log('\n📊 DATABASE DATA:')
  console.log('─'.repeat(60))
  console.log('Menu Name:', menu.menuName)
  console.log('Total Ingredients:', menu.ingredients.length)
  
  // List all ingredients
  console.log('\n🥗 Ingredients in Database:')
  menu.ingredients.forEach((ing, idx) => {
    console.log(`  ${idx + 1}. ${ing.inventoryItem.itemName}`)
    console.log(`     - ID: ${ing.id}`)
    console.log(`     - Quantity: ${ing.quantity} ${ing.unit}`)
  })
  
  // Check for specific ingredient
  const kacangPanjang = menu.ingredients.find(i => 
    i.id === 'cmh06cjo9002vsvynukx5zq3p'
  )
  
  if (kacangPanjang) {
    console.log('\n⚠️  FOUND: Kacang Panjang in database!')
    console.log('    - Ingredient ID:', kacangPanjang.id)
    console.log('    - Item Name:', kacangPanjang.inventoryItem.itemName)
    console.log('    - Quantity:', kacangPanjang.quantity, kacangPanjang.unit)
  }
  
  // Nutrition calculation
  if (menu.nutritionCalc) {
    console.log('\n📈 Nutrition Calculation in Database:')
    console.log('─'.repeat(60))
    console.log('Calories:', menu.nutritionCalc.totalCalories, 'kkal')
    console.log('Protein:', menu.nutritionCalc.totalProtein, 'g')
    console.log('Carbohydrates:', menu.nutritionCalc.totalCarbs, 'g')
    console.log('Fat:', menu.nutritionCalc.totalFat, 'g')
    console.log('Fiber:', menu.nutritionCalc.totalFiber, 'g')
    console.log('\nVitamins:')
    console.log('- Vitamin A:', menu.nutritionCalc.vitaminA, 'mcg')
    console.log('- Vitamin C:', menu.nutritionCalc.vitaminC, 'mg')
    console.log('- Vitamin D:', menu.nutritionCalc.vitaminD, 'mcg')
    console.log('- Vitamin E:', menu.nutritionCalc.vitaminE, 'mg')
    console.log('- Vitamin K:', menu.nutritionCalc.vitaminK, 'mcg')
    console.log('- Vitamin B1 (Thiamin):', menu.nutritionCalc.thiamin, 'mg')
    console.log('- Vitamin B2 (Riboflavin):', menu.nutritionCalc.riboflavin, 'mg')
    console.log('- Vitamin B3 (Niacin):', menu.nutritionCalc.niacin, 'mg')
    console.log('- Vitamin B6:', menu.nutritionCalc.vitaminB6, 'mg')
    console.log('- Vitamin B9 (Folate):', menu.nutritionCalc.folate, 'mcg')
    console.log('- Vitamin B12:', menu.nutritionCalc.vitaminB12, 'mcg')
    
    console.log('\n📅 Calculated At:', menu.nutritionCalc.calculatedAt)
  } else {
    console.log('\n❌ No nutrition calculation found in database!')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('💡 WHAT YOU SHOULD SEE ON FRONTEND:')
  console.log('─'.repeat(60))
  console.log('URL: http://localhost:3000/menu/' + menuId)
  console.log('\n1. Status AKG: Should match akgCompliant status')
  console.log('2. Compliance Score: Should match complianceScore')
  console.log('3. Makronutrien:')
  console.log('   - Kalori:', menu.nutritionCalc?.totalCalories || 0, 'kkal')
  console.log('   - Protein:', menu.nutritionCalc?.totalProtein || 0, 'g')
  console.log('   - Karbohidrat:', menu.nutritionCalc?.totalCarbs || 0, 'g')
  console.log('   - Lemak:', menu.nutritionCalc?.totalFat || 0, 'g')
  console.log('   - Serat:', menu.nutritionCalc?.totalFiber || 0, 'g')
  console.log('\n4. Vitamin values should match database values above')
  console.log('\n5. Ingredients list (Rincian Bahan):')
  console.log('   - Should show', menu.ingredients.length, 'ingredients')
  if (kacangPanjang) {
    console.log('   - ⚠️  "Kacang Panjang" SHOULD appear (it exists in DB)')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🔍 ISSUES TO CHECK:')
  console.log('─'.repeat(60))
  console.log('1. Are vitamin values showing 0 on frontend but > 0 in database?')
  console.log('2. Is "Kacang Panjang" showing on frontend (it should if in DB)?')
  console.log('3. Are macronutrient values matching between DB and frontend?')
  console.log('\n📝 Please compare the frontend display with values above!')
}

compareMenuData()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
