/**
 * Production Seed Script - Safe for Coolify
 * Only seeds if database is empty (no SPPG entities exist)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Checking if production database needs seeding...')

  // Check if data already exists
  const existingSppg = await prisma.sPPG.count()
  
  if (existingSppg > 0) {
    console.log('✅ Database already has data. Skipping seed.')
    console.log(`   Found ${existingSppg} SPPG entities.`)
    return
  }

  console.log('📊 Database is empty. Starting seed process...')

  // Import and run seed modules
  const { seedSppg } = await import('../prisma/seeds/sppg-seed')
  const { seedDemoUsers2025 } = await import('../prisma/seeds/user-seed')
  const { seedRegional } = await import('../prisma/seeds/regional-seed')
  const { seedNutrition } = await import('../prisma/seeds/nutrition-seed')
  const { seedInventory } = await import('../prisma/seeds/inventory-seed')
  const { seedMenu } = await import('../prisma/seeds/menu-seed')

  try {
    console.log('1️⃣ Seeding SPPG Demo 2025...')
    const sppgResult = await seedSppg(prisma)
    const demoSppg = sppgResult.sppgs[0]
    console.log(`   ✅ Created Demo SPPG: ${demoSppg.code}`)

    console.log('2️⃣ Seeding regional data (Purwakarta)...')
    await seedRegional(prisma)
    console.log('   ✅ Regional data seeded')

    console.log('3️⃣ Seeding comprehensive demo users (all roles)...')
    const users = await seedDemoUsers2025(prisma, sppgResult.sppgs)
    console.log(`   ✅ Created ${users.length} demo users`)

    console.log('4️⃣ Seeding nutrition standards...')
    await seedNutrition(prisma)
    console.log('   ✅ Nutrition standards seeded')

    console.log('5️⃣ Seeding inventory items...')
    await seedInventory()
    console.log('   ✅ Inventory items seeded')

    console.log('6️⃣ Seeding menu data (programs, menus, ingredients, nutrition & cost)...')
    const menuPrograms = await seedMenu(prisma, sppgResult.sppgs, users)
    console.log(`   ✅ Menu data seeded (${menuPrograms.length} programs)`)

    console.log('\n🎉 Demo 2025 database seeding completed!')
    console.log('\n📝 Summary:')
    console.log(`   - Demo SPPG: ${demoSppg.code} (${demoSppg.name})`)
    console.log(`   - Demo Users: ${users.length} (All roles)`)
    console.log(`   - Menu Programs: ${menuPrograms.length} (with complete ingredients)`)
    console.log(`   - Password: demo2025`)
    console.log(`   - Ready for comprehensive testing`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
