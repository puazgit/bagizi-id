/**
 * Seed Inventory for SPPG Purwakarta Utara
 */

import { PrismaClient, InventoryCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function seedForSppgPurwakarta() {
  console.log('🌱 Seeding Inventory for SPPG Purwakarta Utara...\n')

  // Get SPPG Purwakarta Utara
  const sppg = await prisma.sPPG.findUnique({
    where: { code: 'SPPG-PWK-001' }
  })

  if (!sppg) {
    console.error('❌ SPPG Purwakarta Utara not found!')
    return
  }

  console.log(`✓ Found SPPG: ${sppg.name}`)
  console.log(`  sppgId: ${sppg.id}\n`)

  // Delete existing inventory items for this SPPG (if any)
  const deleted = await prisma.inventoryItem.deleteMany({
    where: { sppgId: sppg.id }
  })
  console.log(`🗑️  Deleted ${deleted.count} existing items\n`)

  const inventoryItems: Array<{
    itemName: string
    itemCode: string
    category: InventoryCategory
    unit: string
    currentStock: number
    minStock: number
    maxStock: number
    costPerUnit: number
    storageLocation: string
    storageCondition?: string
    isActive: boolean
    sppgId: string
  }> = [
    // KARBOHIDRAT (4 items)
    {
      itemName: 'Beras Merah',
      itemCode: 'BRM-001',
      category: 'KARBOHIDRAT',
      unit: 'kg',
      currentStock: 150,
      minStock: 50,
      maxStock: 500,
      costPerUnit: 15000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'DRY',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Beras Putih',
      itemCode: 'BRP-001',
      category: 'KARBOHIDRAT',
      unit: 'kg',
      currentStock: 200,
      minStock: 80,
      maxStock: 600,
      costPerUnit: 12000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'DRY',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Tepung Terigu',
      itemCode: 'TPT-001',
      category: 'KARBOHIDRAT',
      unit: 'kg',
      currentStock: 75,
      minStock: 30,
      maxStock: 200,
      costPerUnit: 10000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'DRY',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Mie Telur',
      itemCode: 'MIE-001',
      category: 'KARBOHIDRAT',
      unit: 'kg',
      currentStock: 30,
      minStock: 15,
      maxStock: 100,
      costPerUnit: 18000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'DRY',
      isActive: true,
      sppgId: sppg.id
    },

    // PROTEIN (7 items)
    {
      itemName: 'Ayam Fillet',
      itemCode: 'AYM-001',
      category: 'PROTEIN',
      unit: 'kg',
      currentStock: 40,
      minStock: 20,
      maxStock: 100,
      costPerUnit: 45000,
      storageLocation: 'Freezer',
      storageCondition: 'FROZEN',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Daging Sapi',
      itemCode: 'DSP-001',
      category: 'PROTEIN',
      unit: 'kg',
      currentStock: 25,
      minStock: 10,
      maxStock: 60,
      costPerUnit: 120000,
      storageLocation: 'Freezer',
      storageCondition: 'FROZEN',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Telur Ayam',
      itemCode: 'TLR-001',
      category: 'PROTEIN',
      unit: 'kg',
      currentStock: 30,
      minStock: 15,
      maxStock: 80,
      costPerUnit: 28000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Ikan Nila',
      itemCode: 'IKN-001',
      category: 'PROTEIN',
      unit: 'kg',
      currentStock: 25,
      minStock: 10,
      maxStock: 60,
      costPerUnit: 35000,
      storageLocation: 'Freezer',
      storageCondition: 'FROZEN',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Ikan Lele',
      itemCode: 'IKL-001',
      category: 'PROTEIN',
      unit: 'kg',
      currentStock: 20,
      minStock: 10,
      maxStock: 50,
      costPerUnit: 28000,
      storageLocation: 'Freezer',
      storageCondition: 'FROZEN',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Tempe',
      itemCode: 'TMP-001',
      category: 'PROTEIN',
      unit: 'kg',
      currentStock: 20,
      minStock: 10,
      maxStock: 50,
      costPerUnit: 12000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Tahu',
      itemCode: 'TAH-001',
      category: 'PROTEIN',
      unit: 'kg',
      currentStock: 18,
      minStock: 8,
      maxStock: 40,
      costPerUnit: 10000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },

    // SAYURAN (7 items)
    {
      itemName: 'Wortel',
      itemCode: 'WRT-001',
      category: 'SAYURAN',
      unit: 'kg',
      currentStock: 35,
      minStock: 15,
      maxStock: 100,
      costPerUnit: 8000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Bayam',
      itemCode: 'BYM-001',
      category: 'SAYURAN',
      unit: 'kg',
      currentStock: 20,
      minStock: 10,
      maxStock: 60,
      costPerUnit: 6000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Kangkung',
      itemCode: 'KNG-001',
      category: 'SAYURAN',
      unit: 'kg',
      currentStock: 15,
      minStock: 8,
      maxStock: 50,
      costPerUnit: 5000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Tomat',
      itemCode: 'TMT-001',
      category: 'SAYURAN',
      unit: 'kg',
      currentStock: 25,
      minStock: 10,
      maxStock: 70,
      costPerUnit: 9000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Sawi Hijau',
      itemCode: 'SWH-001',
      category: 'SAYURAN',
      unit: 'kg',
      currentStock: 18,
      minStock: 10,
      maxStock: 60,
      costPerUnit: 5500,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Kentang',
      itemCode: 'KNT-001',
      category: 'SAYURAN',
      unit: 'kg',
      currentStock: 40,
      minStock: 20,
      maxStock: 120,
      costPerUnit: 12000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Buncis',
      itemCode: 'BNC-001',
      category: 'SAYURAN',
      unit: 'kg',
      currentStock: 15,
      minStock: 8,
      maxStock: 50,
      costPerUnit: 11000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },

    // BUAH (4 items)
    {
      itemName: 'Pisang',
      itemCode: 'PSG-001',
      category: 'BUAH',
      unit: 'kg',
      currentStock: 30,
      minStock: 15,
      maxStock: 80,
      costPerUnit: 12000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Jeruk',
      itemCode: 'JRK-001',
      category: 'BUAH',
      unit: 'kg',
      currentStock: 20,
      minStock: 10,
      maxStock: 60,
      costPerUnit: 18000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Apel',
      itemCode: 'APL-001',
      category: 'BUAH',
      unit: 'kg',
      currentStock: 25,
      minStock: 12,
      maxStock: 70,
      costPerUnit: 25000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Semangka',
      itemCode: 'SMK-001',
      category: 'BUAH',
      unit: 'kg',
      currentStock: 15,
      minStock: 8,
      maxStock: 50,
      costPerUnit: 8000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },

    // SUSU_OLAHAN (3 items)
    {
      itemName: 'Susu UHT',
      itemCode: 'SSU-001',
      category: 'SUSU_OLAHAN',
      unit: 'liter',
      currentStock: 100,
      minStock: 40,
      maxStock: 300,
      costPerUnit: 18000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Keju Cheddar',
      itemCode: 'KJC-001',
      category: 'SUSU_OLAHAN',
      unit: 'kg',
      currentStock: 10,
      minStock: 5,
      maxStock: 30,
      costPerUnit: 120000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Yogurt',
      itemCode: 'YGT-001',
      category: 'SUSU_OLAHAN',
      unit: 'kg',
      currentStock: 15,
      minStock: 8,
      maxStock: 50,
      costPerUnit: 45000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },

    // BUMBU_REMPAH (6 items)
    {
      itemName: 'Garam',
      itemCode: 'GRM-001',
      category: 'BUMBU_REMPAH',
      unit: 'kg',
      currentStock: 10,
      minStock: 5,
      maxStock: 30,
      costPerUnit: 5000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'DRY',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Gula Pasir',
      itemCode: 'GLP-001',
      category: 'BUMBU_REMPAH',
      unit: 'kg',
      currentStock: 25,
      minStock: 10,
      maxStock: 80,
      costPerUnit: 14000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'DRY',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Bawang Merah',
      itemCode: 'BWM-001',
      category: 'BUMBU_REMPAH',
      unit: 'kg',
      currentStock: 15,
      minStock: 8,
      maxStock: 50,
      costPerUnit: 35000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Bawang Putih',
      itemCode: 'BWP-001',
      category: 'BUMBU_REMPAH',
      unit: 'kg',
      currentStock: 12,
      minStock: 6,
      maxStock: 40,
      costPerUnit: 38000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Kecap Manis',
      itemCode: 'KCM-001',
      category: 'BUMBU_REMPAH',
      unit: 'liter',
      currentStock: 20,
      minStock: 10,
      maxStock: 60,
      costPerUnit: 22000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Saos Tomat',
      itemCode: 'STM-001',
      category: 'BUMBU_REMPAH',
      unit: 'liter',
      currentStock: 15,
      minStock: 8,
      maxStock: 50,
      costPerUnit: 25000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },

    // MINYAK_LEMAK (3 items)
    {
      itemName: 'Minyak Goreng',
      itemCode: 'MYK-001',
      category: 'MINYAK_LEMAK',
      unit: 'liter',
      currentStock: 40,
      minStock: 20,
      maxStock: 120,
      costPerUnit: 16000,
      storageLocation: 'Gudang Kering',
      storageCondition: 'ROOM_TEMP',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Mentega',
      itemCode: 'MTG-001',
      category: 'MINYAK_LEMAK',
      unit: 'kg',
      currentStock: 10,
      minStock: 5,
      maxStock: 30,
      costPerUnit: 85000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
    {
      itemName: 'Margarin',
      itemCode: 'MRG-001',
      category: 'MINYAK_LEMAK',
      unit: 'kg',
      currentStock: 12,
      minStock: 6,
      maxStock: 35,
      costPerUnit: 45000,
      storageLocation: 'Chiller',
      storageCondition: 'COOL',
      isActive: true,
      sppgId: sppg.id
    },
  ]

  // Bulk insert
  const result = await prisma.inventoryItem.createMany({
    data: inventoryItems,
    skipDuplicates: true
  })

  console.log(`✅ Created ${result.count} inventory items for ${sppg.name}!\n`)
  console.log('📦 Inventory by Category:')
  console.log('  - KARBOHIDRAT: 4 items')
  console.log('  - PROTEIN: 7 items')
  console.log('  - SAYURAN: 7 items')
  console.log('  - BUAH: 4 items')
  console.log('  - SUSU_OLAHAN: 3 items')
  console.log('  - BUMBU_REMPAH: 6 items')
  console.log('  - MINYAK_LEMAK: 3 items')
  console.log('  ═══════════════════════')
  console.log(`  TOTAL: ${result.count} items`)

  await prisma.$disconnect()
}

seedForSppgPurwakarta()
  .catch(console.error)
  .finally(() => process.exit(0))
