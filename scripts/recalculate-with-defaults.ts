import { PrismaClient, Prisma } from '@prisma/client'

const db = new PrismaClient()

/**
 * Recalculate menu cost with realistic operational defaults
 */
async function recalculateMenuCost() {
  const menuId = 'cmh0d2v2n003nsv7fdurgpm5e' // Pisang Goreng Keju

  console.log('🔄 Recalculating menu cost with realistic defaults...\n')

  // Call the calculate-cost API endpoint via internal function simulation
  const menu = await db.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      program: {
        select: {
          sppgId: true,
          name: true
        }
      },
      ingredients: {
        include: {
          inventoryItem: {
            select: {
              itemName: true,
              unit: true,
              costPerUnit: true
            }
          }
        }
      }
    }
  })

  if (!menu) {
    console.error('❌ Menu not found')
    return
  }

  console.log('📋 Menu:', menu.menuName)
  console.log('   Serving Size:', menu.servingSize + 'g')
  console.log('   Batch Size:', menu.batchSize, 'portions')
  console.log('   Ingredients:', menu.ingredients.length)
  console.log('')

  // Simulate the updated API calculation
  
  // Calculate ingredient costs with scaling
  let totalIngredientCost = new Prisma.Decimal(0)
  const ingredientBreakdown: Array<{
    inventoryItemId: string
    inventoryItemName: string
    quantity: number
    unit: string
    costPerUnit: number
    totalCost: number
  }> = []

  console.log('🧮 CALCULATING INGREDIENT COSTS (with scaling):\n')
  
  for (const ingredient of menu.ingredients) {
    const itemCostPerUnit = ingredient.inventoryItem.costPerUnit || 0
    
    // Scale from 100g base to actual serving size
    const actualQuantity = ingredient.quantity * (menu.servingSize / 100)
    const itemTotalCost = actualQuantity * itemCostPerUnit
    
    totalIngredientCost = totalIngredientCost.add(new Prisma.Decimal(itemTotalCost))

    console.log(`${ingredient.inventoryItem.itemName}:`)
    console.log(`  Base (100g): ${ingredient.quantity} ${ingredient.inventoryItem.unit}`)
    console.log(`  Actual (${menu.servingSize}g): ${actualQuantity.toFixed(4)} ${ingredient.inventoryItem.unit}`)
    console.log(`  Cost/unit: Rp ${itemCostPerUnit.toLocaleString('id-ID')}`)
    console.log(`  Total: Rp ${itemTotalCost.toLocaleString('id-ID')}`)
    console.log('')

    ingredientBreakdown.push({
      inventoryItemId: ingredient.inventoryItemId,
      inventoryItemName: ingredient.inventoryItem.itemName,
      quantity: actualQuantity,
      unit: ingredient.inventoryItem.unit,
      costPerUnit: itemCostPerUnit,
      totalCost: itemTotalCost
    })
  }

  console.log(`✅ Total Ingredient Cost: Rp ${parseFloat(totalIngredientCost.toString()).toLocaleString('id-ID')}\n`)

  // REALISTIC DEFAULTS based on SPPG operations
  const defaultPlannedPortions = menu.batchSize || 100
  
  console.log('💼 OPERATIONAL COSTS (with realistic defaults):\n')
  
  // Labor costs
  const laborCostPerHour = new Prisma.Decimal(20000) // Rp 20,000/hour
  
  // Time estimation based on batch size
  let defaultHours = 2.5
  if (defaultPlannedPortions < 50) {
    defaultHours = 1.5
  } else if (defaultPlannedPortions > 150) {
    defaultHours = 4.0
  }
  
  const preparationHours = new Prisma.Decimal(defaultHours * 0.4) // 40% prep
  const cookingHours = new Prisma.Decimal(defaultHours * 0.6) // 60% cooking
  const totalLaborCost = laborCostPerHour.mul(preparationHours.add(cookingHours))

  console.log('Labor Costs:')
  console.log(`  Cost per hour: Rp ${parseFloat(laborCostPerHour.toString()).toLocaleString('id-ID')}`)
  console.log(`  Preparation hours: ${parseFloat(preparationHours.toString())} hours`)
  console.log(`  Cooking hours: ${parseFloat(cookingHours.toString())} hours`)
  console.log(`  Total labor cost: Rp ${parseFloat(totalLaborCost.toString()).toLocaleString('id-ID')}`)
  console.log('')

  // Utility costs
  const gasCost = new Prisma.Decimal(5000)
  const electricityCost = new Prisma.Decimal(1500)
  const waterCost = new Prisma.Decimal(1000)
  const totalUtilityCost = gasCost.add(electricityCost).add(waterCost)

  console.log('Utility Costs:')
  console.log(`  Gas: Rp ${parseFloat(gasCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Electricity: Rp ${parseFloat(electricityCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Water: Rp ${parseFloat(waterCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Total utility cost: Rp ${parseFloat(totalUtilityCost.toString()).toLocaleString('id-ID')}`)
  console.log('')

  // Other operational costs
  const packagingCostPerPortion = 500
  const packagingCost = new Prisma.Decimal(packagingCostPerPortion * defaultPlannedPortions)
  const equipmentCost = new Prisma.Decimal(8000)
  const cleaningCost = new Prisma.Decimal(5000)

  console.log('Other Operational Costs:')
  console.log(`  Packaging (Rp 500 x ${defaultPlannedPortions} portions): Rp ${parseFloat(packagingCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Equipment depreciation: Rp ${parseFloat(equipmentCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Cleaning supplies: Rp ${parseFloat(cleaningCost.toString()).toLocaleString('id-ID')}`)
  console.log('')

  // Overhead
  const overheadPercentage = new Prisma.Decimal(15)
  const totalDirectCost = totalIngredientCost.add(totalLaborCost).add(totalUtilityCost)
  const overheadCost = totalDirectCost.mul(overheadPercentage).div(100)

  console.log('Overhead:')
  console.log(`  Percentage: ${parseFloat(overheadPercentage.toString())}%`)
  console.log(`  Total direct cost: Rp ${parseFloat(totalDirectCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Overhead cost: Rp ${parseFloat(overheadCost.toString()).toLocaleString('id-ID')}`)
  console.log('')

  // Total costs
  const totalIndirectCost = packagingCost.add(equipmentCost).add(cleaningCost).add(overheadCost)
  const grandTotalCost = totalDirectCost.add(totalIndirectCost)
  const costPerPortion = grandTotalCost.div(defaultPlannedPortions)

  // Cost ratios
  const ingredientCostRatio = totalIngredientCost.div(grandTotalCost).mul(100)
  const laborCostRatio = totalLaborCost.div(grandTotalCost).mul(100)
  const overheadCostRatio = overheadCost.div(grandTotalCost).mul(100)

  console.log('📊 FINAL CALCULATION:\n')
  console.log('Direct Costs:')
  console.log(`  Ingredients: Rp ${parseFloat(totalIngredientCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Labor: Rp ${parseFloat(totalLaborCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Utilities: Rp ${parseFloat(totalUtilityCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Subtotal: Rp ${parseFloat(totalDirectCost.toString()).toLocaleString('id-ID')}`)
  console.log('')
  console.log('Indirect Costs:')
  console.log(`  Packaging: Rp ${parseFloat(packagingCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Equipment: Rp ${parseFloat(equipmentCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Cleaning: Rp ${parseFloat(cleaningCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Overhead (15%): Rp ${parseFloat(overheadCost.toString()).toLocaleString('id-ID')}`)
  console.log(`  Subtotal: Rp ${parseFloat(totalIndirectCost.toString()).toLocaleString('id-ID')}`)
  console.log('')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`GRAND TOTAL: Rp ${parseFloat(grandTotalCost.toString()).toLocaleString('id-ID')}`)
  console.log(`Planned Portions: ${defaultPlannedPortions}`)
  console.log(`COST PER PORTION: Rp ${parseFloat(costPerPortion.toString()).toLocaleString('id-ID')}`)
  console.log('═══════════════════════════════════════════════════════')
  console.log('')

  console.log('💾 Saving to database...\n')

  // Save to database
  await db.menuCostCalculation.upsert({
    where: { menuId },
    create: {
      menuId,
      totalIngredientCost: parseFloat(totalIngredientCost.toString()),
      ingredientBreakdown,
      laborCostPerHour: parseFloat(laborCostPerHour.toString()),
      preparationHours: parseFloat(preparationHours.toString()),
      cookingHours: parseFloat(cookingHours.toString()),
      totalLaborCost: parseFloat(totalLaborCost.toString()),
      gasCost: parseFloat(gasCost.toString()),
      electricityCost: parseFloat(electricityCost.toString()),
      waterCost: parseFloat(waterCost.toString()),
      totalUtilityCost: parseFloat(totalUtilityCost.toString()),
      packagingCost: parseFloat(packagingCost.toString()),
      equipmentCost: parseFloat(equipmentCost.toString()),
      cleaningCost: parseFloat(cleaningCost.toString()),
      overheadPercentage: parseFloat(overheadPercentage.toString()),
      overheadCost: parseFloat(overheadCost.toString()),
      totalDirectCost: parseFloat(totalDirectCost.toString()),
      totalIndirectCost: parseFloat(totalIndirectCost.toString()),
      grandTotalCost: parseFloat(grandTotalCost.toString()),
      plannedPortions: defaultPlannedPortions,
      costPerPortion: parseFloat(costPerPortion.toString()),
      ingredientCostRatio: parseFloat(ingredientCostRatio.toString()),
      laborCostRatio: parseFloat(laborCostRatio.toString()),
      overheadCostRatio: parseFloat(overheadCostRatio.toString()),
      calculatedAt: new Date(),
      calculationMethod: 'AUTO_WITH_DEFAULTS',
      isActive: true,
      costOptimizations: [],
      alternativeIngredients: []
    },
    update: {
      totalIngredientCost: parseFloat(totalIngredientCost.toString()),
      ingredientBreakdown,
      laborCostPerHour: parseFloat(laborCostPerHour.toString()),
      preparationHours: parseFloat(preparationHours.toString()),
      cookingHours: parseFloat(cookingHours.toString()),
      totalLaborCost: parseFloat(totalLaborCost.toString()),
      gasCost: parseFloat(gasCost.toString()),
      electricityCost: parseFloat(electricityCost.toString()),
      waterCost: parseFloat(waterCost.toString()),
      totalUtilityCost: parseFloat(totalUtilityCost.toString()),
      packagingCost: parseFloat(packagingCost.toString()),
      equipmentCost: parseFloat(equipmentCost.toString()),
      cleaningCost: parseFloat(cleaningCost.toString()),
      overheadPercentage: parseFloat(overheadPercentage.toString()),
      overheadCost: parseFloat(overheadCost.toString()),
      totalDirectCost: parseFloat(totalDirectCost.toString()),
      totalIndirectCost: parseFloat(totalIndirectCost.toString()),
      grandTotalCost: parseFloat(grandTotalCost.toString()),
      plannedPortions: defaultPlannedPortions,
      costPerPortion: parseFloat(costPerPortion.toString()),
      ingredientCostRatio: parseFloat(ingredientCostRatio.toString()),
      laborCostRatio: parseFloat(laborCostRatio.toString()),
      overheadCostRatio: parseFloat(overheadCostRatio.toString()),
      calculatedAt: new Date(),
      calculationMethod: 'AUTO_WITH_DEFAULTS',
      isActive: true,
      updatedAt: new Date()
    }
  })

  console.log('✅ Database updated successfully!')
  console.log('')
  console.log('🎯 SUMMARY:')
  console.log(`   Cost per portion: Rp ${parseFloat(costPerPortion.toString()).toLocaleString('id-ID')}`)
  console.log(`   Ingredient ratio: ${parseFloat(ingredientCostRatio.toString()).toFixed(1)}%`)
  console.log(`   Labor ratio: ${parseFloat(laborCostRatio.toString()).toFixed(1)}%`)
  console.log(`   Overhead ratio: ${parseFloat(overheadCostRatio.toString()).toFixed(1)}%`)
}

recalculateMenuCost()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
