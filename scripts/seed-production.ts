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
  const { seedUsers } = await import('../prisma/seeds/user-seed')
  const { seedNutrition } = await import('../prisma/seeds/nutrition-seed')
  const { seedInventory } = await import('../prisma/seeds/inventory-seed')
  const { seedMenu } = await import('../prisma/seeds/menu-seed')

  try {
    console.log('1️⃣ Seeding SPPG entities...')
    const sppgResult = await seedSppg(prisma)
    console.log(`   ✅ Created ${sppgResult.sppgs.length} SPPG entities`)

    console.log('2️⃣ Seeding users and roles...')
    const users = await seedUsers(prisma, sppgResult.sppgs)
    console.log(`   ✅ Created ${users.length} users`)

    console.log('3️⃣ Seeding nutrition standards...')
    await seedNutrition(prisma)
    console.log('   ✅ Nutrition data seeded')

    console.log('4️⃣ Seeding inventory items...')
    await seedInventory()
    console.log('   ✅ Inventory seeded')

    console.log('5️⃣ Seeding menu items...')
    await seedMenu(prisma, sppgResult.sppgs, users)
    console.log('   ✅ Menu seeded')

    console.log('🎉 Production database seeding completed successfully!')
    console.log('\n📝 Summary:')
    console.log(`   - SPPG Entities: ${sppgResult.sppgs.length}`)
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Ready for production use`)

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
