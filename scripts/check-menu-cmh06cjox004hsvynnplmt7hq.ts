import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMenuData() {
  console.log('🔍 Checking Menu: cmh06cjox004hsvynnplmt7hq\n')
  
  const menu = await prisma.nutritionMenu.findUnique({
    where: { id: 'cmh06cjox004hsvynnplmt7hq' },
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
  
  console.log('📋 Menu Details:')
  console.log('- Name:', menu.menuName)
  console.log('- Ingredients Count:', menu.ingredients.length)
  console.log('- Has Nutrition Calc:', !!menu.nutritionCalc)
  console.log('- Has Cost Calc:', !!menu.costCalc)
  
  console.log('\n🥗 Ingredients:')
  menu.ingredients.forEach((ing, idx) => {
    console.log(`${idx + 1}. ${ing.inventoryItem.itemName}`)
    console.log(`   - ID: ${ing.id}`)
    console.log(`   - Quantity: ${ing.quantity} ${ing.unit}`)
    console.log(`   - Inventory ID: ${ing.inventoryItemId}`)
  })
  
  if (menu.nutritionCalc) {
    console.log('\n📊 Nutrition Calculation:')
    console.log('- Total Calories:', menu.nutritionCalc.totalCalories)
    console.log('- Total Protein:', menu.nutritionCalc.totalProtein)
    console.log('- Total Carbs:', menu.nutritionCalc.totalCarbs)
    console.log('- Total Fat:', menu.nutritionCalc.totalFat)
    console.log('- Total Fiber:', menu.nutritionCalc.totalFiber)
    console.log('- Vitamin A:', menu.nutritionCalc.vitaminA)
    console.log('- Vitamin C:', menu.nutritionCalc.vitaminC)
    console.log('- Vitamin D:', menu.nutritionCalc.vitaminD)
    console.log('- Vitamin E:', menu.nutritionCalc.vitaminE)
    console.log('- Calculated At:', menu.nutritionCalc.calculatedAt)
  }
  
  // Check for "Kacang Panjang" ingredient
  const kacangPanjang = menu.ingredients.find(i => 
    i.id === 'cmh06cjo9002vsvynukx5zq3p' || 
    i.inventoryItem.itemName.toLowerCase().includes('kacang panjang')
  )
  
  if (kacangPanjang) {
    console.log('\n⚠️  Found "Kacang Panjang" ingredient:')
    console.log('- Ingredient ID:', kacangPanjang.id)
    console.log('- Item Name:', kacangPanjang.inventoryItem.itemName)
    console.log('- Quantity:', kacangPanjang.quantity, kacangPanjang.unit)
    console.log('- Should this ingredient be here?')
  } else {
    console.log('\n✅ No "Kacang Panjang" found in ingredients')
  }
}

checkMenuData()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
