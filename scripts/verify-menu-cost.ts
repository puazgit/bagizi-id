/**
 * Verify specific menu cost calculation
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function verifyMenu() {
  console.log('🔍 Verifying Menu: Nasi Ayam Goreng Lalapan\n')

  try {
    const menu = await db.nutritionMenu.findFirst({
      where: {
        menuName: {
          contains: 'Nasi Ayam Goreng Lalapan',
          mode: 'insensitive'
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
      console.log('❌ Menu not found')
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

    // Calculate expected realistic cost
    console.log('✅ Cost Breakdown Analysis:')
    console.log('   Beras (0.08kg × Rp12,000/kg) = Rp 960')
    console.log('   Ayam (0.1kg × Rp45,000/kg) = Rp 4,500')
    console.log('   Tahu (0.05kg × Rp10,000/kg) = Rp 500')
    console.log('   Sayuran & bumbu (~Rp 1,000)')
    console.log('   ─────────────────────────────────')
    console.log(`   Expected: ~Rp 7,000 - Rp 8,000 per serving`)
    console.log(`   Actual: Rp ${totalCalculated.toLocaleString()}`)
    
    if (totalCalculated >= 6000 && totalCalculated <= 9000) {
      console.log('\n✅ REALISTIC COST! Calculations are correct!')
    } else {
      console.log('\n⚠️  Cost seems unusual, please verify')
    }

    if (menu.costCalc) {
      console.log('\n📊 Saved Cost Calculation:')
      console.log(`   Cost Per Portion: Rp ${menu.costCalc.costPerPortion?.toLocaleString() || 0}`)
    } else {
      console.log('\n⚠️  No cost calculation saved yet')
      console.log('   Click "Hitung Biaya Sekarang" in UI to save')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verifyMenu()
