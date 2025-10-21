/**
 * @fileoverview Menu domain seeding dengan data regional Purwakarta yang realistis
 * @description Comprehensive menu data termasuk programs, menus, ingredients, recipe steps,
 *              nutrition calculations, dan cost calculations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { PrismaClient, SPPG, User, NutritionProgram, NutritionMenu } from '@prisma/client'

/**
 * Seed complete menu domain data including:
 * - Nutrition Programs (2 programs)
 * - Nutrition Menus (10 menus)
 * - Menu Ingredients (50+ ingredients)
 * - Recipe Steps (60+ steps)
 * - Nutrition Calculations (10 calculations)
 * - Cost Calculations (10 calculations)
 * 
 * @param prisma - Prisma client instance
 * @param sppgs - Array of SPPG entities (Purwakarta SPPG)
 * @param users - Array of User entities
 * @returns Promise<void>
 */
export async function seedMenu(
  prisma: PrismaClient,
  sppgs: SPPG[],
  users: User[]
): Promise<{ id: string; name: string; sppgId: string }[]> {
  console.log('  → Creating Menu domain data...')

  // Get Demo SPPG (has inventory items)
  // Fix #1: Menu seed uses DEMO SPPG because it has complete inventory items
  const purwakartaSppg = sppgs.find(s => s.code === 'DEMO-SPPG-001')
  if (!purwakartaSppg) {
    console.log('  ⚠️  Demo SPPG not found, skipping menu seed')
    return []
  }

  // Get admin user for createdBy (use demo user)
  const adminUser = users.find(u => u.email === 'demo@sppg-purwakarta.com') || users.find(u => u.email === 'admin@sppg-purwakarta.com')
  if (!adminUser) {
    console.log('  ⚠️  Admin user not found, skipping menu seed')
    return []
  }

  // Fetch all inventory items first (needed for MenuIngredients)
  console.log('  → Fetching inventory items...')
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { 
      sppgId: purwakartaSppg.id,
      itemCode: { not: null } // Only items with itemCode
    },
    select: { id: true, itemCode: true, itemName: true, unit: true, costPerUnit: true }
  })
  console.log(`  ✓ Found ${inventoryItems.length} inventory items`)

  console.log('  → Creating Nutrition Programs...')
  const programs = await seedNutritionPrograms(prisma, purwakartaSppg)

  console.log('  → Creating Nutrition Menus...')
  const menus = await seedNutritionMenus(prisma, programs)

  console.log('  → Creating Menu Ingredients...')
  await seedMenuIngredients(prisma, menus, inventoryItems)

  console.log('  → Creating Recipe Steps...')
  await seedRecipeSteps(prisma, menus)

  console.log('  → Creating Nutrition Calculations...')
  // ⚠️  DISABLED: Depends on menu ingredients
  console.log('  ⚠️  Nutrition calculations temporarily disabled - depends on ingredients')
  // await seedNutritionCalculations(prisma, menus, adminUser)

  console.log('  → Creating Cost Calculations...')
  // ⚠️  DISABLED: Depends on menu ingredients  
  console.log('  ⚠️  Cost calculations temporarily disabled - depends on ingredients')
  // await seedCostCalculations(prisma, menus, adminUser)

  console.log('  ✓ Menu domain data created successfully')
  
  // Return programs for school seeding
  return programs.map(p => ({
    id: p.id,
    name: p.name,
    sppgId: p.sppgId
  }))
}

/**
 * Seed Nutrition Programs for Purwakarta SPPG
 */
async function seedNutritionPrograms(
  prisma: PrismaClient,
  sppg: SPPG
): Promise<NutritionProgram[]> {
  const programs = await Promise.all([
    // Program 1: Program Makan Siang Anak Sekolah
    prisma.nutritionProgram.upsert({
      where: { programCode: 'PWK-PMAS-2024' },
      update: {},
      create: {
        sppgId: sppg.id,
        programCode: 'PWK-PMAS-2024',
        name: 'Program Makan Siang Anak Sekolah Purwakarta 2024',
        description: 'Program penyediaan makan siang bergizi untuk siswa SD/MI di wilayah Purwakarta',
        programType: 'SUPPLEMENTARY_FEEDING',
        targetGroup: 'SCHOOL_CHILDREN',

        // Nutrition Goals
        calorieTarget: 700, // 700 kkal per makan siang
        proteinTarget: 20, // 20 gram protein
        carbTarget: 95, // 95 gram karbohidrat
        fatTarget: 23, // 23 gram lemak
        fiberTarget: 8, // 8 gram serat

        // Schedule
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-20'),
        feedingDays: [1, 2, 3, 4, 5], // Senin-Jumat
        mealsPerDay: 1, // 1 kali makan siang

        // Budget & Targets
        totalBudget: 12000000000, // Rp 12 miliar per tahun
        budgetPerMeal: 10000, // Rp 10.000 per porsi
        targetRecipients: 5000,
        currentRecipients: 4850,

        // Location
        implementationArea: 'Kabupaten Purwakarta (15 Kecamatan)',
        partnerSchools: [
          'SDN 1 Nagri Tengah',
          'SDN 2 Nagri Kidul',
          'SDN Purwakarta Barat',
          'MI Al-Hidayah Purwakarta',
          'SDN Cibatu Permai',
          'SDN Babakan Cikao',
          'SDN Pasir Jaya',
          'SDN Jatiluhur',
          'SDN Campaka',
          'SDN Bungursari'
        ],

        status: 'ACTIVE'
      }
    }),

    // Program 2: Program Makanan Tambahan Anak (PMT)
    prisma.nutritionProgram.upsert({
      where: { programCode: 'PWK-PMT-2024' },
      update: {},
      create: {
        sppgId: sppg.id,
        programCode: 'PWK-PMT-2024',
        name: 'Program Makanan Tambahan Anak Purwakarta 2024',
        description: 'Program penyediaan snack sehat bergizi untuk anak-anak prasekolah (PAUD/TK)',
        programType: 'SUPPLEMENTARY_FEEDING',
        targetGroup: 'TODDLER',

        // Nutrition Goals
        calorieTarget: 350, // 350 kkal per snack
        proteinTarget: 10, // 10 gram protein
        carbTarget: 45, // 45 gram karbohidrat
        fatTarget: 15, // 15 gram lemak
        fiberTarget: 5, // 5 gram serat

        // Schedule
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-12-31'),
        feedingDays: [1, 2, 3, 4, 5, 6], // Senin-Sabtu
        mealsPerDay: 2, // 2 kali snack (pagi dan sore)

        // Budget & Targets
        totalBudget: 3600000000, // Rp 3.6 miliar per tahun
        budgetPerMeal: 6000, // Rp 6.000 per porsi
        targetRecipients: 1500,
        currentRecipients: 1450,

        // Location
        implementationArea: 'Kecamatan Purwakarta dan sekitarnya',
        partnerSchools: [
          'PAUD Tunas Harapan',
          'TK Pertiwi Purwakarta',
          'PAUD Mutiara Hati',
          'TK Islam Al-Azhar',
          'PAUD Ceria Mandiri'
        ],

        status: 'ACTIVE'
      }
    })
  ])

  console.log(`  ✓ Created ${programs.length} Nutrition Programs`)
  return programs
}

/**
 * Seed Nutrition Menus - 10 diverse Indonesian menus
 */
async function seedNutritionMenus(
  prisma: PrismaClient,
  programs: NutritionProgram[]
): Promise<NutritionMenu[]> {
  const schoolLunchProgram = programs.find(p => p.programCode === 'PWK-PMAS-2024')!
  const snackProgram = programs.find(p => p.programCode === 'PWK-PMT-2024')!

  const menus = await Promise.all([
    // === MENU MAKAN SIANG (5 menus) ===

    // Menu 1: Nasi Gudeg Ayam Purwakarta
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: schoolLunchProgram.id, 
          menuCode: 'LUNCH-001' 
        } 
      },
      update: {},
      create: {
        programId: schoolLunchProgram.id,
        menuCode: 'LUNCH-001',
        menuName: 'Nasi Gudeg Ayam Purwakarta',
        description: 'Nasi putih dengan gudeg nangka muda khas Purwakarta, ayam suwir, tahu bacem, tempe goreng, dan sambal khas',
        mealType: 'MAKAN_SIANG',
        servingSize: 350, // gram

        // Cost & Pricing (realistic with operations included)
        costPerServing: 10800, // Ingredients 6620 + Labor 2000 + Utilities 500 + Packaging 300 + Overhead 1380

        // Recipe Info
        cookingTime: 90, // 90 menit
        preparationTime: 30, // 30 menit
        difficulty: 'MEDIUM',
        cookingMethod: 'BOIL', // Rebus dulu, baru goreng
        batchSize: 100, // 100 porsi per batch
        budgetAllocation: 950000,

        // Allergen & Dietary
        allergens: ['SOY', 'COCONUT'],
        isHalal: true,
        isVegetarian: false,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 2: Nasi Ayam Goreng Lalapan
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: schoolLunchProgram.id, 
          menuCode: 'LUNCH-002' 
        } 
      },
      update: {},
      create: {
        programId: schoolLunchProgram.id,
        menuCode: 'LUNCH-002',
        menuName: 'Nasi Ayam Goreng Lalapan',
        description: 'Nasi putih hangat dengan ayam goreng bumbu kuning, lalapan sayur segar, sambal terasi, dan tahu goreng',
        mealType: 'MAKAN_SIANG',
        servingSize: 330,

        costPerServing: 9200, // Ingredients 5600 + Labor 1500 + Utilities 600 + Packaging 300 + Overhead 1200

        cookingTime: 45,
        preparationTime: 20,
        difficulty: 'EASY',
        cookingMethod: 'FRY',
        batchSize: 120,
        budgetAllocation: 1020000,

        allergens: ['SOY'],
        isHalal: true,
        isVegetarian: false,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 3: Nasi Ikan Pepes Sunda
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: schoolLunchProgram.id, 
          menuCode: 'LUNCH-003' 
        } 
      },
      update: {},
      create: {
        programId: schoolLunchProgram.id,
        menuCode: 'LUNCH-003',
        menuName: 'Nasi Ikan Pepes Sunda',
        description: 'Nasi putih dengan pepes ikan mas bumbu kuning, sayur asem segar, tempe mendoan, dan kerupuk',
        mealType: 'MAKAN_SIANG',
        servingSize: 340,

        costPerServing: 10000, // Ingredients 6020 + Labor 2000 + Utilities 400 + Packaging 300 + Overhead 1280

        cookingTime: 60,
        preparationTime: 25,
        difficulty: 'MEDIUM',
        cookingMethod: 'STEAM',
        batchSize: 100,
        budgetAllocation: 900000,

        allergens: ['FISH', 'SOY'],
        isHalal: true,
        isVegetarian: false,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 4: Nasi Sayur Asem Iga Ayam (Authentic Sundanese)
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: schoolLunchProgram.id, 
          menuCode: 'LUNCH-004' 
        } 
      },
      update: {},
      create: {
        programId: schoolLunchProgram.id,
        menuCode: 'LUNCH-004',
        menuName: 'Nasi Sayur Asem Iga Ayam',
        description: 'Nasi putih dengan sayur asem segar khas Sunda berisi iga ayam kampung empuk, labu siam, kacang panjang, jagung manis, dan kuah asam jawa yang menyegarkan',
        mealType: 'MAKAN_SIANG',
        servingSize: 350,

        costPerServing: 9500, // Realistic with operations included

        cookingTime: 45, // Efficient for school kitchen
        preparationTime: 20,
        difficulty: 'EASY',
        cookingMethod: 'BOIL',
        batchSize: 100, // Standardized batch size
        budgetAllocation: 950000,

        allergens: [], // No major allergens - suitable for most children
        isHalal: true,
        isVegetarian: false,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 5: Nasi Empal Gepuk Sunda (Authentic Sundanese)
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: schoolLunchProgram.id, 
          menuCode: 'LUNCH-005' 
        } 
      },
      update: {},
      create: {
        programId: schoolLunchProgram.id,
        menuCode: 'LUNCH-005',
        menuName: 'Nasi Empal Gepuk Sunda',
        description: 'Nasi putih dengan empal gepuk daging sapi empuk khas Purwakarta yang dipukul halus, sambal dadak pedas manis, lalap mentah segar, dan kerupuk kulit renyah',
        mealType: 'MAKAN_SIANG',
        servingSize: 340,

        costPerServing: 10000, // Realistic within budget

        cookingTime: 60, // Optimized cooking time
        preparationTime: 25,
        difficulty: 'MEDIUM',
        cookingMethod: 'BOIL', // Boil then gepuk (pound/flatten)
        batchSize: 100, // Standardized batch size
        budgetAllocation: 1000000,

        allergens: ['BEEF'],
        isHalal: true,
        isVegetarian: false,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // === MENU SNACK (5 menus) ===

    // Menu 6: Roti Pisang Cokelat
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: snackProgram.id, 
          menuCode: 'SNACK-001' 
        } 
      },
      update: {},
      create: {
        programId: snackProgram.id,
        menuCode: 'SNACK-001',
        menuName: 'Roti Pisang Cokelat',
        description: 'Roti gandum lembut isi pisang dan cokelat leleh, kaya serat dan energi untuk anak-anak',
        mealType: 'SNACK_PAGI',
        servingSize: 100,

        costPerServing: 6000, // Ingredients 4500 + Operations 1500

        cookingTime: 30,
        preparationTime: 15,
        difficulty: 'EASY',
        cookingMethod: 'BAKE',
        batchSize: 150,
        budgetAllocation: 750000,

        allergens: ['GLUTEN', 'MILK'],
        isHalal: true,
        isVegetarian: true,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 7: Bubur Kacang Hijau
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: snackProgram.id, 
          menuCode: 'SNACK-002' 
        } 
      },
      update: {},
      create: {
        programId: snackProgram.id,
        menuCode: 'SNACK-002',
        menuName: 'Bubur Kacang Hijau',
        description: 'Bubur kacang hijau manis hangat dengan santan kelapa, tinggi protein nabati dan zat besi',
        mealType: 'SNACK_PAGI',
        servingSize: 200,

        costPerServing: 4500,

        cookingTime: 40,
        preparationTime: 10,
        difficulty: 'EASY',
        cookingMethod: 'BOIL',
        batchSize: 180,
        budgetAllocation: 810000,

        allergens: ['COCONUT'],
        isHalal: true,
        isVegetarian: true,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 8: Nagasari Pisang
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: snackProgram.id, 
          menuCode: 'SNACK-003' 
        } 
      },
      update: {},
      create: {
        programId: snackProgram.id,
        menuCode: 'SNACK-003',
        menuName: 'Nagasari Pisang',
        description: 'Kue nagasari tradisional isi pisang raja, dibungkus daun pisang, lembut dan manis alami',
        mealType: 'SNACK_SORE',
        servingSize: 120,

        costPerServing: 6000, // Ingredients 4200 + Operations 1800

        cookingTime: 45,
        preparationTime: 20,
        difficulty: 'MEDIUM',
        cookingMethod: 'STEAM',
        batchSize: 140,
        budgetAllocation: 770000,

        allergens: ['COCONUT'],
        isHalal: true,
        isVegetarian: true,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 9: Pisang Goreng Keju
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: snackProgram.id, 
          menuCode: 'SNACK-004' 
        } 
      },
      update: {},
      create: {
        programId: snackProgram.id,
        menuCode: 'SNACK-004',
        menuName: 'Pisang Goreng Keju',
        description: 'Pisang kepok goreng tepung crispy dengan taburan keju parut, disukai anak-anak',
        mealType: 'SNACK_SORE',
        servingSize: 130,

        costPerServing: 7000, // Ingredients 5300 + Operations 1700

        cookingTime: 20,
        preparationTime: 10,
        difficulty: 'EASY',
        cookingMethod: 'FRY',
        batchSize: 160,
        budgetAllocation: 960000,

        allergens: ['GLUTEN', 'MILK'],
        isHalal: true,
        isVegetarian: true,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    }),

    // Menu 10: Susu Kedelai Cokelat
    prisma.nutritionMenu.upsert({
      where: { 
        programId_menuCode: { 
          programId: snackProgram.id, 
          menuCode: 'SNACK-005' 
        } 
      },
      update: {},
      create: {
        programId: snackProgram.id,
        menuCode: 'SNACK-005',
        menuName: 'Susu Kedelai Cokelat',
        description: 'Minuman susu kedelai rasa cokelat hangat, tinggi protein nabati, cocok untuk anak lactose intolerant',
        mealType: 'SNACK_PAGI',
        servingSize: 250, // ml

        costPerServing: 4000,

        cookingTime: 25,
        preparationTime: 10,
        difficulty: 'EASY',
        cookingMethod: 'BOIL',
        batchSize: 200,
        budgetAllocation: 800000,

        allergens: ['SOY'],
        isHalal: true,
        isVegetarian: true,
        isVegan: false,
        nutritionStandardCompliance: true,
        isActive: true
      }
    })
  ])

  console.log(`  ✓ Created ${menus.length} Nutrition Menus`)
  return menus
}

/**
 * Seed Menu Ingredients - realistic ingredients for each menu
 * Fix #1: Uses ONLY inventoryItemId (REQUIRED) + quantity + preparationNotes
 * Removed fields: ingredientName, unit, costPerUnit, totalCost (redundant)
 */
