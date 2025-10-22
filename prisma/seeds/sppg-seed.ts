/**
 * @fileoverview SPPG Demo 2025 Seeding - Enterprise Pattern
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Prisma Seed Architecture
 * @description Single comprehensive demo SPPG following enterprise seed pattern
 * Date: October 22, 2025
 */

import { PrismaClient, SPPG } from '@prisma/client'

/**
 * Seed SPPG Demo 2025 Entity
 * @param prisma - Prisma client instance
 * @param regionalData - Regional data from seedRegional (province, regency, district, village IDs)
 * @returns Promise<SPPG[]> - Array of created SPPG entities
 */
export async function seedSppg(
  prisma: PrismaClient,
  regionalData: {
    provinceId: string
    regencyId: string
    districtId: string
    villageId: string
  }
): Promise<SPPG[]> {
  console.log('  → Creating SPPG Demo 2025 entity...')

  const sppgs = await Promise.all([
    // 🎭 DEMO SPPG 2025 - Comprehensive Testing Account
    prisma.sPPG.upsert({
      where: { code: 'DEMO-2025' },
      update: {},
      create: {
        code: 'DEMO-2025',
        name: 'SPPG Demo Bagizi 2025',
        description: 'Demo Account untuk testing semua fitur sistem Bagizi-ID tahun 2025. Dilengkapi dengan user untuk semua role dan permission.',
        
        // Complete Address Structure
        addressDetail: 'Jl. Demo Bagizi No. 2025, RT 01 RW 01',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41100',
        coordinates: '-6.5547,107.4338', // Purwakarta coordinates
        timezone: 'WIB',
        
        // Contact Information
        phone: '0264-DEMO-2025',
        email: 'demo2025@bagizi.id',
        
        // Person In Charge
        picName: 'Demo Administrator 2025',
        picPosition: 'Kepala SPPG Demo',
        picEmail: 'admin.demo@bagizi.id',
        picPhone: '0264-000-2025',
        picWhatsapp: '081234567890',
        
        // Organization Details
        organizationType: 'PEMERINTAH',
        establishedYear: 2025,
        targetRecipients: 1000,
        maxRadius: 20.0,
        maxTravelTime: 30,
        operationStartDate: new Date('2025-01-01'),
        
        // Demo Account Settings
        status: 'ACTIVE',
        isDemoAccount: true,
        demoStartedAt: new Date('2025-01-01'),
        demoExpiresAt: new Date('2025-12-31'), // Valid until end of 2025
        
        // Feature Access (All features for comprehensive testing)
        demoAllowedFeatures: [
          'MENU_MANAGEMENT',
          'NUTRITION_CALCULATION', 
          'COST_CALCULATION',
          'PROCUREMENT',
          'PRODUCTION',
          'DISTRIBUTION',
          'INVENTORY',
          'REPORTING',
          'ANALYTICS',
          'USER_MANAGEMENT'
        ],
        
        // Limits & Settings
        demoMaxBeneficiaries: 1000,
        budgetAlertThreshold: 90
      }
    })
  ])

  console.log(`  ✓ Created ${sppgs.length} SPPG Demo 2025 entity`)
  return sppgs
}