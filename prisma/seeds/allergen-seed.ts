/**
 * Allergen Seed Data
 * Common Indonesian allergens for SPPG Menu Planning
 * 
 * @fileoverview Seeds platform-default allergens (sppgId = null)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { PrismaClient } from '@prisma/client'

export async function seedAllergens(prisma: PrismaClient) {
  console.log('  → Creating platform allergen data...')

  // Platform allergens (sppgId = null)
  const allergenData = [
    // === DAIRY (Produk Susu) ===
    {
      name: 'Susu',
      description: 'Produk susu dan olahannya (susu sapi, kambing, keju, yogurt, mentega, krim)',
      category: 'DAIRY',
      isCommon: true,
      localName: 'Susu dan produk olahannya',
    },

    // === EGGS (Telur) ===
    {
      name: 'Telur',
      description: 'Telur ayam, bebek, atau unggas lainnya dan produk olahannya',
      category: 'EGGS',
      isCommon: true,
      localName: 'Telur dan produk olahannya',
    },

    // === NUTS (Kacang-kacangan) ===
    {
      name: 'Kacang Tanah',
      description: 'Kacang tanah dan produk olahannya (selai kacang, bumbu kacang)',
      category: 'NUTS',
      isCommon: true,
      localName: 'Kacang tanah',
    },
    {
      name: 'Kacang Kedelai',
      description: 'Kedelai dan produk olahannya (tahu, tempe, kecap, susu kedelai)',
      category: 'NUTS',
      isCommon: true,
      localName: 'Kedelai',
    },
    {
      name: 'Kacang Mete',
      description: 'Kacang mete (cashew nuts) dan produk olahannya',
      category: 'NUTS',
      isCommon: true,
      localName: 'Kacang mete / jambu monyet',
    },
    {
      name: 'Kacang Almond',
      description: 'Kacang almond dan produk olahannya (susu almond, tepung almond)',
      category: 'NUTS',
      isCommon: false,
      localName: 'Almond',
    },

    // === SEAFOOD (Makanan Laut) ===
    {
      name: 'Ikan',
      description: 'Ikan dan produk olahannya (ikan segar, ikan asin, ikan asap, terasi)',
      category: 'SEAFOOD',
      isCommon: true,
      localName: 'Ikan dan olahannya',
    },
    {
      name: 'Udang',
      description: 'Udang dan produk olahannya (udang segar, ebi, terasi udang)',
      category: 'SEAFOOD',
      isCommon: true,
      localName: 'Udang',
    },
    {
      name: 'Kerang',
      description: 'Kerang, tiram, cumi, dan moluska lainnya',
      category: 'SEAFOOD',
      isCommon: true,
      localName: 'Kerang dan moluska',
    },
    {
      name: 'Kepiting',
      description: 'Kepiting, rajungan, dan krustasea lainnya',
      category: 'SEAFOOD',
      isCommon: true,
      localName: 'Kepiting dan rajungan',
    },

    // === GRAINS (Biji-bijian) ===
    {
      name: 'Gandum',
      description: 'Gandum dan produk olahannya yang mengandung gluten (roti, pasta, mie)',
      category: 'GRAINS',
      isCommon: true,
      localName: 'Gandum / terigu',
    },
    {
      name: 'Jagung',
      description: 'Jagung dan produk olahannya (tepung jagung, minyak jagung)',
      category: 'GRAINS',
      isCommon: false,
      localName: 'Jagung',
    },

    // === SEEDS (Biji-bijian kecil) ===
    {
      name: 'Wijen',
      description: 'Biji wijen dan produk olahannya (minyak wijen, tahini)',
      category: 'SEEDS',
      isCommon: true,
      localName: 'Wijen / bijan',
    },

    // === TROPICAL FRUITS (Buah Tropis) ===
    {
      name: 'Durian',
      description: 'Buah durian dan produk olahannya',
      category: 'FRUITS',
      isCommon: false,
      localName: 'Durian',
    },
    {
      name: 'Nanas',
      description: 'Buah nanas dan produk olahannya',
      category: 'FRUITS',
      isCommon: false,
      localName: 'Nanas',
    },

    // === ADDITIVES (Bahan Tambahan) ===
    {
      name: 'MSG',
      description: 'Monosodium glutamate (vetsin, micin, penyedap rasa)',
      category: 'ADDITIVES',
      isCommon: true,
      localName: 'MSG / Vetsin / Micin',
    },
    {
      name: 'Pengawet Makanan',
      description: 'Bahan pengawet seperti benzoat, sulfit, nitrit',
      category: 'ADDITIVES',
      isCommon: false,
      localName: 'Pengawet',
    },

    // === MEAT (Daging) ===
    {
      name: 'Daging Sapi',
      description: 'Daging sapi dan produk olahannya (bakso sapi, kornet)',
      category: 'MEAT',
      isCommon: false,
      localName: 'Daging sapi',
    },
    {
      name: 'Daging Ayam',
      description: 'Daging ayam dan produk olahannya (nugget ayam, sosis ayam)',
      category: 'MEAT',
      isCommon: false,
      localName: 'Daging ayam',
    },
  ]

  // Create allergens if they don't exist
  const createdAllergens = []
  for (const data of allergenData) {
    const existing = await prisma.allergen.findFirst({
      where: {
        name: data.name,
        sppgId: null,
      }
    })

    if (!existing) {
      const allergen = await prisma.allergen.create({
        data: {
          ...data,
          sppgId: null,
          isActive: true,
        }
      })
      createdAllergens.push(allergen)
    } else {
      createdAllergens.push(existing)
    }
  }

  console.log(`  ✓ Created/verified ${createdAllergens.length} platform allergen records`)
  return createdAllergens
}
