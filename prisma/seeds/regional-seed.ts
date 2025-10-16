/**
 * @fileoverview Regional data seeding untuk Indonesia (Provinsi, Kabupaten, Kecamatan, Desa)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { PrismaClient } from '@prisma/client'

export async function seedRegional(prisma: PrismaClient) {
  console.log('  → Creating regional data...')

  // Province - Jawa Barat
  const jawaBarat = await prisma.province.upsert({
    where: { code: '32' },
    update: {},
    create: {
      code: '32',
      name: 'Jawa Barat',
      region: 'JAWA',
      timezone: 'WIB',
    }
  })

  // Regency - Purwakarta
  const purwakarta = await prisma.regency.upsert({
    where: { 
      provinceId_code: {
        provinceId: jawaBarat.id,
        code: '3217'
      }
    },
    update: {},
    create: {
      code: '3217',
      name: 'Kabupaten Purwakarta',
      type: 'REGENCY',
      provinceId: jawaBarat.id,
    }
  })

  // Districts - Hanya yang penting untuk SPPG
  const purwakartaDistrict = await prisma.district.upsert({
    where: { 
      regencyId_code: {
        regencyId: purwakarta.id,
        code: '321710'
      }
    },
    update: {},
    create: {
      code: '321710',
      name: 'Purwakarta',
      regencyId: purwakarta.id,
    }
  })

  // Villages - Sample untuk SPPG location
  const nagriTengah = await prisma.village.upsert({
    where: { 
      districtId_code: {
        districtId: purwakartaDistrict.id,
        code: '3217100003'
      }
    },
    update: {},
    create: {
      code: '3217100003',
      name: 'Nagri Tengah',
      type: 'URBAN_VILLAGE',
      districtId: purwakartaDistrict.id,
      postalCode: '41113',
    }
  })

  console.log('  ✓ Created regional data:')
  console.log(`    - 1 province (Jawa Barat)`)
  console.log(`    - 1 regency (Purwakarta)`) 
  console.log(`    - 1 district (Purwakarta)`)
  console.log(`    - 1 village (Nagri Tengah)`)

  return {
    jawaBarat,
    purwakarta,
    purwakartaDistrict,
    nagriTengah,
  }
}