import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkIngredients() {
  const menus = await prisma.nutritionMenu.findMany({
    include: {
      _count: {
        select: { ingredients: true }
      }
    },
    orderBy: { menuCode: 'asc' }
  })
  
  console.log('\n📊 Ingredients per Menu:\n')
  let total = 0
  menus.forEach(m => {
    const count = m._count.ingredients
    total += count
    console.log(`${m.menuCode}: ${m.menuName} - ${count} ingredients`)
  })
  console.log(`\n✅ Total: ${total} ingredients`)
  console.log(`🎯 Expected: 122 ingredients`)
  console.log(`${total === 122 ? '✅ MATCH!' : `⚠️  Difference: ${122 - total} missing`}`)
  
  await prisma.$disconnect()
}

checkIngredients()
