/**
 * @fileoverview SPPG Comprehensive Seeding - Enterprise Pattern
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Prisma Seed Architecture
 * @description Comprehensive SPPG entities for Admin Platform testing
 * Including various organization types, statuses, and demo accounts
 * Date: October 25, 2025
 */

import { PrismaClient, SPPG, OrganizationType, SppgStatus } from '@prisma/client'

/**
 * Seed Comprehensive SPPG Entities
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
  console.log('  → Creating comprehensive SPPG entities for Admin Platform testing...')

  const sppgs = await Promise.all([
    // 1. �️ SPPG PEMERINTAH - Kabupaten Purwakarta (ACTIVE, NON-DEMO)
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-001' },
      update: {},
      create: {
        code: 'SPPG-PWK-001',
        name: 'SPPG Kabupaten Purwakarta 1',
        description: 'Satuan Pelayanan Pemenuhan Gizi Kabupaten Purwakarta melayani wilayah Kecamatan Purwakarta dan sekitarnya. Dikelola oleh Dinas Pendidikan Kabupaten Purwakarta dengan fokus pada pemenuhan gizi peserta didik di sekolah negeri.',
        
        // Complete Address Structure
        addressDetail: 'Jl. KK Singawinata No. 88, Nagrikidul',
        provinceId: regionalData.provinceId, // Jawa Barat
        regencyId: regionalData.regencyId,   // Kabupaten Purwakarta
        districtId: regionalData.districtId, // Kecamatan Purwakarta
        villageId: regionalData.villageId,   // Kelurahan Nagrikidul
        postalCode: '41115',
        coordinates: '-6.5547,107.4338', // Coordinates Purwakarta
        timezone: 'WIB',
        
        // Contact Information (Valid E.164 format)
        phone: '+622643456789',
        email: 'sppg.purwakarta1@bgn.go.id',
        
        // Person In Charge
        picName: 'Drs. Ahmad Santoso, M.Pd',
        picPosition: 'Kepala SPPG',
        picEmail: 'ahmad.santoso@bgn.go.id',
        picPhone: '+6281234567801',
        picWhatsapp: '+6281234567801',
        
        // Organization Details
        organizationType: 'PEMERINTAH' as OrganizationType,
        establishedYear: 2024,
        targetRecipients: 2500,
        maxRadius: 15.0,
        maxTravelTime: 45,
        operationStartDate: new Date('2024-09-01'),
        operationEndDate: new Date('2026-06-30'),
        
        // Budget Information (Complete with allocation)
        monthlyBudget: 75000000, // Rp 75 juta per bulan
        yearlyBudget: 900000000, // Rp 900 juta per tahun
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2024-09-01'),
        budgetEndDate: new Date('2025-08-31'),
        budgetAutoReset: true,
        budgetAlertThreshold: 85,
        budgetAllocation: {
          bahan_baku: 45,      // 45% untuk bahan baku makanan
          operasional: 25,     // 25% untuk operasional harian
          sdm: 22,            // 22% untuk SDM (gaji, pelatihan)
          transportasi: 5,     // 5% untuk transportasi distribusi
          lainnya: 3          // 3% untuk kebutuhan lainnya
        },
        
        // Status & Demo Settings
        status: 'ACTIVE' as SppgStatus,
        isDemoAccount: false,
        demoAllowedFeatures: [],
        demoStartedAt: null,
        demoExpiresAt: null,
        demoMaxBeneficiaries: null,
        demoParentId: null,
      }
    }),

    // 2. 🏫 SPPG SWASTA - Yayasan Pendidikan Purwakarta (ACTIVE, NON-DEMO)
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-002' },
      update: {},
      create: {
        code: 'SPPG-PWK-002',
        name: 'SPPG Yayasan Pendidikan Bhakti Purwakarta',
        description: 'SPPG yang dikelola oleh swasta melalui Yayasan Pendidikan Bhakti melayani sekolah-sekolah swasta di wilayah Purwakarta dengan standar gizi yang tinggi dan menu beragam.',
        
        addressDetail: 'Jl. Veteran No. 45, Cibatu',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41116',
        coordinates: '-6.5580,107.4420',
        timezone: 'WIB',
        
        phone: '+622643456790',
        email: 'sppg.bhakti@yayasanpendidikan.org',
        
        picName: 'Ibu Siti Nurjanah, S.Gz',
        picPosition: 'Koordinator SPPG',
        picEmail: 'siti.nurjanah@yayasanpendidikan.org',
        picPhone: '+6281234567802',
        picWhatsapp: '+6281234567802',
        
        organizationType: 'SWASTA' as OrganizationType,
        establishedYear: 2024,
        targetRecipients: 1500,
        maxRadius: 10.0,
        maxTravelTime: 30,
        operationStartDate: new Date('2024-10-01'),
        operationEndDate: new Date('2026-09-30'),
        
        // Budget Information (Complete with allocation)
        monthlyBudget: 50000000,
        yearlyBudget: 600000000,
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2024-10-01'),
        budgetEndDate: new Date('2025-09-30'),
        budgetAutoReset: true,
        budgetAlertThreshold: 90,
        budgetAllocation: {
          bahan_baku: 50,      // 50% untuk bahan baku makanan berkualitas tinggi
          operasional: 20,     // 20% untuk operasional
          sdm: 25,            // 25% untuk SDM profesional
          lainnya: 5          // 5% untuk kebutuhan lainnya
        },
        
        // Status & Demo Settings
        status: 'ACTIVE' as SppgStatus,
        isDemoAccount: false,
        demoAllowedFeatures: [],
        demoStartedAt: null,
        demoExpiresAt: null,
        demoMaxBeneficiaries: null,
        demoParentId: null,
      }
    }),

    // 3. 🕌 SPPG YAYASAN - Pondok Pesantren (ACTIVE, NON-DEMO)
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-003' },
      update: {},
      create: {
        code: 'SPPG-PWK-003',
        name: 'SPPG Pondok Pesantren Al-Hikmah Purwakarta',
        description: 'SPPG khusus untuk santri Pondok Pesantren Al-Hikmah dengan menu halal certified dan sesuai kebutuhan gizi santri yang aktif dalam kegiatan tahfidz dan pendidikan agama.',
        
        addressDetail: 'Jl. Pesantren Raya No. 123, Campaka',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41181',
        coordinates: '-6.5650,107.4250',
        timezone: 'WIB',
        
        phone: '+622643456791',
        email: 'sppg@pesantrenalhikmah.sch.id',
        
        picName: 'Ustadz Muhammad Ridwan, Lc., M.A',
        picPosition: 'Kepala Bagian Konsumsi',
        picEmail: 'm.ridwan@pesantrenalhikmah.sch.id',
        picPhone: '+6281234567803',
        picWhatsapp: '+6281234567803',
        
        organizationType: 'YAYASAN' as OrganizationType,
        establishedYear: 2025,
        targetRecipients: 800,
        maxRadius: 5.0, // Khusus area pesantren
        maxTravelTime: 15,
        operationStartDate: new Date('2025-01-15'),
        operationEndDate: new Date('2027-01-14'),
        
        // Budget Information (Complete with allocation)
        monthlyBudget: 30000000,
        yearlyBudget: 360000000,
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2025-01-01'),
        budgetEndDate: new Date('2025-12-31'),
        budgetAutoReset: true,
        budgetAlertThreshold: 80,
        budgetAllocation: {
          bahan_baku: 55,      // 55% untuk bahan baku halal certified
          operasional: 20,     // 20% untuk operasional
          sdm: 18,            // 18% untuk SDM
          transportasi: 4,     // 4% untuk transportasi
          lainnya: 3          // 3% untuk kebutuhan lainnya
        },
        
        // Status & Demo Settings
        status: 'ACTIVE' as SppgStatus,
        isDemoAccount: false,
        demoAllowedFeatures: [],
        demoStartedAt: null,
        demoExpiresAt: null,
        demoMaxBeneficiaries: null,
        demoParentId: null,
      }
    }),

    // 4. 👥 SPPG KOMUNITAS - Kelompok Peduli Gizi (PENDING, NON-DEMO)
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-004' },
      update: {},
      create: {
        code: 'SPPG-PWK-004',
        name: 'SPPG Komunitas Peduli Gizi Purwakarta',
        description: 'SPPG yang diinisiasi oleh komunitas masyarakat peduli gizi untuk melayani anak-anak di wilayah terpencil dan kurang mampu di Purwakarta. Masih dalam tahap persiapan.',
        
        addressDetail: 'Jl. Bhakti Sosial No. 17, Munjul',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41172',
        coordinates: '-6.5700,107.4500',
        timezone: 'WIB',
        
        phone: '+622643456792',
        email: 'komunitas.gizi@gmail.com',
        
        picName: 'Bapak Dedi Kurniawan',
        picPosition: 'Ketua Komunitas',
        picEmail: 'dedi.kurniawan@gmail.com',
        picPhone: '+6281234567804',
        picWhatsapp: '+6281234567804',
        
        organizationType: 'KOMUNITAS' as OrganizationType,
        establishedYear: 2025,
        targetRecipients: 300,
        maxRadius: 20.0,
        maxTravelTime: 60,
        operationStartDate: new Date('2025-03-01'),
        operationEndDate: new Date('2027-02-28'),
        
        // Budget Information (Complete with allocation)
        monthlyBudget: 15000000,
        yearlyBudget: 180000000,
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2025-03-01'),
        budgetEndDate: new Date('2026-02-28'),
        budgetAutoReset: true,
        budgetAlertThreshold: 75,
        budgetAllocation: {
          bahan_baku: 60,      // 60% untuk bahan baku (komunitas fokus pada makanan)
          operasional: 15,     // 15% untuk operasional
          sdm: 15,            // 15% untuk SDM volunteer
          transportasi: 8,     // 8% untuk transportasi ke area terpencil
          lainnya: 2          // 2% untuk kebutuhan lainnya
        },
        
        // Status & Demo Settings (PENDING APPROVAL)
        status: 'PENDING_APPROVAL' as SppgStatus, // Masih menunggu persetujuan
        isDemoAccount: false,
        demoAllowedFeatures: [],
        demoStartedAt: null,
        demoExpiresAt: null,
        demoMaxBeneficiaries: null,
        demoParentId: null,
      }
    }),

    // 5. ⚠️ SPPG SUSPENDED - Masalah Administrasi (SUSPENDED, NON-DEMO)
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-005' },
      update: {},
      create: {
        code: 'SPPG-PWK-005',
        name: 'SPPG Lembaga Layanan Gizi Sejahtera',
        description: 'SPPG yang sementara ditangguhkan karena permasalahan administrasi dan perlunya verifikasi ulang dokumen kelengkapan operasional.',
        
        addressDetail: 'Jl. Raya Sadang No. 234',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41165',
        coordinates: '-6.5800,107.4600',
        timezone: 'WIB',
        
        phone: '+622643456793',
        email: 'sppg.sejahtera@email.com',
        
        picName: 'Ibu Ratna Sari',
        picPosition: 'Pengelola',
        picEmail: 'ratna.sari@email.com',
        picPhone: '+6281234567805',
        picWhatsapp: '+6281234567805',
        
        organizationType: 'LAINNYA' as OrganizationType,
        establishedYear: 2024,
        targetRecipients: 500,
        maxRadius: 12.0,
        maxTravelTime: 40,
        operationStartDate: new Date('2024-11-01'),
        operationEndDate: new Date('2026-10-31'),
        
        // Budget Information (Complete with allocation - SUSPENDED but has budget history)
        monthlyBudget: 20000000,
        yearlyBudget: 240000000,
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2024-11-01'),
        budgetEndDate: new Date('2025-10-31'),
        budgetAutoReset: false, // Suspended, no auto reset
        budgetAlertThreshold: 70,
        budgetAllocation: {
          bahan_baku: 50,      // 50% untuk bahan baku
          operasional: 25,     // 25% untuk operasional
          sdm: 20,            // 20% untuk SDM
          lainnya: 5          // 5% untuk kebutuhan lainnya
        },
        
        // Status & Demo Settings (SUSPENDED)
        status: 'SUSPENDED' as SppgStatus, // Ditangguhkan
        isDemoAccount: false,
        demoAllowedFeatures: [],
        demoStartedAt: null,
        demoExpiresAt: null,
        demoMaxBeneficiaries: null,
        demoParentId: null,
      }
    }),

    // 6. 🎭 DEMO SPPG - Comprehensive Testing Account (ACTIVE, DEMO)
    prisma.sPPG.upsert({
      where: { code: 'DEMO-2025' },
      update: {},
      create: {
        code: 'DEMO-2025',
        name: 'SPPG Demo Bagizi 2025',
        description: 'Demo Account untuk testing semua fitur sistem Bagizi-ID tahun 2025. Dilengkapi dengan akses penuh ke semua modul dan fitur untuk keperluan pelatihan dan demonstrasi platform.',
        
        addressDetail: 'Jl. Demo Testing No. 2025, Demonstrasi Village',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41100',
        coordinates: '-6.5547,107.4338',
        timezone: 'WIB',
        
        // Demo phones with valid E.164 format
        phone: '+622640002025',
        email: 'demo2025@bagizi.id',
        
        picName: 'Demo Administrator 2025',
        picPosition: 'Kepala SPPG Demo',
        picEmail: 'admin.demo@bagizi.id',
        picPhone: '+6282100002025',
        picWhatsapp: '+6282100002025',
        
        organizationType: 'PEMERINTAH' as OrganizationType,
        establishedYear: 2025,
        targetRecipients: 1000,
        maxRadius: 20.0,
        maxTravelTime: 30,
        operationStartDate: new Date('2025-01-01'),
        operationEndDate: new Date('2025-12-31'),
        
        // Demo Budget (Complete with allocation)
        monthlyBudget: 100000000,
        yearlyBudget: 1200000000,
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2025-01-01'),
        budgetEndDate: new Date('2025-12-31'),
        budgetAutoReset: false, // Manual control for demo
        budgetAlertThreshold: 90,
        budgetAllocation: {
          bahan_baku: 40,      // 40% untuk bahan baku
          operasional: 30,     // 30% untuk operasional
          sdm: 20,            // 20% untuk SDM
          transportasi: 6,     // 6% untuk transportasi
          lainnya: 4          // 4% untuk testing features
        },
        
        // Demo Account Settings
        status: 'ACTIVE' as SppgStatus,
        isDemoAccount: true,
        demoStartedAt: new Date('2025-01-01'),
        demoExpiresAt: new Date('2025-12-31'), // Valid until end of 2025
        demoMaxBeneficiaries: 1000,
        demoParentId: null,
        
        // Full Feature Access for Testing
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
          'USER_MANAGEMENT',
          'SCHOOL_MANAGEMENT',
          'ALLERGEN_MANAGEMENT',
          'DELIVERY_MANAGEMENT'
        ],
      }
    }),

    // 7. 🏢 SPPG PEMERINTAH - Multi Location (ACTIVE, NON-DEMO)
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-006' },
      update: {},
      create: {
        code: 'SPPG-PWK-006',
        name: 'SPPG Kabupaten Purwakarta 2 (Wilayah Barat)',
        description: 'SPPG cabang yang melayani wilayah barat Kabupaten Purwakarta dengan jangkauan ke beberapa kecamatan. Memiliki sistem distribusi terpusat dengan armada kendaraan khusus.',
        
        addressDetail: 'Jl. Raya Bungursari No. 156, Bungursari',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41119',
        coordinates: '-6.5400,107.4100',
        timezone: 'WIB',
        
        phone: '+622643456794',
        email: 'sppg.purwakarta2@bgn.go.id',
        
        picName: 'Bapak Hendra Gunawan, S.T',
        picPosition: 'Kepala SPPG Wilayah Barat',
        picEmail: 'hendra.gunawan@bgn.go.id',
        picPhone: '+6281234567806',
        picWhatsapp: '+6281234567806',
        
        organizationType: 'PEMERINTAH' as OrganizationType,
        establishedYear: 2024,
        targetRecipients: 3000,
        maxRadius: 25.0, // Area coverage lebih luas
        maxTravelTime: 60,
        operationStartDate: new Date('2024-09-15'),
        operationEndDate: new Date('2026-06-30'),
        
        // Budget Information (Complete with allocation)
        monthlyBudget: 90000000,
        yearlyBudget: 1080000000,
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2024-09-01'),
        budgetEndDate: new Date('2025-08-31'),
        budgetAutoReset: true,
        budgetAlertThreshold: 85,
        budgetAllocation: {
          bahan_baku: 42,      // 42% untuk bahan baku
          operasional: 25,     // 25% untuk operasional multi-location
          sdm: 23,            // 23% untuk SDM
          transportasi: 8,     // 8% untuk transportasi area luas
          lainnya: 2          // 2% untuk kebutuhan lainnya
        },
        
        // Status & Demo Settings
        status: 'ACTIVE' as SppgStatus,
        isDemoAccount: false,
        demoAllowedFeatures: [],
        demoStartedAt: null,
        demoExpiresAt: null,
        demoMaxBeneficiaries: null,
        demoParentId: null,
      }
    }),

    // 8. 🎓 SPPG YAYASAN - Sekolah Khusus (ACTIVE, NON-DEMO)
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-007' },
      update: {},
      create: {
        code: 'SPPG-PWK-007',
        name: 'SPPG Sekolah Luar Biasa Harapan Mulia',
        description: 'SPPG khusus untuk Sekolah Luar Biasa dengan menu dan porsi yang disesuaikan dengan kebutuhan anak berkebutuhan khusus. Dilengkapi dengan ahli gizi dan terapis.',
        
        addressDetail: 'Jl. Pendidikan Khusus No. 88, Maniis',
        provinceId: regionalData.provinceId,
        regencyId: regionalData.regencyId,
        districtId: regionalData.districtId,
        villageId: regionalData.villageId,
        postalCode: '41151',
        coordinates: '-6.5600,107.4200',
        timezone: 'WIB',
        
        phone: '+622643456795',
        email: 'sppg@slbharapanmulia.sch.id',
        
        picName: 'Ibu Dr. Linda Permata, S.Gz, M.Gizi',
        picPosition: 'Kepala Bagian Gizi',
        picEmail: 'linda.permata@slbharapanmulia.sch.id',
        picPhone: '+6281234567807',
        picWhatsapp: '+6281234567807',
        
        organizationType: 'YAYASAN' as OrganizationType,
        establishedYear: 2025,
        targetRecipients: 250,
        maxRadius: 8.0,
        maxTravelTime: 25,
        operationStartDate: new Date('2025-02-01'),
        operationEndDate: new Date('2027-01-31'),
        
        // Budget Information (Complete with allocation for special needs)
        monthlyBudget: 40000000,
        yearlyBudget: 480000000,
        budgetCurrency: 'IDR',
        budgetStartDate: new Date('2025-02-01'),
        budgetEndDate: new Date('2026-01-31'),
        budgetAutoReset: true,
        budgetAlertThreshold: 80,
        budgetAllocation: {
          bahan_baku: 48,      // 48% untuk bahan baku khusus
          operasional: 22,     // 22% untuk operasional specialized
          sdm: 25,            // 25% untuk SDM terapis & ahli gizi
          transportasi: 3,     // 3% untuk transportasi area kecil
          lainnya: 2          // 2% untuk kebutuhan khusus lainnya
        },
        
        // Status & Demo Settings
        status: 'ACTIVE' as SppgStatus,
        isDemoAccount: false,
        demoAllowedFeatures: [],
        demoStartedAt: null,
        demoExpiresAt: null,
        demoMaxBeneficiaries: null,
        demoParentId: null,
      }
    }),
  ])

  console.log(`  ✓ Created ${sppgs.length} comprehensive SPPG entities`)
  console.log(`    - ACTIVE: ${sppgs.filter(s => s.status === 'ACTIVE').length}`)
  console.log(`    - PENDING_APPROVAL: ${sppgs.filter(s => s.status === 'PENDING_APPROVAL').length}`)
  console.log(`    - SUSPENDED: ${sppgs.filter(s => s.status === 'SUSPENDED').length}`)
  console.log(`    - DEMO: ${sppgs.filter(s => s.isDemoAccount).length}`)
  console.log(`    - Organization Types:`)
  console.log(`      • PEMERINTAH: ${sppgs.filter(s => s.organizationType === 'PEMERINTAH').length}`)
  console.log(`      • SWASTA: ${sppgs.filter(s => s.organizationType === 'SWASTA').length}`)
  console.log(`      • YAYASAN: ${sppgs.filter(s => s.organizationType === 'YAYASAN').length}`)
  console.log(`      • KOMUNITAS: ${sppgs.filter(s => s.organizationType === 'KOMUNITAS').length}`)
  console.log(`      • LAINNYA: ${sppgs.filter(s => s.organizationType === 'LAINNYA').length}`)
  
  return sppgs
}