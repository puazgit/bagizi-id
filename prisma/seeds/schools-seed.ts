/**
 * @fileoverview School Beneficiary seeding untuk SPPG Purwakarta
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { PrismaClient, SchoolBeneficiary } from '@prisma/client'

export async function seedSchools(
  prisma: PrismaClient,
  sppg: { id: string; name: string }[],
  programs: { id: string; name: string; sppgId: string }[],
  nagriTengahVillageId: string
): Promise<SchoolBeneficiary[]> {
  console.log('  → Creating school beneficiaries...')

  // Get SPPG Purwakarta
  const purwakartaSppg = sppg.find(s => s.name.includes('Purwakarta'))
  if (!purwakartaSppg) {
    throw new Error('SPPG Purwakarta not found')
  }

  // Get programs for Purwakarta SPPG
  const purwakartaPrograms = programs.filter(p => p.sppgId === purwakartaSppg.id)
  if (purwakartaPrograms.length === 0) {
    throw new Error('No programs found for SPPG Purwakarta')
  }

  // Use first program for schools
  const mainProgram = purwakartaPrograms[0]

  const schools = await Promise.all([
    // SD Negeri di Purwakarta
    prisma.schoolBeneficiary.upsert({
      where: { id: 'school-sdn-nagri-tengah-01' },
      update: {},
      create: {
        id: 'school-sdn-nagri-tengah-01',
        schoolCode: '20230101',
        schoolName: 'SD Negeri Nagri Tengah 01',
        schoolType: 'SD_NEGERI',
        schoolStatus: 'ACTIVE',
        targetStudents: 240,
        totalStudents: 235,
        
        // Program relation
        programId: mainProgram.id,
        
        // Contact Information
        principalName: 'Dra. Siti Aminah, M.Pd',
        contactPhone: '0264-201001',
        contactEmail: 'sdnagritengah01@purwakarta.sch.id',
        
        // Address - need villageId from schema
        schoolAddress: 'Jl. Raya Nagri Tengah No. 25',
        villageId: nagriTengahVillageId, // Use passed villageId
        deliveryAddress: 'Jl. Raya Nagri Tengah No. 25, Desa Nagri Tengah, Kec. Purwakarta',
        deliveryContact: 'Bapak Joko Santoso (Kepala Tata Usaha)',
        deliveryInstructions: 'Masuk melalui gerbang utama, langsung ke kantin sekolah. Pengiriman jam 09:00-10:00',
        coordinates: '-6.5550,107.4340',
        
        // Facilities
        hasKitchen: true,
        hasStorage: true,
        storageCapacity: '50 kg beras + 30 kg sayuran', // String field
        
        // Additional required fields from schema
        feedingDays: [1, 2, 3, 4, 5], // Monday to Friday
        feedingTime: '10:00',
        beneficiaryType: 'CHILD',
        specialDietary: ['Bebas MSG', 'Bebas pewarna buatan'],
        allergyAlerts: [],
        culturalReqs: [],
      }
    }),

    prisma.schoolBeneficiary.upsert({
      where: { id: 'school-sdn-nagri-tengah-02' },
      update: {},
      create: {
        id: 'school-sdn-nagri-tengah-02',
        schoolCode: '20230102',
        schoolName: 'SD Negeri Nagri Tengah 02',
        schoolType: 'SD_NEGERI',
        schoolStatus: 'ACTIVE',
        targetStudents: 180,
        totalStudents: 176,
        
        programId: mainProgram.id,
        
        principalName: 'H. Ahmad Sutrisno, S.Pd, M.Pd',
        contactPhone: '0264-201002',
        contactEmail: 'sdnagritengah02@purwakarta.sch.id',
        
        schoolAddress: 'Jl. Pendidikan No. 12',
        villageId: nagriTengahVillageId,
        deliveryAddress: 'Jl. Pendidikan No. 12, Desa Nagri Tengah, Kec. Purwakarta',
        deliveryContact: 'Ibu Ratna Sari (Guru Piket)',
        deliveryInstructions: 'Koordinasi dengan guru piket, parkir di halaman belakang',
        coordinates: '-6.5555,107.4345',
        
        hasKitchen: true,
        hasStorage: false,
        storageCapacity: '30 kg beras',
        
        feedingDays: [1, 2, 3, 4, 5],
        feedingTime: '09:30',
        beneficiaryType: 'CHILD',
        specialDietary: ['Hindari kacang-kacangan'],
        allergyAlerts: ['Kacang tanah'],
        culturalReqs: [],
      }
    }),

    prisma.schoolBeneficiary.upsert({
      where: { id: 'school-smp-purwakarta-1' },
      update: {},
      create: {
        id: 'school-smp-purwakarta-1',
        schoolCode: '20240201',
        schoolName: 'SMP Negeri 1 Purwakarta',
        schoolType: 'SMP_NEGERI',
        schoolStatus: 'ACTIVE',
        targetStudents: 420,
        totalStudents: 415,
        
        programId: mainProgram.id,
        
        principalName: 'Dr. Budi Prasetyo, M.Pd',
        contactPhone: '0264-202001',
        contactEmail: 'smpn1purwakarta@purwakarta.sch.id',
        
        schoolAddress: 'Jl. Veteran No. 45',
        villageId: nagriTengahVillageId,
        deliveryAddress: 'Jl. Veteran No. 45, Nagri Kidul, Kec. Purwakarta',
        deliveryContact: 'Bapak Darmawan (Koordinator Kantin)',
        deliveryInstructions: 'Masuk dari gerbang samping, koordinasi dengan satpam. Pengiriman jam 08:30-09:30',
        coordinates: '-6.5560,107.4350',
        
        hasKitchen: true,
        hasStorage: true,
        storageCapacity: '100 kg beras + storage room',
        
        feedingDays: [1, 2, 3, 4, 5, 6],
        feedingTime: '10:30',
        beneficiaryType: 'CHILD',
        specialDietary: ['Porsi lebih besar untuk remaja'],
        allergyAlerts: [],
        culturalReqs: [],
      }
    })
  ])

  console.log(`  ✓ Created ${schools.length} school beneficiaries:`)
  console.log(`    - ${schools.filter(s => s.schoolStatus === 'ACTIVE').length} ACTIVE schools`)
  console.log(`    - ${schools.filter(s => s.schoolStatus === 'PENDING').length} PENDING schools`) 
  console.log(`    - Total students: ${schools.reduce((sum, s) => sum + s.totalStudents, 0)}`)

  return schools
}