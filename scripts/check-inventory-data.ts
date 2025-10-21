/**
 * Check if inventory items have nutrition & cost data
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function checkInventoryData() {
  console.log('📦 Checking Inventory Items Data...\n')

  try {
    // Get all inventory items
    const items = await db.inventoryItem.findMany({
      select: {
        id: true,
        itemName: true,
        category: true,
        unit: true,
        costPerUnit: true,
        calories: true,
        protein: true,
        carbohydrates: true,
        fat: true,
        fiber: true
      },
      take: 10
    })

    console.log(`Total items checked: ${items.length}\n`)

    let withCost = 0
    let withNutrition = 0
    let complete = 0

    for (const item of items) {
      const hasCost = item.costPerUnit !== null && item.costPerUnit > 0
      const hasNutrition = item.calories !== null || item.protein !== null
      
      if (hasCost) withCost++
      if (hasNutrition) withNutrition++
      if (hasCost && hasNutrition) complete++

      console.log(`📌 ${item.itemName}`)
      console.log(`   Category: ${item.category}`)
      console.log(`   Cost: ${hasCost ? `✅ Rp ${item.costPerUnit?.toLocaleString()}/${item.unit}` : '❌ No cost data'}`)
      console.log(`   Nutrition: ${hasNutrition ? `✅ ${item.calories}kcal, ${item.protein}g protein` : '❌ No nutrition data'}`)
      console.log('')
    }

    console.log('📊 Summary:')
    console.log(`   Items with cost: ${withCost}/${items.length} (${((withCost/items.length)*100).toFixed(0)}%)`)
    console.log(`   Items with nutrition: ${withNutrition}/${items.length} (${((withNutrition/items.length)*100).toFixed(0)}%)`)
    console.log(`   Items complete: ${complete}/${items.length} (${((complete/items.length)*100).toFixed(0)}%)`)

    if (complete === items.length) {
      console.log('\n✅ All inventory items have complete data!')
    } else {
      console.log('\n⚠️  Some items missing cost or nutrition data')
      console.log('   Cost & nutrition calculations may be incomplete')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkInventoryData()
