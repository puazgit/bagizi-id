/**
 * Test Nutrition Calculation for Menu
 * Verifies vitamin/mineral values are calculated correctly
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testNutritionCalculation() {
  console.log('🧪 Testing Nutrition Calculation with Vitamin/Mineral Data\n')
  console.log('=' .repeat(80))

  try {
    // Find the Gudeg menu
    const menu = await prisma.nutritionMenu.findFirst({
      where: {
        menuName: {
          contains: 'Gudeg'
        }
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                itemName: true,
                vitaminA: true,
                vitaminC: true,
                calcium: true,
                iron: true,
                zinc: true,
                folate: true,
                vitaminB1: true,
                vitaminB2: true,
                vitaminB3: true,
                vitaminB6: true,
                vitaminB12: true,
                vitaminD: true,
                vitaminE: true,
                vitaminK: true
              }
            }
          }
        },
        nutritionCalc: true
      }
    })

    if (!menu) {
      console.log('❌ Menu Gudeg not found!')
      return
    }

    console.log(`📋 Menu: ${menu.menuName}`)
    console.log(`🆔 ID: ${menu.id}`)
    console.log(`📏 Serving Size: ${menu.servingSize}g\n`)

    // Check ingredients
    console.log('🥘 Ingredients with Vitamin/Mineral Data:')
    console.log('-'.repeat(80))
    
    let hasVitaminData = false
    
    for (const ingredient of menu.ingredients) {
      const item = ingredient.inventoryItem
      const hasData = item.vitaminA || item.vitaminC || item.calcium || item.iron
      
      if (hasData) {
        hasVitaminData = true
        console.log(`\n✅ ${item.itemName} (${ingredient.quantity}g):`)
        if (item.vitaminA) console.log(`   - Vitamin A: ${item.vitaminA} mcg per 100g`)
        if (item.vitaminC) console.log(`   - Vitamin C: ${item.vitaminC} mg per 100g`)
        if (item.calcium) console.log(`   - Calcium: ${item.calcium} mg per 100g`)
        if (item.iron) console.log(`   - Iron: ${item.iron} mg per 100g`)
        if (item.zinc) console.log(`   - Zinc: ${item.zinc} mg per 100g`)
      } else {
        console.log(`\n⚠️  ${item.itemName} (${ingredient.quantity}g): No vitamin/mineral data`)
      }
    }

    console.log('\n' + '='.repeat(80))

    // Check nutrition calculation
    if (menu.nutritionCalc) {
      console.log('\n📊 Nutrition Calculation Results:')
      console.log('-'.repeat(80))
      
      const calc = menu.nutritionCalc
      
      console.log('\n🍎 VITAMINS:')
      console.log(`  Vitamin A:   ${calc.totalVitaminA.toFixed(1)} mcg`)
      console.log(`  Vitamin B1:  ${calc.totalVitaminB1.toFixed(2)} mg`)
      console.log(`  Vitamin B2:  ${calc.totalVitaminB2.toFixed(2)} mg`)
      console.log(`  Vitamin B3:  ${calc.totalVitaminB3.toFixed(2)} mg`)
      console.log(`  Vitamin B6:  ${calc.totalVitaminB6.toFixed(2)} mg`)
      console.log(`  Vitamin B12: ${calc.totalVitaminB12.toFixed(2)} mcg`)
      console.log(`  Vitamin C:   ${calc.totalVitaminC.toFixed(1)} mg`)
      console.log(`  Vitamin D:   ${calc.totalVitaminD.toFixed(1)} mcg`)
      console.log(`  Vitamin E:   ${calc.totalVitaminE.toFixed(1)} mg`)
      console.log(`  Vitamin K:   ${calc.totalVitaminK.toFixed(1)} mcg`)
      console.log(`  Folate:      ${calc.totalFolate.toFixed(1)} mcg`)

      console.log('\n🦴 MINERALS:')
      console.log(`  Calcium:     ${calc.totalCalcium.toFixed(1)} mg`)
      console.log(`  Iron:        ${calc.totalIron.toFixed(1)} mg`)
      console.log(`  Zinc:        ${calc.totalZinc.toFixed(1)} mg`)
      console.log(`  Magnesium:   ${calc.totalMagnesium.toFixed(1)} mg`)
      console.log(`  Phosphorus:  ${calc.totalPhosphorus.toFixed(1)} mg`)
      console.log(`  Potassium:   ${calc.totalPotassium.toFixed(1)} mg`)
      console.log(`  Sodium:      ${calc.totalSodium.toFixed(1)} mg`)
      console.log(`  Selenium:    ${calc.totalSelenium.toFixed(1)} mcg`)
      console.log(`  Iodine:      ${calc.totalIodine.toFixed(1)} mcg`)

      // Check if values are non-zero
      const hasNonZeroVitamins = 
        calc.totalVitaminA > 0 ||
        calc.totalVitaminC > 0 ||
        calc.totalVitaminE > 0 ||
        calc.totalVitaminK > 0

      const hasNonZeroMinerals = 
        calc.totalCalcium > 0 ||
        calc.totalIron > 0 ||
        calc.totalZinc > 0

      console.log('\n' + '='.repeat(80))
      console.log('\n✅ VERIFICATION:')
      
      if (hasVitaminData && hasNonZeroVitamins && hasNonZeroMinerals) {
        console.log('✅ SUCCESS! Vitamins and minerals have NON-ZERO values!')
        console.log('✅ Calculation is working correctly!')
        console.log('✅ Data from seed file is being used!')
      } else if (!hasVitaminData) {
        console.log('⚠️  WARNING: Ingredients have NO vitamin/mineral data in seed!')
        console.log('⚠️  Need to add TKPI data to inventory items.')
      } else if (!hasNonZeroVitamins || !hasNonZeroMinerals) {
        console.log('⚠️  WARNING: Calculation exists but values are ZERO!')
        console.log('⚠️  Calculation may need to be re-run.')
      }

      // Get AKG standards for comparison
      const standards = await prisma.nutritionStandard.findFirst({
        where: {
          targetGroup: 'SCHOOL_CHILDREN',
          ageGroup: 'ANAK_6_12'
        }
      })

      if (standards) {
        console.log('\n📐 AKG COMPLIANCE (for SCHOOL_CHILDREN 6-12 years):')
        console.log('-'.repeat(80))
        
        if (standards.vitaminA) {
          const pct = (calc.totalVitaminA / standards.vitaminA * 100).toFixed(1)
          const status = calc.totalVitaminA >= standards.vitaminA ? '✅' : '⚠️'
          console.log(`  ${status} Vitamin A: ${pct}% (${calc.totalVitaminA.toFixed(1)} / ${standards.vitaminA} mcg)`)
        }
        
        if (standards.vitaminC) {
          const pct = (calc.totalVitaminC / standards.vitaminC * 100).toFixed(1)
          const status = calc.totalVitaminC >= standards.vitaminC ? '✅' : '⚠️'
          console.log(`  ${status} Vitamin C: ${pct}% (${calc.totalVitaminC.toFixed(1)} / ${standards.vitaminC} mg)`)
        }
        
        if (standards.calcium) {
          const pct = (calc.totalCalcium / standards.calcium * 100).toFixed(1)
          const status = calc.totalCalcium >= standards.calcium ? '✅' : '⚠️'
          console.log(`  ${status} Calcium: ${pct}% (${calc.totalCalcium.toFixed(1)} / ${standards.calcium} mg)`)
        }
        
        if (standards.iron) {
          const pct = (calc.totalIron / standards.iron * 100).toFixed(1)
          const status = calc.totalIron >= standards.iron ? '✅' : '⚠️'
          console.log(`  ${status} Iron: ${pct}% (${calc.totalIron.toFixed(1)} / ${standards.iron} mg)`)
        }
      }

    } else {
      console.log('\n⚠️  WARNING: No nutrition calculation found!')
      console.log('💡 Need to click "Hitung Nutrisi" button in UI to generate calculation.')
    }

    console.log('\n' + '='.repeat(80))
    console.log('\n📍 Next Steps:')
    console.log('1. Open: http://localhost:3000/menu/' + menu.id)
    console.log('2. Click: "Hitung Nutrisi" button')
    console.log('3. Verify: Vitamin/mineral values are NOT 0.0')
    console.log('4. Check: Compliance score is calculated correctly\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNutritionCalculation()
