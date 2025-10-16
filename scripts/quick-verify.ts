import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickCheck() {
  console.log('\n🔍 QUICK DATABASE VERIFICATION\n')
  
  const counts = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.nutritionProgram.count(),
    prisma.nutritionMenu.count(),
    prisma.menuIngredient.count(),
    prisma.recipeStep.count(),
    prisma.menuNutritionCalculation.count(),
    prisma.menuCostCalculation.count(),
  ])
  
  console.log('📊 Database Contents:')
  console.log(`✅ Inventory Items: ${counts[0]}/64`)
  console.log(`✅ Nutrition Programs: ${counts[1]}/2`)
  console.log(`✅ Nutrition Menus: ${counts[2]}/10`)
  console.log(`✅ Menu Ingredients: ${counts[3]}/122`)
  console.log(`✅ Recipe Steps: ${counts[4]}/65`)
  console.log(`✅ Nutrition Calculations: ${counts[5]}/10`)
  console.log(`✅ Cost Calculations: ${counts[6]}/10`)
  
  const allComplete = counts[0] === 64 && counts[1] === 2 && counts[2] === 10 && 
                      counts[4] === 65 && counts[5] === 10 && counts[6] === 10
  
  console.log(`\n${allComplete ? '🎉 DATABASE COMPLETE!' : '⚠️  Some data missing'}`)
  
  await prisma.$disconnect()
}

quickCheck()