/**
 * @fileoverview Master seed file untuk database Bagizi-ID
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Prisma Seed Architecture
 */

import { PrismaClient } from '@prisma/client'
import { seedSppg } from './seeds/sppg-seed'
import { seedUsers } from './seeds/user-seed'
import { seedNutrition } from './seeds/nutrition-seed'
import { seedInventory } from './seeds/inventory-seed'
import { seedMenu } from './seeds/menu-seed'
import { seedAllergens } from './seeds/allergen-seed'
import { seedMenuPlanning } from './seeds/menu-planning-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Core Platform Data
    console.log('📊 Seeding SPPG entities...')
    const sppgs = await seedSppg(prisma)

    console.log('👥 Seeding users and roles...')
    const users = await seedUsers(prisma, sppgs)

    // 2. Master Data
    console.log('🥗 Seeding nutrition data...')
    await seedNutrition(prisma)

    console.log('🏷️  Seeding allergen data...')
    await seedAllergens(prisma)

    console.log('📦 Seeding inventory items...')
    await seedInventory()

    // 3. Menu Domain Data
    console.log('🍽️  Seeding menu domain (programs, menus, ingredients, recipes, calculations)...')
    await seedMenu(prisma, sppgs, users)

    // 4. Menu Planning Domain Data
    console.log('📅 Seeding menu planning domain (plans, assignments, templates)...')
    await seedMenuPlanning(prisma, sppgs, users)

    console.log('')
    console.log('✅ Database seeding completed successfully!')
    console.log('')
    console.log('� Quick Start Guide:')
    console.log('  1. npm run dev - Start development server')
    console.log('  2. Visit http://localhost:3000/login')
    console.log('  3. Use credentials displayed above to login')
    console.log('  4. Explore SPPG dashboard and admin panel')
    console.log('')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()