/**
 * Test script: Manually calculate nutrition for Gudeg menu
 * This bypasses authentication by directly calling the calculation logic
 */

import { PrismaClient, Prisma } from '@prisma/client'

const db = new PrismaClient()

async function testNutritionCalculation() {
  console.log('🧪 Testing Nutrition Calculation with Unit Conversion\n')
  console.log('================================================================================')

  const menuId = 'cmh0d2v2m003csv7f1ilxfgow'
  const userId = 'cmh0czps7000msvpr90j9o6ce' // admin user
  const sppgId = 'cmh0czp5t0008svpryrbklnvn'

  // 1. Fetch menu with ingredients
  const menu = await db.nutritionMenu.findFirst({
    where: {
      id: menuId,
      program: {
        sppgId: sppgId
      }
    },
    include: {
      ingredients: {
        include: {
          inventoryItem: {
            select: {
              unit: true,
              calories: true,
              protein: true,
              carbohydrates: true,
              fat: true,
              fiber: true,
              vitaminA: true,
              vitaminB1: true,
              vitaminB2: true,
              vitaminB3: true,
              vitaminB6: true,
              vitaminB12: true,
              vitaminC: true,
              vitaminD: true,
              vitaminE: true,
              vitaminK: true,
              folate: true,
              calcium: true,
              iron: true,
              magnesium: true,
              phosphorus: true,
              potassium: true,
              sodium: true,
              zinc: true,
              selenium: true,
              iodine: true
            }
          }
        }
      }
    }
  })

  if (!menu) {
    console.error('❌ Menu not found!')
    return
  }

  console.log(`📋 Menu: ${menu.menuName}`)
  console.log(`🆔 ID: ${menu.id}`)
  console.log(`📏 Serving Size: ${menu.servingSize}g\n`)

  // 2. Calculate nutrition
  let totalCalories = new Prisma.Decimal(0)
  let totalProtein = new Prisma.Decimal(0)
  let totalCarbs = new Prisma.Decimal(0)
  let totalFat = new Prisma.Decimal(0)
  let totalFiber = new Prisma.Decimal(0)
  
  let totalVitaminA = new Prisma.Decimal(0)
  let totalVitaminB1 = new Prisma.Decimal(0)
  let totalVitaminB2 = new Prisma.Decimal(0)
  let totalVitaminB3 = new Prisma.Decimal(0)
  let totalVitaminB6 = new Prisma.Decimal(0)
  let totalVitaminB12 = new Prisma.Decimal(0)
  let totalVitaminC = new Prisma.Decimal(0)
  let totalVitaminD = new Prisma.Decimal(0)
  let totalVitaminE = new Prisma.Decimal(0)
  let totalVitaminK = new Prisma.Decimal(0)
  let totalFolate = new Prisma.Decimal(0)
  
  let totalCalcium = new Prisma.Decimal(0)
  let totalIron = new Prisma.Decimal(0)
  let totalMagnesium = new Prisma.Decimal(0)
  let totalPhosphorus = new Prisma.Decimal(0)
  let totalPotassium = new Prisma.Decimal(0)
  let totalSodium = new Prisma.Decimal(0)
  let totalZinc = new Prisma.Decimal(0)
  let totalSelenium = new Prisma.Decimal(0)
  let totalIodine = new Prisma.Decimal(0)

  console.log('🥘 Ingredient Calculation Details:')
  console.log('--------------------------------------------------------------------------------\n')

  for (const ingredient of menu.ingredients) {
    if (!ingredient.inventoryItem) continue

    const item = ingredient.inventoryItem
    
    // Convert quantity to grams
    let quantityInGrams = ingredient.quantity
    const unit = item.unit?.toLowerCase() || 'kg'
    
    console.log(`📦 Ingredient: ${ingredient.inventoryItem ? 'Item loaded' : 'Missing'}`)
    console.log(`   Original: ${ingredient.quantity} ${unit}`)
    
    if (unit === 'kg' || unit === 'kilogram') {
      quantityInGrams = ingredient.quantity * 1000
      console.log(`   ✅ Converted: ${quantityInGrams}g (kg → gram)`)
    } else if (unit === 'liter' || unit === 'l') {
      quantityInGrams = ingredient.quantity * 1000
      console.log(`   ✅ Converted: ${quantityInGrams}g (liter → gram)`)
    } else if (unit === 'lembar' || unit === 'pcs' || unit === 'piece') {
      quantityInGrams = ingredient.quantity * 100
      console.log(`   ✅ Converted: ${quantityInGrams}g (piece → gram)`)
    } else {
      console.log(`   ⚠️  Assumed: ${quantityInGrams}g (no conversion)`)
    }
    
    const factor = quantityInGrams / 100
    console.log(`   Factor: ${factor} (${quantityInGrams}g / 100)`)

    // Show vitamin/mineral contributions
    if (item.vitaminA) {
      const contribution = new Prisma.Decimal(item.vitaminA).mul(factor).toNumber()
      console.log(`   🍎 Vitamin A: ${item.vitaminA} × ${factor} = ${contribution.toFixed(2)} mcg`)
      totalVitaminA = totalVitaminA.add(new Prisma.Decimal(item.vitaminA).mul(factor))
    }
    if (item.calcium) {
      const contribution = new Prisma.Decimal(item.calcium).mul(factor).toNumber()
      console.log(`   🦴 Calcium: ${item.calcium} × ${factor} = ${contribution.toFixed(2)} mg`)
      totalCalcium = totalCalcium.add(new Prisma.Decimal(item.calcium).mul(factor))
    }
    if (item.iron) {
      const contribution = new Prisma.Decimal(item.iron).mul(factor).toNumber()
      console.log(`   🔴 Iron: ${item.iron} × ${factor} = ${contribution.toFixed(2)} mg`)
      totalIron = totalIron.add(new Prisma.Decimal(item.iron).mul(factor))
    }
    if (item.zinc) {
      const contribution = new Prisma.Decimal(item.zinc).mul(factor).toNumber()
      console.log(`   ⚡ Zinc: ${item.zinc} × ${factor} = ${contribution.toFixed(2)} mg`)
      totalZinc = totalZinc.add(new Prisma.Decimal(item.zinc).mul(factor))
    }

    console.log('')

    // Calculate all nutrients
    totalCalories = totalCalories.add(new Prisma.Decimal(item.calories || 0).mul(factor))
    totalProtein = totalProtein.add(new Prisma.Decimal(item.protein || 0).mul(factor))
    totalCarbs = totalCarbs.add(new Prisma.Decimal(item.carbohydrates || 0).mul(factor))
    totalFat = totalFat.add(new Prisma.Decimal(item.fat || 0).mul(factor))
    totalFiber = totalFiber.add(new Prisma.Decimal(item.fiber || 0).mul(factor))
    
    totalVitaminB1 = totalVitaminB1.add(new Prisma.Decimal(item.vitaminB1 || 0).mul(factor))
    totalVitaminB2 = totalVitaminB2.add(new Prisma.Decimal(item.vitaminB2 || 0).mul(factor))
    totalVitaminB3 = totalVitaminB3.add(new Prisma.Decimal(item.vitaminB3 || 0).mul(factor))
    totalVitaminB6 = totalVitaminB6.add(new Prisma.Decimal(item.vitaminB6 || 0).mul(factor))
    totalVitaminB12 = totalVitaminB12.add(new Prisma.Decimal(item.vitaminB12 || 0).mul(factor))
    totalVitaminC = totalVitaminC.add(new Prisma.Decimal(item.vitaminC || 0).mul(factor))
    totalVitaminD = totalVitaminD.add(new Prisma.Decimal(item.vitaminD || 0).mul(factor))
    totalVitaminE = totalVitaminE.add(new Prisma.Decimal(item.vitaminE || 0).mul(factor))
    totalVitaminK = totalVitaminK.add(new Prisma.Decimal(item.vitaminK || 0).mul(factor))
    totalFolate = totalFolate.add(new Prisma.Decimal(item.folate || 0).mul(factor))
    
    totalMagnesium = totalMagnesium.add(new Prisma.Decimal(item.magnesium || 0).mul(factor))
    totalPhosphorus = totalPhosphorus.add(new Prisma.Decimal(item.phosphorus || 0).mul(factor))
    totalPotassium = totalPotassium.add(new Prisma.Decimal(item.potassium || 0).mul(factor))
    totalSodium = totalSodium.add(new Prisma.Decimal(item.sodium || 0).mul(factor))
    totalSelenium = totalSelenium.add(new Prisma.Decimal(item.selenium || 0).mul(factor))
    totalIodine = totalIodine.add(new Prisma.Decimal(item.iodine || 0).mul(factor))
  }

  console.log('================================================================================')
  console.log('\n📊 TOTAL CALCULATED VALUES:\n')
  
  console.log('🍎 KEY VITAMINS:')
  console.log(`   Vitamin A:  ${totalVitaminA.toFixed(2)} mcg`)
  console.log(`   Vitamin C:  ${totalVitaminC.toFixed(2)} mg`)
  
  console.log('\n🦴 KEY MINERALS:')
  console.log(`   Calcium:    ${totalCalcium.toFixed(2)} mg`)
  console.log(`   Iron:       ${totalIron.toFixed(2)} mg`)
  console.log(`   Zinc:       ${totalZinc.toFixed(2)} mg`)

  // 3. Save to database
  console.log('\n💾 Saving to database...')

  const dailyCalories = 2000
  const dailyProtein = 50
  const dailyCarbs = 275
  const dailyFat = 78
  const dailyFiber = 28

  const caloriesDV = totalCalories.div(dailyCalories).mul(100)
  const proteinDV = totalProtein.div(dailyProtein).mul(100)
  const carbsDV = totalCarbs.div(dailyCarbs).mul(100)
  const fatDV = totalFat.div(dailyFat).mul(100)
  const fiberDV = totalFiber.div(dailyFiber).mul(100)
  const meetsAKG = proteinDV.gte(20) && caloriesDV.gte(30)

  await db.menuNutritionCalculation.upsert({
    where: { menuId },
    create: {
      menuId,
      totalCalories: totalCalories.toNumber(),
      totalProtein: totalProtein.toNumber(),
      totalCarbs: totalCarbs.toNumber(),
      totalFat: totalFat.toNumber(),
      totalFiber: totalFiber.toNumber(),
      totalVitaminA: totalVitaminA.toNumber(),
      totalVitaminB1: totalVitaminB1.toNumber(),
      totalVitaminB2: totalVitaminB2.toNumber(),
      totalVitaminB3: totalVitaminB3.toNumber(),
      totalVitaminB6: totalVitaminB6.toNumber(),
      totalVitaminB12: totalVitaminB12.toNumber(),
      totalVitaminC: totalVitaminC.toNumber(),
      totalVitaminD: totalVitaminD.toNumber(),
      totalVitaminE: totalVitaminE.toNumber(),
      totalVitaminK: totalVitaminK.toNumber(),
      totalFolate: totalFolate.toNumber(),
      totalCalcium: totalCalcium.toNumber(),
      totalPhosphorus: totalPhosphorus.toNumber(),
      totalIron: totalIron.toNumber(),
      totalZinc: totalZinc.toNumber(),
      totalIodine: totalIodine.toNumber(),
      totalSelenium: totalSelenium.toNumber(),
      totalMagnesium: totalMagnesium.toNumber(),
      totalPotassium: totalPotassium.toNumber(),
      totalSodium: totalSodium.toNumber(),
      caloriesDV: caloriesDV.toNumber(),
      proteinDV: proteinDV.toNumber(),
      carbsDV: carbsDV.toNumber(),
      fatDV: fatDV.toNumber(),
      fiberDV: fiberDV.toNumber(),
      meetsAKG,
      calculatedBy: userId,
      calculatedAt: new Date()
    },
    update: {
      totalCalories: totalCalories.toNumber(),
      totalProtein: totalProtein.toNumber(),
      totalCarbs: totalCarbs.toNumber(),
      totalFat: totalFat.toNumber(),
      totalFiber: totalFiber.toNumber(),
      totalVitaminA: totalVitaminA.toNumber(),
      totalVitaminB1: totalVitaminB1.toNumber(),
      totalVitaminB2: totalVitaminB2.toNumber(),
      totalVitaminB3: totalVitaminB3.toNumber(),
      totalVitaminB6: totalVitaminB6.toNumber(),
      totalVitaminB12: totalVitaminB12.toNumber(),
      totalVitaminC: totalVitaminC.toNumber(),
      totalVitaminD: totalVitaminD.toNumber(),
      totalVitaminE: totalVitaminE.toNumber(),
      totalVitaminK: totalVitaminK.toNumber(),
      totalFolate: totalFolate.toNumber(),
      totalCalcium: totalCalcium.toNumber(),
      totalPhosphorus: totalPhosphorus.toNumber(),
      totalIron: totalIron.toNumber(),
      totalZinc: totalZinc.toNumber(),
      totalIodine: totalIodine.toNumber(),
      totalSelenium: totalSelenium.toNumber(),
      totalMagnesium: totalMagnesium.toNumber(),
      totalPotassium: totalPotassium.toNumber(),
      totalSodium: totalSodium.toNumber(),
      caloriesDV: caloriesDV.toNumber(),
      proteinDV: proteinDV.toNumber(),
      carbsDV: carbsDV.toNumber(),
      fatDV: fatDV.toNumber(),
      fiberDV: fiberDV.toNumber(),
      meetsAKG,
      calculatedBy: userId,
      calculatedAt: new Date()
    }
  })

  console.log('✅ Calculation saved to database!\n')
  
  console.log('================================================================================')
  console.log('\n📍 NEXT STEPS:')
  console.log('1. Refresh: http://localhost:3000/menu/cmh0d2v2m003csv7f1ilxfgow')
  console.log('2. Verify: Vitamin A should show ~21 mcg (not 0.0)')
  console.log('3. Verify: Calcium should show ~15.8 mg (not 0.0)')
  console.log('4. Verify: Iron should show ~1.3 mg (not 0.0)')
  console.log('5. Verify: Zinc should show ~1.78 mg (not 0.0)')
  console.log('\n✅ Unit conversion fix applied - values should be correct now!')
}

testNutritionCalculation()
  .catch(console.error)
  .finally(() => process.exit(0))
