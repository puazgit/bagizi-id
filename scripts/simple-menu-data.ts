/**
 * Simple script to get real menu data
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('📊 Fetching menu data...\n')
    
    const menus = await prisma.nutritionMenu.findMany({
      take: 2,
      include: {
        program: true,
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        nutritionCalc: true,
        costCalc: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Found ${menus.length} menus\n`)
    
    for (const menu of menus) {
      console.log('='.repeat(80))
      console.log(`📋 ${menu.menuName} (${menu.menuCode})`)
      console.log('='.repeat(80))
      console.log(`Serving Size: ${menu.servingSize}g`)
      console.log(`Batch Size: ${menu.batchSize} portions`)
      console.log(`Cost Per Serving: Rp ${menu.costPerServing || 0}`)
      console.log(`\nIngredients (${menu.ingredients.length}):`)
      
      for (const ing of menu.ingredients) {
        console.log(`  - ${ing.inventoryItem.itemName}: ${ing.quantity} ${ing.inventoryItem.unit}`)
        console.log(`    Cost/unit: Rp ${ing.inventoryItem.costPerUnit || 0}`)
      }
      console.log('')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
