/**
 * @fileoverview Nutrition reference seeding dengan data makanan lokal Indonesia
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { PrismaClient } from '@prisma/client'

export async function seedNutrition(prisma: PrismaClient) {
  console.log('  → Creating nutrition reference data...')

  // Nutrition Standards - Standar gizi sesuai PMK No. 28 Tahun 2019
  const nutritionStandards = await Promise.all([
    // BALITA 2-5 tahun
    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'TODDLER',
          ageGroup: 'BALITA_2_5',
          gender: 'MALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'TODDLER',
        ageGroup: 'BALITA_2_5',
        gender: 'MALE',
        activityLevel: 'MODERATE',
        calories: 1125,  // 75% AKG
        protein: 25,     // 75% AKG
        carbohydrates: 155,
        fat: 44,
        fiber: 16,
        calcium: 650,
        iron: 8,
        vitaminA: 400,
        vitaminC: 40,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi balita laki-laki 2-5 tahun sesuai PMK 28/2019',
      }
    }),

    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'TODDLER',
          ageGroup: 'BALITA_2_5',
          gender: 'FEMALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'TODDLER',
        ageGroup: 'BALITA_2_5',
        gender: 'FEMALE',
        activityLevel: 'MODERATE',
        calories: 1050,
        protein: 23,
        carbohydrates: 144,
        fat: 41,
        fiber: 15,
        calcium: 650,
        iron: 8,
        vitaminA: 400,
        vitaminC: 40,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi balita perempuan 2-5 tahun sesuai PMK 28/2019',
      }
    }),

    // ANAK SEKOLAH 6-12 tahun
    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'SCHOOL_CHILDREN',
          ageGroup: 'ANAK_6_12',
          gender: 'MALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'SCHOOL_CHILDREN',
        ageGroup: 'ANAK_6_12',
        gender: 'MALE',
        activityLevel: 'MODERATE',
        calories: 1650,
        protein: 45,
        carbohydrates: 220,
        fat: 65,
        fiber: 20,
        calcium: 1000,
        iron: 10,
        vitaminA: 500,
        vitaminC: 45,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi anak laki-laki 6-12 tahun sesuai PMK 28/2019',
      }
    }),

    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'SCHOOL_CHILDREN',
          ageGroup: 'ANAK_6_12',
          gender: 'FEMALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'SCHOOL_CHILDREN',
        ageGroup: 'ANAK_6_12',
        gender: 'FEMALE',
        activityLevel: 'MODERATE',
        calories: 1500,
        protein: 40,
        carbohydrates: 200,
        fat: 58,
        fiber: 18,
        calcium: 1000,
        iron: 8,
        vitaminA: 500,
        vitaminC: 45,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi anak perempuan 6-12 tahun sesuai PMK 28/2019',
      }
    }),

    // REMAJA 13-18 tahun
    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'TEENAGE_GIRL',
          ageGroup: 'REMAJA_13_18',
          gender: 'MALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'TEENAGE_GIRL',
        ageGroup: 'REMAJA_13_18',
        gender: 'MALE',
        activityLevel: 'MODERATE',
        calories: 2175,
        protein: 70,
        carbohydrates: 300,
        fat: 85,
        fiber: 35,
        calcium: 1200,
        iron: 15,
        vitaminA: 600,
        vitaminC: 90,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi remaja laki-laki 13-18 tahun sesuai PMK 28/2019',
      }
    }),

    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'TEENAGE_GIRL',
          ageGroup: 'REMAJA_13_18',
          gender: 'FEMALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'TEENAGE_GIRL',
        ageGroup: 'REMAJA_13_18',
        gender: 'FEMALE',
        activityLevel: 'MODERATE',
        calories: 1950,
        protein: 60,
        carbohydrates: 270,
        fat: 75,
        fiber: 30,
        calcium: 1200,
        iron: 15,
        vitaminA: 500,
        vitaminC: 75,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi remaja perempuan 13-18 tahun sesuai PMK 28/2019',
      }
    }),

    // IBU HAMIL
    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'PREGNANT_WOMAN',
          ageGroup: 'DEWASA_19_59',
          gender: 'FEMALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'PREGNANT_WOMAN',
        ageGroup: 'DEWASA_19_59',
        gender: 'FEMALE',
        activityLevel: 'MODERATE',
        calories: 2130,
        protein: 75,
        carbohydrates: 290,
        fat: 80,
        fiber: 32,
        calcium: 1200,
        iron: 27,
        vitaminA: 800,
        vitaminC: 85,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi ibu hamil sesuai PMK 28/2019',
      }
    }),

    // IBU MENYUSUI
    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'BREASTFEEDING_MOTHER',
          ageGroup: 'DEWASA_19_59',
          gender: 'FEMALE',
          activityLevel: 'MODERATE'
        }
      },
      update: {},
      create: {
        targetGroup: 'BREASTFEEDING_MOTHER',
        ageGroup: 'DEWASA_19_59',
        gender: 'FEMALE',
        activityLevel: 'MODERATE',
        calories: 2330,
        protein: 80,
        carbohydrates: 320,
        fat: 85,
        fiber: 33,
        calcium: 1200,
        iron: 9,
        vitaminA: 850,
        vitaminC: 120,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi ibu menyusui sesuai PMK 28/2019',
      }
    }),

    // LANSIA 60+ tahun
    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'ELDERLY',
          ageGroup: 'LANSIA_60_PLUS',
          gender: 'MALE',
          activityLevel: 'LIGHT'
        }
      },
      update: {},
      create: {
        targetGroup: 'ELDERLY',
        ageGroup: 'LANSIA_60_PLUS',
        gender: 'MALE',
        activityLevel: 'LIGHT',
        calories: 1800,
        protein: 62,
        carbohydrates: 245,
        fat: 67,
        fiber: 25,
        calcium: 1000,
        iron: 9,
        vitaminA: 600,
        vitaminC: 90,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi lansia laki-laki 60+ tahun sesuai PMK 28/2019',
      }
    }),

    prisma.nutritionStandard.upsert({
      where: { 
        targetGroup_ageGroup_gender_activityLevel: {
          targetGroup: 'ELDERLY',
          ageGroup: 'LANSIA_60_PLUS',
          gender: 'FEMALE',
          activityLevel: 'LIGHT'
        }
      },
      update: {},
      create: {
        targetGroup: 'ELDERLY',
        ageGroup: 'LANSIA_60_PLUS',
        gender: 'FEMALE',
        activityLevel: 'LIGHT',
        calories: 1550,
        protein: 56,
        carbohydrates: 210,
        fat: 57,
        fiber: 22,
        calcium: 1000,
        iron: 8,
        vitaminA: 500,
        vitaminC: 75,
        source: 'PMK No. 28 Tahun 2019',
        referenceYear: 2019,
        notes: 'Standar gizi lansia perempuan 60+ tahun sesuai PMK 28/2019',
      }
    })
  ])

  console.log('  ✓ Created nutrition reference data:')
  console.log(`    - ${nutritionStandards.length} nutrition standards`)
}