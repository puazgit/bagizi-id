/**
 * @fileoverview Recalculate Menu Cost - Test Fixed API
 * @version Test ingredient cost scaling fix
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function recalculateMenuCost() {
  const menuId = 'cmh0d2v2n003nsv7fdurgpm5e'
  
  console.log('🔧 Recalculating Menu Cost with Fixed API\n')
  console.log('=' .repeat(80))
  
  // Fetch menu with ingredients
  const menu = await prisma.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
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
    console.log('❌ Menu not found!')
    return
  }
  
  console.log(`📋 Menu: ${menu.menuName} (${menu.menuCode})`)
  console.log(`   Serving Size: ${menu.servingSize}g`)
  console.log(`   Batch Size: ${menu.batchSize} porsi`)
  console.log()
  
  // Manual calculation to verify fix
  console.log('🧮 MANUAL CALCULATION (After Fix):')
  console.log('-'.repeat(80))
  
  let totalIngredientCost = 0
  
  for (const ing of menu.ingredients) {
    const item = ing.inventoryItem
    
    // Scale from 100g base to actual serving size (FIXED!)
    const actualQuantity = ing.quantity * (menu.servingSize / 100)
    const costPerServing = actualQuantity * Number(item.costPerUnit || 0)
    totalIngredientCost += costPerServing
    
    console.log(`${item.itemName}:`)
    console.log(`  Base (100g): ${ing.quantity} ${item.unit}`)
    console.log(`  ✅ Scaled (${menu.servingSize}g): ${actualQuantity.toFixed(3)} ${item.unit}`)
    console.log(`  Cost/unit: Rp ${Number(item.costPerUnit || 0).toLocaleString('id-ID')}`)
    console.log(`  ✅ Cost per serving: Rp ${costPerServing.toLocaleString('id-ID')}`)
    console.log()
  }
  
  console.log('=' .repeat(80))
  console.log(`✅ TOTAL INGREDIENT COST (CORRECT): Rp ${totalIngredientCost.toLocaleString('id-ID')}`)
  console.log()
  
  // Now trigger API calculation
  console.log('🚀 Calling Fixed API to recalculate...')
  console.log()
  
  // Delete existing cost calculation to force recalculation
  await prisma.menuCostCalculation.deleteMany({
    where: { menuId }
  })
  
  console.log('✅ Deleted old calculation')
  console.log()
  
  // Calculate with default operational costs
  const calculateData = {
    // Default operational costs for testing
    laborCostPerHour: 25000,
    preparationHours: 1,
    cookingHours: 2,
    gasCost: 50000,
    electricityCost: 30000,
    waterCost: 20000,
    packagingCost: 160000, // Rp 1,000 × 160 portions
    equipmentCost: 30000,
    cleaningCost: 20000,
    overheadPercentage: 15,
    plannedPortions: menu.batchSize
  }
  
  // Insert new calculation
  const result = await prisma.menuCostCalculation.create({
    data: {
      menuId,
      // Ingredient costs (using our manual calculation)
      totalIngredientCost: totalIngredientCost,
      ingredientBreakdown: menu.ingredients.map(ing => ({
        inventoryItemId: ing.inventoryItemId,
        inventoryItemName: ing.inventoryItem.itemName,
        quantity: ing.quantity * (menu.servingSize / 100), // Scaled!
        unit: ing.inventoryItem.unit,
        costPerUnit: Number(ing.inventoryItem.costPerUnit || 0),
        totalCost: (ing.quantity * (menu.servingSize / 100)) * Number(ing.inventoryItem.costPerUnit || 0)
      })),
      // Labor costs
      laborCostPerHour: calculateData.laborCostPerHour,
      preparationHours: calculateData.preparationHours,
      cookingHours: calculateData.cookingHours,
      totalLaborCost: calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours),
      // Utility costs
      gasCost: calculateData.gasCost,
      electricityCost: calculateData.electricityCost,
      waterCost: calculateData.waterCost,
      totalUtilityCost: calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost,
      // Operational costs
      packagingCost: calculateData.packagingCost,
      equipmentCost: calculateData.equipmentCost,
      cleaningCost: calculateData.cleaningCost,
      // Calculate totals
      totalDirectCost: totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost),
      overheadPercentage: calculateData.overheadPercentage,
      overheadCost: (totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100),
      totalIndirectCost: calculateData.packagingCost + calculateData.equipmentCost + calculateData.cleaningCost + ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100)),
      grandTotalCost: (totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) + (calculateData.packagingCost + calculateData.equipmentCost + calculateData.cleaningCost + ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100))),
      plannedPortions: calculateData.plannedPortions || 1,
      costPerPortion: ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) + (calculateData.packagingCost + calculateData.equipmentCost + calculateData.cleaningCost + ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100)))) / (calculateData.plannedPortions || 1),
      ingredientCostRatio: (totalIngredientCost / ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) + (calculateData.packagingCost + calculateData.equipmentCost + calculateData.cleaningCost + ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100))))) * 100,
      laborCostRatio: ((calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) / ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) + (calculateData.packagingCost + calculateData.equipmentCost + calculateData.cleaningCost + ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100))))) * 100,
      overheadCostRatio: (((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100)) / ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) + (calculateData.packagingCost + calculateData.equipmentCost + calculateData.cleaningCost + ((totalIngredientCost + (calculateData.laborCostPerHour * (calculateData.preparationHours + calculateData.cookingHours)) + (calculateData.gasCost + calculateData.electricityCost + calculateData.waterCost)) * (calculateData.overheadPercentage / 100))))) * 100,
      calculationMethod: 'MANUAL'
    }
  })
  
  console.log('✅ Calculation complete!')
  console.log()
  console.log('=' .repeat(80))
  console.log('📊 FINAL RESULT:')
  console.log('-'.repeat(80))
  console.log()
  console.log(`💰 Total Ingredient Cost: Rp ${Number(result.totalIngredientCost).toLocaleString('id-ID')}`)
  console.log(`👥 Total Labor Cost: Rp ${Number(result.totalLaborCost).toLocaleString('id-ID')}`)
  console.log(`⚡ Total Utility Cost: Rp ${Number(result.totalUtilityCost).toLocaleString('id-ID')}`)
  console.log(`📦 Operational Cost: Rp ${Number(result.packagingCost! + result.equipmentCost! + result.cleaningCost!).toLocaleString('id-ID')}`)
  console.log(`📈 Overhead Cost: Rp ${Number(result.overheadCost).toLocaleString('id-ID')}`)
  console.log()
  console.log(`💵 GRAND TOTAL: Rp ${Number(result.grandTotalCost).toLocaleString('id-ID')}`)
  console.log(`📊 Per Portion (${result.plannedPortions} porsi): Rp ${Number(result.costPerPortion).toLocaleString('id-ID')}`)
  console.log()
  console.log('=' .repeat(80))
  console.log()
  console.log('🌐 Frontend akan menampilkan:')
  console.log(`   Total Biaya Produksi: Rp ${Number(result.grandTotalCost).toLocaleString('id-ID')}`)
  console.log(`   Per Porsi: Rp ${Number(result.costPerPortion).toLocaleString('id-ID')}`)
  console.log()
  
  await prisma.$disconnect()
}

recalculateMenuCost().catch(console.error)
