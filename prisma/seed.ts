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
import { seedSchools } from './seeds/schools-seed'
import { seedMenuPlanning } from './seeds/menu-planning-seed'
import { seedProcurement } from './seeds/procurement-seed'
import { seedProduction } from './seeds/production-seed'
import { seedVehicles } from './seeds/vehicle-seed'
import { seedDistributionComprehensive } from './seeds/distribution-comprehensive-seed'

const prisma = new PrismaClient()

/**
 * Reset database by deleting all data in reverse order of dependencies
 * This ensures clean state before seeding
 */
async function resetDatabase() {
  console.log('🔄 Resetting database (deleting all data)...')
  
  try {
    // Skip reset if tables don't exist yet (fresh database)
    // This happens after `prisma migrate reset` which already clears all data
    console.log('  ℹ️  Skipping manual reset (already done by migrate reset)')
    return
    
    // Delete in reverse order of dependencies to avoid foreign key constraints
    
    // Domain data (depends on everything)
    await prisma.foodDistribution.deleteMany()
    await prisma.foodProduction.deleteMany()
    await prisma.procurementItem.deleteMany()
    await prisma.procurement.deleteMany()
    await prisma.procurementPlan.deleteMany()
    await prisma.supplierProduct.deleteMany()
    await prisma.supplierContract.deleteMany()
    await prisma.supplierEvaluation.deleteMany()
    await prisma.supplier.deleteMany()
    
    // Menu planning
    await prisma.menuAssignment.deleteMany()
    await prisma.menuPlan.deleteMany()
    await prisma.menuPlanTemplate.deleteMany()
    
    // Menu domain
    await prisma.menuNutritionCalculation.deleteMany()
    await prisma.menuCostCalculation.deleteMany()
    await prisma.recipeStep.deleteMany()
    await prisma.menuIngredient.deleteMany()
    await prisma.nutritionMenu.deleteMany()
    
    // Inventory
    await prisma.stockMovement.deleteMany()
    await prisma.inventoryItem.deleteMany()
    
    // Schools and Programs
    await prisma.schoolBeneficiary.deleteMany() // ✅ NEW: Delete schools before programs
    await prisma.nutritionProgram.deleteMany()
    
    // Master data
    await prisma.allergen.deleteMany()
    await prisma.nutritionStandard.deleteMany()
    
    // Users and SPPG
    await prisma.auditLog.deleteMany()
    await prisma.user.deleteMany()
    await prisma.sPPG.deleteMany()
    
    console.log('  ✅ Database reset completed!')
  } catch (error) {
    console.error('  ❌ Error resetting database:', error)
    throw error
  }
}

async function main() {
  console.log('🌱 Starting database seeding...')
  console.log('')

  try {
    // Step 0: Reset database first
    await resetDatabase()
    console.log('')

    // 1. Core Platform Data
    console.log('📊 Seeding SPPG entities...')
    const { sppgs, nagriTengahVillageId } = await seedSppg(prisma)

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
    const programs = await seedMenu(prisma, sppgs, users)

    // 4. School Beneficiaries (needs programs)
    console.log('🏫 Seeding school beneficiaries...')
    await seedSchools(prisma, sppgs, programs, nagriTengahVillageId)

    // 5. Menu Planning Domain Data
    console.log('📅 Seeding menu planning domain (plans, assignments, templates)...')
    await seedMenuPlanning(prisma, sppgs, users)

    // 5. Procurement Domain Data (Suppliers, Purchase Orders)
    console.log('🛒 Seeding procurement domain (suppliers, products, plans, procurements)...')
    await seedProcurement(prisma, sppgs, programs)

    // 6. Production Domain Data (Integrated with SPPG Purwakarta)
    console.log('🏭 Seeding production domain (SPPG Purwakarta productions)...')
    await seedProduction(prisma, sppgs, programs)

    // 6.5. Vehicles for Distribution (needs SPPG)
    console.log('🚗 Seeding vehicles for distribution operations...')
    await seedVehicles(prisma, sppgs)

    // 7. Distribution Domain Data (Integrated with SPPG Purwakarta)
    console.log('🚚 Seeding distribution domain (SPPG Purwakarta distributions)...')
    await seedDistributionComprehensive(prisma, sppgs, programs)

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