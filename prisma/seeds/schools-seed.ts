/**
 * @fileoverview School Beneficiary seeding untuk SPPG Purwakarta
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @updated October 23, 2025 - Comprehensive improvements with new fields
 */

import { PrismaClient, SchoolBeneficiary } from '@prisma/client'

/**
 * Seed school beneficiaries with comprehensive data
 * @param prisma - Prisma client instance
 * @param sppg - Array of SPPG entities
 * @param programs - Array of nutrition programs
 * @param regionalData - Regional IDs (province, regency, district, village)
 */
export async function seedSchools(
  prisma: PrismaClient,
  sppg: { id: string; name: string }[],
  programs: { id: string; name: string; sppgId: string }[],
  regionalData: {
    villageId: string
    districtId: string
    regencyId: string
    provinceId: string
  }
): Promise<SchoolBeneficiary[]> {
  console.log('  → Creating school beneficiaries with comprehensive data...')

  // Get Demo SPPG (consolidated seed strategy)
  const demoSppg = sppg.find(s => s.name.includes('Demo'))
  if (!demoSppg) {
    console.log('  ⚠️  Demo SPPG not found, skipping schools seed')
    return []
  }

  // Get programs for Demo SPPG
  const demoPrograms = programs.filter(p => p.sppgId === demoSppg.id)
  if (demoPrograms.length === 0) {
    console.log('  ⚠️  No programs found for Demo SPPG, skipping schools seed')
    return []
  }

  // Use first program for schools
  const mainProgram = demoPrograms[0]

  const schools = await Promise.all([
    // ========================================
    // SCHOOL 1: SD Negeri Nagri Tengah 01
    // ========================================
    prisma.schoolBeneficiary.upsert({
      where: { id: 'school-sdn-nagri-tengah-01' },
      update: {},
      create: {
        id: 'school-sdn-nagri-tengah-01',
        
        // ✅ CRITICAL: Multi-tenancy & Program
        sppgId: demoSppg.id,
        programId: mainProgram.id,
        
        // Basic Information
        schoolCode: 'SDK-PWK-001',
        schoolName: 'SD Negeri Nagri Tengah 01',
        npsn: '20230101', // National School ID
        schoolType: 'SD', // Enum: SD
        schoolStatus: 'NEGERI', // Enum: Public school
        accreditationGrade: 'A',
        accreditationYear: 2023,
        
        // Principal & Contact
        principalName: 'Dra. Siti Aminah, M.Pd',
        principalNip: '196705121990032001',
        contactPhone: '0264-201001',
        contactEmail: 'sdnagritengah01@purwakarta.sch.id',
        alternatePhone: '081234567801',
        whatsappNumber: '081234567801',
        
        // ✅ Complete Regional Hierarchy
        schoolAddress: 'Jl. Raya Nagri Tengah No. 25',
        villageId: regionalData.villageId,
        districtId: regionalData.districtId,
        regencyId: regionalData.regencyId,
        provinceId: regionalData.provinceId,
        postalCode: '41151',
        coordinates: '-6.5550,107.4340',
        urbanRural: 'URBAN',
        
        // Student Demographics
        totalStudents: 240,
        targetStudents: 240,
        activeStudents: 235,
        students4to6Years: 0,
        students7to12Years: 240,
        students13to15Years: 0,
        students16to18Years: 0,
        maleStudents: 125,
        femaleStudents: 115,
        
        // Feeding Configuration
        feedingDays: [1, 2, 3, 4, 5], // Monday to Friday
        mealsPerDay: 1,
        feedingTime: '10:00',
        breakfastTime: null,
        lunchTime: '10:00',
        snackTime: null,
        
        // Delivery & Logistics
        deliveryAddress: 'Jl. Raya Nagri Tengah No. 25, Desa Nagri Tengah, Kec. Purwakarta',
        deliveryContact: 'Bapak Joko Santoso (Kepala Tata Usaha)',
        deliveryPhone: '081234567802',
        deliveryInstructions: 'Masuk melalui gerbang utama, langsung ke kantin sekolah. Pengiriman jam 09:00-10:00',
        preferredDeliveryTime: '09:00-10:00',
        accessRoadCondition: 'GOOD',
        distanceFromSppg: 3.5, // 3.5 KM
        estimatedTravelTime: 15, // 15 minutes
        
        // Facilities & Infrastructure
        storageCapacity: '50 kg beras + 30 kg sayuran',
        servingMethod: 'CAFETERIA', // Enum
        hasKitchen: true,
        hasStorage: true,
        hasRefrigerator: true,
        hasCleanWater: true,
        hasElectricity: true,
        hasHandwashing: true,
        hasDiningArea: true,
        diningCapacity: 80, // Can serve 80 students at once
        
        // Budget & Financial
        monthlyBudgetAllocation: 24000000, // Rp 24 juta/bulan
        budgetPerStudent: 100000, // Rp 100k per student
        contractStartDate: new Date('2025-01-01'),
        contractEndDate: new Date('2025-12-31'),
        contractValue: 288000000, // Rp 288 juta/tahun
        contractNumber: 'CONT-SDK-PWK-001-2025',
        
        // Performance Metrics
        attendanceRate: 98.5, // 98.5% attendance
        participationRate: 97.0, // 97% participation
        satisfactionScore: 4.7, // 4.7 out of 5
        lastDistributionDate: new Date('2025-10-22'),
        lastReportDate: new Date('2025-10-20'),
        totalDistributions: 185,
        totalMealsServed: 44400, // 185 days x 240 students
        
        // Status & Enrollment
        enrollmentDate: new Date('2025-01-01'),
        isActive: true,
        suspendedAt: null,
        suspensionReason: null,
        reactivationDate: null,
        
        // Special Requirements
        beneficiaryType: 'CHILD',
        specialDietary: ['Bebas MSG', 'Bebas pewarna buatan', 'Porsi sayur lebih banyak'],
        allergyAlerts: [],
        culturalReqs: ['Halal'],
        religiousReqs: ['Halal', 'Tidak mengandung babi'],
        
        // Integration & External Systems
        dapodikId: 'DAPODIK-20230101',
        kemendikbudId: 'KEMDIKBUD-SDK-PWK-001',
        externalSystemId: null,
        syncedAt: new Date('2025-10-22'),
        
        // Notes & Documentation
        notes: 'Sekolah dengan fasilitas lengkap, akreditasi A, kepala sekolah sangat kooperatif',
        specialInstructions: 'Koordinasi dengan Bu Siti untuk perubahan menu atau jadwal',
        documents: {
          contract: 'contracts/SDK-PWK-001-2025.pdf',
          accreditation: 'accreditation/SDK-PWK-001-A-2023.pdf',
          photos: ['schools/SDK-PWK-001-front.jpg', 'schools/SDK-PWK-001-kitchen.jpg']
        },
        
        // Audit Trail
        createdBy: 'system-seed',
        updatedBy: 'system-seed',
      }
    }),

    // ========================================
    // SCHOOL 2: SD Negeri Nagri Tengah 02
    // ========================================
    prisma.schoolBeneficiary.upsert({
      where: { id: 'school-sdn-nagri-tengah-02' },
      update: {},
      create: {
        id: 'school-sdn-nagri-tengah-02',
        
        sppgId: demoSppg.id,
        programId: mainProgram.id,
        
        schoolCode: 'SDK-PWK-002',
        schoolName: 'SD Negeri Nagri Tengah 02',
        npsn: '20230102',
        schoolType: 'SD',
        schoolStatus: 'NEGERI',
        accreditationGrade: 'B',
        accreditationYear: 2022,
        
        principalName: 'H. Ahmad Sutrisno, S.Pd, M.Pd',
        principalNip: '197203151995121001',
        contactPhone: '0264-201002',
        contactEmail: 'sdnagritengah02@purwakarta.sch.id',
        alternatePhone: '081234567803',
        whatsappNumber: '081234567803',
        
        schoolAddress: 'Jl. Pendidikan No. 12',
        villageId: regionalData.villageId,
        districtId: regionalData.districtId,
        regencyId: regionalData.regencyId,
        provinceId: regionalData.provinceId,
        postalCode: '41151',
        coordinates: '-6.5555,107.4345',
        urbanRural: 'URBAN',
        
        totalStudents: 180,
        targetStudents: 180,
        activeStudents: 176,
        students4to6Years: 0,
        students7to12Years: 180,
        students13to15Years: 0,
        students16to18Years: 0,
        maleStudents: 92,
        femaleStudents: 88,
        
        feedingDays: [1, 2, 3, 4, 5],
        mealsPerDay: 1,
        feedingTime: '09:30',
        breakfastTime: null,
        lunchTime: '09:30',
        snackTime: null,
        
        deliveryAddress: 'Jl. Pendidikan No. 12, Desa Nagri Tengah, Kec. Purwakarta',
        deliveryContact: 'Ibu Ratna Sari (Guru Piket)',
        deliveryPhone: '081234567804',
        deliveryInstructions: 'Koordinasi dengan guru piket, parkir di halaman belakang',
        preferredDeliveryTime: '08:30-09:30',
        accessRoadCondition: 'GOOD',
        distanceFromSppg: 4.2,
        estimatedTravelTime: 18,
        
        storageCapacity: '30 kg beras, storage terbatas',
        servingMethod: 'CLASSROOM', // Served in classroom
        hasKitchen: true,
        hasStorage: false, // No storage room
        hasRefrigerator: false,
        hasCleanWater: true,
        hasElectricity: true,
        hasHandwashing: true,
        hasDiningArea: false,
        diningCapacity: 0, // No dining area
        
        monthlyBudgetAllocation: 18000000,
        budgetPerStudent: 100000,
        contractStartDate: new Date('2025-01-01'),
        contractEndDate: new Date('2025-12-31'),
        contractValue: 216000000,
        contractNumber: 'CONT-SDK-PWK-002-2025',
        
        attendanceRate: 96.8,
        participationRate: 95.5,
        satisfactionScore: 4.5,
        lastDistributionDate: new Date('2025-10-22'),
        lastReportDate: new Date('2025-10-19'),
        totalDistributions: 185,
        totalMealsServed: 33300, // 185 days x 180 students
        
        enrollmentDate: new Date('2025-01-01'),
        isActive: true,
        suspendedAt: null,
        suspensionReason: null,
        reactivationDate: null,
        
        beneficiaryType: 'CHILD',
        specialDietary: ['Hindari kacang-kacangan'],
        allergyAlerts: ['Kacang tanah - 3 siswa'],
        culturalReqs: ['Halal'],
        religiousReqs: ['Halal'],
        
        dapodikId: 'DAPODIK-20230102',
        kemendikbudId: 'KEMDIKBUD-SDK-PWK-002',
        externalSystemId: null,
        syncedAt: new Date('2025-10-22'),
        
        notes: 'Sekolah dengan keterbatasan fasilitas storage, perlu perhatian khusus untuk alergi kacang',
        specialInstructions: 'PENTING: 3 siswa alergi kacang tanah, pastikan menu bebas kacang',
        documents: {
          contract: 'contracts/SDK-PWK-002-2025.pdf',
          accreditation: 'accreditation/SDK-PWK-002-B-2022.pdf'
        },
        
        createdBy: 'system-seed',
        updatedBy: 'system-seed',
      }
    }),

    // ========================================
    // SCHOOL 3: SMP Negeri 1 Purwakarta
    // ========================================
    prisma.schoolBeneficiary.upsert({
      where: { id: 'school-smp-purwakarta-1' },
      update: {},
      create: {
        id: 'school-smp-purwakarta-1',
        
        sppgId: demoSppg.id,
        programId: mainProgram.id,
        
        schoolCode: 'SMP-PWK-001',
        schoolName: 'SMP Negeri 1 Purwakarta',
        npsn: '20240201',
        schoolType: 'SMP',
        schoolStatus: 'TERAKREDITASI_A', // Accredited A
        accreditationGrade: 'A',
        accreditationYear: 2024,
        
        principalName: 'Dr. Budi Prasetyo, M.Pd',
        principalNip: '196812201993031001',
        contactPhone: '0264-202001',
        contactEmail: 'smpn1purwakarta@purwakarta.sch.id',
        alternatePhone: '081234567805',
        whatsappNumber: '081234567805',
        
        schoolAddress: 'Jl. Veteran No. 45',
        villageId: regionalData.villageId,
        districtId: regionalData.districtId,
        regencyId: regionalData.regencyId,
        provinceId: regionalData.provinceId,
        postalCode: '41151',
        coordinates: '-6.5560,107.4350',
        urbanRural: 'URBAN',
        
        totalStudents: 420,
        targetStudents: 420,
        activeStudents: 415,
        students4to6Years: 0,
        students7to12Years: 0,
        students13to15Years: 420, // Middle school age
        students16to18Years: 0,
        maleStudents: 210,
        femaleStudents: 210,
        
        feedingDays: [1, 2, 3, 4, 5, 6], // Include Saturday
        mealsPerDay: 1,
        feedingTime: '10:30',
        breakfastTime: null,
        lunchTime: '10:30',
        snackTime: null,
        
        deliveryAddress: 'Jl. Veteran No. 45, Nagri Kidul, Kec. Purwakarta',
        deliveryContact: 'Bapak Darmawan (Koordinator Kantin)',
        deliveryPhone: '081234567806',
        deliveryInstructions: 'Masuk dari gerbang samping, koordinasi dengan satpam. Pengiriman jam 08:30-09:30',
        preferredDeliveryTime: '08:30-09:30',
        accessRoadCondition: 'GOOD',
        distanceFromSppg: 2.8,
        estimatedTravelTime: 12,
        
        storageCapacity: '100 kg beras + dedicated storage room',
        servingMethod: 'CAFETERIA',
        hasKitchen: true,
        hasStorage: true,
        hasRefrigerator: true,
        hasCleanWater: true,
        hasElectricity: true,
        hasHandwashing: true,
        hasDiningArea: true,
        diningCapacity: 150,
        
        monthlyBudgetAllocation: 50400000, // Higher for middle school
        budgetPerStudent: 120000, // Larger portions for teens
        contractStartDate: new Date('2025-01-01'),
        contractEndDate: new Date('2025-12-31'),
        contractValue: 604800000,
        contractNumber: 'CONT-SMP-PWK-001-2025',
        
        attendanceRate: 97.2,
        participationRate: 96.0,
        satisfactionScore: 4.8,
        lastDistributionDate: new Date('2025-10-22'),
        lastReportDate: new Date('2025-10-21'),
        totalDistributions: 220, // Include Saturdays
        totalMealsServed: 92400, // 220 days x 420 students
        
        enrollmentDate: new Date('2025-01-01'),
        isActive: true,
        suspendedAt: null,
        suspensionReason: null,
        reactivationDate: null,
        
        beneficiaryType: 'CHILD',
        specialDietary: ['Porsi lebih besar untuk remaja', 'Protein tinggi'],
        allergyAlerts: [],
        culturalReqs: ['Halal'],
        religiousReqs: ['Halal', 'Tidak mengandung babi'],
        
        dapodikId: 'DAPODIK-20240201',
        kemendikbudId: 'KEMDIKBUD-SMP-PWK-001',
        externalSystemId: 'SISFO-SMP-001',
        syncedAt: new Date('2025-10-22'),
        
        notes: 'Sekolah favorit dengan fasilitas excellent, pengelolaan kantin sangat baik, tingkat kepuasan tinggi',
        specialInstructions: 'Porsi untuk remaja harus lebih besar, fokus pada protein dan karbohidrat kompleks',
        documents: {
          contract: 'contracts/SMP-PWK-001-2025.pdf',
          accreditation: 'accreditation/SMP-PWK-001-A-2024.pdf',
          photos: [
            'schools/SMP-PWK-001-front.jpg', 
            'schools/SMP-PWK-001-cafeteria.jpg',
            'schools/SMP-PWK-001-kitchen.jpg'
          ]
        },
        
        createdBy: 'system-seed',
        updatedBy: 'system-seed',
      }
    })
  ])

  console.log(`  ✓ Created ${schools.length} school beneficiaries with comprehensive data:`)
  console.log(`    - ${schools.filter(s => s.isActive).length} ACTIVE schools`)
  console.log(`    - Total students: ${schools.reduce((sum, s) => sum + s.totalStudents, 0)}`)
  console.log(`    - Total target students: ${schools.reduce((sum, s) => sum + s.targetStudents, 0)}`)
  console.log(`    - Average satisfaction score: ${(schools.reduce((sum, s) => sum + (s.satisfactionScore || 0), 0) / schools.length).toFixed(2)}`)
  console.log(`    - Total meals served: ${schools.reduce((sum, s) => sum + s.totalMealsServed, 0).toLocaleString()}`)

  return schools
}