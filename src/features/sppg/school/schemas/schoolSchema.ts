/**
 * @fileoverview School Master Zod Schema - COMPREHENSIVE (82 fields)
 * @version Next.js 15.5.4 / Zod / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/SCHOOL_BENEFICIARY_COMPREHENSIVE_IMPROVEMENTS.md}
 */

import { z } from 'zod'
import { BeneficiaryType, SchoolType, SchoolStatus, SchoolServingMethod } from '@prisma/client'

/**
 * School master creation/edit schema - COMPREHENSIVE
 * Maps to SchoolBeneficiary database model with all 82 fields
 */
export const schoolMasterSchema = z.object({
  // === CORE & PROGRAM ===
  programId: z.string().cuid('Program ID harus valid'),

  // === BASIC INFORMATION ===
  schoolName: z.string().min(3, 'Nama sekolah minimal 3 karakter').max(255),
  schoolCode: z.string().max(50).optional().nullable(),
  
  // === IDENTIFICATION ===
  npsn: z.string().max(20).optional().nullable(),
  dapodikId: z.string().max(50).optional().nullable(),
  kemendikbudId: z.string().max(50).optional().nullable(),
  accreditationGrade: z.enum(['A', 'B', 'C']).optional().nullable(),
  accreditationYear: z.number().int().min(2000).max(2100).optional().nullable(),

  // === SCHOOL CLASSIFICATION ===
  schoolType: z.nativeEnum(SchoolType),
  schoolStatus: z.nativeEnum(SchoolStatus),

  // === CONTACT INFORMATION ===
  principalName: z.string().min(3, 'Nama kepala sekolah minimal 3 karakter').max(255),
  principalNip: z.string().max(30).optional().nullable(),
  contactPhone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(20),
  contactEmail: z.string().email('Email tidak valid').max(255).optional().nullable(),
  alternatePhone: z.string().max(20).optional().nullable(),
  whatsappNumber: z.string().max(20).optional().nullable(),

  // === ADDRESS & LOCATION ===
  schoolAddress: z.string().min(10, 'Alamat sekolah minimal 10 karakter'),
  postalCode: z.string().max(10).optional().nullable(),
  coordinates: z.string().max(50).optional().nullable(),
  urbanRural: z.enum(['URBAN', 'RURAL']).optional().nullable(),

  // === REGIONAL HIERARCHY ===
  villageId: z.string().cuid('Village ID harus valid'),
  districtId: z.string().cuid('District ID harus valid'),
  regencyId: z.string().cuid('Regency ID harus valid'),
  provinceId: z.string().cuid('Province ID harus valid'),

  // === STUDENT DEMOGRAPHICS ===
  totalStudents: z.number().int().min(0, 'Jumlah siswa tidak boleh negatif'),
  targetStudents: z.number().int().min(0, 'Target siswa tidak boleh negatif'),
  activeStudents: z.number().int().min(0, 'Siswa aktif tidak boleh negatif').default(0),
  maleStudents: z.number().int().min(0).optional().nullable(),
  femaleStudents: z.number().int().min(0).optional().nullable(),
  students4to6Years: z.number().int().min(0).default(0),
  students7to12Years: z.number().int().min(0).default(0),
  students13to15Years: z.number().int().min(0).default(0),
  students16to18Years: z.number().int().min(0).default(0),

  // === FEEDING OPERATIONS ===
  feedingDays: z.array(z.number().int().min(1).max(7)),
  mealsPerDay: z.number().int().min(1).max(5).default(1),
  feedingTime: z.string().max(50).optional().nullable(),
  breakfastTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu HH:MM').optional().nullable(),
  lunchTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu HH:MM').optional().nullable(),
  snackTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu HH:MM').optional().nullable(),
  servingMethod: z.nativeEnum(SchoolServingMethod).default('CAFETERIA'),

  // === DELIVERY & LOGISTICS ===
  deliveryAddress: z.string().min(10, 'Alamat pengiriman minimal 10 karakter'),
  deliveryContact: z.string().min(3, 'Kontak pengiriman wajib diisi').max(255),
  deliveryPhone: z.string().max(20).optional().nullable(),
  deliveryInstructions: z.string().optional().nullable(),
  preferredDeliveryTime: z.string().max(50).optional().nullable(),
  distanceFromSppg: z.number().min(0, 'Jarak tidak boleh negatif').max(1000).optional().nullable(),
  estimatedTravelTime: z.number().int().min(0, 'Waktu tempuh tidak boleh negatif').max(600).optional().nullable(),
  accessRoadCondition: z.enum(['BAIK', 'SEDANG', 'BURUK']).optional().nullable(),

  // === BUDGET & CONTRACTS ===
  contractNumber: z.string().max(100).optional().nullable(),
  contractStartDate: z.coerce.date().optional().nullable(),
  contractEndDate: z.coerce.date().optional().nullable(),
  contractValue: z.number().min(0, 'Nilai kontrak tidak boleh negatif').optional().nullable(),
  monthlyBudgetAllocation: z.number().min(0, 'Alokasi bulanan tidak boleh negatif').optional().nullable(),
  budgetPerStudent: z.number().min(0, 'Budget per siswa tidak boleh negatif').optional().nullable(),

  // === PERFORMANCE METRICS ===
  attendanceRate: z.number().min(0).max(100, 'Tingkat kehadiran maksimal 100%').optional().nullable(),
  participationRate: z.number().min(0).max(100, 'Tingkat partisipasi maksimal 100%').optional().nullable(),
  satisfactionScore: z.number().min(0).max(5, 'Skor kepuasan maksimal 5').optional().nullable(),
  lastDistributionDate: z.coerce.date().optional().nullable(),
  lastReportDate: z.coerce.date().optional().nullable(),
  totalDistributions: z.number().int().min(0).default(0),
  totalMealsServed: z.number().int().min(0).default(0),

  // === FACILITIES ===
  hasKitchen: z.boolean().default(false),
  hasStorage: z.boolean().default(false),
  storageCapacity: z.string().max(100).optional().nullable(),
  hasCleanWater: z.boolean().default(true),
  hasElectricity: z.boolean().default(true),
  hasRefrigerator: z.boolean().default(false),
  hasDiningArea: z.boolean().default(false),
  diningCapacity: z.number().int().min(0).optional().nullable(),
  hasHandwashing: z.boolean().default(true),

  // === STATUS & LIFECYCLE ===
  enrollmentDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  suspendedAt: z.coerce.date().optional().nullable(),
  suspensionReason: z.string().optional().nullable(),
  reactivationDate: z.coerce.date().optional().nullable(),

  // === DIETARY & CULTURAL ===
  beneficiaryType: z.nativeEnum(BeneficiaryType).default('CHILD'),
  specialDietary: z.array(z.string()).default([]),
  allergyAlerts: z.array(z.string()).default([]),
  culturalReqs: z.array(z.string()).default([]),
  religiousReqs: z.array(z.string()).default([]),

  // === INTEGRATION & SYNC ===
  externalSystemId: z.string().max(100).optional().nullable(),
  syncedAt: z.coerce.date().optional().nullable(),

  // === NOTES & DOCUMENTATION ===
  notes: z.string().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
  documents: z.any().optional().nullable(), // JSON field
})
.refine((data) => {
  // Validation 1: Gender breakdown must equal totalStudents if provided
  if (data.maleStudents !== null && data.maleStudents !== undefined && 
      data.femaleStudents !== null && data.femaleStudents !== undefined) {
    const genderSum = data.maleStudents + data.femaleStudents
    return genderSum === data.totalStudents
  }
  return true
}, {
  message: 'Jumlah siswa laki-laki + perempuan harus sama dengan total siswa',
  path: ['totalStudents']
})
.refine((data) => {
  // Validation 2: Age breakdown sum must equal totalStudents
  const ageSum = 
    data.students4to6Years +
    data.students7to12Years +
    data.students13to15Years +
    data.students16to18Years
  
  return ageSum === data.totalStudents
}, {
  message: 'Jumlah siswa per kelompok usia harus sama dengan total siswa',
  path: ['totalStudents']
})
.refine((data) => {
  // Validation 3: If totalStudents > 0, activeStudents must be > 0
  if (data.totalStudents > 0) {
    return data.activeStudents > 0
  }
  return true
}, {
  message: 'Siswa aktif harus lebih dari 0 jika ada total siswa',
  path: ['activeStudents']
})
.refine((data) => {
  // Validation 4: Contract end date must be after start date
  if (data.contractStartDate && data.contractEndDate) {
    return data.contractEndDate > data.contractStartDate
  }
  return true
}, {
  message: 'Tanggal akhir kontrak harus setelah tanggal mulai',
  path: ['contractEndDate']
})
.refine((data) => {
  // Validation 5: Budget per student should be reasonable (Rp 1,000 - Rp 100,000)
  if (data.budgetPerStudent !== null && data.budgetPerStudent !== undefined) {
    return data.budgetPerStudent >= 1000 && data.budgetPerStudent <= 100000
  }
  return true
}, {
  message: 'Budget per siswa harus antara Rp 1,000 - Rp 100,000',
  path: ['budgetPerStudent']
})
.refine((data) => {
  // Validation 6: Distance from SPPG should be reasonable (0-1000 KM)
  if (data.distanceFromSppg !== null && data.distanceFromSppg !== undefined) {
    return data.distanceFromSppg >= 0 && data.distanceFromSppg <= 1000
  }
  return true
}, {
  message: 'Jarak dari SPPG harus antara 0-1000 KM',
  path: ['distanceFromSppg']
})

