/**
 * @fileoverview Master seed file untuk database Bagizi-ID
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Prisma Seed Architecture
 */

import { PrismaClient } from '@prisma/client'
import { seedSppg } from './seeds/sppg-seed'
import { seedDemoUsers2025 } from './seeds/user-seed'
import { seedRegional } from './seeds/regional-seed'
import { seedNutrition } from './seeds/nutrition-seed'
import { seedInventory } from './seeds/inventory-seed'
import { seedMenu } from './seeds/menu-seed'
import { seedAllergens } from './seeds/allergen-seed'
import { seedSchools } from './seeds/schools-seed'
import { seedMenuPlanning } from './seeds/menu-planning-seed'
import { seedProcurement } from './seeds/procurement-seed'
import { seedProduction } from './seeds/production-seed'
import { seedVehicles } from './seeds/vehicle-seed'
import { seedDistributionComprehensive } from './seeds/distribution-seed'

const prisma = new PrismaClient()

/**
 * Reset database by deleting all data in reverse order of dependencies
 * This ensures clean state before seeding
 */
async function resetDatabase() {
  console.log('🔄 Resetting database (deleting all data)...')
  
  try {
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
    
    // Menu domain - delete ingredients FIRST before inventory
    await prisma.menuNutritionCalculation.deleteMany()
    await prisma.menuCostCalculation.deleteMany()
    await prisma.recipeStep.deleteMany()
    await prisma.menuIngredient.deleteMany() // ✅ CRITICAL: Delete before inventory
    await prisma.nutritionMenu.deleteMany()
    
    // Inventory - now safe to delete
    await prisma.stockMovement.deleteMany()
    await prisma.inventoryItem.deleteMany()
    
    // Schools and Programs
    await prisma.schoolBeneficiary.deleteMany()
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
  console.log('🌱 Starting Bagizi-ID Demo 2025 Database Seeding...')
  console.log('📅 Date: October 22, 2025')
  console.log('')

  try {
    // Step 0: Reset database first (cleans all existing data)
    await resetDatabase()
    console.log('')

    // 1. Core Platform Data (Following Copilot Instruction Pattern)
    console.log('🗺️  Step 1: Seeding regional data (Purwakarta, Jawa Barat)...')
    const { jawaBarat, purwakarta, purwakartaDistrict, nagriTengah } = await seedRegional(prisma)
    
    console.log('📊 Step 2: Seeding SPPG Demo 2025 entity...')
    const sppgs = await seedSppg(prisma, {
      provinceId: jawaBarat.id,
      regencyId: purwakarta.id,
      districtId: purwakartaDistrict.id,
      villageId: nagriTengah.id
    })

    console.log('👥 Step 3: Seeding demo users 2025 (16 users with all roles)...')
    const users = await seedDemoUsers2025(prisma, sppgs)

    // 2. Master Data
    console.log('🥗 Step 4: Seeding nutrition standards...')
    await seedNutrition(prisma)

    console.log('🏷️  Step 5: Seeding allergen data...')
    await seedAllergens(prisma)

    console.log('📦 Step 6: Seeding inventory items...')
    await seedInventory()

    // 3. Menu Domain Data
    console.log('🍽️  Step 7: Seeding menu domain (programs, menus, ingredients, calculations)...')
    const programs = await seedMenu(prisma, sppgs, users)

    // 4. School Beneficiaries (needs programs)
    console.log('🏫 Step 8: Seeding school beneficiaries...')
    await seedSchools(prisma, sppgs, programs, {
      villageId: nagriTengah.id,
      districtId: purwakartaDistrict.id,
      regencyId: purwakarta.id,
      provinceId: jawaBarat.id
    })

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
    console.log('✅ Bagizi-ID Demo 2025 Database Seeding Completed!')
    console.log('')
    console.log('📋 Summary (October 22, 2025):')
    console.log(`   - SPPG Demo: ${sppgs.length} entity (DEMO-2025)`)
    console.log(`   - Demo Users: ${users.length} accounts (all 16 roles)`)
    console.log(`   - Default Password: demo2025`)
    console.log(`   - Demo Period: January 1 - December 31, 2025`)
    console.log('')
    console.log('🚀 Quick Start:')
    console.log('   1. npm run dev')
    console.log('   2. http://localhost:3000/login')
    console.log('   3. See DEMO_CREDENTIALS.md for login info')
    console.log('')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()