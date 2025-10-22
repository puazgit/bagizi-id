/**
 * @fileoverview Seed file untuk Menu Planning domain (Purwakarta focused)
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Prisma Seed Architecture
 * 
 * Domain: Menu Planning
 * Models: MenuPlan, MenuAssignment, MenuPlanTemplate
 * Dependencies: NutritionProgram, NutritionMenu, SPPG, User
 * 
 * IMPORTANT: This seed works with existing SPPG Demo 2025 data:
 * - SPPG Code: DEMO-2025 (SPPG Demo 2025)
 * - Admin User: ahligizi@demo.sppg.id (Ahli Gizi Demo)
 * - Program: PWK-PMAS-2025 (Program Makan Siang Anak Sekolah)
 */

import { PrismaClient, SPPG, User, MenuPlanStatus, AssignmentStatus, MealType } from '@prisma/client'

/**
 * Seed Menu Planning data for Purwakarta SPPG
 * Creates: Menu Plans, Menu Assignments, Menu Plan Templates
 * 
 * @param prisma - Prisma Client instance
 * @param sppgs - Array of SPPG entities (dependency)
 * @param users - Array of User entities (dependency)
 * @returns Promise<void>
 */
export async function seedMenuPlanning(
  prisma: PrismaClient,
  sppgs: SPPG[],
  users: User[]
): Promise<void> {
  console.log('  → Creating Menu Planning data for SPPG Purwakarta...')

  // Get Purwakarta SPPG
  const purwakartaSppg = sppgs.find(s => s.code === 'DEMO-2025')
  if (!purwakartaSppg) {
    console.log('  ⚠️  SPPG Purwakarta not found. Skipping menu planning seed.')
    return
  }

  // Get Program for Purwakarta
  const programs = await prisma.nutritionProgram.findMany({
    where: { sppgId: purwakartaSppg.id },
  })

  if (programs.length === 0) {
    console.log('  ⚠️  No nutrition programs found for SPPG Purwakarta. Skipping.')
    return
  }

  const program = programs[0] // Use first program (PWK-PMAS-2025)

  // Get Menus for this program with their nutrition and cost calculations
  const menus = await prisma.nutritionMenu.findMany({
    where: { programId: program.id },
    include: {
      nutritionCalc: true, // MenuNutritionCalculation (one-to-one)
      costCalc: true,      // MenuCostCalculation (one-to-one)
    },
  })

  if (menus.length === 0) {
    console.log(`  ⚠️  No menus found for program ${program.programCode}. Skipping.`)
    return
  }

  // Get creator user (admin@sppg-purwakarta.com)
  const adminUser = users.find(u => u.email === 'admin@sppg-purwakarta.com')
  if (!adminUser) {
    console.log('  ⚠️  Admin user for Purwakarta not found. Skipping.')
    return
  }

  // Get approver user (kepala@sppg-purwakarta.com or same admin)
  const kepalaUser = users.find(u => u.email === 'kepala@sppg-purwakarta.com')
  const approverUser = kepalaUser || adminUser

  // Clean up existing data to avoid duplicates
  console.log('  → Cleaning up existing menu planning data...')
  await prisma.menuAssignment.deleteMany({
    where: { menuPlan: { sppgId: purwakartaSppg.id } }
  })
  await prisma.menuPlan.deleteMany({
    where: { sppgId: purwakartaSppg.id }
  })
  await prisma.menuPlanTemplate.deleteMany({
    where: { sppgId: purwakartaSppg.id }
  })

  let totalPlans = 0
  let totalAssignments = 0
  let totalTemplates = 0

  // === 1. DRAFT Menu Plan (Current Month - November 2025) ===
  const draftStartDate = new Date('2025-11-01')
  const draftEndDate = new Date('2025-11-30')
  const draftDays = 30

  const draftPlan = await prisma.menuPlan.upsert({
    where: {
      id: 'menu-plan-draft-pwk-nov-2025',
    },
    update: {},
    create: {
      id: 'menu-plan-draft-pwk-nov-2025',
      programId: program.id,
      sppgId: purwakartaSppg.id,
      createdBy: adminUser.id,
      name: 'Rencana Menu November 2025 - DRAFT',
      description: 'Rencana menu bulanan yang masih dalam tahap penyusunan untuk Program Makan Siang Anak Sekolah',
      startDate: draftStartDate,
      endDate: draftEndDate,
      status: MenuPlanStatus.DRAFT,
      isDraft: true,
      isActive: false,
      isArchived: false,
      totalDays: draftDays,
      totalMenus: 0, // Will be updated
      averageCostPerDay: 0,
      totalEstimatedCost: 0,
      nutritionScore: null,
      varietyScore: null,
      costEfficiency: null,
      meetsNutritionStandards: false,
      meetsbudgetConstraints: false,
      planningRules: {
        maxBudgetPerDay: 3500000, // Rp 3.5jt per hari (5000 siswa × Rp 700)
        minVarietyScore: 70,
        maxMenuRepetitionPerWeek: 2,
      },
    },
  })
  totalPlans++

  // Create 7 days of assignments for draft plan (first week only - weekdays)
  const draftAssignments = []
  for (let i = 0; i < 7; i++) {
    const assignDate = new Date(draftStartDate)
    assignDate.setDate(assignDate.getDate() + i)

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (assignDate.getDay() === 0 || assignDate.getDay() === 6) continue

    // Assign 1 meal per day: MAKAN_SIANG
    const mealType = MealType.MAKAN_SIANG

    // Pick random menu for this meal type
    const suitableMenus = menus.filter((m) => m.mealType === mealType)
    if (suitableMenus.length === 0) continue

    const menu = suitableMenus[Math.floor(Math.random() * suitableMenus.length)]
    const menuCost = menu.costCalc?.costPerPortion || menu.costPerServing // Use calculated cost or fallback to base cost

    // Check if assignment already exists for this date and meal type
    const existingAssignment = await prisma.menuAssignment.findFirst({
      where: {
        menuPlanId: draftPlan.id,
        assignedDate: assignDate,
        mealType: mealType,
      },
    })

    if (existingAssignment) {
      continue // Skip if already exists
    }

    const assignment = await prisma.menuAssignment.create({
      data: {
        menuPlanId: draftPlan.id,
        menuId: menu.id,
        assignedDate: assignDate,
        mealType: mealType,
        plannedPortions: program.targetRecipients, // Use targetRecipients
        estimatedCost: menuCost * program.targetRecipients,
        calories: menu.nutritionCalc?.totalCalories || 700, // Use calculated nutrition
        protein: menu.nutritionCalc?.totalProtein || 20,
        carbohydrates: menu.nutritionCalc?.totalCarbs || 95,
        fat: menu.nutritionCalc?.totalFat || 23,
        isSubstitute: false,
        status: AssignmentStatus.PLANNED,
        isProduced: false,
        isDistributed: false,
      },
    })
    draftAssignments.push(assignment)
    totalAssignments++
  }

  // Update draft plan with totals
  const totalCost = draftAssignments.reduce((sum, a) => sum + a.estimatedCost, 0)
  await prisma.menuPlan.update({
    where: { id: draftPlan.id },
    data: {
      totalMenus: draftAssignments.length,
      totalEstimatedCost: totalCost,
      averageCostPerDay: draftAssignments.length > 0 ? totalCost / draftAssignments.length : 0,
    },
  })

  console.log(`    ✓ DRAFT plan created: ${draftAssignments.length} assignments`)

  // === 2. APPROVED Menu Plan (October 2025) ===
  const approvedStartDate = new Date('2025-10-01')
  const approvedEndDate = new Date('2025-10-31')
  const approvedDays = 31

  const approvedPlan = await prisma.menuPlan.upsert({
    where: {
      id: 'menu-plan-approved-pwk-oct-2025',
    },
    update: {},
    create: {
      id: 'menu-plan-approved-pwk-oct-2025',
      programId: program.id,
      sppgId: purwakartaSppg.id,
      createdBy: adminUser.id,
      approvedBy: approverUser.id,
      name: 'Rencana Menu Oktober 2025 - APPROVED',
      description: 'Rencana menu bulanan yang telah disetujui dan siap dipublikasikan',
      startDate: approvedStartDate,
      endDate: approvedEndDate,
      status: MenuPlanStatus.APPROVED,
      isDraft: false,
      isActive: false,
      isArchived: false,
      totalDays: approvedDays,
      totalMenus: 0,
      averageCostPerDay: 0,
      totalEstimatedCost: 0,
      nutritionScore: 85.5,
      varietyScore: 78.2,
      costEfficiency: 92.3,
      meetsNutritionStandards: true,
      meetsbudgetConstraints: true,
      planningRules: {
        maxBudgetPerDay: 3500000,
        minVarietyScore: 70,
        maxMenuRepetitionPerWeek: 2,
      },
    },
  })
  totalPlans++

  // Create full month assignments for approved plan (weekdays only)
  const approvedAssignments = []
  for (let i = 0; i < approvedDays; i++) {
    const assignDate = new Date(approvedStartDate)
    assignDate.setDate(assignDate.getDate() + i)

    // Skip weekends
    if (assignDate.getDay() === 0 || assignDate.getDay() === 6) continue

    const mealType = MealType.MAKAN_SIANG
    const suitableMenus = menus.filter((m) => m.mealType === mealType)
    if (suitableMenus.length === 0) continue

    const menu = suitableMenus[Math.floor(Math.random() * suitableMenus.length)]
    const menuCost = menu.costCalc?.costPerPortion || menu.costPerServing

    const assignment = await prisma.menuAssignment.create({
      data: {
        menuPlanId: approvedPlan.id,
        menuId: menu.id,
        assignedDate: assignDate,
        mealType: mealType,
        plannedPortions: program.targetRecipients,
        estimatedCost: menuCost * program.targetRecipients,
        calories: menu.nutritionCalc?.totalCalories || 700,
        protein: menu.nutritionCalc?.totalProtein || 20,
        carbohydrates: menu.nutritionCalc?.totalCarbs || 95,
        fat: menu.nutritionCalc?.totalFat || 23,
        isSubstitute: false,
        status: AssignmentStatus.CONFIRMED,
        isProduced: false,
        isDistributed: false,
      },
    })
    approvedAssignments.push(assignment)
    totalAssignments++
  }

  const approvedTotalCost = approvedAssignments.reduce((sum, a) => sum + a.estimatedCost, 0)
  await prisma.menuPlan.update({
    where: { id: approvedPlan.id },
    data: {
      totalMenus: approvedAssignments.length,
      totalEstimatedCost: approvedTotalCost,
      averageCostPerDay: approvedAssignments.length > 0 ? approvedTotalCost / approvedAssignments.length : 0,
    },
  })

  console.log(`    ✓ APPROVED plan created: ${approvedAssignments.length} assignments`)

  // === 3. ACTIVE Menu Plan (September 2025) ===
  const activeStartDate = new Date('2025-09-01')
  const activeEndDate = new Date('2025-09-30')
  const activeDays = 30

  const activePlan = await prisma.menuPlan.upsert({
    where: {
      id: 'menu-plan-active-pwk-sep-2025',
    },
    update: {},
    create: {
      id: 'menu-plan-active-pwk-sep-2025',
      programId: program.id,
      sppgId: purwakartaSppg.id,
      createdBy: adminUser.id,
      approvedBy: approverUser.id,
      name: 'Rencana Menu September 2025 - ACTIVE',
      description: 'Rencana menu bulanan yang sedang berjalan',
      startDate: activeStartDate,
      endDate: activeEndDate,
      status: MenuPlanStatus.ACTIVE,
      isDraft: false,
      isActive: true,
      isArchived: false,
      publishedAt: activeStartDate,
      totalDays: activeDays,
      totalMenus: 0,
      averageCostPerDay: 0,
      totalEstimatedCost: 0,
      nutritionScore: 88.7,
      varietyScore: 82.5,
      costEfficiency: 89.8,
      meetsNutritionStandards: true,
      meetsbudgetConstraints: true,
      planningRules: {
        maxBudgetPerDay: 3500000,
        minVarietyScore: 70,
        maxMenuRepetitionPerWeek: 2,
      },
    },
  })
  totalPlans++

  // Create full month assignments (some past = produced, some future = confirmed)
  const activeAssignments = []
  const today = new Date()
  for (let i = 0; i < activeDays; i++) {
    const assignDate = new Date(activeStartDate)
    assignDate.setDate(assignDate.getDate() + i)

    // Skip weekends
    if (assignDate.getDay() === 0 || assignDate.getDay() === 6) continue

    const mealType = MealType.MAKAN_SIANG
    const suitableMenus = menus.filter((m) => m.mealType === mealType)
    if (suitableMenus.length === 0) continue

    const menu = suitableMenus[Math.floor(Math.random() * suitableMenus.length)]
    const menuCost = menu.costCalc?.costPerPortion || menu.costPerServing

    // All dates in September are in the past (relative to October 16, 2025)
    const isPast = assignDate < today
    const status = isPast
      ? i % 3 === 0
        ? AssignmentStatus.DISTRIBUTED
        : AssignmentStatus.PRODUCED
      : AssignmentStatus.CONFIRMED

    const assignment = await prisma.menuAssignment.create({
      data: {
        menuPlanId: activePlan.id,
        menuId: menu.id,
        assignedDate: assignDate,
        mealType: mealType,
        plannedPortions: program.targetRecipients,
        estimatedCost: menuCost * program.targetRecipients,
        calories: menu.nutritionCalc?.totalCalories || 700,
        protein: menu.nutritionCalc?.totalProtein || 20,
        carbohydrates: menu.nutritionCalc?.totalCarbs || 95,
        fat: menu.nutritionCalc?.totalFat || 23,
        isSubstitute: false,
        status: status,
        isProduced: isPast,
        isDistributed: status === AssignmentStatus.DISTRIBUTED,
        actualPortions: isPast ? program.targetRecipients : null,
        actualCost: isPast ? menuCost * program.targetRecipients : null,
      },
    })
    activeAssignments.push(assignment)
    totalAssignments++
  }

  const activeTotalCost = activeAssignments.reduce((sum, a) => sum + a.estimatedCost, 0)
  await prisma.menuPlan.update({
    where: { id: activePlan.id },
    data: {
      totalMenus: activeAssignments.length,
      totalEstimatedCost: activeTotalCost,
      averageCostPerDay: activeAssignments.length > 0 ? activeTotalCost / activeAssignments.length : 0,
    },
  })

  console.log(`    ✓ ACTIVE plan created: ${activeAssignments.length} assignments`)

  // === 4. COMPLETED Menu Plan (August 2025) ===
  const completedStartDate = new Date('2025-08-01')
  const completedEndDate = new Date('2025-08-31')
  const completedDays = 31

  const completedPlan = await prisma.menuPlan.upsert({
    where: {
      id: 'menu-plan-completed-pwk-aug-2025',
    },
    update: {},
    create: {
      id: 'menu-plan-completed-pwk-aug-2025',
      programId: program.id,
      sppgId: purwakartaSppg.id,
      createdBy: adminUser.id,
      approvedBy: approverUser.id,
      name: 'Rencana Menu Agustus 2025 - COMPLETED',
      description: 'Rencana menu bulanan yang telah selesai dilaksanakan',
      startDate: completedStartDate,
      endDate: completedEndDate,
      status: MenuPlanStatus.COMPLETED,
      isDraft: false,
      isActive: false,
      isArchived: false,
      publishedAt: completedStartDate,
      totalDays: completedDays,
      totalMenus: 0,
      averageCostPerDay: 0,
      totalEstimatedCost: 0,
      nutritionScore: 87.3,
      varietyScore: 80.1,
      costEfficiency: 91.5,
      meetsNutritionStandards: true,
      meetsbudgetConstraints: true,
      planningRules: {
        maxBudgetPerDay: 3500000,
        minVarietyScore: 70,
        maxMenuRepetitionPerWeek: 2,
      },
    },
  })
  totalPlans++

  // Create full month assignments (all completed)
  const completedAssignments = []
  for (let i = 0; i < completedDays; i++) {
    const assignDate = new Date(completedStartDate)
    assignDate.setDate(assignDate.getDate() + i)

    // Skip weekends
    if (assignDate.getDay() === 0 || assignDate.getDay() === 6) continue

    const mealType = MealType.MAKAN_SIANG
    const suitableMenus = menus.filter((m) => m.mealType === mealType)
    if (suitableMenus.length === 0) continue

    const menu = suitableMenus[Math.floor(Math.random() * suitableMenus.length)]
    const menuCost = menu.costCalc?.costPerPortion || menu.costPerServing

    const assignment = await prisma.menuAssignment.create({
      data: {
        menuPlanId: completedPlan.id,
        menuId: menu.id,
        assignedDate: assignDate,
        mealType: mealType,
        plannedPortions: program.targetRecipients,
        estimatedCost: menuCost * program.targetRecipients,
        calories: menu.nutritionCalc?.totalCalories || 700,
        protein: menu.nutritionCalc?.totalProtein || 20,
        carbohydrates: menu.nutritionCalc?.totalCarbs || 95,
        fat: menu.nutritionCalc?.totalFat || 23,
        isSubstitute: false,
        status: AssignmentStatus.COMPLETED,
        isProduced: true,
        isDistributed: true,
        actualPortions: program.targetRecipients,
        actualCost: menuCost * program.targetRecipients,
      },
    })
    completedAssignments.push(assignment)
    totalAssignments++
  }

  const completedTotalCost = completedAssignments.reduce((sum, a) => sum + a.estimatedCost, 0)
  await prisma.menuPlan.update({
    where: { id: completedPlan.id },
    data: {
      totalMenus: completedAssignments.length,
      totalEstimatedCost: completedTotalCost,
      averageCostPerDay: completedAssignments.length > 0 ? completedTotalCost / completedAssignments.length : 0,
    },
  })

  console.log(`    ✓ COMPLETED plan created: ${completedAssignments.length} assignments`)

  // === 5. Menu Plan Templates ===

  // Template 1: Standard Weekly Pattern
  await prisma.menuPlanTemplate.upsert({
    where: {
      id: 'template-weekly-pwk',
    },
    update: {},
    create: {
      id: 'template-weekly-pwk',
      menuPlanId: completedPlan.id,
      sppgId: purwakartaSppg.id,
      createdBy: adminUser.id,
      name: 'Pola Menu Mingguan Standar',
      description: 'Template pola menu mingguan yang dapat digunakan berulang setiap minggu',
      category: 'Weekly',
      templatePattern: {
        pattern: 'weekly',
        days: 5, // Weekdays only
        mealsPerDay: 1, // Makan siang only
        rotationCycle: 1,
        mealTypes: ['MAKAN_SIANG'],
      },
      useCount: 5,
      lastUsedAt: new Date(),
      isPublic: false,
    },
  })
  totalTemplates++

  // Template 2: Monthly Rotation
  await prisma.menuPlanTemplate.upsert({
    where: {
      id: 'template-monthly-pwk',
    },
    update: {},
    create: {
      id: 'template-monthly-pwk',
      menuPlanId: activePlan.id,
      sppgId: purwakartaSppg.id,
      createdBy: adminUser.id,
      name: 'Rotasi Menu Bulanan',
      description: 'Template rotasi menu bulanan dengan variasi tinggi untuk Program Makan Siang',
      category: 'Monthly',
      templatePattern: {
        pattern: 'monthly',
        days: 22, // Average weekdays in a month
        mealsPerDay: 1,
        rotationCycle: 4,
        mealTypes: ['MAKAN_SIANG'],
        varietyRules: {
          minDaysBetweenRepeat: 5,
          maxRepeatPerWeek: 2,
        },
      },
      useCount: 2,
      lastUsedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      isPublic: false,
    },
  })
  totalTemplates++

  // Template 3: Budget-Optimized Pattern
  await prisma.menuPlanTemplate.upsert({
    where: {
      id: 'template-budget-pwk',
    },
    update: {},
    create: {
      id: 'template-budget-pwk',
      menuPlanId: approvedPlan.id,
      sppgId: purwakartaSppg.id,
      createdBy: adminUser.id,
      name: 'Pola Menu Hemat Anggaran',
      description: 'Template pola menu yang dioptimalkan untuk efisiensi biaya dengan tetap memenuhi standar gizi',
      category: 'Budget',
      templatePattern: {
        pattern: 'budget-optimized',
        days: 5,
        mealsPerDay: 1,
        maxBudgetPerDay: 3000000, // Rp 3jt target
        costOptimization: true,
        mealTypes: ['MAKAN_SIANG'],
      },
      useCount: 8,
      lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isPublic: true, // Shared template
    },
  })
  totalTemplates++

  console.log(
    `  ✓ Created menu planning data for SPPG Purwakarta: ` +
      `${totalPlans} plans, ${totalAssignments} assignments, ${totalTemplates} templates`
  )
}
