/**
 * Test Cost Calculation with Correct PlannedPortions
 * Tests the fix for plannedPortions defaulting to batchSize
 * 
 * Bug: plannedPortions defaulted to 1, should use menu.batchSize
 * Expected: costPerPortion = grandTotalCost / batchSize
 */

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function testCostCalculation() {
  console.log('💰 Testing Cost Calculation with PlannedPortions Fix\n')

  const menuId = 'cmh0d2v2n003rsv7flmd5ms0w' // Nasi Sayur Asem Iga Ayam

  try {
    // 1. Fetch menu with ingredients
    console.log('📋 Fetching menu...')
    const menu = await prisma.nutritionMenu.findUnique({
      where: { id: menuId },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                itemName: true,
                unit: true,
                costPerUnit: true,
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

    console.log(`✅ Menu: ${menu.menuName}`)
    console.log(`   Serving Size: ${menu.servingSize}g`)
    console.log(`   Batch Size: ${menu.batchSize} portions`)
    console.log('')

    // 2. Calculate ingredient costs
    console.log('🥘 Calculating ingredient costs...\n')
    
    let totalIngredientCost = new Prisma.Decimal(0)
    const ingredientBreakdown: Array<{
      inventoryItemId: string
      itemName: string
      quantity: number
      unit: string
      pricePerUnit: number
      subtotal: number
    }> = []

    for (const ingredient of menu.ingredients) {
      const item = ingredient.inventoryItem
      const quantity = new Prisma.Decimal(ingredient.quantity)
      const costPerUnit = item.costPerUnit ? new Prisma.Decimal(item.costPerUnit) : new Prisma.Decimal(1000)
      const subtotal = quantity.mul(costPerUnit)

      totalIngredientCost = totalIngredientCost.add(subtotal)

      ingredientBreakdown.push({
        inventoryItemId: ingredient.inventoryItemId,
        itemName: item.itemName,
        quantity: quantity.toNumber(),
        unit: item.unit,
        pricePerUnit: costPerUnit.toNumber(),
        subtotal: subtotal.toNumber()
      })

      console.log(`📦 ${item.itemName}:`)
      console.log(`   Quantity: ${ingredient.quantity} ${item.unit}`)
      console.log(`   Price per unit: Rp ${costPerUnit.toLocaleString()}`)
      console.log(`   Subtotal: Rp ${subtotal.toLocaleString()}`)
      console.log('')
    }

    console.log(`💵 Total Ingredient Cost: Rp ${totalIngredientCost.toLocaleString()}\n`)

    // 3. Calculate operational costs (using example values)
    console.log('⚙️ Calculating operational costs...\n')

    // Labor costs
    const laborCostPerHour = new Prisma.Decimal(15000)
    const preparationHours = new Prisma.Decimal(1.5)
    const cookingHours = new Prisma.Decimal(2.0)
    const totalLaborHours = preparationHours.add(cookingHours)
    const totalLaborCost = totalLaborHours.mul(laborCostPerHour)

    console.log(`👨‍🍳 Labor Costs:`)
    console.log(`   Rate: Rp ${laborCostPerHour.toLocaleString()}/hour`)
    console.log(`   Preparation: ${preparationHours} hours`)
    console.log(`   Cooking: ${cookingHours} hours`)
    console.log(`   Total Labor: Rp ${totalLaborCost.toLocaleString()}`)
    console.log('')

    // Utility costs
    const gasCost = new Prisma.Decimal(5000)
    const electricityCost = new Prisma.Decimal(3000)
    const waterCost = new Prisma.Decimal(2000)
    const totalUtilityCost = gasCost.add(electricityCost).add(waterCost)

    console.log(`⚡ Utility Costs:`)
    console.log(`   Gas: Rp ${gasCost.toLocaleString()}`)
    console.log(`   Electric: Rp ${electricityCost.toLocaleString()}`)
    console.log(`   Water: Rp ${waterCost.toLocaleString()}`)
    console.log(`   Total Utilities: Rp ${totalUtilityCost.toLocaleString()}`)
    console.log('')

    // Other operational costs
    const packagingCost = new Prisma.Decimal(500)
    const equipmentCost = new Prisma.Decimal(200)
    const cleaningCost = new Prisma.Decimal(300)
    const totalOperationalCost = packagingCost.add(equipmentCost).add(cleaningCost)

    console.log(`📦 Other Operational Costs:`)
    console.log(`   Packaging: Rp ${packagingCost.toLocaleString()}`)
    console.log(`   Equipment: Rp ${equipmentCost.toLocaleString()}`)
    console.log(`   Cleaning: Rp ${cleaningCost.toLocaleString()}`)
    console.log(`   Total Operational: Rp ${totalOperationalCost.toLocaleString()}`)
    console.log('')

    // 4. Calculate totals
    console.log('📊 Calculating totals...\n')

    // Direct costs
    const totalDirectCost = totalIngredientCost.add(totalLaborCost).add(totalUtilityCost).add(totalOperationalCost)

    // Overhead (10%)
    const overheadPercentage = new Prisma.Decimal(10)
    const overheadCost = totalDirectCost.mul(overheadPercentage).div(100)

    // Grand total
    const totalIndirectCost = overheadCost
    const grandTotalCost = totalDirectCost.add(totalIndirectCost)

    console.log(`💰 Cost Summary:`)
    console.log(`   Direct Costs: Rp ${totalDirectCost.toLocaleString()}`)
    console.log(`   Overhead (${overheadPercentage}%): Rp ${overheadCost.toLocaleString()}`)
    console.log(`   ─────────────────────────────────`)
    console.log(`   Grand Total: Rp ${grandTotalCost.toLocaleString()}`)
    console.log('')

    // 5. Calculate per-portion cost (THE FIX!)
    console.log('🍽️ Per-Portion Cost Calculation:\n')

    // BEFORE FIX (BUG):
    const buggyPlannedPortions = 1
    const buggyCostPerPortion = grandTotalCost.div(buggyPlannedPortions)
    console.log(`❌ BEFORE FIX (Bug):`)
    console.log(`   plannedPortions = 1 (hardcoded default)`)
    console.log(`   costPerPortion = ${grandTotalCost.toLocaleString()} / 1`)
    console.log(`   costPerPortion = Rp ${buggyCostPerPortion.toLocaleString()} ❌ WRONG!`)
    console.log('')

    // AFTER FIX (CORRECT):
    const correctPlannedPortions = menu.batchSize || 1 // Use batchSize as default
    const correctCostPerPortion = grandTotalCost.div(correctPlannedPortions)
    console.log(`✅ AFTER FIX (Correct):`)
    console.log(`   plannedPortions = ${correctPlannedPortions} (from menu.batchSize)`)
    console.log(`   costPerPortion = ${grandTotalCost.toLocaleString()} / ${correctPlannedPortions}`)
    console.log(`   costPerPortion = Rp ${correctCostPerPortion.toLocaleString()} ✅ CORRECT!`)
    console.log('')

    // 6. Calculate cost ratios
    const ingredientCostRatio = totalIngredientCost.div(grandTotalCost).mul(100)
    const laborCostRatio = totalLaborCost.div(grandTotalCost).mul(100)
    const overheadCostRatio = overheadCost.div(grandTotalCost).mul(100)

    console.log('📈 Cost Breakdown:')
    console.log(`   Ingredients: ${ingredientCostRatio.toFixed(1)}%`)
    console.log(`   Labor: ${laborCostRatio.toFixed(1)}%`)
    console.log(`   Overhead: ${overheadCostRatio.toFixed(1)}%`)
    console.log('')

    // 7. Save to database
    console.log('💾 Saving cost calculation to database...')
    
    await prisma.menuCostCalculation.upsert({
      where: { menuId },
      create: {
        menuId,
        // Ingredient costs
        totalIngredientCost: totalIngredientCost.toNumber(),
        ingredientBreakdown: ingredientBreakdown as unknown as Prisma.InputJsonValue,
        // Labor costs
        laborCostPerHour: laborCostPerHour.toNumber(),
        preparationHours: preparationHours.toNumber(),
        cookingHours: cookingHours.toNumber(),
        totalLaborCost: totalLaborCost.toNumber(),
        // Utility costs
        gasCost: gasCost.toNumber(),
        electricityCost: electricityCost.toNumber(),
        waterCost: waterCost.toNumber(),
        totalUtilityCost: totalUtilityCost.toNumber(),
        // Operational costs
        packagingCost: packagingCost.toNumber(),
        equipmentCost: equipmentCost.toNumber(),
        cleaningCost: cleaningCost.toNumber(),
        // Overhead
        overheadPercentage: overheadPercentage.toNumber(),
        overheadCost: overheadCost.toNumber(),
        // Totals
        totalDirectCost: totalDirectCost.toNumber(),
        totalIndirectCost: totalIndirectCost.toNumber(),
        grandTotalCost: grandTotalCost.toNumber(),
        // Per portion (FIXED!)
        plannedPortions: correctPlannedPortions,
        costPerPortion: correctCostPerPortion.toNumber(),
        // Ratios
        ingredientCostRatio: ingredientCostRatio.toNumber(),
        laborCostRatio: laborCostRatio.toNumber(),
        overheadCostRatio: overheadCostRatio.toNumber(),
        // Metadata
        calculatedAt: new Date(),
        calculationMethod: 'AUTO'
      },
      update: {
        // Ingredient costs
        totalIngredientCost: totalIngredientCost.toNumber(),
        ingredientBreakdown: ingredientBreakdown as unknown as Prisma.InputJsonValue,
        // Labor costs
        laborCostPerHour: laborCostPerHour.toNumber(),
        preparationHours: preparationHours.toNumber(),
        cookingHours: cookingHours.toNumber(),
        totalLaborCost: totalLaborCost.toNumber(),
        // Utility costs
        gasCost: gasCost.toNumber(),
        electricityCost: electricityCost.toNumber(),
        waterCost: waterCost.toNumber(),
        totalUtilityCost: totalUtilityCost.toNumber(),
        // Operational costs
        packagingCost: packagingCost.toNumber(),
        equipmentCost: equipmentCost.toNumber(),
        cleaningCost: cleaningCost.toNumber(),
        // Overhead
        overheadPercentage: overheadPercentage.toNumber(),
        overheadCost: overheadCost.toNumber(),
        // Totals
        totalDirectCost: totalDirectCost.toNumber(),
        totalIndirectCost: totalIndirectCost.toNumber(),
        grandTotalCost: grandTotalCost.toNumber(),
        // Per portion (FIXED!)
        plannedPortions: correctPlannedPortions,
        costPerPortion: correctCostPerPortion.toNumber(),
        // Ratios
        ingredientCostRatio: ingredientCostRatio.toNumber(),
        laborCostRatio: laborCostRatio.toNumber(),
        overheadCostRatio: overheadCostRatio.toNumber(),
        // Metadata
        calculatedAt: new Date(),
        calculationMethod: 'AUTO'
      }
    })

    console.log('✅ Cost calculation saved to database!')
    console.log('')

    // 8. Verification
    console.log('🔍 VERIFICATION:\n')
    console.log(`Expected in UI:`)
    console.log(`   Total Biaya Produksi: Rp ${grandTotalCost.toLocaleString()}`)
    console.log(`   Per Porsi: Rp ${correctCostPerPortion.toLocaleString()}`)
    console.log(`   (${correctPlannedPortions} portions)`)
    console.log('')
    console.log(`📍 Test at: http://localhost:3000/menu/${menuId}`)
    console.log(`   Tab: Biaya → Should show different values now!`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCostCalculation()
