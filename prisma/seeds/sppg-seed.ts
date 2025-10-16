/**
 * @fileoverview SPPG seeding dengan data regional Purwakarta yang realistis
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { PrismaClient, SPPG } from '@prisma/client'
import { seedRegional } from './regional-seed'

export async function seedSppg(prisma: PrismaClient): Promise<SPPG[]> {
  console.log('  → Creating SPPG entities...')

  // Create regional data first
  const { jawaBarat, purwakarta, purwakartaDistrict, nagriTengah } = await seedRegional(prisma)

  const sppgs = await Promise.all([
    // Production SPPG with Regional Data
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-001' },
      update: {},
      create: {
        code: 'SPPG-PWK-001',
        name: 'SPPG Purwakarta Utara',
        description: 'Satuan Pelayanan Pemenuhan Gizi untuk wilayah Purwakarta Utara',
        
        // Enhanced Structured Address
        addressDetail: 'Jl. KH. Abdul Halim No. 103, RT 02 RW 01',
        provinceId: jawaBarat.id,
        regencyId: purwakarta.id,
        districtId: purwakartaDistrict.id,
        villageId: nagriTengah.id,
        postalCode: '41152',
        coordinates: '-6.5547,107.4338', // Purwakarta coordinates
        timezone: 'WIB',
        
        // Contact Information
        phone: '0264-200001',
        email: 'purwakarta.utara@sppg.id',
        
        // Person In Charge (REQUIRED FIELDS)
        picName: 'Dr. Siti Nurhaliza, S.Gz., M.Si',
        picPosition: 'Kepala SPPG Purwakarta Utara',
        picEmail: 'siti.nurhaliza@sppg.purwakarta.go.id',
        picPhone: '0264-200002',
        picWhatsapp: '081234567890',
        
        organizationType: 'PEMERINTAH',
        establishedYear: 2024,
        targetRecipients: 5000,
        maxRadius: 25.5,
        maxTravelTime: 45,
        operationStartDate: new Date('2024-01-15'),
        status: 'ACTIVE',
        isDemoAccount: false
      }
    }),

    // Demo SPPG
    prisma.sPPG.upsert({
      where: { code: 'DEMO-SPPG-001' },
      update: {},
      create: {
        code: 'DEMO-SPPG-001',
        name: 'Demo SPPG Purwakarta',
        description: 'Demo account untuk evaluasi sistem SPPG',
        
        // Demo Address
        addressDetail: 'Demo Address - Jl. Demo No. 1',
        provinceId: jawaBarat.id,
        regencyId: purwakarta.id,
        districtId: purwakartaDistrict.id,
        villageId: nagriTengah.id,
        postalCode: '41000',
        coordinates: '-6.5547,107.4338',
        timezone: 'WIB',
        
        // Demo Contact
        phone: '0264-000000',
        email: 'demo@sppg.id',
        
        // Demo Person In Charge (REQUIRED FIELDS)
        picName: 'Ahmad Demo Sutrisno, S.Gz',
        picPosition: 'Demo Account Manager',
        picEmail: 'demo.manager@sppg.id',
        picPhone: '0264-000001',
        picWhatsapp: '081000000000',
        
        organizationType: 'PEMERINTAH',
        establishedYear: 2024,
        targetRecipients: 100,
        maxRadius: 10.0,
        maxTravelTime: 30,
        operationStartDate: new Date('2024-12-01'),
        status: 'ACTIVE',
        
        // Demo flags
        isDemoAccount: true,
        demoExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        demoStartedAt: new Date(),
        demoMaxBeneficiaries: 100,
        demoAllowedFeatures: [
          'MENU_MANAGEMENT',
          'BASIC_PROCUREMENT',
          'BASIC_REPORTING'
        ]
      }
    })
  ])

  console.log(`  ✓ Created ${sppgs.length} SPPG entities`)
  return sppgs
}