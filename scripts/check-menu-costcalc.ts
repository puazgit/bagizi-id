/**
 * @fileoverview Check Menu Cost Calculation in Database
 * @version Check what's stored in database vs what we calculate
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMenuCostCalc() {
  const menuId = 'cmh0d2v2n003nsv7fdurgpm5e'
  
  console.log('🔍 Checking Menu Cost Calculation Data\n')
  console.log('=' .repeat(80))
  
  // Fetch menu with cost calculation
  const menu = await prisma.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      costCalc: true,
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
  console.log(`   Cost Per Serving (from menu): Rp ${menu.costPerServing?.toLocaleString('id-ID') || 0}`)
  console.log()
  
  // Show ingredients
  console.log('📦 INGREDIENTS:')
  console.log('-'.repeat(80))
  
  let calculatedTotal = 0
  
  for (const ing of menu.ingredients) {
    const item = ing.inventoryItem
    
    // Calculate actual quantity for serving size
    const actualQty = ing.quantity * (menu.servingSize / 100)
    
    // Calculate cost
    const costPerServing = actualQty * Number(item.costPerUnit || 0)
    calculatedTotal += costPerServing
    
    console.log(`${item.itemName}:`)
    console.log(`  Quantity (100g base): ${ing.quantity} ${item.unit}`)
    console.log(`  Actual (${menu.servingSize}g): ${actualQty.toFixed(3)} ${item.unit}`)
    console.log(`  Cost/unit: Rp ${Number(item.costPerUnit || 0).toLocaleString('id-ID')}`)
    console.log(`  Cost per serving: Rp ${costPerServing.toLocaleString('id-ID')}`)
    console.log()
  }
  
  console.log('=' .repeat(80))
  console.log(`💵 CALCULATED INGREDIENT COST: Rp ${calculatedTotal.toLocaleString('id-ID')}`)
  console.log(`💾 DATABASE costPerServing: Rp ${Number(menu.costPerServing || 0).toLocaleString('id-ID')}`)
  console.log()
  
  // Check if costCalc exists
  if (!menu.costCalc) {
    console.log('⚠️  NO COST CALCULATION FOUND IN DATABASE!')
    console.log('   Frontend akan menampilkan "Belum Ada Data Biaya"')
    console.log()
    console.log('💡 Solution: Klik tombol "Hitung Biaya Sekarang" di frontend')
    return
  }
  
  console.log('=' .repeat(80))
  console.log('📊 DATABASE COST CALCULATION (MenuCostCalculation table):')
  console.log('-'.repeat(80))
  console.log()
  
  console.log('💰 BIAYA BAHAN BAKU:')
  console.log(`   Total Ingredient Cost: Rp ${Number(menu.costCalc.totalIngredientCost || 0).toLocaleString('id-ID')}`)
  console.log()
  
  console.log('👥 BIAYA TENAGA KERJA:')
  console.log(`   Preparation Hours: ${menu.costCalc.preparationHours || 0} jam`)
  console.log(`   Cooking Hours: ${menu.costCalc.cookingHours || 0} jam`)
  console.log(`   Labor Cost/Hour: Rp ${Number(menu.costCalc.laborCostPerHour || 0).toLocaleString('id-ID')}`)
  console.log(`   Total Labor Cost: Rp ${Number(menu.costCalc.totalLaborCost || 0).toLocaleString('id-ID')}`)
  console.log()
  
  console.log('⚡ BIAYA UTILITAS:')
  console.log(`   Gas Cost: Rp ${Number(menu.costCalc.gasCost || 0).toLocaleString('id-ID')}`)
  console.log(`   Electricity Cost: Rp ${Number(menu.costCalc.electricityCost || 0).toLocaleString('id-ID')}`)
  console.log(`   Water Cost: Rp ${Number(menu.costCalc.waterCost || 0).toLocaleString('id-ID')}`)
  console.log(`   Total Utility Cost: Rp ${Number(menu.costCalc.totalUtilityCost || 0).toLocaleString('id-ID')}`)
  console.log()
  
  console.log('🔧 BIAYA OPERASIONAL:')
  console.log(`   Packaging Cost: Rp ${Number(menu.costCalc.packagingCost || 0).toLocaleString('id-ID')}`)
  console.log(`   Equipment Cost: Rp ${Number(menu.costCalc.equipmentCost || 0).toLocaleString('id-ID')}`)
  console.log(`   Cleaning Cost: Rp ${Number(menu.costCalc.cleaningCost || 0).toLocaleString('id-ID')}`)
  console.log()
  
  console.log('📈 OVERHEAD & TOTAL:')
  console.log(`   Overhead Cost: Rp ${Number(menu.costCalc.overheadCost || 0).toLocaleString('id-ID')}`)
  console.log(`   Total Direct Cost: Rp ${Number(menu.costCalc.totalDirectCost || 0).toLocaleString('id-ID')}`)
  console.log(`   GRAND TOTAL COST: Rp ${Number(menu.costCalc.grandTotalCost || 0).toLocaleString('id-ID')}`)
  console.log()
  
  console.log('📊 PER PORSI:')
  console.log(`   Planned Portions: ${menu.costCalc.plannedPortions || 0} porsi`)
  console.log(`   Cost Per Portion: Rp ${Number(menu.costCalc.costPerPortion || 0).toLocaleString('id-ID')}`)
  console.log()
  
  console.log('=' .repeat(80))
  console.log('🔎 ANALYSIS:')
  console.log('-'.repeat(80))
  
  const ingredientCostFromCalc = Number(menu.costCalc.totalIngredientCost || 0)
  const costPerPortionFromCalc = Number(menu.costCalc.costPerPortion || 0)
  const grandTotalFromCalc = Number(menu.costCalc.grandTotalCost || 0)
  const plannedPortions = menu.costCalc.plannedPortions || 1
  
  console.log()
  console.log('Ingredient Cost Comparison:')
  console.log(`  - Calculated from ingredients: Rp ${calculatedTotal.toLocaleString('id-ID')}`)
  console.log(`  - Stored in costCalc table: Rp ${ingredientCostFromCalc.toLocaleString('id-ID')}`)
  console.log(`  - Difference: Rp ${(calculatedTotal - ingredientCostFromCalc).toLocaleString('id-ID')}`)
  console.log()
  
  console.log('Cost Per Portion Verification:')
  console.log(`  - Grand Total: Rp ${grandTotalFromCalc.toLocaleString('id-ID')}`)
  console.log(`  - Planned Portions: ${plannedPortions}`)
  console.log(`  - Expected Cost/Portion: Rp ${(grandTotalFromCalc / plannedPortions).toLocaleString('id-ID')}`)
  console.log(`  - Stored Cost/Portion: Rp ${costPerPortionFromCalc.toLocaleString('id-ID')}`)
  console.log()
  
  if (costPerPortionFromCalc === grandTotalFromCalc / plannedPortions) {
    console.log('✅ Cost per portion calculation is CORRECT!')
  } else {
    console.log('❌ Cost per portion calculation has ERROR!')
  }
  console.log()
  
  console.log('=' .repeat(80))
  console.log('💡 WHAT FRONTEND DISPLAYS:')
  console.log('-'.repeat(80))
  console.log()
  console.log('Tab "Analisis Biaya" akan menampilkan:')
  console.log(`  - Total Biaya Produksi: Rp ${grandTotalFromCalc.toLocaleString('id-ID')}`)
  console.log(`  - Per Porsi: Rp ${costPerPortionFromCalc.toLocaleString('id-ID')}`)
  console.log(`  - Bahan Baku: Rp ${ingredientCostFromCalc.toLocaleString('id-ID')}`)
  console.log(`  - Tenaga Kerja: Rp ${Number(menu.costCalc.totalLaborCost || 0).toLocaleString('id-ID')}`)
  console.log(`  - Utilitas: Rp ${Number(menu.costCalc.totalUtilityCost || 0).toLocaleString('id-ID')}`)
  console.log()
  
  await prisma.$disconnect()
}

checkMenuCostCalc().catch(console.error)