/**
 * School master update schema (all fields optional)
 */
export const updateSchoolMasterSchema = schoolMasterSchema.partial()

/**
 * TypeScript types inferred from schemas
 */
export type SchoolMasterInput = z.infer<typeof schoolMasterSchema>
export type UpdateSchoolMasterInput = z.infer<typeof updateSchoolMasterSchema>

/**
 * School master filter schema for queries - COMPREHENSIVE
 */
export const schoolMasterFilterSchema = z.object({
  // Core filters
  sppgId: z.string().optional(),
  programId: z.string().optional(),
  schoolType: z.nativeEnum(SchoolType).optional(),
  schoolStatus: z.nativeEnum(SchoolStatus).optional(),
  isActive: z.boolean().optional(),
  
  // Regional filters
  provinceId: z.string().optional(),
  regencyId: z.string().optional(),
  districtId: z.string().optional(),
  villageId: z.string().optional(),
  urbanRural: z.enum(['URBAN', 'RURAL']).optional(),
  
  // Student range filters
  minStudents: z.number().int().min(0).optional(),
  maxStudents: z.number().int().min(0).optional(),
  
  // Contract filters
  hasContract: z.boolean().optional(),
  contractExpiring: z.boolean().optional(), // Contract expiring in 30 days
  contractStatus: z.enum(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'NO_CONTRACT']).optional(),
  
  // Performance filters
  minAttendanceRate: z.number().min(0).max(100).optional(),
  minSatisfactionScore: z.number().min(0).max(5).optional(),
  
  // Facilities filters
  hasKitchen: z.boolean().optional(),
  hasRefrigerator: z.boolean().optional(),
  hasDiningArea: z.boolean().optional(),
  
  // Search
  search: z.string().optional(), // Search by name, code, NPSN, or principal
  
  // Pagination
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  
  // Sorting
  sortBy: z.enum([
    'schoolName',
    'totalStudents',
    'attendanceRate',
    'satisfactionScore',
    'contractEndDate',
    'lastDistributionDate',
    'createdAt'
  ]).default('schoolName').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
})

export type SchoolMasterFilter = z.infer<typeof schoolMasterFilterSchema>

/**
 * School import schema (for bulk import from Excel/CSV)
 */
export const schoolImportSchema = z.object({
  // Required fields
  schoolName: z.string().min(3),
  schoolType: z.nativeEnum(SchoolType),
  schoolStatus: z.nativeEnum(SchoolStatus),
  principalName: z.string().min(3),
  contactPhone: z.string().min(10),
  schoolAddress: z.string().min(10),
  totalStudents: z.number().int().min(0),
  targetStudents: z.number().int().min(0),
  feedingDays: z.array(z.number().int().min(1).max(7)),
  deliveryAddress: z.string().min(10),
  deliveryContact: z.string().min(3),
  
  // Optional fields
  schoolCode: z.string().optional(),
  npsn: z.string().optional(),
  contactEmail: z.string().email().optional(),
  coordinates: z.string().optional(),
  contractNumber: z.string().optional(),
  budgetPerStudent: z.number().min(0).optional(),
})

export type SchoolImportInput = z.infer<typeof schoolImportSchema>
