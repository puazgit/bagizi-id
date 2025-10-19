/**
 * @fileoverview Procurement Domain Seed File - Enterprise-grade
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Prisma Seed Architecture
 * 
 * Domain: Procurement (Pengadaan Barang)
 * Models: Supplier, SupplierProduct, ProcurementPlan, Procurement, ProcurementItem
 * Dependencies: SPPG, InventoryItem, NutritionProgram
 * 
 * INTEGRATION: Works with SPPG Purwakarta data
 */

import { 
  PrismaClient, 
  SupplierType, 
  ProcurementMethod, 
  ProcurementStatus,
  QualityGrade,
  InventoryCategory 
} from '@prisma/client'

/**
 * Seed Procurement domain for SPPG Purwakarta
 * Creates: Suppliers, Products, Plans, Procurements, Items
 * 
 * @param prisma - Prisma Client instance
 * @returns Promise<void>
 */
export async function seedProcurement(
  prisma: PrismaClient,
  sppgs: { id: string; name: string; code: string }[],
  programs: { id: string; name: string; sppgId: string }[]
): Promise<void> {
  console.log('  → Creating Procurement domain data for SPPG Purwakarta...')

  // Step 1: Find SPPG Purwakarta from passed data
  const sppg = sppgs.find(s => s.code === 'SPPG-PWK-001')
  if (!sppg) {
    console.warn('  ⚠️  SPPG Purwakarta not found, skipping procurement seed')
    return
  }

  console.log(`  ✅ Found SPPG: ${sppg.name}`)

  // Step 2: Find nutrition program from passed data
  const program = programs.find(p => p.sppgId === sppg.id)
  if (!program) {
    console.warn('  ⚠️  No program found, skipping procurement seed')
    return
  }

  console.log(`  ✅ Found Program: ${program.name}`)

  // Step 3: Get inventory items for product linking
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { sppgId: sppg.id },
    take: 20
  })

  console.log(`  ✅ Found ${inventoryItems.length} inventory items`)

  // ========================================
  // 1. CREATE SUPPLIERS (5 suppliers)
  // ========================================
  console.log('  → Creating suppliers...')

  const suppliers = []

  // Supplier 1: Protein Supplier (Poultry & Meat)
  const supplier1 = await prisma.supplier.upsert({
    where: { supplierCode: 'SUP-PWK-PROTEIN-001' },
    update: {},
    create: {
      sppgId: sppg.id,
      supplierCode: 'SUP-PWK-PROTEIN-001',
      supplierName: 'CV Berkah Protein Nusantara',
      businessName: 'CV Berkah Protein Nusantara',
      supplierType: SupplierType.LOCAL,
      category: 'PROTEIN',
      primaryContact: 'Budi Santoso',
      phone: '0267-123456',
      email: 'order@berkahprotein.com',
      whatsapp: '08123456789',
      address: 'Jl. Industri No. 45, Kawasan Industri Purwakarta',
      city: 'Purwakarta',
      province: 'Jawa Barat',
      postalCode: '41181',
      deliveryRadius: 50,
      paymentTerms: 'NET_30',
      creditLimit: 50000000,
      overallRating: 4.5,
      qualityRating: 4.8,
      deliveryRating: 4.3,
      priceCompetitiveness: 4.2,
      serviceRating: 4.6,
      totalOrders: 24,
      successfulDeliveries: 23,
      onTimeDeliveryRate: 95.8,
      totalPurchaseValue: 125000000,
      minOrderValue: 500000,
      maxOrderCapacity: 10000000,
      leadTimeHours: 24,
      deliveryDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      specialties: ['Ayam', 'Daging Sapi', 'Telur', 'Ikan'],
      isActive: true,
      isPreferred: true,
      isHalalCertified: true,
      isFoodSafetyCertified: true,
      complianceStatus: 'VERIFIED',
      partnershipLevel: 'PREFERRED',
      preferredOrderMethod: 'WHATSAPP',
    }
  })
  suppliers.push(supplier1)

  // Supplier 2: Vegetable Supplier
  const supplier2 = await prisma.supplier.upsert({
    where: { supplierCode: 'SUP-PWK-VEG-001' },
    update: {},
    create: {
      sppgId: sppg.id,
      supplierCode: 'SUP-PWK-VEG-001',
      supplierName: 'UD Sayur Segar Purwakarta',
      businessName: 'UD Sayur Segar Purwakarta',
      supplierType: SupplierType.LOCAL,
      category: 'VEGETABLES',
      primaryContact: 'Ibu Siti Aminah',
      phone: '0267-234567',
      email: 'sayursegar@gmail.com',
      whatsapp: '08234567890',
      address: 'Pasar Induk Sayuran, Jl. Raya Sadang No. 12',
      city: 'Purwakarta',
      province: 'Jawa Barat',
      postalCode: '41115',
      deliveryRadius: 30,
      paymentTerms: 'CASH_ON_DELIVERY',
      overallRating: 4.2,
      qualityRating: 4.5,
      deliveryRating: 4.0,
      priceCompetitiveness: 4.8,
      serviceRating: 4.1,
      totalOrders: 18,
      successfulDeliveries: 18,
      onTimeDeliveryRate: 100,
      totalPurchaseValue: 45000000,
      minOrderValue: 200000,
      maxOrderCapacity: 5000000,
      leadTimeHours: 12,
      deliveryDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      specialties: ['Sayuran Segar', 'Buah Lokal', 'Bumbu'],
      isActive: true,
      isPreferred: true,
      complianceStatus: 'VERIFIED',
      partnershipLevel: 'PREFERRED',
      preferredOrderMethod: 'PHONE',
    }
  })
  suppliers.push(supplier2)

  // Supplier 3: Carbohydrate Supplier (Rice, Flour)
  const supplier3 = await prisma.supplier.upsert({
    where: { supplierCode: 'SUP-PWK-CARB-001' },
    update: {},
    create: {
      sppgId: sppg.id,
      supplierCode: 'SUP-PWK-CARB-001',
      supplierName: 'PT Mitra Pangan Sejahtera',
      businessName: 'PT Mitra Pangan Sejahtera',
      supplierType: SupplierType.NATIONAL,
      category: 'GRAINS',
      primaryContact: 'Agus Wijaya',
      phone: '0267-345678',
      email: 'sales@mitrapangan.co.id',
      whatsapp: '08345678901',
      website: 'www.mitrapangan.co.id',
      address: 'Jl. Gatot Subroto No. 88, Purwakarta',
      city: 'Purwakarta',
      province: 'Jawa Barat',
      postalCode: '41112',
      deliveryRadius: 100,
      paymentTerms: 'NET_15',
      creditLimit: 75000000,
      overallRating: 4.7,
      qualityRating: 4.9,
      deliveryRating: 4.6,
      priceCompetitiveness: 4.5,
      serviceRating: 4.8,
      totalOrders: 32,
      successfulDeliveries: 31,
      onTimeDeliveryRate: 96.9,
      totalPurchaseValue: 215000000,
      minOrderValue: 1000000,
      maxOrderCapacity: 20000000,
      leadTimeHours: 48,
      deliveryDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      specialties: ['Beras Premium', 'Tepung', 'Mie', 'Pasta'],
      certifications: ['ISO_9001', 'HALAL', 'FOOD_SAFETY'],
      isActive: true,
      isPreferred: true,
      isHalalCertified: true,
      isFoodSafetyCertified: true,
      isISOCertified: true,
      complianceStatus: 'VERIFIED',
      partnershipLevel: 'STRATEGIC',
      preferredOrderMethod: 'EMAIL',
      hasAPIIntegration: false,
    }
  })
  suppliers.push(supplier3)

  // Supplier 4: Dairy & Beverage Supplier
  const supplier4 = await prisma.supplier.upsert({
    where: { supplierCode: 'SUP-PWK-DAIRY-001' },
    update: {},
    create: {
      sppgId: sppg.id,
      supplierCode: 'SUP-PWK-DAIRY-001',
      supplierName: 'CV Sumber Susu Murni',
      businessName: 'CV Sumber Susu Murni',
      supplierType: SupplierType.LOCAL,
      category: 'DAIRY',
      primaryContact: 'Dedi Kurniawan',
      phone: '0267-456789',
      email: 'order@sumbersusu.com',
      whatsapp: '08456789012',
      address: 'Jl. Veteran No. 23, Purwakarta',
      city: 'Purwakarta',
      province: 'Jawa Barat',
      postalCode: '41118',
      deliveryRadius: 40,
      paymentTerms: 'NET_7',
      creditLimit: 25000000,
      overallRating: 4.4,
      qualityRating: 4.6,
      deliveryRating: 4.5,
      priceCompetitiveness: 4.0,
      serviceRating: 4.5,
      totalOrders: 15,
      successfulDeliveries: 15,
      onTimeDeliveryRate: 100,
      totalPurchaseValue: 62000000,
      minOrderValue: 300000,
      maxOrderCapacity: 8000000,
      leadTimeHours: 24,
      deliveryDays: ['TUESDAY', 'THURSDAY', 'SATURDAY'],
      specialties: ['Susu Segar', 'Yogurt', 'Keju', 'UHT'],
      isActive: true,
      isPreferred: false,
      isHalalCertified: true,
      isFoodSafetyCertified: true,
      complianceStatus: 'VERIFIED',
      partnershipLevel: 'STANDARD',
      preferredOrderMethod: 'WHATSAPP',
    }
  })
  suppliers.push(supplier4)

  // Supplier 5: Spices & Condiments
  const supplier5 = await prisma.supplier.upsert({
    where: { supplierCode: 'SUP-PWK-SPICE-001' },
    update: {},
    create: {
      sppgId: sppg.id,
      supplierCode: 'SUP-PWK-SPICE-001',
      supplierName: 'Toko Bumbu Lengkap',
      businessName: 'Toko Bumbu Lengkap',
      supplierType: SupplierType.LOCAL,
      category: 'CONDIMENTS',
      primaryContact: 'Pak Hendra',
      phone: '0267-567890',
      whatsapp: '08567890123',
      address: 'Pasar Tradisional Purwakarta Blok C No. 15',
      city: 'Purwakarta',
      province: 'Jawa Barat',
      postalCode: '41111',
      deliveryRadius: 20,
      paymentTerms: 'CASH_ON_DELIVERY',
      overallRating: 4.0,
      qualityRating: 4.2,
      deliveryRating: 3.8,
      priceCompetitiveness: 4.5,
      serviceRating: 4.0,
      totalOrders: 12,
      successfulDeliveries: 11,
      onTimeDeliveryRate: 91.7,
      totalPurchaseValue: 18000000,
      minOrderValue: 100000,
      maxOrderCapacity: 2000000,
      leadTimeHours: 6,
      deliveryDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      specialties: ['Bumbu Dapur', 'Rempah', 'Minyak Goreng', 'Garam'],
      isActive: true,
      isPreferred: false,
      complianceStatus: 'PENDING',
      partnershipLevel: 'STANDARD',
      preferredOrderMethod: 'PHONE',
    }
  })
  suppliers.push(supplier5)

  console.log(`  ✓ Created ${suppliers.length} suppliers`)

  // ========================================
  // 2. CREATE SUPPLIER PRODUCTS (20 products)
  // ========================================
  console.log('  → Creating supplier products...')

  const products = []

  // Products for Supplier 1 (Protein)
  const proteinProducts = await Promise.all([
    prisma.supplierProduct.upsert({
      where: { 
        supplierId_productCode: {
          supplierId: supplier1.id,
          productCode: 'PROT-001-CHICKEN'
        }
      },
      update: {},
      create: {
        supplierId: supplier1.id,
        sppgId: sppg.id,
        productCode: 'PROT-001-CHICKEN',
        productName: 'Ayam Kampung Segar (Utuh)',
        category: 'PROTEIN_HEWANI',
        subcategory: 'UNGGAS',
        description: 'Ayam kampung segar, usia 4-5 bulan, berat 1-1.2kg',
        unit: 'EKOR',
        packagingType: 'PLASTIK_VAKUM',
        shelfLife: 2,
        storageCondition: 'FROZEN_-18C',
        basePrice: 85000,
        pricePerUnit: 85000,
        minimumOrder: 10,
        isAvailable: true,
        leadTimeHours: 24,
        hasHalalCert: true,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier1.id,
          productCode: 'PROT-002-BEEF'
        }
      },
      update: {},
      create: {
        supplierId: supplier1.id,
        sppgId: sppg.id,
        productCode: 'PROT-002-BEEF',
        productName: 'Daging Sapi Segar (Has Dalam)',
        category: 'PROTEIN_HEWANI',
        subcategory: 'DAGING',
        description: 'Daging sapi has dalam, Grade A, segar tanpa pengawet',
        unit: 'KG',
        packagingType: 'PLASTIK_VAKUM',
        shelfLife: 3,
        storageCondition: 'CHILLED_0_4C',
        basePrice: 145000,
        pricePerUnit: 145000,
        minimumOrder: 5,
        isAvailable: true,
        leadTimeHours: 48,
        hasHalalCert: true,
        qualityGrade: QualityGrade.EXCELLENT,
      }
    }),
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier1.id,
          productCode: 'PROT-003-EGG'
        }
      },
      update: {},
      create: {
        supplierId: supplier1.id,
        sppgId: sppg.id,
        productCode: 'PROT-003-EGG',
        productName: 'Telur Ayam Negeri (Grade A)',
        category: 'PROTEIN_HEWANI',
        subcategory: 'TELUR',
        description: 'Telur ayam negeri segar, Grade A, berat 60-65g per butir',
        unit: 'KG',
        packagingType: 'TRAY_PLASTIK',
        shelfLife: 14,
        storageCondition: 'ROOM_TEMP',
        basePrice: 28000,
        pricePerUnit: 28000,
        minimumOrder: 10,
        isAvailable: true,
        leadTimeHours: 12,
        hasHalalCert: true,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier1.id,
          productCode: 'PROT-004-FISH'
        }
      },
      update: {},
      create: {
        supplierId: supplier1.id,
        sppgId: sppg.id,
        productCode: 'PROT-004-FISH',
        productName: 'Ikan Nila Segar (Ukuran Sedang)',
        category: 'PROTEIN_HEWANI',
        subcategory: 'IKAN',
        description: 'Ikan nila segar, ukuran 300-400g per ekor, dari kolam',
        unit: 'KG',
        packagingType: 'ES_BATU',
        shelfLife: 1,
        storageCondition: 'CHILLED_0_4C',
        basePrice: 32000,
        pricePerUnit: 32000,
        minimumOrder: 10,
        isAvailable: true,
        leadTimeHours: 12,
        hasHalalCert: true,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
  ])

  products.push(...proteinProducts)

  // Products for Supplier 2 (Vegetables)
  const vegProducts = await Promise.all([
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier2.id,
          productCode: 'VEG-001-SPINACH'
        }
      },
      update: {},
      create: {
        supplierId: supplier2.id,
        sppgId: sppg.id,
        productCode: 'VEG-001-SPINACH',
        productName: 'Bayam Hijau Segar',
        category: 'SAYURAN',
        subcategory: 'DAUN',
        description: 'Bayam hijau segar, dipetik pagi hari',
        unit: 'KG',
        packagingType: 'PLASTIK',
        shelfLife: 2,
        storageCondition: 'CHILLED_0_4C',
        basePrice: 8000,
        pricePerUnit: 8000,
        minimumOrder: 5,
        isAvailable: true,
        leadTimeHours: 6,
        hasOrganicCert: false,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier2.id,
          productCode: 'VEG-002-CARROT'
        }
      },
      update: {},
      create: {
        supplierId: supplier2.id,
        sppgId: sppg.id,
        productCode: 'VEG-002-CARROT',
        productName: 'Wortel Lokal Segar',
        category: 'SAYURAN',
        subcategory: 'UMBI',
        description: 'Wortel lokal segar, ukuran sedang-besar',
        unit: 'KG',
        packagingType: 'KARUNG',
        shelfLife: 7,
        storageCondition: 'ROOM_TEMP',
        basePrice: 12000,
        pricePerUnit: 12000,
        minimumOrder: 10,
        isAvailable: true,
        leadTimeHours: 12,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier2.id,
          productCode: 'VEG-003-TOMATO'
        }
      },
      update: {},
      create: {
        supplierId: supplier2.id,
        sppgId: sppg.id,
        productCode: 'VEG-003-TOMATO',
        productName: 'Tomat Merah Segar',
        category: 'SAYURAN',
        subcategory: 'BUAH',
        description: 'Tomat merah segar, tingkat kematangan 80%',
        unit: 'KG',
        packagingType: 'KERANJANG',
        shelfLife: 5,
        storageCondition: 'ROOM_TEMP',
        basePrice: 15000,
        pricePerUnit: 15000,
        minimumOrder: 5,
        isAvailable: true,
        leadTimeHours: 6,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier2.id,
          productCode: 'VEG-004-CABBAGE'
        }
      },
      update: {},
      create: {
        supplierId: supplier2.id,
        sppgId: sppg.id,
        productCode: 'VEG-004-CABBAGE',
        productName: 'Kubis Hijau Segar',
        category: 'SAYURAN',
        subcategory: 'DAUN',
        description: 'Kubis hijau segar, ukuran sedang (800g-1kg)',
        unit: 'KG',
        packagingType: 'PLASTIK',
        shelfLife: 7,
        storageCondition: 'CHILLED_0_4C',
        basePrice: 9000,
        pricePerUnit: 9000,
        minimumOrder: 10,
        isAvailable: true,
        leadTimeHours: 12,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
  ])

  products.push(...vegProducts)

  // Products for Supplier 3 (Carbs)
  const carbProducts = await Promise.all([
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier3.id,
          productCode: 'CARB-001-RICE'
        }
      },
      update: {},
      create: {
        supplierId: supplier3.id,
        sppgId: sppg.id,
        productCode: 'CARB-001-RICE',
        productName: 'Beras Premium Cianjur (Karung 25kg)',
        category: 'KARBOHIDRAT',
        subcategory: 'BERAS',
        description: 'Beras premium Cianjur, putih bersih, aroma wangi',
        unit: 'KARUNG',
        packagingType: 'KARUNG_25KG',
        shelfLife: 180,
        storageCondition: 'DRY_COOL',
        basePrice: 375000,
        pricePerUnit: 375000,
        minimumOrder: 4,
        isAvailable: true,
        leadTimeHours: 48,
        hasHalalCert: true,
        qualityGrade: QualityGrade.EXCELLENT,
        certifications: ['HALAL', 'SNI'],
      }
    }),
    prisma.supplierProduct.upsert({
      where: {
        supplierId_productCode: {
          supplierId: supplier3.id,
          productCode: 'CARB-002-FLOUR'
        }
      },
      update: {},
      create: {
        supplierId: supplier3.id,
        sppgId: sppg.id,
        productCode: 'CARB-002-FLOUR',
        productName: 'Tepung Terigu Protein Sedang (1kg)',
        category: 'KARBOHIDRAT',
        subcategory: 'TEPUNG',
        description: 'Tepung terigu protein sedang, cocok untuk kue dan gorengan',
        unit: 'KG',
        packagingType: 'PLASTIK_SEAL',
        shelfLife: 365,
        storageCondition: 'DRY_COOL',
        basePrice: 12000,
        pricePerUnit: 12000,
        minimumOrder: 20,
        isAvailable: true,
        leadTimeHours: 24,
        hasHalalCert: true,
        qualityGrade: QualityGrade.GOOD,
      }
    }),
  ])

  products.push(...carbProducts)

  console.log(`  ✓ Created ${products.length} supplier products`)

  // ========================================
  // 3. CREATE PROCUREMENT PLAN
  // ========================================
  console.log('  → Creating procurement plan...')

  const currentMonth = new Date().toISOString().slice(0, 7) // "2025-10"
  const currentYear = new Date().getFullYear()
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)

  const procurementPlan = await prisma.procurementPlan.upsert({
    where: {
      id: `proc-plan-${sppg.code}-${currentMonth}`
    },
    update: {},
    create: {
      id: `proc-plan-${sppg.code}-${currentMonth}`,
      sppgId: sppg.id,
      programId: program.id,
      planName: `Rencana Pengadaan ${currentMonth}`,
      planMonth: currentMonth,
      planYear: currentYear,
      planQuarter: currentQuarter,
      totalBudget: 50000000,
      allocatedBudget: 45000000,
      usedBudget: 32500000,
      remainingBudget: 12500000,
      proteinBudget: 20000000,
      carbBudget: 15000000,
      vegetableBudget: 8000000,
      fruitBudget: 2000000,
      targetRecipients: 200, // Default value
      targetMeals: 200 * 22, // 22 hari kerja
      costPerMeal: 10000,
      approvalStatus: 'APPROVED',
      submittedBy: 'admin-user-id',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      approvedBy: 'kepala-user-id',
      approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      notes: 'Rencana pengadaan untuk menu makan siang anak sekolah bulan ini',
      emergencyBuffer: 5000000,
    }
  })

  console.log('  ✓ Created procurement plan')

  // ========================================
  // 4. CREATE PROCUREMENTS (6 procurements with various statuses)
  // ========================================
  console.log('  → Creating procurements...')

  const procurements = []
  const today = new Date()

  // Procurement 1: COMPLETED (last week)
  const proc1Date = new Date(today)
  proc1Date.setDate(proc1Date.getDate() - 7)

  const proc1 = await prisma.procurement.create({
    data: {
      sppgId: sppg.id,
      planId: procurementPlan.id,
      procurementCode: `PO-${sppg.code}-${Date.now()}-001`,
      procurementDate: proc1Date,
      expectedDelivery: new Date(proc1Date.getTime() + 2 * 24 * 60 * 60 * 1000),
      actualDelivery: new Date(proc1Date.getTime() + 2 * 24 * 60 * 60 * 1000),
      supplierId: supplier1.id,
      purchaseMethod: ProcurementMethod.DIRECT,
      paymentTerms: 'NET_30',
      subtotalAmount: 8500000,
      taxAmount: 935000,
      totalAmount: 9435000,
      paidAmount: 9435000,
      paymentStatus: 'PAID',
      status: ProcurementStatus.COMPLETED,
      deliveryStatus: 'DELIVERED',
      qualityGrade: QualityGrade.EXCELLENT,
      qualityNotes: 'Kualitas produk sangat baik, sesuai spesifikasi',
      receiptNumber: 'RCP-001-2025',
      deliveryMethod: 'DELIVERY',
      acceptanceStatus: 'ACCEPTED',
    }
  })
  procurements.push(proc1)

  // Add items for Procurement 1
  await Promise.all([
    prisma.procurementItem.create({
      data: {
        procurementId: proc1.id,
        inventoryItemId: inventoryItems[0]?.id,
        itemName: 'Ayam Kampung Segar',
        category: InventoryCategory.PROTEIN,
        orderedQuantity: 100,
        receivedQuantity: 100,
        unit: 'EKOR',
        pricePerUnit: 85000,
        totalPrice: 8500000,
        finalPrice: 8500000,
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isAccepted: true,
      }
    })
  ])

  // Procurement 2: IN_DELIVERY (today)
  const proc2 = await prisma.procurement.create({
    data: {
      sppgId: sppg.id,
      planId: procurementPlan.id,
      procurementCode: `PO-${sppg.code}-${Date.now()}-002`,
      procurementDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      expectedDelivery: today,
      supplierId: supplier2.id,
      purchaseMethod: ProcurementMethod.DIRECT,
      paymentTerms: 'CASH_ON_DELIVERY',
      subtotalAmount: 450000,
      totalAmount: 450000,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: ProcurementStatus.ORDERED,
      deliveryStatus: 'SHIPPED',
      deliveryMethod: 'DELIVERY',
    }
  })
  procurements.push(proc2)

  // Add items for Procurement 2
  await Promise.all([
    prisma.procurementItem.create({
      data: {
        procurementId: proc2.id,
        itemName: 'Bayam Hijau',
        category: InventoryCategory.SAYURAN,
        orderedQuantity: 20,
        unit: 'KG',
        pricePerUnit: 8000,
        totalPrice: 160000,
        finalPrice: 160000,
      }
    }),
    prisma.procurementItem.create({
      data: {
        procurementId: proc2.id,
        itemName: 'Wortel',
        category: InventoryCategory.SAYURAN,
        orderedQuantity: 15,
        unit: 'KG',
        pricePerUnit: 12000,
        totalPrice: 180000,
        finalPrice: 180000,
      }
    }),
    prisma.procurementItem.create({
      data: {
        procurementId: proc2.id,
        itemName: 'Tomat',
        category: InventoryCategory.SAYURAN,
        orderedQuantity: 10,
        unit: 'KG',
        pricePerUnit: 15000,
        totalPrice: 150000,
        finalPrice: 150000,
      }
    }),
  ])

  // Procurement 3: APPROVED (tomorrow delivery)
  const proc3 = await prisma.procurement.create({
    data: {
      sppgId: sppg.id,
      planId: procurementPlan.id,
      procurementCode: `PO-${sppg.code}-${Date.now()}-003`,
      procurementDate: today,
      expectedDelivery: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
      supplierId: supplier3.id,
      purchaseMethod: ProcurementMethod.CONTRACT,
      paymentTerms: 'NET_15',
      subtotalAmount: 1500000,
      totalAmount: 1500000,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: ProcurementStatus.APPROVED,
      deliveryStatus: 'CONFIRMED',
      deliveryMethod: 'DELIVERY',
    }
  })
  procurements.push(proc3)

  // Add items for Procurement 3
  await prisma.procurementItem.create({
    data: {
      procurementId: proc3.id,
      itemName: 'Beras Premium Cianjur',
      category: InventoryCategory.KARBOHIDRAT,
      orderedQuantity: 4,
      unit: 'KARUNG',
      pricePerUnit: 375000,
      totalPrice: 1500000,
      finalPrice: 1500000,
    }
  })

  // Procurement 4: DRAFT
  const proc4 = await prisma.procurement.create({
    data: {
      sppgId: sppg.id,
      planId: procurementPlan.id,
      procurementCode: `PO-${sppg.code}-${Date.now()}-004`,
      procurementDate: today,
      expectedDelivery: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      supplierId: supplier4.id,
      purchaseMethod: ProcurementMethod.DIRECT,
      paymentTerms: 'NET_7',
      subtotalAmount: 840000,
      totalAmount: 840000,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: ProcurementStatus.DRAFT,
      deliveryStatus: 'ORDERED',
      deliveryMethod: 'DELIVERY',
    }
  })
  procurements.push(proc4)

  // Add items for Procurement 4
  await prisma.procurementItem.create({
    data: {
      procurementId: proc4.id,
      itemName: 'Susu UHT 1 Liter',
      category: InventoryCategory.SUSU_OLAHAN,
      orderedQuantity: 60,
      unit: 'LITER',
      pricePerUnit: 14000,
      totalPrice: 840000,
      finalPrice: 840000,
    }
  })

  // Procurement 5: CANCELLED
  const proc5 = await prisma.procurement.create({
    data: {
      sppgId: sppg.id,
      planId: procurementPlan.id,
      procurementCode: `PO-${sppg.code}-${Date.now()}-005`,
      procurementDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      expectedDelivery: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      supplierId: supplier5.id,
      purchaseMethod: ProcurementMethod.EMERGENCY,
      paymentTerms: 'CASH_ON_DELIVERY',
      subtotalAmount: 250000,
      totalAmount: 250000,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: ProcurementStatus.CANCELLED,
      deliveryStatus: 'CANCELLED',
      rejectionReason: 'Supplier tidak dapat memenuhi order dalam waktu yang ditentukan',
    }
  })
  procurements.push(proc5)

  // Procurement 6: QUALITY_CHECK
  const proc6 = await prisma.procurement.create({
    data: {
      sppgId: sppg.id,
      planId: procurementPlan.id,
      procurementCode: `PO-${sppg.code}-${Date.now()}-006`,
      procurementDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      expectedDelivery: today,
      actualDelivery: today,
      supplierId: supplier1.id,
      purchaseMethod: ProcurementMethod.DIRECT,
      paymentTerms: 'NET_30',
      subtotalAmount: 3200000,
      totalAmount: 3200000,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: ProcurementStatus.PARTIALLY_RECEIVED,
      deliveryStatus: 'DELIVERED',
      deliveryMethod: 'DELIVERY',
      acceptanceStatus: 'PARTIAL',
    }
  })
  procurements.push(proc6)

  // Add items for Procurement 6
  await Promise.all([
    prisma.procurementItem.create({
      data: {
        procurementId: proc6.id,
        itemName: 'Ikan Nila Segar',
        category: InventoryCategory.PROTEIN,
        orderedQuantity: 100,
        receivedQuantity: 95,
        unit: 'KG',
        pricePerUnit: 32000,
        totalPrice: 3200000,
        finalPrice: 3040000,
        isAccepted: true,
        returnedQuantity: 5,
        rejectionReason: '5kg tidak memenuhi standar ukuran',
      }
    })
  ])

  console.log(`  ✓ Created ${procurements.length} procurements`)
  console.log('  ✓ Procurement scenarios: Completed, In-Delivery, Approved, Draft, Cancelled, Quality-Check')

  // ========================================
  // SUMMARY
  // ========================================
  console.log('')
  console.log('  ✅ Procurement domain seed completed!')
  console.log(`     - Suppliers: ${suppliers.length}`)
  console.log(`     - Products: ${products.length}`)
  console.log(`     - Plans: 1`)
  console.log(`     - Procurements: ${procurements.length}`)
  console.log(`     - Total Items: ${procurements.length * 2} (avg)`)
}