async function seedMenuIngredients(
  prisma: PrismaClient,
  menus: NutritionMenu[],
  inventoryItems: Array<{ id: string; itemCode: string | null; itemName: string; unit: string; costPerUnit: number | null }>
): Promise<void> {
  // Get SPPG ID from first menu's program
  if (menus.length === 0) {
    console.log('  ⚠️  No menus found')
    return
  }

  // Helper function to find inventory item by code - REQUIRED (Fix #1)
  const findInventoryItem = (itemCode: string): string => {
    const item = inventoryItems.find(i => i.itemCode === itemCode)
    if (!item) {
      throw new Error(`❌ CRITICAL: Inventory item REQUIRED but not found: ${itemCode}. Cannot create MenuIngredient without inventoryItemId (Fix #1 schema change).`)
    }
    return item.id
  }

  console.log(`  → Found ${inventoryItems.length} inventory items for linking`)
  
  if (inventoryItems.length === 0) {
    console.warn('  ⚠️  No inventory items found! Cannot create menu ingredients (inventoryItemId is REQUIRED after Fix #1).')
    return
  }

  // Menu 1: Nasi Gudeg Ayam Kampung (Regional Specialty Purwakarta)
  const menu1 = menus.find(m => m.menuCode === 'LUNCH-001')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu1.id,
        inventoryItemId: findInventoryItem('BRP-001'), // ✅ REQUIRED (Fix #1)
        quantity: 0.08, // gram
        preparationNotes: 'Cuci beras 80 gram dengan air mengalir hingga jernih (3-4 kali cuci). Rendam dalam air bersih selama 15 menit untuk menghasilkan nasi yang pulen. Tiriskan dengan saringan sebelum dimasak. Perbandingan air:beras = 1.2:1 untuk tekstur nasi yang pas.',
        substitutes: ['Beras Merah (lebih tinggi serat, +Rp 3/g)', 'Beras Organik (lebih sehat, +Rp 8/g)'],
        isOptional: false
      },
      {
        menuId: menu1.id,
        inventoryItemId: findInventoryItem('NKM-001'), // ✅ REQUIRED (Fix #1)
        quantity: 0.1, // gram
        preparationNotes: 'Kupas nangka muda 100 gram, potong tipis setebal 3-4 cm dan lebar 5 cm. Rebus dalam air mendidih dengan sedikit garam selama 15 menit untuk menghilangkan getah. Tiriskan dan peras airnya. Jangan terlalu lembek agar tekstur tetap kenyal saat dimasak dengan santan.',
        substitutes: ['Nangka Kalengan (lebih praktis, +Rp 5/g)', 'Kol (alternatif sayuran, -Rp 7/g)'],
        isOptional: false
      },
      {
        menuId: menu1.id,
        inventoryItemId: findInventoryItem('AYM-001'), // ✅ REQUIRED (Fix #1)
        quantity: 0.1, // gram
        preparationNotes: 'Cuci bersih ayam kampung fillet 100 gram. Potong dadu ukuran 2x2 cm untuk memudahkan penyerapan bumbu. Marinasi dengan air jeruk nipis 1 sendok teh dan garam 1/2 sendok teh selama 10 menit. Rebus dengan lengkuas dan sereh hingga empuk (30 menit), lalu suwir halus. Ayam kampung memberikan tekstur lebih kenyal dan aroma khas.',
        substitutes: ['Ayam Broiler Fillet (lebih murah, -Rp 18/g)', 'Ayam Organik (lebih premium, +Rp 15/g)'],
        isOptional: false
      },
      {
        menuId: menu1.id,
        inventoryItemId: findInventoryItem('SNT-001'), // ✅ REQUIRED (Fix #1)
        quantity: 0.05, // ml
        preparationNotes: 'Gunakan santan kental dari kelapa segar 50 ml (dari 1/4 butir kelapa). Pastikan santan tidak pecah dengan menambahkan 1 sendok teh tepung maizena. Masak dengan api kecil sambil diaduk terus. Santan segar memberikan aroma khas gudeg Sunda yang autentik. Hindari mendidih agar tidak pecah.',
        substitutes: ['Santan Kemasan (lebih praktis, -Rp 2/ml)', 'Santan Instan (paling praktis, -Rp 3/ml)'],
        isOptional: false
      },
      {
        menuId: menu1.id,
        inventoryItemId: findInventoryItem('GLM-001'), // ✅ REQUIRED (Fix #1)
        quantity: 0.02, // gram
        preparationNotes: 'Sisir halus gula merah 20 gram agar mudah larut dan meresap sempurna ke dalam nangka. Gula merah memberikan rasa manis legit khas gudeg dan warna cokelat kemerahan yang cantik. Jangan terlalu banyak agar tidak terlalu manis. Sisir saat masih dingin agar tidak lengket.',
        substitutes: ['Gula Aren (rasa mirip, +Rp 3/g)', 'Gula Pasir + Kecap Manis (alternatif, -Rp 15/g)'],
        isOptional: false
      },
      {
        menuId: menu1.id,
        inventoryItemId: findInventoryItem('LKS-001'), // ✅ REQUIRED (Fix #1)
        quantity: 0.005, // gram
        preparationNotes: 'Iris tipis lengkuas 5 gram (sekitar 1 ruas jari), lalu memarkan dengan punggung pisau untuk mengeluarkan aroma maksimal. Lengkuas memberikan aroma harum khas dan menghilangkan bau amis ayam. Masukkan sejak awal memasak untuk aroma yang meresap sempurna.',
        substitutes: ['Jahe (aroma berbeda, -Rp 2/g)', 'Laos Bubuk (kurang aroma, -Rp 10/g)'],
        isOptional: false
      },
      {
        menuId: menu1.id,
        inventoryItemId: findInventoryItem('DSL-001'), // ✅ REQUIRED (Fix #1)
        quantity: 0.002, // gram (2 lembar)
        preparationNotes: 'Gunakan 2 lembar daun salam segar (sekitar 2 gram). Cuci bersih dan sobek sedikit untuk mengeluarkan aroma. Daun salam memberikan aroma tradisional khas masakan Sunda. Buang daun sebelum menghidangkan. Daun segar lebih harum dibanding kering.',
        substitutes: ['Daun Salam Kering (kurang aroma, -Rp 15/g)'],
        isOptional: true
      }
    ],
    skipDuplicates: true
  })

  // Menu 2: Nasi Ayam Goreng Lalapan (Traditional Fried Chicken with Fresh Vegetables)
  const menu2 = menus.find(m => m.menuCode === 'LUNCH-002')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('BRP-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Cuci beras 80 gram hingga air jernih, rendam 15 menit. Masak dengan perbandingan air 1.2:1 untuk nasi pulen yang pas. Nasi harus hangat dan tidak terlalu lembek agar cocok dimakan dengan lalapan segar.',
        substitutes: ['Beras Merah (lebih sehat, +Rp 3/g)', 'Beras Organik (premium, +Rp 8/g)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('AYM-001'),        quantity: 0.1, // was 100g        preparationNotes: 'Cuci bersih paha ayam 100 gram (1 potong sedang). Marinasi dengan bumbu kuning (kunyit 5g, bawang putih 5g, ketumbar 2g, garam 1g) selama minimal 30 menit agar bumbu meresap sempurna. Goreng dengan minyak panas sedang hingga kuning keemasan dan matang merata (15-20 menit). Tiriskan minyak sebelum sajikan.',
        substitutes: ['Ayam Kampung (lebih gurih, +Rp 5/g)', 'Ayam Fillet (lebih lembut, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('TAH-001'),        quantity: 0.05, // was 50g        preparationNotes: 'Gunakan tahu Sumedang atau tahu putih lokal 50 gram (1 potong besar). Potong kotak persegi 3x3 cm setebal 2 cm. Goreng dalam minyak panas hingga permukaan kuning keemasan dan renyah di luar, lembut di dalam (8-10 menit). Jangan dibalik terlalu sering agar tidak hancur.',
        substitutes: ['Tahu Sutra (lebih lembut, +Rp 5/g)', 'Tempe (protein nabati, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('KOL-001'),        quantity: 0.03, // was 30g        preparationNotes: 'Pilih kol segar 30 gram (3-4 lembar). Cuci bersih dengan air mengalir, rendam air garam 5 menit untuk menghilangkan ulat kecil. Iris tipis memanjang setebal 0.5 cm. Kol mentah memberikan tekstur renyah dan segar sebagai lalapan. Sajikan segera setelah diiris agar tetap renyah.',
        substitutes: ['Selada (lebih segar, +Rp 4/g)', 'Sawi Putih (lebih manis, +Rp 2/g)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('TMN-001'),        quantity: 0.03, // was 30g        preparationNotes: 'Pilih timun segar hijau 30 gram (1/3 buah sedang). Cuci bersih, kupas kulit tipis-tipis jika pahit. Iris bulat setebal 0.5 cm atau iris panjang memanjang. Timun memberikan kesegaran dan mengurangi rasa pedas sambal. Rendam air dingin 5 menit agar lebih renyah.',
        substitutes: ['Mentimun Jepang (lebih manis, +Rp 10/g)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('TMT-001'),        quantity: 0.02, // was 20g        preparationNotes: 'Gunakan tomat merah segar 20 gram (1/2 buah sedang). Cuci bersih, potong wedges (8 bagian) atau iris bulat. Tomat memberikan rasa asam segar dan vitamin C. Pilih tomat yang matang merah tapi masih keras agar tidak lembek saat dimakan.',
        substitutes: ['Tomat Ceri (lebih manis, +Rp 25/g)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('CBR-001'),        quantity: 0.025, // was 25g        preparationNotes: 'Ulek 15 gram cabe rawit merah segar, 3 siung bawang merah, 2 siung bawang putih, 5 gram terasi bakar, 1 gram garam, 1 sendok teh air jeruk nipis. Ulek kasar agar tekstur tidak terlalu halus. Sambal terasi khas Sunda harus pedas, gurih terasi, dan segar. Jangan terlalu banyak air agar sambal kental.',
        substitutes: ['Sambal Bawang (tidak terasi, -Rp 10/g)', 'Sambal Kecap (lebih manis, -Rp 5/g)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('KNY-001'),        quantity: 0.005, // was 5g        preparationNotes: 'Parut halus kunyit segar 5 gram (1 ruas jari kecil) untuk bumbu marinasi ayam. Kunyit memberikan warna kuning cerah khas ayam goreng Sunda dan aroma harum. Campurkan dengan bawang putih, ketumbar, dan garam untuk bumbu lengkap. Kunyit segar lebih harum dari bubuk.',
        substitutes: ['Kunyit Bubuk (lebih praktis, -Rp 8/g)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('BWP-001'),        quantity: 0.005, // was 5g        preparationNotes: 'Haluskan 5 gram bawang putih (2 siung besar) untuk bumbu marinasi ayam. Bawang putih memberikan aroma gurih dan membantu melunakkan daging ayam. Haluskan bersama kunyit dan ketumbar untuk bumbu yang meresap sempurna.',
        substitutes: ['Bawang Putih Bubuk (darurat, -Rp 20/g)'],
        isOptional: false
      },
      {
        menuId: menu2.id,
        inventoryItemId: findInventoryItem('KTB-001'),        quantity: 0.002, // was 2g        preparationNotes: 'Sangrai 2 gram ketumbar biji (1/2 sendok teh) dengan api kecil hingga harum (3 menit), lalu tumbuk kasar. Ketumbar sangrai memberikan aroma khas dan rasa gurih pada ayam goreng. Jangan sangrai terlalu lama agar tidak gosong dan pahit.',
        substitutes: ['Ketumbar Bubuk (lebih praktis, -Rp 10/g)'],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 3: Nasi Ikan Pepes Sunda (Traditional Steamed Fish in Banana Leaf)
  const menu3 = menus.find(m => m.menuCode === 'LUNCH-003')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu3.id,
        inventoryItemId: findInventoryItem('BRP-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Cuci beras 80 gram hingga bersih, rendam 15 menit. Masak dengan perbandingan air 1.2:1 untuk nasi pulen. Nasi harus hangat saat disajikan dengan pepes ikan agar aroma harum daun pisang tercium sempurna.',
        substitutes: ['Beras Merah (lebih sehat, +Rp 3/g)', 'Beras Pandan (harum, +Rp 5/g)'],
        isOptional: false
      },
      {
        menuId: menu3.id,
        inventoryItemId: findInventoryItem('IKN-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Pilih ikan mas segar dari Waduk Jatiluhur 80 gram (1 potong sedang). Cuci bersih, buang sisik dan duri halus. Lumuri dengan jeruk nipis 1 sendok teh dan garam 1/2 sendok teh selama 10 menit untuk menghilangkan bau amis. Ikan mas Jatiluhur memiliki daging tebal dan gurih khas air tawar.',
        substitutes: ['Ikan Nila (lebih ekonomis, -Rp 10/g)', 'Ikan Gurame (lebih premium, +Rp 25/g)'],
        isOptional: false
      },
      {
        menuId: menu3.id,
        inventoryItemId: findInventoryItem('DPS-001'),        quantity: 0.001, // was 1g        preparationNotes: 'Gunakan daun pisang segar ukuran 20x25 cm (1 lembar). Bersihkan dengan lap basah, layukan sebentar di atas api agar lentur dan tidak sobek saat dilipat. Daun pisang memberikan aroma harum khas pepes Sunda. Lipat membentuk amplop dengan bagian mengkilap di dalam agar ikan tidak lengket.',
        substitutes: ['Alumunium Foil (darurat, tidak ada aroma, -Rp 300)'],
        isOptional: false
      },
      {
        menuId: menu3.id,
        inventoryItemId: findInventoryItem('TMP-001'),        quantity: 0.04, // was 40g        preparationNotes: 'Iris tempe 40 gram (2 potong) setebal 0.5 cm. Celup ke adonan tepung terigu 20g + ketumbar 1g + daun bawang 2g + air 30ml hingga rata tipis. Goreng dalam minyak panas sedang hingga crispy kuning keemasan (3 menit per sisi). Jangan terlalu tebal agar mendoan renyah.',
        substitutes: ['Tempe Goreng Biasa (tanpa tepung, -Rp 2/g)', 'Tahu Goreng (alternatif protein, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu3.id,
        inventoryItemId: findInventoryItem('LBS-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Campur labu siam 30g (potong dadu 2x2cm), kacang panjang 25g (potong 3cm), jagung manis 25g (pipil). Rebus dalam 200ml air mendidih dengan asam jawa 5g, garam 1g, gula merah 3g, lengkuas 2g selama 15 menit. Sayur asem Sunda harus asam segar dengan tekstur sayuran masih renyah.',
        substitutes: ['Sayur Sop (tidak asam, -Rp 2/g)', 'Sayur Lodeh (lebih gurih, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu3.id,
        inventoryItemId: findInventoryItem('KRK-001'),        quantity: 0.01, // was 10g        preparationNotes: 'Goreng 10 gram kerupuk udang mentah (3-4 keping) dalam minyak panas 180°C hingga mengembang sempurna (5 detik per keping). Angkat segera agar tidak gosong dan tetap renyah. Tiriskan minyak, sajikan hangat. Kerupuk udang menambah tekstur renyah dan gurih.',
        substitutes: ['Kerupuk Putih (lebih ekonomis, -Rp 8/g)', 'Emping Melinjo (khas Sunda, +Rp 15/g)'],
        isOptional: false
      },
      {
        menuId: menu3.id,
        inventoryItemId: findInventoryItem('KNY-001'),        quantity: 0.008, // was 8g        preparationNotes: 'Haluskan 8 gram kunyit segar (1 ruas), 5 gram bawang merah (2 siung), 3 gram bawang putih (1 siung), 2 gram cabe merah keriting, 1 gram terasi bakar, 5 gram tomat, 2 gram daun kemangi, garam secukupnya. Lumuri ikan dengan bumbu halus ini sebelum dibungkus daun pisang. Bumbu pepes harus harum kunyit dan terasi.',
        substitutes: ['Bumbu Pepes Instan (lebih praktis, -Rp 5/g)'],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 4: Nasi Sayur Asem Iga Ayam (Authentic Sundanese Sour Soup)
  const menu4 = menus.find(m => m.menuCode === 'LUNCH-004')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu4.id,
        inventoryItemId: findInventoryItem('BRP-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Cuci beras 80 gram hingga bersih, rendam 15 menit. Masak dengan perbandingan air 1.2:1 untuk nasi pulen. Nasi harus hangat dan pulen agar cocok dimakan dengan kuah sayur asem yang segar dan asam.',
        substitutes: ['Beras Merah (lebih sehat, +Rp 3/g)', 'Beras Organik (premium, +Rp 8/g)'],
        isOptional: false
      },
      {
        menuId: menu4.id,
        inventoryItemId: findInventoryItem('AYM-001'),        quantity: 0.07, // was 70g        preparationNotes: 'Gunakan iga ayam kampung 70 gram (1-2 potong kecil). Cuci bersih, rebus dengan lengkuas 5g, sereh 3g, daun salam 1 lembar, garam 1g dalam 400ml air selama 40 menit hingga empuk dan kaldu gurih. Ayam kampung memberikan kaldu yang lebih harum dan daging lebih kenyal daripada broiler.',
        substitutes: ['Iga Ayam Broiler (lebih murah, -Rp 18/g)', 'Daging Ayam Tanpa Tulang (lebih praktis, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu4.id,
        inventoryItemId: findInventoryItem('LBS-001'),        quantity: 0.05, // was 50g        preparationNotes: 'Kupas labu siam 50 gram, potong dadu 2x2 cm. Labu siam memberikan tekstur renyah dan sedikit manis pada sayur asem. Masukkan setelah kaldu mendidih, masak 10 menit hingga empuk tapi tidak lembek. Labu siam menyerap rasa asam dengan sempurna.',
        substitutes: ['Labu Kuning (lebih manis, +Rp 2/g)', 'Terong (tekstur lebih lembut, -Rp 1/g)'],
        isOptional: false
      },
      {
        menuId: menu4.id,
        inventoryItemId: findInventoryItem('KCG-001'),        quantity: 0.03, // was 30g        preparationNotes: 'Siangi kacang panjang 30 gram (3-4 helai), cuci bersih. Potong-potong sepanjang 3 cm. Masukkan 7 menit sebelum angkat agar tetap renyah dan hijau segar. Kacang panjang menambah serat dan tekstur renyah pada sayur asem.',
        substitutes: ['Buncis (lebih manis, +Rp 3/g)', 'Kacang Kapri (lebih empuk, +Rp 8/g)'],
        isOptional: false
      },
      {
        menuId: menu4.id,
        inventoryItemId: findInventoryItem('JGM-001'),        quantity: 0.04, // was 40g        preparationNotes: 'Pipil jagung manis 40 gram dari tongkol (sekitar 1/4 tongkol). Cuci bersih. Jagung manis memberikan rasa manis alami yang menyeimbangkan asam dari asam jawa. Masukkan bersama labu siam agar empuk sempurna (10 menit).',
        substitutes: ['Jagung Pipil Frozen (lebih praktis, +Rp 5/g)'],
        isOptional: false
      },
      {
        menuId: menu4.id,
        inventoryItemId: findInventoryItem('ASM-001'),        quantity: 0.015, // was 15g        preparationNotes: 'Larutkan 15 gram asam jawa (1 sendok makan penuh) dalam 50ml air hangat, peras dan saring untuk mendapatkan air asam jawa murni. Asam jawa memberikan rasa asam segar khas sayur asem Sunda. Tambahkan 5 menit sebelum angkat agar rasa asam tidak terlalu tajam. Jangan terlalu banyak agar tidak kecut.',
        substitutes: ['Asam Jawa Cair (lebih praktis, +Rp 2/g)', 'Air Jeruk Nipis (rasa berbeda, -Rp 3/g)'],
        isOptional: false
      },
      {
        menuId: menu4.id,
        inventoryItemId: findInventoryItem('BWM-001'),        quantity: 0.025, // was 25g        preparationNotes: 'Iris tipis 15 gram bawang merah (3 siung), 5 gram cabe merah keriting (1 buah), 5 gram gula merah. Tumis bumbu iris dengan 1 sendok teh minyak hingga harum (3 menit), lalu masukkan ke kuah sayur asem bersama lengkuas dan sereh. Bumbu iris memberikan aroma harum dan rasa kompleks pada sayur asem.',
        substitutes: ['Bumbu Halus (lebih praktis, kurang harum, sama harga)'],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 5: Nasi Empal Gepuk Sunda (Authentic Sundanese Smashed Beef)
  const menu5 = menus.find(m => m.menuCode === 'LUNCH-005')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu5.id,
        inventoryItemId: findInventoryItem('BRP-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Cuci beras 80 gram hingga bersih, rendam 15 menit. Masak dengan perbandingan air 1.2:1 untuk nasi pulen hangat. Nasi harus pulen dan hangat agar cocok dimakan dengan empal gepuk yang gurih empuk.',
        substitutes: ['Beras Merah (lebih sehat, +Rp 3/g)', 'Beras Pandan (harum, +Rp 5/g)'],
        isOptional: false
      },
      {
        menuId: menu5.id,
        inventoryItemId: findInventoryItem('DSP-001'),        quantity: 0.07, // was 70g        preparationNotes: 'Gunakan daging sapi sengkel 70 gram (1 potong kecil). Rebus dengan 400ml air, lengkuas 5g, sereh 3g, daun salam 1 lembar selama 90 menit hingga sangat empuk. Angkat, dinginkan 10 menit. Gepuk/pukul daging dengan ulekan hingga pipih setebal 1 cm untuk tekstur lembut khas empal. Goreng kering dengan minyak sedikit hingga cokelat keemasan (15 menit). Empal gepuk Sunda harus empuk, gurih, dan sedikit manis.',
        substitutes: ['Daging Sapi Has Dalam (lebih empuk, +Rp 30/g)', 'Daging Sapi Sandung Lamur (lebih gurih, +Rp 10/g)'],
        isOptional: false
      },
      {
        menuId: menu5.id,
        inventoryItemId: findInventoryItem('KTB-001'),        quantity: 0.02, // was 20g        preparationNotes: 'Haluskan 5 gram ketumbar sangrai, 8 gram bawang merah (2 siung), 3 gram bawang putih (1 siung), 2 gram lengkuas, 1 gram gula merah, 1 gram garam. Marinasi daging rebus dengan bumbu halus ini selama 30 menit sebelum digoreng. Bumbu ketumbar sangrai memberikan aroma khas empal Sunda yang gurih dan harum.',
        substitutes: ['Bumbu Empal Instan (lebih praktis, -Rp 5/g)'],
        isOptional: false
      },
      {
        menuId: menu5.id,
        inventoryItemId: findInventoryItem('CBR-001'),        quantity: 0.025, // was 25g        preparationNotes: 'Ulek kasar 15 gram cabe rawit merah (10 buah), 5 gram tomat ceri (1 buah), 3 gram bawang merah (1 siung), 1 gram terasi bakar, 1 gram garam. Sambal dadak harus pedas segar dan ulek kasar, tidak halus. Jangan tambahkan air agar sambal kental dan tahan lama. Sambal dadak khas pendamping empal gepuk Sunda.',
        substitutes: ['Sambal Tomat (lebih manis, -Rp 10/g)', 'Sambal Hijau (rasa berbeda, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu5.id,
        inventoryItemId: findInventoryItem('KOL-001'),        quantity: 0.04, // was 40g        preparationNotes: 'Campurkan 20 gram kubis iris tipis, 15 gram timun iris bulat, 5 gram kemangi segar. Cuci bersih semua lalapan, rendam air garam 5 menit lalu bilas. Lalapan harus segar dan renyah sebagai penyeimbang empal yang gurih. Sajikan segera agar tidak layu.',
        substitutes: ['Lalapan Selada + Tomat (lebih segar, +Rp 5/g)'],
        isOptional: false
      },
      {
        menuId: menu5.id,
        inventoryItemId: findInventoryItem('KRK-001'),        quantity: 0.015, // was 15g        preparationNotes: 'Goreng 15 gram kerupuk kulit mentah (3-4 keping besar) dalam minyak panas 180°C hingga mengembang sempurna dan renyah (8-10 detik per keping). Kerupuk kulit harus mengembang sempurna, renyah, dan tidak berminyak. Tiriskan dengan baik, sajikan segera agar tetap renyah. Kerupuk kulit adalah pendamping khas empal gepuk Sunda.',
        substitutes: ['Kerupuk Udang (lebih gurih, sama harga)', 'Kerupuk Melarat (lebih renyah, +Rp 10/g)'],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 6: Roti Pisang Cokelat (Healthy Snack for Children)
  const menu6 = menus.find(m => m.menuCode === 'SNACK-001')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu6.id,
        inventoryItemId: findInventoryItem('ROT-001'),        quantity: 0.07, // was 70g        preparationNotes: 'Gunakan 2 lembar roti gandum tawar segar (70 gram total). Roti gandum lebih sehat dengan serat tinggi dan vitamin B kompleks. Panggang sebentar dengan mentega agar renyah dan harum (3 menit per sisi). Jangan terlalu kering agar tetap lembut di dalam.',
        substitutes: ['Roti Tawar Putih (kurang serat, -Rp 8/g)', 'Roti Multigrain (lebih sehat, +Rp 15/g)'],
        isOptional: false
      },
      {
        menuId: menu6.id,
        inventoryItemId: findInventoryItem('PSG-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Kupas pisang ambon matang 80 gram (1 buah sedang). Potong memanjang tipis setebal 0.5 cm atau iris bulat. Pisang ambon memberikan rasa manis alami, kalium tinggi, dan tekstur lembut. Pilih pisang yang matang kuning dengan bintik cokelat agar lebih manis dan harum.',
        substitutes: ['Pisang Raja (lebih manis, +Rp 5/g)', 'Pisang Cavendish (import, +Rp 10/g)'],
        isOptional: false
      },
      {
        menuId: menu6.id,
        inventoryItemId: findInventoryItem('SLC-001'),        quantity: 0.03, // was 30g        preparationNotes: 'Oles 30 gram selai cokelat (2 sendok makan) merata di permukaan roti gandum. Gunakan selai cokelat dengan kandungan kakao minimal 30% untuk rasa cokelat yang kaya. Oles tipis merata agar tidak terlalu manis dan menutupi rasa pisang.',
        substitutes: ['Selai Kacang (protein tinggi, sama harga)', 'Selai Strawberry (rasa berbeda, -Rp 5/g)'],
        isOptional: false
      },
      {
        menuId: menu6.id,
        inventoryItemId: findInventoryItem('MTG-001'),        quantity: 0.01, // was 10g        preparationNotes: 'Oles tipis 10 gram mentega (1 sendok teh) di sisi luar roti sebelum dipanggang. Mentega memberikan aroma harum, tekstur renyah, dan rasa gurih. Gunakan api sedang agar mentega tidak gosong. Mentega juga menambah kalori dan vitamin A untuk anak-anak.',
        substitutes: ['Margarin (lebih ekonomis, -Rp 15/g)', 'Butter Unsalted (premium, +Rp 20/g)'],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 7: Bubur Kacang Hijau (Traditional Sweet Mung Bean Porridge)
  const menu7 = menus.find(m => m.menuCode === 'SNACK-002')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu7.id,
        inventoryItemId: findInventoryItem('KCG-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Cuci bersih 80 gram kacang hijau (4 sendok makan), buang kotoran dan kacang yang mengapung. Rendam dalam air bersih 2-3 jam agar cepat empuk. Rebus dengan 400ml air dan 2 lembar daun pandan dalam panci hingga mendidih, kecilkan api dan masak 40 menit hingga kacang lembut dan pecah. Kacang hijau kaya protein, serat, dan zat besi untuk anak-anak.',
        substitutes: ['Kacang Hijau Kupas (lebih cepat matang, +Rp 8/g)'],
        isOptional: false
      },
      {
        menuId: menu7.id,
        inventoryItemId: findInventoryItem('SNT-001'),        quantity: 0.1, // was 100g        preparationNotes: 'Gunakan 100ml santan kental dari 1/4 kelapa parut. Tambahkan santan 5 menit sebelum angkat agar tidak pecah dan tetap kental. Aduk perlahan agar santan tidak menggumpal. Santan memberikan rasa gurih dan tekstur creamy pada bubur kacang hijau. Jangan mendidihkan santan agar tidak pecah.',
        substitutes: ['Santan Instan (lebih praktis, sama harga)', 'Susu Cair (rasa berbeda, +Rp 5/ml)'],
        isOptional: false
      },
      {
        menuId: menu7.id,
        inventoryItemId: findInventoryItem('GLP-001'),        quantity: 0.04, // was 40g        preparationNotes: 'Tambahkan 40 gram gula pasir (3 sendok makan) setelah kacang lembut. Aduk hingga larut sempurna. Gula pasir memberikan rasa manis yang pas, tidak terlalu pekat seperti gula merah. Sesuaikan tingkat kemanisan dengan selera anak-anak. Jangan terlalu manis agar tidak menutupi aroma pandan.',
        substitutes: ['Gula Aren (rasa lebih kaya, +Rp 10/g)', 'Madu (lebih sehat, +Rp 80/g)'],
        isOptional: false
      },
      {
        menuId: menu7.id,
        inventoryItemId: findInventoryItem('PDN-001'),        quantity: 0.002, // was 2g        preparationNotes: 'Cuci bersih 2 lembar daun pandan segar, simpul ujungnya agar tidak lepas saat direbus. Masukkan bersamaan dengan kacang hijau dari awal agar aroma pandan meresap sempurna. Daun pandan memberikan aroma harum khas dan warna hijau alami. Angkat daun pandan sebelum disajikan.',
        substitutes: ['Ekstrak Pandan (lebih praktis, -Rp 50/porsi)'],
        isOptional: false
      },
      {
        menuId: menu7.id,
        inventoryItemId: findInventoryItem('GRM-001'),        quantity: 0.002, // was 2g        preparationNotes: 'Tambahkan sejumput garam (2 gram / 1/4 sendok teh) setelah gula larut untuk menyeimbangkan rasa manis. Garam membuat rasa manis lebih bulat dan menonjolkan aroma santan. Jangan terlalu banyak agar tidak terasa asin.',
        substitutes: [],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 8: Nagasari Pisang (Traditional Steamed Banana Cake)
  const menu8 = menus.find(m => m.menuCode === 'SNACK-003')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu8.id,
        inventoryItemId: findInventoryItem('TPG-001'),        quantity: 0.06, // was 60g        preparationNotes: 'Ayak 60 gram tepung beras (5 sendok makan) agar tidak menggumpal. Tepung beras memberikan tekstur lembut dan kenyal khas nagasari. Campurkan dengan 150ml santan dan 2 sendok makan gula pasir, aduk rata hingga adonan halus tanpa gumpalan. Masak dengan api kecil sambil diaduk terus hingga mengental seperti pasta (8-10 menit).',
        substitutes: ['Tepung Ketan (lebih kenyal, +Rp 3/g)'],
        isOptional: false
      },
      {
        menuId: menu8.id,
        inventoryItemId: findInventoryItem('SNT-001'),        quantity: 0.15, // was 150g        preparationNotes: 'Gunakan 150ml santan kental dari 1/3 kelapa parut. Santan memberikan aroma harum dan rasa gurih pada nagasari. Masak santan dengan api kecil agar tidak pecah. Aduk terus saat mencampur dengan tepung beras. Santan yang baik membuat nagasari lembut dan tidak cepat basi.',
        substitutes: ['Santan Instan (lebih praktis, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu8.id,
        inventoryItemId: findInventoryItem('PSG-001'),        quantity: 0.1, // was 100g        preparationNotes: 'Kupas pisang raja matang 100 gram (1 buah), potong memanjang tipis setebal 1 cm. Pisang raja lebih harum dan manis daripada pisang ambon. Letakkan 2-3 potong pisang di tengah adonan nagasari sebelum dikukus. Pisang raja tidak mudah hancur saat dikukus dan aromanya harum khas.',
        substitutes: ['Pisang Kepok (lebih murah, -Rp 6/g)', 'Pisang Ambon (lebih lembut, -Rp 3/g)'],
        isOptional: false
      },
      {
        menuId: menu8.id,
        inventoryItemId: findInventoryItem('GLP-001'),        quantity: 0.03, // was 30g        preparationNotes: 'Larutkan 30 gram gula pasir (2.5 sendok makan) ke dalam adonan santan tepung beras. Gula memberikan rasa manis yang pas, tidak berlebihan. Aduk hingga gula larut sempurna sebelum dimasak. Rasa nagasari harus manis alami dari gula dan pisang, tidak terlalu pekat.',
        substitutes: ['Gula Aren (rasa lebih kompleks, +Rp 12/g)'],
        isOptional: false
      },
      {
        menuId: menu8.id,
        inventoryItemId: findInventoryItem('DPS-001'),        quantity: 0.001, // was 1g        preparationNotes: 'Potong daun pisang 20x15 cm (1 lembar per porsi). Bersihkan dengan lap basah, layukan di atas api agar lentur. Daun pisang memberikan aroma harum khas pada nagasari. Tuang 3 sendok makan adonan, tambah pisang di tengah, tutup dengan 2 sendok adonan lagi. Lipat rapi, kukus 30 menit hingga matang.',
        substitutes: ['Alumunium Foil (darurat, tidak ada aroma, -Rp 300)'],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 9: Pisang Goreng Keju (Crispy Fried Banana with Cheese)
  const menu9 = menus.find(m => m.menuCode === 'SNACK-004')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu9.id,
        inventoryItemId: findInventoryItem('PSG-001'),        quantity: 0.12, // was 120g        preparationNotes: 'Kupas pisang kepok setengah matang 120 gram (2 buah sedang). Belah memanjang menjadi 2 bagian. Pisang kepok lebih padat dan tidak mudah hancur saat digoreng. Pisang setengah matang menghasilkan gorengan yang renyah dan tidak terlalu lembek. Jangan gunakan pisang terlalu matang karena akan lembek saat digoreng.',
        substitutes: ['Pisang Tanduk (lebih besar, +Rp 5/g)', 'Pisang Raja (lebih manis, +Rp 6/g)'],
        isOptional: false
      },
      {
        menuId: menu9.id,
        inventoryItemId: findInventoryItem('TPG-001'),        quantity: 0.05, // was 50g        preparationNotes: 'Campurkan 50 gram tepung terigu (4 sendok makan) dengan 30g tepung beras, 1/2 sendok teh baking powder, 1 sendok makan gula pasir, sejumput garam, 80ml air dingin. Aduk rata hingga adonan kental seperti yogurt. Adonan tepung yang pas membuat pisang goreng renyah di luar dan lembut di dalam. Dinginkan adonan 10 menit sebelum digunakan.',
        substitutes: ['Tepung Serbaguna (sama saja, sama harga)'],
        isOptional: false
      },
      {
        menuId: menu9.id,
        inventoryItemId: findInventoryItem('KJU-001'),        quantity: 0.03, // was 30g        preparationNotes: 'Parut kasar 30 gram keju cheddar (2-3 lapis tipis keju). Taburkan keju parut di atas pisang goreng yang masih panas agar meleleh sedikit. Keju cheddar memberikan rasa gurih dan creamy yang disukai anak-anak. Gunakan keju berkualitas baik agar aromanya harum. Keju menambah kalsium dan protein.',
        substitutes: ['Keju Edam (lebih lembut, +Rp 20/g)', 'Keju Quick Melt (meleleh cepat, +Rp 10/g)'],
        isOptional: false
      },
      {
        menuId: menu9.id,
        inventoryItemId: findInventoryItem('MYK-001'),        quantity: 0.1, // was 100g        preparationNotes: 'Panaskan 100ml minyak goreng dalam wajan dengan api sedang hingga suhu 170-180°C. Celupkan pisang ke adonan tepung hingga rata, goreng 3-4 menit per sisi hingga kuning keemasan dan renyah. Jangan terlalu panas agar tidak gosong. Tiriskan minyak dengan baik agar pisang goreng tidak berminyak.',
        substitutes: ['Minyak Kelapa (lebih harum, +Rp 4/ml)'],
        isOptional: false
      },
      {
        menuId: menu9.id,
        inventoryItemId: findInventoryItem('GLP-001'),        quantity: 0.01, // was 10g        preparationNotes: 'Campurkan 10 gram gula pasir (1 sendok makan) ke dalam adonan tepung untuk sedikit rasa manis. Gula membantu warna keemasan saat digoreng dan menambah rasa. Jangan terlalu banyak agar tidak terlalu manis dan menutupi rasa pisang alami.',
        substitutes: [],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  // Menu 10: Susu Kedelai Cokelat (Chocolate Soy Milk - Lactose Free)
  const menu10 = menus.find(m => m.menuCode === 'SNACK-005')!
  await prisma.menuIngredient.createMany({
    data: [
      {
        menuId: menu10.id,
        inventoryItemId: findInventoryItem('KDL-001'),        quantity: 0.08, // was 80g        preparationNotes: 'Rendam 80 gram kedelai kuning kering (5 sendok makan) dalam air 8 jam atau semalaman hingga mengembang 2x lipat. Kupas kulit ari dengan meremas dalam air. Blender kedelai dengan 600ml air hingga sangat halus (3-4 menit). Saring dengan kain saring halus, peras untuk mendapatkan susu kedelai murni. Kedelai kaya protein nabati, isoflavon, dan cocok untuk anak lactose intolerant.',
        substitutes: ['Kedelai Hitam (lebih kaya antioksidan, +Rp 8/g)'],
        isOptional: false
      },
      {
        menuId: menu10.id,
        inventoryItemId: findInventoryItem('CKT-001'),        quantity: 0.02, // was 20g        preparationNotes: 'Larutkan 20 gram bubuk cokelat murni (3 sendok makan) dalam 50ml air hangat hingga tidak ada gumpalan. Gunakan cokelat dengan kandungan kakao minimal 40% untuk rasa cokelat yang kaya. Masukkan larutan cokelat ke susu kedelai yang sudah mendidih, aduk rata. Cokelat menambah antioksidan dan rasa yang disukai anak-anak.',
        substitutes: ['Bubuk Milo (lebih manis, +Rp 30/g)', 'Dark Chocolate Chips (lebih premium, +Rp 80/g)'],
        isOptional: false
      },
      {
        menuId: menu10.id,
        inventoryItemId: findInventoryItem('GLP-001'),        quantity: 0.05, // was 50g        preparationNotes: 'Tambahkan 50 gram gula pasir (4 sendok makan) ke dalam susu kedelai setelah mendidih. Aduk hingga larut sempurna. Gula menghilangkan rasa langu kedelai dan memberikan rasa manis yang pas untuk anak-anak. Sesuaikan tingkat kemanisan dengan selera. Masak 10 menit dengan api kecil sambil diaduk agar gula larut sempurna.',
        substitutes: ['Gula Aren (rasa lebih kompleks, +Rp 12/g)', 'Madu (lebih sehat, +Rp 100/g)'],
        isOptional: false
      },
      {
        menuId: menu10.id,
        inventoryItemId: findInventoryItem('PDN-001'),        quantity: 0.002, // was 2g        preparationNotes: 'Cuci bersih 2 lembar daun pandan, simpul ujungnya. Masukkan saat merebus susu kedelai untuk menghilangkan bau langu dan menambah aroma harum. Rebus susu kedelai dengan daun pandan selama 15 menit dengan api kecil sambil diaduk agar tidak gosong di dasar panci. Angkat daun pandan sebelum disajikan.',
        substitutes: ['Ekstrak Vanila (rasa berbeda, +Rp 200/porsi)'],
        isOptional: false
      },
      {
        menuId: menu10.id,
        inventoryItemId: findInventoryItem('GRM-001'),        quantity: 0.001, // was 1g        preparationNotes: 'Tambahkan sejumput garam (1 gram / 1/4 sendok teh) untuk menyeimbangkan rasa manis dan mengurangi rasa langu kedelai. Garam membuat rasa cokelat lebih menonjol. Jangan terlalu banyak agar tidak terasa asin.',
        substitutes: [],
        isOptional: false
      }
    ],
    skipDuplicates: true
  })

  console.log('  ✓ Created Menu Ingredients for sample menus')
}

/**
 * Seed Recipe Steps - detailed cooking instructions
 */
async function seedRecipeSteps(
  prisma: PrismaClient,
  menus: NutritionMenu[]
): Promise<void> {
  // Recipe Steps for Menu 1: Nasi Gudeg Ayam Purwakarta
  const menu1 = menus.find(m => m.menuCode === 'LUNCH-001')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu1.id,
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Cuci bersih nangka muda, potong dadu kecil. Suwir ayam yang sudah direbus. Siapkan bumbu halus.',
        duration: 15,
        equipment: ['PISAU', 'TELENAN', 'WADAH'],
        qualityCheck: 'Pastikan nangka dipotong seragam, ayam suwir halus'
      },
      {
        menuId: menu1.id,
        stepNumber: 2,
        title: 'Masak Gudeg',
        instruction: 'Rebus nangka dengan bumbu halus, gula merah, dan daun salam. Tambahkan santan, masak dengan api kecil hingga nangka empuk dan bumbu meresap (sekitar 3 jam).',
        duration: 180,
        temperature: 100,
        equipment: ['PANCI_BESAR', 'KOMPOR', 'SENDOK_KAYU'],
        qualityCheck: 'Nangka harus empuk, kuah mengental, warna cokelat merata'
      },
      {
        menuId: menu1.id,
        stepNumber: 3,
        title: 'Masak Ayam Suwir',
        instruction: 'Tumis ayam suwir dengan bumbu gudeg, masak hingga bumbu meresap. Tambahkan sedikit santan.',
        duration: 20,
        temperature: 150,
        equipment: ['WAJAN', 'SPATULA'],
        qualityCheck: 'Ayam berbumbu merata, tidak kering'
      },
      {
        menuId: menu1.id,
        stepNumber: 4,
        title: 'Goreng Tahu dan Tempe',
        instruction: 'Potong tahu dan tempe, goreng dalam minyak panas hingga kuning keemasan dan crispy.',
        duration: 15,
        temperature: 180,
        equipment: ['WAJAN', 'SEROK'],
        qualityCheck: 'Tahu dan tempe matang merata, warna kuning keemasan'
      },
      {
        menuId: menu1.id,
        stepNumber: 5,
        title: 'Plating dan Penyajian',
        instruction: 'Tata nasi putih di piring, tambahkan gudeg, ayam suwir, tahu bacem, tempe goreng. Sajikan dengan sambal.',
        duration: 5,
        equipment: ['PIRING', 'SENDOK_SAJI'],
        qualityCheck: 'Presentasi menarik, porsi sesuai standar (350g)'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 2: Nasi Ayam Goreng Lalapan
  const menu2 = menus.find(m => m.menuCode === 'LUNCH-002')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu2.id,
        stepNumber: 1,
        title: 'Marinasi Ayam',
        instruction: 'Lumuri ayam dengan bumbu kuning yang sudah dihaluskan (kunyit, bawang putih, lengkuas, ketumbar, garam). Diamkan 30 menit.',
        duration: 30,
        equipment: ['WADAH', 'BLENDER'],
        qualityCheck: 'Ayam terlumuri bumbu merata'
      },
      {
        menuId: menu2.id,
        stepNumber: 2,
        title: 'Goreng Ayam',
        instruction: 'Panaskan minyak goreng, goreng ayam dengan api sedang hingga matang dan berwarna kuning keemasan. Balik sesekali agar matang merata.',
        duration: 25,
        temperature: 170,
        equipment: ['WAJAN_DALAM', 'SEROK', 'KOMPOR'],
        qualityCheck: 'Ayam matang sempurna, kulit crispy, warna kuning keemasan'
      },
      {
        menuId: menu2.id,
        stepNumber: 3,
        title: 'Goreng Tahu',
        instruction: 'Goreng tahu putih hingga permukaan berwarna kuning kecokelatan.',
        duration: 10,
        temperature: 180,
        equipment: ['WAJAN', 'SEROK'],
        qualityCheck: 'Tahu matang merata, tidak gosong'
      },
      {
        menuId: menu2.id,
        stepNumber: 4,
        title: 'Siapkan Lalapan',
        instruction: 'Cuci bersih kubis, timun, dan tomat. Iris tipis kubis dan timun, potong tomat wedges.',
        duration: 10,
        equipment: ['PISAU', 'TELENAN', 'WADAH'],
        qualityCheck: 'Sayuran segar, bersih, irisan rapi'
      },
      {
        menuId: menu2.id,
        stepNumber: 5,
        title: 'Plating',
        instruction: 'Tata nasi putih, ayam goreng, tahu goreng, dan lalapan segar di piring. Sajikan dengan sambal terasi.',
        duration: 5,
        equipment: ['PIRING', 'SENDOK_SAJI'],
        qualityCheck: 'Presentasi menarik, porsi standar (330g)'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 6: Roti Pisang Cokelat (Snack)
  const menu6 = menus.find(m => m.menuCode === 'SNACK-001')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu6.id,
        stepNumber: 1,
        title: 'Persiapan Roti',
        instruction: 'Ambil roti gandum tawar, oles dengan mentega tipis di satu sisi.',
        duration: 5,
        equipment: ['PISAU_ROTI', 'WADAH'],
        qualityCheck: 'Roti masih segar, tidak keras'
      },
      {
        menuId: menu6.id,
        stepNumber: 2,
        title: 'Isi Roti',
        instruction: 'Potong pisang memanjang, letakkan di tengah roti. Tambahkan selai cokelat di atas pisang.',
        duration: 5,
        equipment: ['PISAU', 'SENDOK'],
        qualityCheck: 'Pisang dan cokelat terdistribusi merata'
      },
      {
        menuId: menu6.id,
        stepNumber: 3,
        title: 'Panggang',
        instruction: 'Lipat roti, panggang dalam oven atau sandwich maker hingga roti crispy dan cokelat leleh (sekitar 10 menit pada suhu 180°C).',
        duration: 10,
        temperature: 180,
        equipment: ['OVEN', 'LOYANG'],
        qualityCheck: 'Roti crispy keemasan, cokelat leleh'
      },
      {
        menuId: menu6.id,
        stepNumber: 4,
        title: 'Penyajian',
        instruction: 'Potong diagonal, sajikan hangat. Bisa tambahkan taburan gula halus jika suka.',
        duration: 2,
        equipment: ['PISAU', 'PIRING'],
        qualityCheck: 'Sajian hangat, potongan rapi'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 3: Nasi Ikan Pepes Sunda
  const menu3 = menus.find(m => m.menuCode === 'LUNCH-003')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu3.id,
        stepNumber: 1,
        title: 'Persiapan Ikan dan Bumbu',
        instruction: 'Bersihkan ikan mas Jatiluhur 80g, buang sisik dan isi perut. Haluskan bumbu: bawang merah 10g, bawang putih 5g, cabai rawit 3g, kunyit 3g, lengkuas 3g, dengan garam 2g. Lumuri ikan dengan bumbu halus, diamkan 15 menit agar meresap.',
        duration: 20,
        equipment: ['PISAU', 'TELENAN', 'COBEK', 'WADAH'],
        qualityCheck: 'Ikan bersih tanpa lendir, bumbu meresap merata, aroma harum'
      },
      {
        menuId: menu3.id,
        stepNumber: 2,
        title: 'Siapkan Daun Pisang',
        instruction: 'Cuci daun pisang segar, keringkan. Lewatkan sebentar di atas api kompor agar lentur dan mudah dilipat (5 detik per sisi). Hati-hati jangan sampai terbakar.',
        duration: 5,
        equipment: ['DAUN_PISANG', 'KOMPOR'],
        qualityCheck: 'Daun pisang lentur, tidak sobek, warna hijau segar'
      },
      {
        menuId: menu3.id,
        stepNumber: 3,
        title: 'Bungkus Pepes',
        instruction: 'Letakkan ikan berbumbu di tengah daun pisang. Tambahkan irisan tomat 5g dan daun kemangi 3g di atas ikan untuk aroma. Lipat daun pisang membentuk amplop, tusuk ujung dengan lidi atau tusuk gigi agar tidak terbuka saat dikukus.',
        duration: 10,
        equipment: ['DAUN_PISANG', 'TUSUK_GIGI', 'LIDI'],
        qualityCheck: 'Bungkusan rapat tidak bocor, bentuk rapi, tusukan kuat'
      },
      {
        menuId: menu3.id,
        stepNumber: 4,
        title: 'Kukus Pepes',
        instruction: 'Panaskan kukusan dengan api sedang hingga air mendidih. Susun pepes ikan, kukus selama 30 menit dengan api sedang-besar. Pastikan air kukusan tidak habis, tambahkan air panas jika perlu.',
        duration: 35,
        temperature: 100,
        equipment: ['KUKUSAN', 'KOMPOR', 'TIMER'],
        qualityCheck: 'Ikan matang sempurna (daging mudah terlepas dari tulang), aroma harum khas pepes, daun pisang layu'
      },
      {
        menuId: menu3.id,
        stepNumber: 5,
        title: 'Goreng Tempe Mendoan',
        instruction: 'Iris tempe tipis 3mm, celupkan dalam adonan tepung beras 30g yang sudah dicampur air 50ml, bawang putih 3g, daun bawang 3g, garam 1g. Goreng dengan minyak panas 150ml hingga crispy kekuningan (7 menit).',
        duration: 15,
        temperature: 170,
        equipment: ['PISAU', 'WADAH', 'WAJAN', 'SEROK'],
        qualityCheck: 'Tempe mendoan crispy tidak berminyak, warna kuning keemasan merata'
      },
      {
        menuId: menu3.id,
        stepNumber: 6,
        title: 'Masak Nasi',
        instruction: 'Cuci beras 80g hingga air jernih (3x bilas). Masak dengan rice cooker menggunakan air 96ml (rasio 1:1.2) selama 25 menit. Biarkan mengembang sempurna 10 menit setelah matang.',
        duration: 35,
        equipment: ['RICE_COOKER', 'GELAS_UKUR'],
        qualityCheck: 'Nasi pulen tidak keras atau lembek, butiran terpisah, aroma harum'
      },
      {
        menuId: menu3.id,
        stepNumber: 7,
        title: 'Plating dan Penyajian',
        instruction: 'Tata nasi putih di piring. Letakkan pepes ikan (boleh dibuka bungkusnya atau tetap terbungkus untuk aroma). Tambahkan tempe mendoan di samping. Sajikan hangat dengan sambal terasi jika suka.',
        duration: 5,
        equipment: ['PIRING', 'SENDOK_SAJI'],
        qualityCheck: 'Presentasi tradisional Sunda, porsi 350g, sajian hangat, aroma menggugah selera'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 4: Nasi Sayur Asem Iga Ayam
  const menu4 = menus.find(m => m.menuCode === 'LUNCH-004')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu4.id,
        stepNumber: 1,
        title: 'Rebus Iga Ayam',
        instruction: 'Rebus iga ayam 70g dalam 800ml air dengan lengkuas 5g (memarkan), daun salam 2 lembar, dan garam 2g. Rebus hingga iga empuk (45 menit) dengan api sedang. Buang busa yang timbul agar kuah jernih.',
        duration: 50,
        equipment: ['PANCI', 'SEROK_BUSA', 'KOMPOR'],
        qualityCheck: 'Iga empuk (daging mudah lepas dari tulang), kuah kaldu jernih, aroma harum'
      },
      {
        menuId: menu4.id,
        stepNumber: 2,
        title: 'Siapkan Bumbu Sayur Asem',
        instruction: 'Haluskan bumbu: bawang merah 10g, bawang putih 5g, cabai rawit 3g, terasi bakar 2g. Larutkan asam jawa 15g dalam 100ml air hangat, saring untuk mendapat air asam. Siapkan gula merah 10g (parut halus).',
        duration: 15,
        equipment: ['COBEK', 'ULEKAN', 'SARINGAN', 'WADAH'],
        qualityCheck: 'Bumbu halus merata, air asam jernih, gula merah siap larut'
      },
      {
        menuId: menu4.id,
        stepNumber: 3,
        title: 'Tumis Bumbu',
        instruction: 'Panaskan minyak goreng 30ml, tumis bumbu halus hingga harum dan matang (tidak langu), sekitar 5 menit dengan api sedang. Aduk terus agar tidak gosong.',
        duration: 8,
        temperature: 150,
        equipment: ['WAJAN', 'SPATULA', 'KOMPOR'],
        qualityCheck: 'Bumbu harum matang, berwarna kecoklatan, minyak terpisah'
      },
      {
        menuId: menu4.id,
        stepNumber: 4,
        title: 'Masak Sayuran',
        instruction: 'Masukkan bumbu tumis ke dalam kuah kaldu iga. Tambahkan labu siam 50g (potong dadu), jagung manis 40g (potong bulat 2cm), kacang panjang 30g (potong 3cm). Masak 15 menit hingga sayuran empuk tapi masih crispy.',
        duration: 20,
        equipment: ['PANCI', 'PISAU', 'TELENAN', 'SENDOK_KAYU'],
        qualityCheck: 'Sayuran empuk tidak terlalu lembek, warna masih cerah, tekstur masih crispy'
      },
      {
        menuId: menu4.id,
        stepNumber: 5,
        title: 'Tambahkan Asam dan Penyedap',
        instruction: 'Masukkan air asam jawa yang sudah disaring, gula merah parut, dan garam secukupnya. Aduk rata, masak 10 menit hingga bumbu meresap. Koreksi rasa: harus ada keseimbangan asam, manis, dan gurih khas sayur asem.',
        duration: 12,
        equipment: ['SENDOK_KAYU', 'SENDOK_SAYUR'],
        qualityCheck: 'Rasa asam manis gurih seimbang, kuah berwarna kecoklatan, aroma segar'
      },
      {
        menuId: menu4.id,
        stepNumber: 6,
        title: 'Masak Nasi',
        instruction: 'Cuci beras 80g dengan air bersih 3 kali hingga air jernih. Masak dengan rice cooker, air 96ml (rasio 1:1.2). Tunggu 25 menit hingga matang, diamkan 10 menit agar nasi mengembang sempurna.',
        duration: 35,
        equipment: ['RICE_COOKER', 'GELAS_UKUR', 'WADAH'],
        qualityCheck: 'Nasi pulen, butiran terpisah, tidak keras atau lembek'
      },
      {
        menuId: menu4.id,
        stepNumber: 7,
        title: 'Plating dan Penyajian',
        instruction: 'Tata nasi putih di mangkuk dalam. Siram dengan sayur asem (sayuran dan kuah). Pastikan iga ayam, labu siam, jagung, dan kacang panjang terdistribusi merata. Sajikan hangat.',
        duration: 5,
        equipment: ['MANGKUK', 'SENDOK_SAYUR', 'PIRING_SAJI'],
        qualityCheck: 'Presentasi menarik, porsi 350g, sayuran komplit, kuah cukup, sajian hangat'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 5: Nasi Empal Gepuk Sunda
  const menu5 = menus.find(m => m.menuCode === 'LUNCH-005')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu5.id,
        stepNumber: 1,
        title: 'Rebus Daging Sapi Sengkel',
        instruction: 'Rebus daging sapi sengkel 70g dalam 400ml air dengan lengkuas 5g (memarkan), sereh 3g (memarkan), daun salam 1 lembar, dan garam 2g. Rebus dengan api kecil-sedang selama 90 menit hingga daging sangat empuk. Cek air, tambahkan air panas jika berkurang.',
        duration: 95,
        equipment: ['PANCI', 'KOMPOR', 'SENDOK', 'TIMER'],
        qualityCheck: 'Daging sangat empuk (mudah ditusuk garpu), kuah kaldu berkurang setengah, aroma harum khas lengkuas sereh'
      },
      {
        menuId: menu5.id,
        stepNumber: 2,
        title: 'Dinginkan dan Gepuk Daging',
        instruction: 'Angkat daging rebus, tiriskan dan dinginkan 10 menit agar lebih mudah digepuk. Letakkan daging di telenan, gepuk/pukul dengan ulekan atau palu daging hingga pipih setebal 1cm. Proses gepuk ini yang membuat tekstur empal khas Sunda yang lembut.',
        duration: 15,
        equipment: ['TELENAN', 'ULEKAN', 'PALU_DAGING'],
        qualityCheck: 'Daging pipih merata tebal 1cm, serat terbuka, tekstur lembut tidak hancur'
      },
      {
        menuId: menu5.id,
        stepNumber: 3,
        title: 'Buat Bumbu Empal',
        instruction: 'Haluskan bumbu empal: ketumbar sangrai 5g, bawang merah 8g (2 siung), bawang putih 3g (1 siung), lengkuas 2g, gula merah 1g, dan garam 1g. Bumbu harus sangat halus agar meresap sempurna.',
        duration: 10,
        equipment: ['COBEK', 'ULEKAN', 'WAJAN_KECIL'],
        qualityCheck: 'Bumbu sangat halus seperti pasta, aroma ketumbar sangrai kuat, warna kecoklatan'
      },
      {
        menuId: menu5.id,
        stepNumber: 4,
        title: 'Marinasi Daging',
        instruction: 'Lumuri daging gepuk dengan bumbu halus di kedua sisi. Pijat-pijat agar bumbu meresap ke dalam serat daging. Diamkan minimal 30 menit (atau overnight di kulkas untuk rasa lebih mantap).',
        duration: 35,
        equipment: ['WADAH', 'SENDOK', 'PLASTIK_WRAP'],
        qualityCheck: 'Bumbu meresap merata, daging berbumbu di semua sisi, aroma harum'
      },
      {
        menuId: menu5.id,
        stepNumber: 5,
        title: 'Goreng Empal Kering',
        instruction: 'Panaskan minyak goreng sedikit (50ml) dalam wajan. Goreng daging berbumbu dengan api kecil-sedang hingga kering dan berwarna cokelat keemasan (15-20 menit). Balik berkala agar matang merata. Empal harus kering agar tahan lama.',
        duration: 20,
        temperature: 150,
        equipment: ['WAJAN', 'SPATULA', 'KOMPOR', 'SEROK'],
        qualityCheck: 'Empal kering tidak berminyak, warna cokelat keemasan merata, tekstur lembut gurih'
      },
      {
        menuId: menu5.id,
        stepNumber: 6,
        title: 'Siapkan Pelengkap',
        instruction: 'Cuci lalapan (kubis 20g, timun 10g, kemangi 10g). Iris kubis dan timun. Siapkan sambal dadak (cabai rawit 15g + tomat 5g + bawang merah 3g + terasi 2g + garam, diulek kasar). Goreng kerupuk kulit 15g hingga mengembang.',
        duration: 15,
        temperature: 180,
        equipment: ['PISAU', 'TELENAN', 'COBEK', 'WAJAN', 'SEROK'],
        qualityCheck: 'Lalapan segar bersih, sambal dadak tidak terlalu halus, kerupuk kering mengembang'
      },
      {
        menuId: menu5.id,
        stepNumber: 7,
        title: 'Masak Nasi',
        instruction: 'Cuci beras 80g hingga air jernih. Masak dengan rice cooker, air 96ml (rasio 1:1.2), tunggu 25 menit. Diamkan 10 menit setelah matang.',
        duration: 35,
        equipment: ['RICE_COOKER', 'GELAS_UKUR'],
        qualityCheck: 'Nasi pulen hangat, butiran terpisah sempurna'
      },
      {
        menuId: menu5.id,
        stepNumber: 8,
        title: 'Plating Empal Gepuk Sunda',
        instruction: 'Tata nasi putih di piring. Letakkan empal gepuk di samping (1-2 potong). Tambahkan lalapan segar, sambal dadak, dan kerupuk kulit. Presentasi harus mencerminkan hidangan khas Sunda yang autentik.',
        duration: 5,
        equipment: ['PIRING', 'SENDOK_SAJI', 'MANGKUK_KECIL'],
        qualityCheck: 'Presentasi premium Sunda, porsi 360g, komposisi lengkap, sajian hangat, aroma menggugah'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 7: Bubur Kacang Hijau
  const menu7 = menus.find(m => m.menuCode === 'SNACK-002')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu7.id,
        stepNumber: 1,
        title: 'Rendam Kacang Hijau',
        instruction: 'Cuci bersih kacang hijau 80g dengan air mengalir. Rendam dalam air bersih 200ml selama minimal 2 jam atau semalam (optimal 8 jam) agar empuk saat dimasak dan waktu memasak lebih cepat. Buang kacang yang mengapung (busuk).',
        duration: 10,
        equipment: ['WADAH', 'SARINGAN', 'AIR_BERSIH'],
        qualityCheck: 'Kacang bersih, terendam semua, tidak ada yang mengapung'
      },
      {
        menuId: menu7.id,
        stepNumber: 2,
        title: 'Rebus Kacang Hijau',
        instruction: 'Tiriskan kacang yang sudah direndam. Rebus dalam 600ml air dengan api sedang. Setelah mendidih, kecilkan api dan masak 45-60 menit hingga kacang sangat empuk dan mulai hancur. Aduk sesekali, tambahkan air panas jika air berkurang.',
        duration: 60,
        temperature: 95,
        equipment: ['PANCI', 'SENDOK_KAYU', 'KOMPOR'],
        qualityCheck: 'Kacang sangat empuk mudah hancur, kuah kental, warna hijau kecoklatan'
      },
      {
        menuId: menu7.id,
        stepNumber: 3,
        title: 'Tambahkan Daun Pandan',
        instruction: 'Cuci daun pandan 2 lembar, simpulkan agar mudah diangkat. Masukkan ke dalam rebusan kacang hijau. Daun pandan memberikan aroma harum khas yang penting untuk bubur kacang hijau tradisional.',
        duration: 2,
        equipment: ['DAUN_PANDAN', 'GUNTING'],
        qualityCheck: 'Daun pandan segar, disimpul rapi, aroma harum menyebar'
      },
      {
        menuId: menu7.id,
        stepNumber: 4,
        title: 'Masak Santan',
        instruction: 'Panaskan santan kental 100ml dalam panci terpisah dengan api kecil. Aduk terus agar santan tidak pecah. Masak hingga mendidih perlahan (10 menit). Santan yang dipanaskan dulu tidak akan pecah saat dicampur bubur panas.',
        duration: 12,
        temperature: 80,
        equipment: ['PANCI_KECIL', 'SENDOK_KAYU', 'KOMPOR'],
        qualityCheck: 'Santan mendidih tidak pecah, warna putih creamy, kental'
      },
      {
        menuId: menu7.id,
        stepNumber: 5,
        title: 'Tambahkan Gula dan Santan',
        instruction: 'Masukkan gula pasir 40g ke dalam bubur kacang hijau, aduk hingga larut sempurna. Tuangkan santan panas perlahan sambil diaduk terus. Masak 5 menit hingga semua bumbu menyatu. Koreksi rasa: manis pas, gurih santan, aroma pandan.',
        duration: 8,
        equipment: ['SENDOK_KAYU', 'SENDOK_SAYUR'],
        qualityCheck: 'Rasa manis gurih seimbang, santan menyatu tidak pecah, tekstur kental creamy'
      },
      {
        menuId: menu7.id,
        stepNumber: 6,
        title: 'Tambahkan Garam',
        instruction: 'Tambahkan sedikit garam 2g untuk mengangkat rasa manis dan gurih. Garam sedikit saja sebagai penyeimbang rasa. Aduk rata dan masak 2 menit lagi.',
        duration: 3,
        equipment: ['SENDOK', 'SENDOK_KAYU'],
        qualityCheck: 'Rasa balance, garam tidak dominan, hanya enhancer'
      },
      {
        menuId: menu7.id,
        stepNumber: 7,
        title: 'Penyajian Hangat',
        instruction: 'Angkat dan buang daun pandan. Tuang bubur kacang hijau ke dalam mangkuk. Sajikan hangat atau suhu ruang. Bisa ditambahkan santan ekstra di atas sebagai garnish untuk presentasi lebih menarik.',
        duration: 3,
        equipment: ['MANGKUK', 'SENDOK_SAYUR', 'SENDOK_MAKAN'],
        qualityCheck: 'Bubur hangat tekstur kental, warna hijau kecoklatan menarik, aroma pandan harum, porsi 220g'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 8: Nagasari Pisang
  const menu8 = menus.find(m => m.menuCode === 'SNACK-003')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu8.id,
        stepNumber: 1,
        title: 'Siapkan Daun Pisang',
        instruction: 'Cuci bersih daun pisang segar 5 lembar (untuk 5 porsi). Potong ukuran 25x20cm. Lewatkan di atas api kompor sebentar (5 detik per sisi) agar lentur dan mudah dilipat. Keringkan dengan lap bersih.',
        duration: 10,
        equipment: ['DAUN_PISANG', 'GUNTING', 'KOMPOR', 'LAP'],
        qualityCheck: 'Daun pisang lentur tidak sobek, warna hijau segar, bersih kering'
      },
      {
        menuId: menu8.id,
        stepNumber: 2,
        title: 'Buat Adonan Nagasari',
        instruction: 'Campur tepung beras 60g, gula pasir 30g, dan sedikit garam 1g dalam wadah. Tuang santan kental 150ml sedikit demi sedikit sambil diaduk hingga adonan halus tanpa gumpalan. Adonan harus kental seperti pancake batter. Saring jika perlu untuk hasil halus.',
        duration: 10,
        equipment: ['WADAH', 'SENDOK', 'SARINGAN', 'WHISK'],
        qualityCheck: 'Adonan halus tanpa gumpalan, kental creamy, warna putih susu'
      },
      {
        menuId: menu8.id,
        stepNumber: 3,
        title: 'Masak Adonan Sambil Diaduk',
        instruction: 'Tuang adonan ke panci, masak dengan api kecil sambil diaduk terus-menerus agar tidak gosong dan menggumpal. Masak hingga adonan mengental dan matang (tidak berbau tepung mentah), sekitar 10 menit. Tekstur harus seperti bubur kental.',
        duration: 12,
        temperature: 70,
        equipment: ['PANCI', 'SENDOK_KAYU', 'KOMPOR'],
        qualityCheck: 'Adonan matang kental seperti puding, tidak berbau langu, bisa diangkat dengan sendok'
      },
      {
        menuId: menu8.id,
        stepNumber: 4,
        title: 'Siapkan Isian Pisang Raja',
        instruction: 'Kupas pisang raja matang 100g (2 buah). Potong memanjang menjadi 2 bagian per pisang. Hindari pisang yang terlalu matang (lembek) atau terlalu muda (keras). Pisang raja memberikan aroma dan rasa manis alami khas nagasari.',
        duration: 5,
        equipment: ['PISAU', 'TELENAN'],
        qualityCheck: 'Pisang matang sempurna, warna kuning cerah, tekstur firm tidak lembek'
      },
      {
        menuId: menu8.id,
        stepNumber: 5,
        title: 'Bungkus Nagasari',
        instruction: 'Letakkan daun pisang di permukaan datar. Tuang 3 sendok makan adonan di tengah daun. Letakkan potongan pisang raja di atas adonan. Tuang lagi 2 sendok makan adonan untuk menutupi pisang. Lipat daun membentuk amplop persegi panjang, kunci ujung dengan tusuk gigi atau stapler bambu.',
        duration: 15,
        equipment: ['DAUN_PISANG', 'SENDOK', 'TUSUK_GIGI', 'STAPLER_BAMBU'],
        qualityCheck: 'Bungkusan rapat tidak bocor, pisang tertutup adonan sempurna, bentuk rapi seragam'
      },
      {
        menuId: menu8.id,
        stepNumber: 6,
        title: 'Kukus Nagasari',
        instruction: 'Panaskan kukusan dengan air mendidih. Susun nagasari dengan rapi (jangan terlalu penuh agar uap merata). Kukus dengan api sedang-besar selama 30 menit hingga adonan matang sempurna (padat kenyal). Buka sebentar setiap 10 menit untuk mencegah air kukusan menetes ke nagasari.',
        duration: 35,
        temperature: 100,
        equipment: ['KUKUSAN', 'KOMPOR', 'SARUNG_TANGAN', 'TIMER'],
        qualityCheck: 'Nagasari matang padat (tidak lengket di tangan), daun layu, aroma harum pisang dan pandan'
      },
      {
        menuId: menu8.id,
        stepNumber: 7,
        title: 'Pendinginan dan Penyajian',
        instruction: 'Angkat nagasari dari kukusan, dinginkan 10 menit agar mudah dibuka. Nagasari bisa disajikan hangat atau dingin (cold dessert). Buka bungkus daun saat akan dimakan untuk aroma daun pisang yang harum. Porsi 1 nagasari = 195g.',
        duration: 12,
        equipment: ['PIRING', 'WADAH_SAJI'],
        qualityCheck: 'Nagasari padat tidak lembek, pisang di tengah sempurna, aroma harum daun pisang, tekstur kenyal lembut'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 9: Pisang Goreng Keju
  const menu9 = menus.find(m => m.menuCode === 'SNACK-004')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu9.id,
        stepNumber: 1,
        title: 'Pilih dan Siapkan Pisang Kepok',
        instruction: 'Pilih pisang kepok kuning matang sempurna 120g (2 buah). Hindari yang terlalu matang (lembek) atau terlalu muda (keras pahit). Kupas pisang, potong memanjang menjadi 2 bagian. Pisang kepok adalah jenis terbaik untuk pisang goreng karena teksturnya yang padat.',
        duration: 5,
        equipment: ['PISAU', 'TELENAN', 'PIRING'],
        qualityCheck: 'Pisang kepok matang sempurna, warna kuning cerah, tekstur padat firm'
      },
      {
        menuId: menu9.id,
        stepNumber: 2,
        title: 'Buat Adonan Tepung Crispy',
        instruction: 'Campur tepung beras 50g, gula pasir 10g, dan sedikit garam 1g dalam wadah. Tambahkan air dingin 80ml sedikit demi sedikit sambil diaduk hingga adonan kental seperti pancake batter. Adonan jangan terlalu encer agar hasil crispy. Diamkan 5 menit.',
        duration: 8,
        equipment: ['WADAH', 'SENDOK', 'WHISK', 'GELAS_UKUR'],
        qualityCheck: 'Adonan kental smooth, tidak ada gumpalan, bisa melapisi pisang sempurna'
      },
      {
        menuId: menu9.id,
        stepNumber: 3,
        title: 'Panaskan Minyak Goreng',
        instruction: 'Tuang minyak goreng 100ml ke dalam wajan dalam (minimal kedalaman 5cm). Panaskan dengan api sedang hingga suhu 170-180°C (test: teteskan adonan, langsung mengapung = siap). Suhu tepat penting untuk hasil crispy tidak berminyak.',
        duration: 8,
        temperature: 175,
        equipment: ['WAJAN_DALAM', 'KOMPOR', 'TERMOMETER'],
        qualityCheck: 'Minyak panas stabil 170-180°C, tidak berasap, siap goreng'
      },
      {
        menuId: menu9.id,
        stepNumber: 4,
        title: 'Celup dan Goreng Pisang',
        instruction: 'Celupkan pisang ke dalam adonan tepung hingga terbalut rata semua sisi. Masukkan ke minyak panas perlahan (hindari percikan). Goreng 4-5 menit per sisi hingga kuning keemasan crispy. Jangan terlalu banyak sekaligus agar suhu minyak stabil. Balik dengan hati-hati.',
        duration: 12,
        temperature: 175,
        equipment: ['WAJAN_DALAM', 'SEROK', 'SUMPIT'],
        qualityCheck: 'Pisang goreng crispy berwarna kuning keemasan merata, tidak berminyak, matang sempurna'
      },
      {
        menuId: menu9.id,
        stepNumber: 5,
        title: 'Tiriskan Minyak',
        instruction: 'Angkat pisang goreng dengan serok berlubang. Tiriskan di atas kertas minyak atau rak kawat selama 2 menit untuk menghilangkan minyak berlebih. Pisang goreng crispy harus tidak berminyak.',
        duration: 3,
        equipment: ['SEROK', 'KERTAS_MINYAK', 'RAK_TIRIS'],
        qualityCheck: 'Minyak menetes habis, pisang goreng kering crispy, tidak berminyak'
      },
      {
        menuId: menu9.id,
        stepNumber: 6,
        title: 'Tambahkan Topping Keju Cheddar',
        instruction: 'Letakkan pisang goreng hangat di piring. Taburkan keju cheddar parut 30g secara merata di atas pisang selagi masih panas agar keju sedikit meleleh. Keju cheddar memberikan rasa gurih asin yang balance dengan manis pisang.',
        duration: 2,
        equipment: ['PIRING', 'PARUTAN_KEJU'],
        qualityCheck: 'Keju tertabur merata, sedikit meleleh, kombinasi warna kuning emas dan orange keju menarik'
      },
      {
        menuId: menu9.id,
        stepNumber: 7,
        title: 'Penyajian Hangat',
        instruction: 'Sajikan pisang goreng keju segera selagi hangat dan crispy. Bisa tambahkan taburan gula halus atau cokelat bubuk sebagai variasi. Pisang goreng keju paling nikmat dimakan hangat saat keju masih meleleh dan kulit masih crispy.',
        duration: 2,
        equipment: ['PIRING_SAJI', 'TISU'],
        qualityCheck: 'Pisang goreng hangat crispy, keju meleleh sempurna, aroma menggugah, porsi 250g'
      }
    ],
    skipDuplicates: true
  })

  // Recipe Steps for Menu 10: Susu Kedelai Cokelat
  const menu10 = menus.find(m => m.menuCode === 'SNACK-005')!
  await prisma.recipeStep.createMany({
    data: [
      {
        menuId: menu10.id,
        stepNumber: 1,
        title: 'Rendam Kedelai Kuning',
        instruction: 'Cuci bersih kedelai kuning 80g dengan air mengalir. Buang kedelai yang rusak atau hitam. Rendam dalam 400ml air bersih minimal 8 jam (semalam) di suhu ruang atau 4 jam di kulkas. Kedelai akan mengembang 2x lipat dan kulit luar mengendur. Rendam yang cukup menghasilkan susu kedelai yang creamy dan tidak langu.',
        duration: 10,
        equipment: ['WADAH', 'SARINGAN', 'AIR_BERSIH'],
        qualityCheck: 'Kedelai bersih, terendam sempurna, tidak ada yang mengapung (busuk)'
      },
      {
        menuId: menu10.id,
        stepNumber: 2,
        title: 'Kupas Kulit Kedelai',
        instruction: 'Tiriskan kedelai yang sudah mengembang. Kupas kulit ari kedelai dengan cara diremas-remas dalam air. Kulit akan terlepas dan mengapung. Buang semua kulit agar susu kedelai tidak pahit dan beraroma langu. Proses ini penting untuk rasa susu kedelai yang enak.',
        duration: 15,
        equipment: ['WADAH_BESAR', 'AIR_BERSIH', 'SARINGAN'],
        qualityCheck: 'Kulit kedelai terbuang semua, kedelai bersih putih kekuningan, tidak berbau langu'
      },
      {
        menuId: menu10.id,
        stepNumber: 3,
        title: 'Blender Kedelai',
        instruction: 'Masukkan kedelai kupas ke blender. Tambahkan air matang hangat 500ml (suhu 60°C). Blender kecepatan tinggi selama 3-4 menit hingga sangat halus seperti bubur. Semakin halus, semakin banyak sari kedelai yang keluar. Air hangat membantu ekstraksi protein lebih maksimal.',
        duration: 5,
        temperature: 60,
        equipment: ['BLENDER', 'GELAS_UKUR', 'AIR_MATANG'],
        qualityCheck: 'Kedelai hancur sangat halus, tekstur seperti bubur creamy, warna putih krem'
      },
      {
        menuId: menu10.id,
        stepNumber: 4,
        title: 'Saring Sari Kedelai',
        instruction: 'Siapkan kain saring bersih (kain kasa atau kantong susu kedelai). Tuang hasil blender ke atas kain saring di atas wadah. Peras kuat-kuat dengan tangan untuk mengeluarkan semua sari kedelai. Ampas (okara) bisa dibuang atau digunakan untuk makanan lain. Hasil saringan adalah susu kedelai mentah.',
        duration: 10,
        equipment: ['KAIN_SARING', 'WADAH_BESAR', 'SARUNG_TANGAN'],
        qualityCheck: 'Susu kedelai tersaring sempurna tanpa ampas, warna putih creamy, kental'
      },
      {
        menuId: menu10.id,
        stepNumber: 5,
        title: 'Rebus Susu Kedelai',
        instruction: 'Tuang susu kedelai mentah ke panci. Tambahkan daun pandan 2 lembar (simpul) untuk aroma. Rebus dengan api sedang sambil diaduk terus agar tidak gosong di dasar panci. Setelah mendidih, kecilkan api dan masak 15 menit lagi untuk menghilangkan bau langu. Busa yang timbul dibuang.',
        duration: 25,
        temperature: 90,
        equipment: ['PANCI', 'SENDOK_KAYU', 'KOMPOR', 'SEROK_BUSA'],
        qualityCheck: 'Susu mendidih tidak meluap, tidak berbau langu, warna putih krem, aroma pandan harum'
      },
      {
        menuId: menu10.id,
        stepNumber: 6,
        title: 'Tambahkan Bubuk Cokelat dan Gula',
        instruction: 'Kecilkan api. Masukkan bubuk cokelat 20g (sudah dilarutkan dengan sedikit air hangat agar tidak menggumpal) dan gula pasir 50g. Aduk hingga larut sempurna dan tercampur rata. Masak 5 menit lagi sambil diaduk. Koreksi rasa: manis dan cokelat seimbang.',
        duration: 8,
        equipment: ['SENDOK', 'WADAH_KECIL', 'SENDOK_KAYU'],
        qualityCheck: 'Cokelat larut sempurna tanpa gumpalan, warna cokelat susu merata, rasa manis pas'
      },
      {
        menuId: menu10.id,
        stepNumber: 7,
        title: 'Tambahkan Garam untuk Balance',
        instruction: 'Tambahkan garam 1g (sedikit saja, ujung sendok teh). Garam berfungsi sebagai flavor enhancer yang mengangkat rasa manis dan cokelat. Aduk rata.',
        duration: 2,
        equipment: ['SENDOK_KECIL'],
        qualityCheck: 'Rasa balance, garam tidak terasa tapi membuat susu lebih nikmat'
      },
      {
        menuId: menu10.id,
        stepNumber: 8,
        title: 'Saring dan Penyajian',
        instruction: 'Angkat panci, buang daun pandan. Saring susu kedelai cokelat sekali lagi dengan saringan halus untuk hasil yang smooth. Tuang ke dalam gelas atau botol. Sajikan hangat atau dingin sesuai selera. Untuk sajian dingin, simpan di kulkas dan minum dalam 2 hari. Susu kedelai cokelat siap dinikmati!',
        duration: 5,
        equipment: ['SARINGAN_HALUS', 'GELAS', 'BOTOL', 'WADAH'],
        qualityCheck: 'Susu kedelai cokelat smooth tanpa ampas, warna cokelat susu menarik, aroma cokelat harum, rasa creamy, porsi 250ml'
      }
    ],
    skipDuplicates: true
  })

  console.log('  ✓ Created Recipe Steps for sample menus')
}

/**
 * Seed Nutrition Calculations - comprehensive nutrition data
 * DISABLED: Depends on menu ingredients (temporarily disabled for Fix #1)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function seedNutritionCalculations(
  prisma: PrismaClient,
  menus: NutritionMenu[],
  adminUser: User
): Promise<void> {
  // Delete existing nutrition calculations to ensure fresh data
  await prisma.menuNutritionCalculation.deleteMany({})

  // Nutrition Calculation for Menu 1: Nasi Gudeg Ayam
  const menu1 = menus.find(m => m.menuCode === 'LUNCH-001')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu1.id,

      // Macronutrients
      totalCalories: 720,
      totalProtein: 22.5,
      totalCarbs: 98.0,
      totalFat: 24.0,
      totalFiber: 9.5,

      // Vitamins
      totalVitaminA: 450,
      totalVitaminB1: 0.35,
      totalVitaminB2: 0.28,
      totalVitaminB3: 4.2,
      totalVitaminB6: 0.42,
      totalVitaminB12: 0.8,
      totalVitaminC: 45,
      totalVitaminD: 1.2,
      totalVitaminE: 3.5,
      totalVitaminK: 25,
      totalFolat: 85,

      // Minerals
      totalCalcium: 180,
      totalPhosphorus: 240,
      totalIron: 4.8,
      totalZinc: 2.5,
      totalIodine: 45,
      totalSelenium: 18,
      totalMagnesium: 95,
      totalPotassium: 520,
      totalSodium: 580,

      // Daily Value Percentages (based on 2000 kcal diet for school children)
      caloriesDV: 103, // 720/700 * 100
      proteinDV: 112, // 22.5/20 * 100
      carbsDV: 103, // 98/95 * 100
      fatDV: 104, // 24/23 * 100
      fiberDV: 119, // 9.5/8 * 100

      // Adequacy Assessment
      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['CALORIES', 'PROTEIN', 'CARBS', 'FAT', 'FIBER', 'VITAMIN_C', 'IRON'],
      excessNutrients: [],
      deficientNutrients: [],

      // Metadata
      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 2: Nasi Ayam Goreng Lalapan
  const menu2 = menus.find(m => m.menuCode === 'LUNCH-002')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu2.id,

      totalCalories: 695,
      totalProtein: 28.5,
      totalCarbs: 85.0,
      totalFat: 22.0,
      totalFiber: 7.5,

      totalVitaminA: 380,
      totalVitaminB1: 0.32,
      totalVitaminB2: 0.25,
      totalVitaminB3: 6.8,
      totalVitaminB6: 0.55,
      totalVitaminB12: 1.2,
      totalVitaminC: 38,
      totalVitaminD: 0.8,
      totalVitaminE: 2.8,
      totalVitaminK: 20,
      totalFolat: 68,

      totalCalcium: 95,
      totalPhosphorus: 280,
      totalIron: 3.2,
      totalZinc: 3.8,
      totalIodine: 35,
      totalSelenium: 22,
      totalMagnesium: 78,
      totalPotassium: 450,
      totalSodium: 620,

      caloriesDV: 99,
      proteinDV: 142,
      carbsDV: 89,
      fatDV: 96,
      fiberDV: 94,

      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      adequateNutrients: ['CALORIES', 'PROTEIN', 'CARBS', 'FAT', 'FIBER', 'ZINC'],
      excessNutrients: [],
      deficientNutrients: [],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 6: Roti Pisang Cokelat (Snack)
  const menu6 = menus.find(m => m.menuCode === 'SNACK-001')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu6.id,

      totalCalories: 365,
      totalProtein: 9.5,
      totalCarbs: 52.0,
      totalFat: 14.0,
      totalFiber: 5.8,

      totalVitaminA: 85,
      totalVitaminB1: 0.18,
      totalVitaminB2: 0.12,
      totalVitaminB3: 2.1,
      totalVitaminB6: 0.28,
      totalVitaminB12: 0.3,
      totalVitaminC: 12,
      totalVitaminD: 0.5,
      totalVitaminE: 1.8,
      totalVitaminK: 5,
      totalFolat: 42,

      totalCalcium: 125,
      totalPhosphorus: 110,
      totalIron: 1.8,
      totalZinc: 0.9,
      totalIodine: 15,
      totalSelenium: 8,
      totalMagnesium: 48,
      totalPotassium: 280,
      totalSodium: 220,

      caloriesDV: 104, // 365/350 * 100
      proteinDV: 95, // 9.5/10 * 100
      carbsDV: 116, // 52/45 * 100
      fatDV: 93, // 14/15 * 100
      fiberDV: 116, // 5.8/5 * 100

      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      adequateNutrients: ['CALORIES', 'PROTEIN', 'CARBS', 'FIBER', 'CALCIUM'],
      excessNutrients: [],
      deficientNutrients: [],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 3: Nasi Ikan Pepes Sunda
  const menu3 = menus.find(m => m.menuCode === 'LUNCH-003')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu3.id,

      // Macronutrients - Rich in protein from fish, balanced carbs from rice
      totalCalories: 685,
      totalProtein: 32.5,  // High protein from ikan nila (70g) + tempe (30g)
      totalCarbs: 82.0,
      totalFat: 18.5,      // Lower fat - fish is leaner than chicken/beef
      totalFiber: 8.2,

      // Vitamins - Fish rich in B vitamins, banana leaf adds minerals
      totalVitaminA: 320,  // Moderate from fish
      totalVitaminB1: 0.42,
      totalVitaminB2: 0.35,
      totalVitaminB3: 5.8,  // High from fish
      totalVitaminB6: 0.58,
      totalVitaminB12: 2.5,  // Very high from fish (excellent source)
      totalVitaminC: 28,
      totalVitaminD: 4.5,   // Fish is excellent vitamin D source
      totalVitaminE: 2.2,
      totalVitaminK: 18,
      totalFolat: 95,

      // Minerals - Fish rich in phosphorus, iodine, selenium
      totalCalcium: 145,
      totalPhosphorus: 380,  // Very high from fish
      totalIron: 3.8,
      totalZinc: 2.2,
      totalIodine: 85,       // Very high from fish (iodine source)
      totalSelenium: 42,     // Very high from fish
      totalMagnesium: 88,
      totalPotassium: 580,
      totalSodium: 620,

      // Daily Value Percentages (based on AKG anak 2-5 tahun)
      caloriesDV: 98,   // 685/700 * 100
      proteinDV: 162,   // 32.5/20 * 100 - VERY HIGH PROTEIN
      carbsDV: 86,      // 82/95 * 100
      fatDV: 80,        // 18.5/23 * 100 - lower fat, healthier
      fiberDV: 102,     // 8.2/8 * 100

      // Adequacy Assessment
      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['CALORIES', 'PROTEIN', 'FIBER', 'VITAMIN_B12', 'VITAMIN_D', 'PHOSPHORUS', 'IODINE', 'SELENIUM'],
      excessNutrients: ['PROTEIN'],  // 162% DV - excellent for growth
      deficientNutrients: [],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 4: Nasi Sayur Asem Iga Ayam
  const menu4 = menus.find(m => m.menuCode === 'LUNCH-004')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu4.id,

      // Macronutrients - Complex soup with vegetables, balanced meal
      totalCalories: 705,
      totalProtein: 24.5,
      totalCarbs: 92.0,
      totalFat: 21.0,
      totalFiber: 11.5,    // Very high fiber from vegetables

      // Vitamins - Rich from diverse vegetables (labu siam, kacang panjang, jagung, etc)
      totalVitaminA: 580,  // High from vegetables (kacang panjang, labu)
      totalVitaminB1: 0.38,
      totalVitaminB2: 0.32,
      totalVitaminB3: 4.8,
      totalVitaminB6: 0.52,
      totalVitaminB12: 0.6,
      totalVitaminC: 68,   // Very high from vegetables (sayuran segar)
      totalVitaminD: 0.5,
      totalVitaminE: 3.8,
      totalVitaminK: 42,   // High from green vegetables
      totalFolat: 125,     // Very high from vegetables

      // Minerals - Diverse from vegetables and iga ayam
      totalCalcium: 165,
      totalPhosphorus: 255,
      totalIron: 4.2,
      totalZinc: 2.8,
      totalIodine: 28,
      totalSelenium: 15,
      totalMagnesium: 115,  // High from vegetables
      totalPotassium: 685,  // Very high from vegetables
      totalSodium: 590,

      // Daily Value Percentages
      caloriesDV: 101,  // 705/700 * 100
      proteinDV: 122,   // 24.5/20 * 100
      carbsDV: 97,      // 92/95 * 100
      fatDV: 91,        // 21/23 * 100
      fiberDV: 144,     // 11.5/8 * 100 - EXCELLENT FIBER

      // Adequacy Assessment
      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['CALORIES', 'PROTEIN', 'CARBS', 'FIBER', 'VITAMIN_A', 'VITAMIN_C', 'VITAMIN_K', 'FOLAT', 'POTASSIUM', 'MAGNESIUM'],
      excessNutrients: ['FIBER'],  // 144% DV - excellent for digestion
      deficientNutrients: [],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 5: Nasi Empal Gepuk Sunda
  const menu5 = menus.find(m => m.menuCode === 'LUNCH-005')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu5.id,

      // Macronutrients - Premium beef, high protein and iron
      totalCalories: 745,
      totalProtein: 34.5,  // Very high protein from beef sengkel (70g)
      totalCarbs: 85.0,
      totalFat: 26.0,      // Higher fat from beef (premium cut)
      totalFiber: 7.8,

      // Vitamins - Beef rich in B vitamins, especially B12
      totalVitaminA: 125,
      totalVitaminB1: 0.45,
      totalVitaminB2: 0.52,  // High from beef
      totalVitaminB3: 7.2,   // Very high from beef (niacin)
      totalVitaminB6: 0.68,
      totalVitaminB12: 3.8,  // Extremely high from beef (premium source)
      totalVitaminC: 22,
      totalVitaminD: 0.8,
      totalVitaminE: 2.5,
      totalVitaminK: 15,
      totalFolat: 72,

      // Minerals - Beef excellent source of iron, zinc, phosphorus
      totalCalcium: 95,
      totalPhosphorus: 320,  // High from beef
      totalIron: 6.8,        // Very high from beef (heme iron - best absorbed)
      totalZinc: 5.5,        // Extremely high from beef (premium zinc source)
      totalIodine: 32,
      totalSelenium: 28,     // High from beef
      totalMagnesium: 82,
      totalPotassium: 485,
      totalSodium: 650,      // Slightly higher from spices and frying

      // Daily Value Percentages
      caloriesDV: 106,  // 745/700 * 100
      proteinDV: 172,   // 34.5/20 * 100 - EXTREMELY HIGH PROTEIN
      carbsDV: 89,      // 85/95 * 100
      fatDV: 113,       // 26/23 * 100 - slightly high (premium cut)
      fiberDV: 98,      // 7.8/8 * 100

      // Adequacy Assessment
      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['CALORIES', 'PROTEIN', 'CARBS', 'VITAMIN_B2', 'VITAMIN_B3', 'VITAMIN_B12', 'PHOSPHORUS', 'IRON', 'ZINC', 'SELENIUM'],
      excessNutrients: ['PROTEIN', 'FAT'],  // Premium meal - high protein and fat
      deficientNutrients: [],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 7: Bubur Kacang Hijau
  const menu7 = menus.find(m => m.menuCode === 'SNACK-002')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu7.id,

      // Macronutrients - Kacang hijau rich in protein and fiber
      totalCalories: 318,
      totalProtein: 12.5,  // Good protein from mung beans
      totalCarbs: 48.0,
      totalFat: 8.5,       // Moderate fat from santan
      totalFiber: 7.2,     // Very high fiber from kacang hijau

      // Vitamins - Mung beans rich in folat and B vitamins
      totalVitaminA: 85,
      totalVitaminB1: 0.28,
      totalVitaminB2: 0.22,
      totalVitaminB3: 1.8,
      totalVitaminB6: 0.32,
      totalVitaminB12: 0,   // Plant-based, no B12
      totalVitaminC: 8,
      totalVitaminD: 0,     // Plant-based
      totalVitaminE: 1.5,
      totalVitaminK: 12,
      totalFolat: 168,      // Extremely high from kacang hijau (excellent source)

      // Minerals - Kacang hijau rich in magnesium, potassium, iron
      totalCalcium: 85,
      totalPhosphorus: 145,
      totalIron: 3.2,       // Good iron from mung beans
      totalZinc: 1.5,
      totalIodine: 8,
      totalSelenium: 6,
      totalMagnesium: 95,   // High from mung beans
      totalPotassium: 385,  // High from mung beans
      totalSodium: 125,     // Low sodium (healthy)

      // Daily Value Percentages (snack = 350 kcal target)
      caloriesDV: 91,   // 318/350 * 100
      proteinDV: 125,   // 12.5/10 * 100 - HIGH PROTEIN for snack
      carbsDV: 107,     // 48/45 * 100
      fatDV: 57,        // 8.5/15 * 100 - low fat
      fiberDV: 144,     // 7.2/5 * 100 - EXCELLENT FIBER

      // Adequacy Assessment
      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['CALORIES', 'PROTEIN', 'CARBS', 'FIBER', 'FOLAT', 'MAGNESIUM', 'POTASSIUM', 'IRON'],
      excessNutrients: ['FIBER', 'FOLAT'],  // Very high fiber and folat
      deficientNutrients: ['VITAMIN_B12', 'VITAMIN_D'],  // Plant-based limitation

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 8: Nagasari Pisang
  const menu8 = menus.find(m => m.menuCode === 'SNACK-003')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu8.id,

      // Macronutrients - Traditional steamed cake, moderate nutrition
      totalCalories: 295,
      totalProtein: 6.5,
      totalCarbs: 52.0,
      totalFat: 7.0,       // Low fat from santan
      totalFiber: 3.8,

      // Vitamins - Pisang raja adds potassium and vitamins
      totalVitaminA: 125,  // From pisang raja
      totalVitaminB1: 0.15,
      totalVitaminB2: 0.08,
      totalVitaminB3: 1.2,
      totalVitaminB6: 0.38,  // High from pisang
      totalVitaminB12: 0,    // Plant-based
      totalVitaminC: 18,     // From pisang
      totalVitaminD: 0,      // Plant-based
      totalVitaminE: 1.2,
      totalVitaminK: 5,
      totalFolat: 42,

      // Minerals - Pisang adds potassium, magnesium
      totalCalcium: 65,
      totalPhosphorus: 85,
      totalIron: 1.2,
      totalZinc: 0.6,
      totalIodine: 5,
      totalSelenium: 3,
      totalMagnesium: 52,    // From pisang
      totalPotassium: 420,   // Very high from pisang raja
      totalSodium: 95,       // Low sodium

      // Daily Value Percentages (snack)
      caloriesDV: 84,   // 295/350 * 100
      proteinDV: 65,    // 6.5/10 * 100
      carbsDV: 116,     // 52/45 * 100
      fatDV: 47,        // 7/15 * 100 - low fat
      fiberDV: 76,      // 3.8/5 * 100

      // Adequacy Assessment
      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['CALORIES', 'CARBS', 'VITAMIN_B6', 'POTASSIUM'],
      excessNutrients: [],
      deficientNutrients: ['PROTEIN', 'VITAMIN_B12', 'VITAMIN_D', 'IRON'],  // Lower protein snack

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 9: Pisang Goreng Keju
  const menu9 = menus.find(m => m.menuCode === 'SNACK-004')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu9.id,

      // Macronutrients - Fried snack with cheese, moderate to high calories
      totalCalories: 385,
      totalProtein: 9.2,
      totalCarbs: 55.0,
      totalFat: 15.5,      // Higher from frying
      totalFiber: 4.5,

      // Vitamins - Pisang + cheese combination
      totalVitaminA: 195,  // From cheese and pisang
      totalVitaminB1: 0.18,
      totalVitaminB2: 0.22,  // From cheese
      totalVitaminB3: 1.5,
      totalVitaminB6: 0.42,
      totalVitaminB12: 0.5,  // From cheese (dairy)
      totalVitaminC: 15,
      totalVitaminD: 0.8,    // From cheese
      totalVitaminE: 2.2,
      totalVitaminK: 8,
      totalFolat: 38,

      // Minerals - Cheese adds calcium
      totalCalcium: 185,     // High from cheese (excellent source)
      totalPhosphorus: 165,  // From cheese
      totalIron: 1.5,
      totalZinc: 1.2,
      totalIodine: 12,
      totalSelenium: 8,
      totalMagnesium: 48,
      totalPotassium: 380,
      totalSodium: 285,      // Higher from cheese

      // Daily Value Percentages (snack)
      caloriesDV: 110,  // 385/350 * 100 - slightly high
      proteinDV: 92,    // 9.2/10 * 100
      carbsDV: 122,     // 55/45 * 100
      fatDV: 103,       // 15.5/15 * 100
      fiberDV: 90,      // 4.5/5 * 100

      // Adequacy Assessment
      meetsCalorieAKG: true,
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['CALORIES', 'PROTEIN', 'CARBS', 'FAT', 'FIBER', 'CALCIUM', 'VITAMIN_A'],
      excessNutrients: [],
      deficientNutrients: [],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  // Nutrition Calculation for Menu 10: Susu Kedelai Cokelat
  const menu10 = menus.find(m => m.menuCode === 'SNACK-005')!
  await prisma.menuNutritionCalculation.create({
    data: {
      menuId: menu10.id,

      // Macronutrients - Soy milk high protein, lactose-free alternative
      totalCalories: 245,
      totalProtein: 11.5,  // High protein from soybean (excellent plant protein)
      totalCarbs: 32.0,
      totalFat: 8.0,
      totalFiber: 3.5,

      // Vitamins - Soy rich in B vitamins
      totalVitaminA: 0,
      totalVitaminB1: 0.32,  // High from soy
      totalVitaminB2: 0.25,  // High from soy
      totalVitaminB3: 1.8,
      totalVitaminB6: 0.28,
      totalVitaminB12: 0,    // Plant-based (unless fortified)
      totalVitaminC: 2,
      totalVitaminD: 0,      // Plant-based (unless fortified)
      totalVitaminE: 2.5,    // From soy
      totalVitaminK: 18,     // From soy
      totalFolat: 88,        // High from soy

      // Minerals - Soy rich in calcium, iron, magnesium
      totalCalcium: 145,     // Good from soy (natural calcium)
      totalPhosphorus: 195,  // High from soy
      totalIron: 2.8,        // Good from soy (non-heme iron)
      totalZinc: 1.5,
      totalIodine: 8,
      totalSelenium: 12,
      totalMagnesium: 85,    // High from soy
      totalPotassium: 420,   // High from soy
      totalSodium: 68,       // Very low sodium

      // Daily Value Percentages (beverage snack)
      caloriesDV: 70,   // 245/350 * 100 - lower calorie beverage
      proteinDV: 115,   // 11.5/10 * 100 - HIGH PROTEIN for beverage
      carbsDV: 71,      // 32/45 * 100
      fatDV: 53,        // 8/15 * 100 - low fat
      fiberDV: 70,      // 3.5/5 * 100

      // Adequacy Assessment
      meetsCalorieAKG: false,  // Lower calorie (beverage)
      meetsProteinAKG: true,
      meetsAKG: true,

      // Nutrient Analysis
      adequateNutrients: ['PROTEIN', 'VITAMIN_B1', 'VITAMIN_B2', 'VITAMIN_E', 'FOLAT', 'CALCIUM', 'PHOSPHORUS', 'IRON', 'MAGNESIUM', 'POTASSIUM'],
      excessNutrients: [],
      deficientNutrients: ['CALORIES', 'VITAMIN_A', 'VITAMIN_B12', 'VITAMIN_D'],  // Plant-based limitations

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO'
    }
  })

  console.log('  ✓ Created Nutrition Calculations for all 10 menus')
}

/**
 * Seed Cost Calculations - detailed cost breakdown
 * DISABLED: Depends on menu ingredients (temporarily disabled for Fix #1)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function seedCostCalculations(
  prisma: PrismaClient,
  menus: NutritionMenu[],
  adminUser: User
): Promise<void> {
  // Cost Calculation for Menu 1: Nasi Gudeg Ayam
  const menu1 = menus.find(m => m.menuCode === 'LUNCH-001')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu1.id },
    update: {},
    create: {
      menuId: menu1.id,

      // Ingredient Costs
      totalIngredientCost: 6620, // Sum of all ingredients
      ingredientBreakdown: {
        'Beras Putih Premium': 960,
        'Nangka Muda': 800,
        'Ayam Kampung Fillet': 2700,
        'Tahu Putih': 300,
        'Tempe Kedelai': 320,
        'Santan Kelapa': 1000,
        'Gula Merah': 240,
        'Bumbu Gudeg': 300
      },

      // Labor Costs
      laborCostPerHour: 25000,
      preparationHours: 0.5,
      cookingHours: 1.5,
      totalLaborCost: 50000, // 2 hours * 25000

      // Utility Costs
      gasCost: 800,
      electricityCost: 200,
      waterCost: 150,
      totalUtilityCost: 1150,

      // Other Costs
      packagingCost: 500,
      equipmentCost: 300,
      cleaningCost: 200,

      // Overhead
      overheadPercentage: 15,
      overheadCost: 8805, // 15% of (ingredient + labor + utility)

      // Total Costs
      totalDirectCost: 57770, // ingredient + labor + utility
      totalIndirectCost: 9805, // packaging + equipment + cleaning + overhead
      grandTotalCost: 67575,

      // Per Portion (batch size 100)
      plannedPortions: 100,
      costPerPortion: 676, // 67575 / 100

      // Budget Planning (for SPPG)
      budgetAllocation: 950000, // Alokasi anggaran untuk menu ini

      // Cost Ratios
      ingredientCostRatio: 9.8, // 6620/67575 * 100
      laborCostRatio: 74.0, // 50000/67575 * 100
      overheadCostRatio: 13.0, // 8805/67575 * 100

      // Optimizations
      costOptimizations: [
        'Pertimbangkan ayam broiler sebagai alternatif untuk mengurangi biaya',
        'Batch produksi bisa ditingkatkan ke 150 porsi untuk efisiensi labor'
      ],
      alternativeIngredients: [
        'Ayam broiler (hemat Rp 600/porsi)',
        'Santan instan kemasan (hemat Rp 200/porsi)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 2: Nasi Ayam Goreng Lalapan
  const menu2 = menus.find(m => m.menuCode === 'LUNCH-002')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu2.id },
    update: {},
    create: {
      menuId: menu2.id,

      totalIngredientCost: 5600,
      ingredientBreakdown: {
        'Beras Putih Premium': 960,
        'Ayam Broiler Paha': 3500,
        'Tahu Putih': 300,
        'Kubis': 150,
        'Timun': 120,
        'Tomat': 120,
        'Sambal Terasi': 300,
        'Bumbu Kuning': 150
      },

      laborCostPerHour: 25000,
      preparationHours: 0.33,
      cookingHours: 0.75,
      totalLaborCost: 27000,

      gasCost: 600,
      electricityCost: 150,
      waterCost: 100,
      totalUtilityCost: 850,

      packagingCost: 400,
      equipmentCost: 250,
      cleaningCost: 150,

      overheadPercentage: 15,
      overheadCost: 5017,

      totalDirectCost: 33450,
      totalIndirectCost: 5817,
      grandTotalCost: 39267,

      plannedPortions: 120,
      costPerPortion: 327,

      budgetAllocation: 600000, // Alokasi anggaran untuk menu ini

      ingredientCostRatio: 14.3,
      laborCostRatio: 68.8,
      overheadCostRatio: 12.8,

      costOptimizations: [
        'Beli ayam dalam jumlah besar untuk diskon',
        'Produksi batch 150 porsi untuk efisiensi'
      ],
      alternativeIngredients: [
        'Ayam kampung lokal (hemat Rp 300/porsi)',
        'Sayuran organik lokal (hemat biaya transport)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 3: Nasi Ikan Pepes Kemangi
  const menu3 = menus.find(m => m.menuCode === 'LUNCH-003')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu3.id },
    update: {},
    create: {
      menuId: menu3.id,

      // Ingredient Costs (from MenuIngredient)
      totalIngredientCost: 7850,
      ingredientBreakdown: {
        'Beras Putih Premium': 960,
        'Ikan Mas Fillet': 3800,
        'Tahu Putih': 300,
        'Tempe Kedelai': 320,
        'Daun Kemangi': 180,
        'Daun Pisang': 220,
        'Sambal Hijau': 350,
        'Bumbu Pepes': 420,
        'Kacang Panjang': 500
      },

      // Labor Costs (65 min total cooking time)
      laborCostPerHour: 25000,
      preparationHours: 0.5, // 30 min prep (membersihkan ikan, menyiapkan bumbu)
      cookingHours: 1.08, // 65 min cooking time from RecipeStep
      totalLaborCost: 39500, // 1.58 hours * 25000

      // Utility Costs (steaming requires more water & gas)
      gasCost: 650, // Medium heat steaming 50 minutes
      electricityCost: 180, // Rice cooker
      waterCost: 200, // Steaming + cleaning fish
      totalUtilityCost: 1030,

      // Other Costs
      packagingCost: 450, // Banana leaves + container
      equipmentCost: 280, // Steamer + utensils depreciation
      cleaningCost: 180, // Fish preparation requires extra cleaning

      // Overhead
      overheadPercentage: 15,
      overheadCost: 7257, // 15% of (7850 + 39500 + 1030)

      // Total Costs
      totalDirectCost: 48380, // ingredient + labor + utility
      totalIndirectCost: 8167, // packaging + equipment + cleaning + overhead
      grandTotalCost: 56547,

      // Per Portion (batch size 100)
      plannedPortions: 100,
      costPerPortion: 565,

      // Budget Planning
      budgetAllocation: 750000,

      // Cost Ratios
      ingredientCostRatio: 13.9, // 7850/56547 * 100
      laborCostRatio: 69.9, // 39500/56547 * 100
      overheadCostRatio: 12.8,

      // Optimizations
      costOptimizations: [
        'Gunakan ikan nila lokal sebagai alternatif (hemat Rp 150/porsi)',
        'Batch produksi 120 porsi untuk efisiensi steaming',
        'Daun pisang bisa didapat gratis dari petani lokal'
      ],
      alternativeIngredients: [
        'Ikan nila lokal (hemat Rp 150/porsi)',
        'Tempe homemade SPPG (hemat Rp 50/porsi)',
        'Daun pisang dari kebun sekitar (hemat Rp 220/batch)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 4: Nasi Sayur Asem Daging
  const menu4 = menus.find(m => m.menuCode === 'LUNCH-004')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu4.id },
    update: {},
    create: {
      menuId: menu4.id,

      // Ingredient Costs (vegetable-heavy menu)
      totalIngredientCost: 6480,
      ingredientBreakdown: {
        'Beras Putih Premium': 960,
        'Daging Sapi Sengkel': 2800,
        'Jagung Manis': 650,
        'Kacang Panjang': 500,
        'Labu Siam': 420,
        'Melinjo': 380,
        'Tomat': 120,
        'Asam Jawa': 180,
        'Bumbu Sayur Asem': 470
      },

      // Labor Costs (55 min cooking time)
      laborCostPerHour: 25000,
      preparationHours: 0.42, // 25 min prep (potong sayuran)
      cookingHours: 0.92, // 55 min cooking from RecipeStep
      totalLaborCost: 33500, // 1.34 hours * 25000

      // Utility Costs (boiling soup requires sustained heat)
      gasCost: 720, // Medium-high heat for 45 minutes
      electricityCost: 180, // Rice cooker
      waterCost: 300, // Soup requires more water
      totalUtilityCost: 1200,

      // Other Costs
      packagingCost: 420,
      equipmentCost: 260,
      cleaningCost: 160, // Many vegetables to wash

      // Overhead
      overheadPercentage: 15,
      overheadCost: 6177, // 15% of direct costs

      // Total Costs
      totalDirectCost: 41180,
      totalIndirectCost: 7017,
      grandTotalCost: 48197,

      // Per Portion (batch size 110 - soup is easier to scale)
      plannedPortions: 110,
      costPerPortion: 438,

      // Budget Planning
      budgetAllocation: 700000,

      // Cost Ratios
      ingredientCostRatio: 13.4,
      laborCostRatio: 69.5,
      overheadCostRatio: 12.8,

      // Optimizations
      costOptimizations: [
        'Sayuran bisa dibeli langsung dari petani lokal (hemat 20%)',
        'Batch 150 porsi untuk maksimalkan kapasitas panci besar',
        'Gunakan asam jawa lokal Purwakarta (lebih murah dan fresh)'
      ],
      alternativeIngredients: [
        'Daging ayam kampung (hemat Rp 200/porsi)',
        'Sayuran organik lokal (hemat biaya transport)',
        'Melinjo dari pohon di sekitar SPPG (gratis)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 5: Nasi Empal Gepuk Pedas
  const menu5 = menus.find(m => m.menuCode === 'LUNCH-005')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu5.id },
    update: {},
    create: {
      menuId: menu5.id,

      // Ingredient Costs (premium beef dish)
      totalIngredientCost: 8920,
      ingredientBreakdown: {
        'Beras Putih Premium': 960,
        'Daging Sapi Has Dalam': 4500, // Premium cut
        'Tahu Putih': 300,
        'Tempe Kedelai': 320,
        'Santan Kelapa': 1000,
        'Lengkuas': 180,
        'Sereh': 120,
        'Daun Salam': 140,
        'Bumbu Empal': 550,
        'Cabe Rawit': 250,
        'Sambal Goreng': 600
      },

      // Labor Costs (75 min cooking time - longest!)
      laborCostPerHour: 25000,
      preparationHours: 0.58, // 35 min prep (slice beef, pound, marinate)
      cookingHours: 1.25, // 75 min cooking from RecipeStep
      totalLaborCost: 45750, // 1.83 hours * 25000

      // Utility Costs (high heat frying + braising)
      gasCost: 950, // High heat for 60 minutes
      electricityCost: 200, // Rice cooker + food processor
      waterCost: 180,
      totalUtilityCost: 1330,

      // Other Costs
      packagingCost: 480, // Premium packaging for premium dish
      equipmentCost: 320, // Heavy duty equipment for beef
      cleaningCost: 200, // Deep frying requires extra cleaning

      // Overhead
      overheadPercentage: 15,
      overheadCost: 8400, // 15% of direct costs

      // Total Costs
      totalDirectCost: 56000,
      totalIndirectCost: 9400,
      grandTotalCost: 65400,

      // Per Portion (batch size 90 - premium portion)
      plannedPortions: 90,
      costPerPortion: 727, // Highest cost per portion (premium beef)

      // Budget Planning
      budgetAllocation: 950000, // Higher allocation for premium menu

      // Cost Ratios
      ingredientCostRatio: 13.6,
      laborCostRatio: 70.0, // High labor due to complexity
      overheadCostRatio: 12.8,

      // Optimizations
      costOptimizations: [
        'Gunakan daging sapi sengkel sebagai alternatif (hemat Rp 180/porsi)',
        'Batch 100 porsi untuk better utilization',
        'Negosiasi harga dengan supplier daging untuk pembelian rutin',
        'Pertimbangkan empal ayam di hari tertentu (hemat 40%)'
      ],
      alternativeIngredients: [
        'Daging sapi sengkel grade B (hemat Rp 180/porsi)',
        'Daging ayam kampung untuk empal ayam (hemat Rp 300/porsi)',
        'Santan kemasan instan (hemat Rp 150/porsi, lebih praktis)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 6: Roti Pisang Cokelat
  const menu6 = menus.find(m => m.menuCode === 'SNACK-001')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu6.id },
    update: {},
    create: {
      menuId: menu6.id,

      totalIngredientCost: 4750,
      ingredientBreakdown: {
        'Roti Gandum': 2100,
        'Pisang Ambon': 1200,
        'Selai Cokelat': 1050,
        'Mentega': 400
      },

      laborCostPerHour: 20000,
      preparationHours: 0.25,
      cookingHours: 0.5,
      totalLaborCost: 15000,

      gasCost: 0, // Menggunakan oven listrik
      electricityCost: 400,
      waterCost: 50,
      totalUtilityCost: 450,

      packagingCost: 300,
      equipmentCost: 200,
      cleaningCost: 100,

      overheadPercentage: 15,
      overheadCost: 3030,

      totalDirectCost: 20200,
      totalIndirectCost: 3630,
      grandTotalCost: 23830,

      plannedPortions: 150,
      costPerPortion: 159,

      budgetAllocation: 250000, // Alokasi anggaran untuk menu ini

      ingredientCostRatio: 19.9,
      laborCostRatio: 62.9,
      overheadCostRatio: 12.7,

      costOptimizations: [
        'Beli roti gandum langsung dari pabrik roti',
        'Gunakan pisang lokal Purwakarta untuk mengurangi biaya'
      ],
      alternativeIngredients: [
        'Roti tawar biasa (hemat Rp 800/porsi)',
        'Selai cokelat homemade (hemat Rp 300/porsi)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 7: Bubur Kacang Hijau
  const menu7 = menus.find(m => m.menuCode === 'SNACK-002')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu7.id },
    update: {},
    create: {
      menuId: menu7.id,

      // Ingredient Costs (affordable plant-based snack)
      totalIngredientCost: 3680,
      ingredientBreakdown: {
        'Kacang Hijau': 1500,
        'Gula Merah': 720, // 3x standard untuk sweetness
        'Santan Kelapa': 1000,
        'Daun Pandan': 120,
        'Garam': 40,
        'Air': 300
      },

      // Labor Costs (45 min cooking time)
      laborCostPerHour: 20000, // Lower rate for simple cooking
      preparationHours: 0.17, // 10 min prep (cuci kacang hijau)
      cookingHours: 0.75, // 45 min cooking from RecipeStep
      totalLaborCost: 18400, // 0.92 hours * 20000

      // Utility Costs (boiling requires sustained heat)
      gasCost: 580, // Medium heat for 40 minutes
      electricityCost: 100, // Minimal electricity
      waterCost: 250, // Boiling water for porridge
      totalUtilityCost: 930,

      // Other Costs
      packagingCost: 280, // Bowl + spoon
      equipmentCost: 180,
      cleaningCost: 120,

      // Overhead
      overheadPercentage: 15,
      overheadCost: 3451, // 15% of direct costs

      // Total Costs
      totalDirectCost: 23010,
      totalIndirectCost: 4031,
      grandTotalCost: 27041,

      // Per Portion (batch size 160 - porridge scales well)
      plannedPortions: 160,
      costPerPortion: 169, // Very affordable!

      // Budget Planning
      budgetAllocation: 320000,

      // Cost Ratios
      ingredientCostRatio: 13.6,
      laborCostRatio: 68.0,
      overheadCostRatio: 12.8,

      // Optimizations
      costOptimizations: [
        'Kacang hijau bisa dibeli dalam karung besar (hemat 15%)',
        'Batch 200 porsi untuk maksimalkan panci besar',
        'Santan bisa diganti dengan santan instan untuk batch besar',
        'Daun pandan bisa ditanam sendiri di SPPG'
      ],
      alternativeIngredients: [
        'Santan instan kemasan (hemat Rp 30/porsi, lebih konsisten)',
        'Gula pasir sebagian (hemat Rp 20/porsi)',
        'Daun pandan dari kebun SPPG (gratis)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 8: Nagasari Pisang Raja
  const menu8 = menus.find(m => m.menuCode === 'SNACK-003')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu8.id },
    update: {},
    create: {
      menuId: menu8.id,

      // Ingredient Costs (traditional steamed cake)
      totalIngredientCost: 4120,
      ingredientBreakdown: {
        'Tepung Beras': 980,
        'Pisang Raja': 1400, // Premium banana
        'Santan Kelapa': 1000,
        'Gula Pasir': 420,
        'Garam': 20,
        'Daun Pisang': 220,
        'Air': 80
      },

      // Labor Costs (40 min cooking time)
      laborCostPerHour: 20000,
      preparationHours: 0.33, // 20 min prep (membuat adonan, wrapping)
      cookingHours: 0.67, // 40 min steaming from RecipeStep
      totalLaborCost: 20000, // 1.0 hours * 20000

      // Utility Costs (steaming)
      gasCost: 520, // Medium heat steaming 35 minutes
      electricityCost: 80,
      waterCost: 180, // Steaming water
      totalUtilityCost: 780,

      // Other Costs
      packagingCost: 320, // Banana leaves + tray
      equipmentCost: 200,
      cleaningCost: 140,

      // Overhead
      overheadPercentage: 15,
      overheadCost: 3735, // 15% of direct costs

      // Total Costs
      totalDirectCost: 24900,
      totalIndirectCost: 4395,
      grandTotalCost: 29295,

      // Per Portion (batch size 140)
      plannedPortions: 140,
      costPerPortion: 209,

      // Budget Planning
      budgetAllocation: 380000,

      // Cost Ratios
      ingredientCostRatio: 14.1,
      laborCostRatio: 68.3,
      overheadCostRatio: 12.7,

      // Optimizations
      costOptimizations: [
        'Pisang raja bisa diganti dengan pisang kepok (hemat Rp 50/porsi)',
        'Batch 160 porsi untuk efisiensi steamer',
        'Daun pisang bisa didapat dari petani lokal dengan harga lebih murah',
        'Tepung beras bisa dibeli langsung dari penggilingan'
      ],
      alternativeIngredients: [
        'Pisang kepok lokal (hemat Rp 50/porsi)',
        'Tepung beras lokal dari penggilingan (hemat Rp 15/porsi)',
        'Daun pisang dari supplier lokal (hemat Rp 80/batch)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 9: Pisang Goreng Keju
  const menu9 = menus.find(m => m.menuCode === 'SNACK-004')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu9.id },
    update: {},
    create: {
      menuId: menu9.id,

      // Ingredient Costs (modern fusion snack)
      totalIngredientCost: 5280,
      ingredientBreakdown: {
        'Pisang Tanduk': 1800,
        'Tepung Terigu': 680,
        'Keju Cheddar Parut': 1500, // Premium ingredient
        'Gula Pasir': 420,
        'Garam': 30,
        'Minyak Goreng': 650,
        'Air': 100,
        'Susu Bubuk': 100
      },

      // Labor Costs (30 min cooking time - quick fry)
      laborCostPerHour: 20000,
      preparationHours: 0.25, // 15 min prep (slice banana, coat)
      cookingHours: 0.5, // 30 min frying from RecipeStep
      totalLaborCost: 15000, // 0.75 hours * 20000

      // Utility Costs (deep frying)
      gasCost: 680, // High heat for 25 minutes
      electricityCost: 120,
      waterCost: 100,
      totalUtilityCost: 900,

      // Other Costs
      packagingCost: 350, // Paper box + napkin
      equipmentCost: 220,
      cleaningCost: 180, // Deep frying cleanup

      // Overhead
      overheadPercentage: 15,
      overheadCost: 3177, // 15% of direct costs

      // Total Costs
      totalDirectCost: 21180,
      totalIndirectCost: 3927,
      grandTotalCost: 25107,

      // Per Portion (batch size 130)
      plannedPortions: 130,
      costPerPortion: 193,

      // Budget Planning
      budgetAllocation: 350000,

      // Cost Ratios
      ingredientCostRatio: 21.0, // Higher ingredient ratio (cheese)
      laborCostRatio: 59.7,
      overheadCostRatio: 12.7,

      // Optimizations
      costOptimizations: [
        'Keju bisa dibeli dalam bentuk blok lalu diparut sendiri (hemat 25%)',
        'Batch 150 porsi untuk maksimalkan minyak goreng',
        'Gunakan pisang lokal yang matang pas untuk hasil lebih manis',
        'Minyak goreng bisa difilter dan digunakan 2-3 kali'
      ],
      alternativeIngredients: [
        'Keju quick melt lokal (hemat Rp 60/porsi)',
        'Pisang kepok sebagai alternatif (hemat Rp 40/porsi)',
        'Tepung campuran untuk coating lebih crispy (sama biaya, lebih enak)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  // Cost Calculation for Menu 10: Susu Kedelai Jahe Hangat
  const menu10 = menus.find(m => m.menuCode === 'SNACK-005')!
  await prisma.menuCostCalculation.upsert({
    where: { menuId: menu10.id },
    update: {},
    create: {
      menuId: menu10.id,

      // Ingredient Costs (plant-based beverage)
      totalIngredientCost: 2980,
      ingredientBreakdown: {
        'Kacang Kedelai': 1500,
        'Gula Aren': 680,
        'Jahe Merah': 420,
        'Daun Pandan': 120,
        'Garam': 20,
        'Air': 240
      },

      // Labor Costs (35 min cooking time)
      laborCostPerHour: 20000,
      preparationHours: 0.25, // 15 min prep (rendam kedelai, kupas)
      cookingHours: 0.58, // 35 min cooking from RecipeStep
      totalLaborCost: 16600, // 0.83 hours * 20000

      // Utility Costs (blending + boiling)
      gasCost: 480, // Medium heat for 30 minutes
      electricityCost: 250, // Blender consumes more power
      waterCost: 200, // Boiling + washing beans
      totalUtilityCost: 930,

      // Other Costs
      packagingCost: 280, // Cup + lid + straw
      equipmentCost: 200, // Blender depreciation
      cleaningCost: 140, // Blender and filter cleaning

      // Overhead
      overheadPercentage: 15,
      overheadCost: 3076, // 15% of direct costs

      // Total Costs
      totalDirectCost: 20510,
      totalIndirectCost: 3696,
      grandTotalCost: 24206,

      // Per Portion (batch size 180 - beverage scales very well)
      plannedPortions: 180,
      costPerPortion: 134, // LOWEST cost per portion!

      // Budget Planning
      budgetAllocation: 280000,

      // Cost Ratios
      ingredientCostRatio: 12.3,
      laborCostRatio: 68.6,
      overheadCostRatio: 12.7,

      // Optimizations
      costOptimizations: [
        'Kacang kedelai bisa dibeli dalam karung 25kg (hemat 20%)',
        'Batch 200 porsi untuk maksimalkan blender capacity',
        'Jahe merah bisa ditanam sendiri di SPPG',
        'Ampas kedelai bisa diolah jadi tempe (zero waste)',
        'Gula aren bisa dibeli langsung dari petani gula kelapa lokal'
      ],
      alternativeIngredients: [
        'Kacang kedelai lokal Jawa Barat (hemat Rp 25/porsi)',
        'Gula merah biasa (hemat Rp 15/porsi)',
        'Jahe biasa jika jahe merah mahal (hemat Rp 10/porsi)'
      ],

      calculatedAt: new Date(),
      calculatedBy: adminUser.id,
      calculationMethod: 'AUTO',
      isActive: true
    }
  })

  console.log('  ✓ Created Cost Calculations for all 10 menus')
}
