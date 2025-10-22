import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugNutritionValues() {
  const menuId = 'cmh06cjox004hsvynnplmt7hq'
  
  console.log('🔍 DEBUG: Nutrition Values for Menu:', menuId)
  console.log('='.repeat(80))
  
  const menu = await prisma.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      nutritionCalc: true
    }
  })
  
  if (!menu) {
    console.log('❌ Menu not found!')
    return
  }
  
  console.log('\n📋 Menu:', menu.menuName)
  console.log('Has Nutrition Calc:', !!menu.nutritionCalc)
  
  if (menu.nutritionCalc) {
    console.log('\n📊 RAW DATABASE VALUES:')
    console.log('─'.repeat(80))
    
    // Macronutrients
    console.log('\n🥗 MACRONUTRIENTS:')
    console.log('totalCalories:', menu.nutritionCalc.totalCalories)
    console.log('totalProtein:', menu.nutritionCalc.totalProtein)
    console.log('totalCarbs:', menu.nutritionCalc.totalCarbs)
    console.log('totalFat:', menu.nutritionCalc.totalFat)
    console.log('totalFiber:', menu.nutritionCalc.totalFiber)
    
    // Vitamins
    console.log('\n💊 VITAMINS (with total prefix):')
    console.log('totalVitaminA:', menu.nutritionCalc.totalVitaminA)
    console.log('totalVitaminB1:', menu.nutritionCalc.totalVitaminB1)
    console.log('totalVitaminB2:', menu.nutritionCalc.totalVitaminB2)
    console.log('totalVitaminB3:', menu.nutritionCalc.totalVitaminB3)
    console.log('totalVitaminB6:', menu.nutritionCalc.totalVitaminB6)
    console.log('totalVitaminB12:', menu.nutritionCalc.totalVitaminB12)
    console.log('totalVitaminC:', menu.nutritionCalc.totalVitaminC)
    console.log('totalVitaminD:', menu.nutritionCalc.totalVitaminD)
    console.log('totalVitaminE:', menu.nutritionCalc.totalVitaminE)
    console.log('totalVitaminK:', menu.nutritionCalc.totalVitaminK)
    console.log('totalFolate:', menu.nutritionCalc.totalFolate)
    
    // Minerals
    console.log('\n⚗️ MINERALS (with total prefix):')
    console.log('totalCalcium:', menu.nutritionCalc.totalCalcium)
    console.log('totalIron:', menu.nutritionCalc.totalIron)
    console.log('totalMagnesium:', menu.nutritionCalc.totalMagnesium)
    console.log('totalPhosphorus:', menu.nutritionCalc.totalPhosphorus)
    console.log('totalPotassium:', menu.nutritionCalc.totalPotassium)
    console.log('totalSodium:', menu.nutritionCalc.totalSodium)
    console.log('totalZinc:', menu.nutritionCalc.totalZinc)
    console.log('totalSelenium:', menu.nutritionCalc.totalSelenium)
    
    console.log('\n📅 Calculated At:', menu.nutritionCalc.calculatedAt)
    console.log('🔄 Is Stale:', menu.nutritionCalc.isStale)
    
    // Check if values are actually 0 or not calculated
    const hasNonZeroVitamins = [
      menu.nutritionCalc.totalVitaminA,
      menu.nutritionCalc.totalVitaminB1,
      menu.nutritionCalc.totalVitaminB2,
      menu.nutritionCalc.totalVitaminB3,
      menu.nutritionCalc.totalVitaminB6,
      menu.nutritionCalc.totalVitaminB12,
      menu.nutritionCalc.totalVitaminC,
      menu.nutritionCalc.totalVitaminD,
      menu.nutritionCalc.totalVitaminE,
      menu.nutritionCalc.totalVitaminK,
      menu.nutritionCalc.totalFolate
    ].some(val => val > 0)
    
    const hasNonZeroMinerals = [
      menu.nutritionCalc.totalCalcium,
      menu.nutritionCalc.totalIron,
      menu.nutritionCalc.totalMagnesium,
      menu.nutritionCalc.totalPhosphorus,
      menu.nutritionCalc.totalPotassium,
      menu.nutritionCalc.totalSodium,
      menu.nutritionCalc.totalZinc,
      menu.nutritionCalc.totalSelenium
    ].some(val => val > 0)
    
    console.log('\n🔍 ANALYSIS:')
    console.log('─'.repeat(80))
    console.log('Has non-zero vitamins:', hasNonZeroVitamins ? '✅ YES' : '❌ NO - All vitamins are 0!')
    console.log('Has non-zero minerals:', hasNonZeroMinerals ? '✅ YES' : '❌ NO - All minerals are 0!')
    
    if (!hasNonZeroVitamins && !hasNonZeroMinerals) {
      console.log('\n⚠️  PROBLEM: Nutrition calculation exists but all vitamin/mineral values are 0!')
      console.log('This means either:')
      console.log('1. Calculation was not performed correctly')
      console.log('2. Inventory items have no vitamin/mineral data')
      console.log('3. Calculation needs to be re-run')
    }
  } else {
    console.log('\n❌ No nutrition calculation found!')
    console.log('You need to run nutrition calculation first.')
  }
  
  // Check inventory items
  console.log('\n📦 CHECKING INVENTORY ITEMS:')
  console.log('─'.repeat(80))
  
  const ingredients = await prisma.menuIngredient.findMany({
    where: { menuId },
    include: {
      inventoryItem: true
    }
  })
  
  console.log(`\nFound ${ingredients.length} ingredients`)
  
  let hasInventoryWithVitamins = false
  ingredients.forEach((ing, idx) => {
    console.log(`\n${idx + 1}. ${ing.inventoryItem.itemName}`)
    console.log(`   Vitamin A: ${ing.inventoryItem.vitaminA || 0}`)
    console.log(`   Vitamin C: ${ing.inventoryItem.vitaminC || 0}`)
    console.log(`   Calcium: ${ing.inventoryItem.calcium || 0}`)
    console.log(`   Iron: ${ing.inventoryItem.iron || 0}`)
    
    if (ing.inventoryItem.vitaminA || ing.inventoryItem.vitaminC || 
        ing.inventoryItem.calcium || ing.inventoryItem.iron) {
      hasInventoryWithVitamins = true
    }
  })
  
  console.log('\n🔍 INVENTORY ANALYSIS:')
  console.log('─'.repeat(80))
  console.log('Has inventory with vitamin/mineral data:', 
    hasInventoryWithVitamins ? '✅ YES' : '❌ NO - Inventory items have no nutrition data!')
  
  if (!hasInventoryWithVitamins) {
    console.log('\n⚠️  ROOT CAUSE: Inventory items do not have vitamin/mineral values!')
    console.log('Solution: Update inventory items with proper nutrition data from TKPI database')
  }
}

debugNutritionValues()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
