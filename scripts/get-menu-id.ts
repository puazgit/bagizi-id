/**
 * Quick script to get a menu ID for testing
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function getMenuId() {
  const menu = await db.nutritionMenu.findFirst({
    where: {
      ingredients: {
        some: {}
      }
    },
    select: {
      id: true,
      menuName: true,
      _count: {
        select: {
          ingredients: true
        }
      }
    }
  })

  if (menu) {
    console.log('✅ Found menu:')
    console.log(`   Name: ${menu.menuName}`)
    console.log(`   ID: ${menu.id}`)
    console.log(`   Ingredients: ${menu._count.ingredients}`)
    console.log('\n📋 Use this ID to test calculations:')
    console.log(`   curl -X POST http://localhost:3000/api/sppg/menu/${menu.id}/calculate-cost`)
  } else {
    console.log('❌ No menu with ingredients found')
  }

  await db.$disconnect()
}

getMenuId()
