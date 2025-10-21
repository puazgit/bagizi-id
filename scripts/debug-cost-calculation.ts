/**
 * Debug cost calculation - check actual data vs displayed
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function debugCostCalculation() {
  console.log('🔍 Debugging Cost Calculation...\n')

  try {
    // Get menu with ingredients and cost calc
    const menu = await db.nutritionMenu.findFirst({
      where: {
        ingredients: {
          some: {}
        }
      },
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
        },
        costCalc: true
      }
    })

    if (!menu) {
      console.log('❌ No menu found')
      return
    }

    console.log(`📋 Menu: ${menu.menuName}`)
    console.log(`   Serving Size: ${menu.servingSize}g\n`)

    console.log('📦 Ingredients Detail:')
    console.log('─'.repeat(80))
    
    let totalCalculated = 0
    
    for (const ing of menu.ingredients) {
      const itemCost = ing.inventoryItem.costPerUnit || 0
      const totalCost = ing.quantity * itemCost
      totalCalculated += totalCost
      
      console.log(`   ${ing.inventoryItem.itemName}`)
      console.log(`   - Quantity: ${ing.quantity} ${ing.inventoryItem.unit}`)
      console.log(`   - Cost/Unit: Rp ${itemCost.toLocaleString()}`)
      console.log(`   - Total: Rp ${totalCost.toLocaleString()}`)
      console.log('')
    }
    
    console.log('─'.repeat(80))
    console.log(`💰 Total Ingredient Cost (calculated): Rp ${totalCalculated.toLocaleString()}\n`)

    if (menu.costCalc) {
      console.log('📊 Saved Cost Calculation:')
      console.log(`   Total Ingredient Cost: Rp ${menu.costCalc.totalIngredientCost?.toLocaleString() || 0}`)
      console.log(`   Labor Cost: Rp ${menu.costCalc.totalLaborCost?.toLocaleString() || 0}`)
      console.log(`   Utility Cost: Rp ${menu.costCalc.totalUtilityCost?.toLocaleString() || 0}`)
      console.log(`   Overhead Cost: Rp ${menu.costCalc.overheadCost?.toLocaleString() || 0}`)
      console.log(`   Grand Total: Rp ${menu.costCalc.grandTotalCost?.toLocaleString() || 0}`)
      console.log(`   Cost Per Portion: Rp ${menu.costCalc.costPerPortion?.toLocaleString() || 0}`)
      
      // Check if breakdown is stored
      if (menu.costCalc.ingredientBreakdown) {
        console.log('\n📝 Ingredient Breakdown (from JSON):')
        const breakdown = menu.costCalc.ingredientBreakdown as any[]
        breakdown.forEach((item: any) => {
          console.log(`   - ${item.inventoryItemName}: ${item.quantity} ${item.unit} × Rp ${item.costPerUnit} = Rp ${item.totalCost}`)
        })
      }
    } else {
      console.log('⚠️  No cost calculation saved yet')
    }

    console.log('\n✅ Debug complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

debugCostCalculation()
