/**
 * Debug script to check menu cost data in database and API response
 */

import { db } from '@/lib/prisma'

async function debugMenuCostData() {
  console.log('🔍 Debugging Menu Cost Data...\n')

  // Check specific menu that user is testing
  const menuId = 'cmh06cjoy004lsvyn00ltuyjg'
  
  // 1. Check database directly
  console.log('1️⃣ Database Query (Direct):')
  const menuFromDb = await db.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      costCalc: true,
      nutritionCalc: true
    }
  })

  if (!menuFromDb) {
    console.log('❌ Menu not found!')
    return
  }

  console.log('Menu:', menuFromDb.menuName)
  console.log('costPerServing (field):', menuFromDb.costPerServing)
  console.log('costCalc exists:', !!menuFromDb.costCalc)
  
  if (menuFromDb.costCalc) {
    console.log('costCalc.costPerPortion:', menuFromDb.costCalc.costPerPortion)
    console.log('costCalc.grandTotalCost:', menuFromDb.costCalc.grandTotalCost)
    console.log('costCalc.calculatedAt:', menuFromDb.costCalc.calculatedAt)
  }
  console.log()

  // 2. Check what menu list API returns
  console.log('2️⃣ Menu List Query (What API Returns):')
  const menusFromApi = await db.nutritionMenu.findMany({
    where: { id: menuId },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          sppgId: true
        }
      },
      costCalc: {
        select: {
          costPerPortion: true,
          grandTotalCost: true,
          calculatedAt: true
        }
      }
    }
  })

  if (menusFromApi.length > 0) {
    const menu = menusFromApi[0]
    console.log('Menu:', menu.menuName)
    console.log('costPerServing:', menu.costPerServing)
    console.log('costCalc:', menu.costCalc)
  }
  console.log()

  // 3. Check all menus with costCalc
  console.log('3️⃣ All Menus with Cost Calculations:')
  const allMenusWithCost = await db.nutritionMenu.findMany({
    where: {
      costCalc: {
        isNot: null
      }
    },
    include: {
      costCalc: {
        select: {
          costPerPortion: true,
          calculatedAt: true
        }
      }
    },
    take: 5
  })

  console.log(`Found ${allMenusWithCost.length} menus with cost calculations:`)
  allMenusWithCost.forEach(menu => {
    console.log(`- ${menu.menuName}:`)
    console.log(`  costPerServing: ${menu.costPerServing}`)
    console.log(`  costCalc.costPerPortion: ${menu.costCalc?.costPerPortion}`)
  })
  console.log()

  // 4. Check recent cost calculations
  console.log('4️⃣ Recent Cost Calculations:')
  const recentCosts = await db.menuCostCalculation.findMany({
    orderBy: {
      calculatedAt: 'desc'
    },
    take: 5,
    include: {
      menu: {
        select: {
          id: true,
          menuName: true
        }
      }
    }
  })

  console.log(`Found ${recentCosts.length} recent calculations:`)
  recentCosts.forEach(calc => {
    console.log(`- Menu: ${calc.menu.menuName}`)
    console.log(`  Menu ID: ${calc.menuId}`)
    console.log(`  Cost Per Portion: ${calc.costPerPortion}`)
    console.log(`  Calculated At: ${calc.calculatedAt}`)
    console.log()
  })
}

debugMenuCostData()
  .then(() => {
    console.log('✅ Debug complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
