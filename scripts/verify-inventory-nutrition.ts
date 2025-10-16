/**
 * Verify Inventory Nutrition Data
 * Check that all inventory items have complete nutrition data
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('\n🔍 Verifying Inventory Nutrition Data...\n')
  
  // Check key ingredients used in Nasi Goreng menu
  const keyIngredients = await prisma.inventoryItem.findMany({
    where: {
      itemCode: {
        in: ['BRP-001', 'AYM-001', 'TLR-001', 'WRT-001', 'BWM-001']
      }
    },
    select: {
      itemName: true,
      itemCode: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true
    }
  })
  
  console.log('Key Ingredients Nutrition Data:')
  console.log('================================')
  keyIngredients.forEach(item => {
    console.log(`\n${item.itemName} (${item.itemCode}):`)
    console.log(`  Calories: ${item.calories} kcal`)
    console.log(`  Protein: ${item.protein}g`)
    console.log(`  Carbs: ${item.carbohydrates}g`)
    console.log(`  Fat: ${item.fat}g`)
    console.log(`  Fiber: ${item.fiber}g`)
  })
  
  // Count items with complete nutrition data
  const totalItems = await prisma.inventoryItem.count()
  const itemsWithNutrition = await prisma.inventoryItem.count({
    where: {
      AND: [
        { calories: { not: null } },
        { protein: { not: null } },
        { carbohydrates: { not: null } },
        { fat: { not: null } },
        { fiber: { not: null } }
      ]
    }
  })
  
  console.log(`\n\n📊 Summary:`)
  console.log(`  Total Items: ${totalItems}`)
  console.log(`  Items with Complete Nutrition: ${itemsWithNutrition}`)
  console.log(`  Coverage: ${((itemsWithNutrition / totalItems) * 100).toFixed(1)}%`)
  
  if (itemsWithNutrition === totalItems) {
    console.log(`\n✅ SUCCESS: All inventory items have complete nutrition data!`)
  } else {
    console.log(`\n⚠️  WARNING: Some items are missing nutrition data`)
    
    // Show which items are missing nutrition data
    const itemsMissingNutrition = await prisma.inventoryItem.findMany({
      where: {
        OR: [
          { calories: null },
          { protein: null },
          { carbohydrates: null },
          { fat: null },
          { fiber: null }
        ]
      },
      select: {
        itemName: true,
        itemCode: true,
        calories: true,
        protein: true,
        carbohydrates: true,
        fat: true,
        fiber: true
      }
    })
    
    console.log(`\n\nItems Missing Nutrition Data:`)
    itemsMissingNutrition.forEach(item => {
      console.log(`  - ${item.itemName} (${item.itemCode})`)
    })
  }
}

verify()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
