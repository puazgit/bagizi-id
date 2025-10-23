/**
 * @fileoverview School Master TypeScript Types - Comprehensive (82 fields)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/SCHOOL_BENEFICIARY_COMPREHENSIVE_IMPROVEMENTS.md}
 */

import { 
  BeneficiaryType, 
  SchoolType, 
  SchoolStatus, 
  SchoolServingMethod,
  Prisma
} from '@prisma/client'

/**
 * School master data structure (from database) - COMPREHENSIVE 82 FIELDS
 * Includes all improvements from comprehensive schema update
 */
export interface SchoolMaster {
  // === CORE IDENTIFICATION (4 fields) ===
  id: string
  programId: string
  schoolName: string
  schoolCode: string | null
  
  // === CRITICAL MULTI-TENANCY (1 field) ===
  sppgId: string
  
  // === ADVANCED IDENTIFICATION (6 fields) ===
  npsn: string | null
  dapodikId: string | null
  kemendikbudId: string | null
  accreditationGrade: string | null
  accreditationYear: number | null
  principalNip: string | null
  
  // === SCHOOL CLASSIFICATION (2 fields) ===
  schoolType: SchoolType
  schoolStatus: SchoolStatus
  
  // === CONTACT INFORMATION (5 fields) ===
  principalName: string
  contactPhone: string
  contactEmail: string | null
  alternatePhone: string | null
  whatsappNumber: string | null
  
  // === ADDRESS & LOCATION (6 fields) ===
  schoolAddress: string
  postalCode: string | null
  coordinates: string | null
  urbanRural: string | null
  deliveryAddress: string
  deliveryInstructions: string | null
  
  // === REGIONAL HIERARCHY (4 fields) ===
  villageId: string
  districtId: string
  regencyId: string
  provinceId: string
  
  // === STUDENT DEMOGRAPHICS (10 fields) ===
  totalStudents: number
  targetStudents: number
  activeStudents: number
  maleStudents: number | null
  femaleStudents: number | null
  students4to6Years: number
  students7to12Years: number
  students13to15Years: number
  students16to18Years: number
  
  // === FEEDING OPERATIONS (8 fields) ===
  feedingDays: number[]
  mealsPerDay: number
  feedingTime: string | null
  breakfastTime: string | null
  lunchTime: string | null
  snackTime: string | null
  servingMethod: SchoolServingMethod
  deliveryContact: string
  deliveryPhone: string | null
  preferredDeliveryTime: string | null
  
  // === BUDGET & CONTRACTS (6 fields) ===
  contractNumber: string | null
  contractStartDate: Date | null
  contractEndDate: Date | null
  contractValue: number | null
  monthlyBudgetAllocation: number | null
  budgetPerStudent: number | null
  
  // === PERFORMANCE METRICS (7 fields) ===
  attendanceRate: number | null
  participationRate: number | null
  satisfactionScore: number | null
  lastDistributionDate: Date | null
  lastReportDate: Date | null
  totalDistributions: number
  totalMealsServed: number
  
  // === LOGISTICS & DELIVERY (3 fields) ===
  distanceFromSppg: number | null
  estimatedTravelTime: number | null
  accessRoadCondition: string | null
  
  // === BASIC FACILITIES (5 fields) ===
  hasKitchen: boolean
  hasStorage: boolean
  storageCapacity: string | null
  hasCleanWater: boolean
  hasElectricity: boolean
  
  // === ENHANCED FACILITIES (5 fields) ===
  hasRefrigerator: boolean
  hasDiningArea: boolean
  diningCapacity: number | null
  hasHandwashing: boolean
  
  // === STATUS & LIFECYCLE (5 fields) ===
  enrollmentDate: Date
  isActive: boolean
  suspendedAt: Date | null
  suspensionReason: string | null
  reactivationDate: Date | null
  
  // === DIETARY & CULTURAL (5 fields) ===
  beneficiaryType: BeneficiaryType
  specialDietary: string[]
  allergyAlerts: string[]
  culturalReqs: string[]
  religiousReqs: string[]
  
  // === INTEGRATION & SYNC (2 fields) ===
  externalSystemId: string | null
  syncedAt: Date | null
  
  // === NOTES & DOCUMENTATION (3 fields) ===
  notes: string | null
  specialInstructions: string | null
  documents: Prisma.JsonValue | null
  
  // === AUDIT TRAIL (4 fields) ===
  createdAt: Date
  updatedAt: Date
  createdBy: string | null
  updatedBy: string | null
}

/**
 * School master with relations - COMPREHENSIVE
 */
export interface SchoolMasterWithRelations extends SchoolMaster {
  sppg: {
    id: string
    sppgName: string
    sppgCode: string
  }
  program: {
    id: string
    name: string
  }
  province: {
    id: string
    name: string
  }
  regency: {
    id: string
    name: string
  }
  district: {
    id: string
    name: string
  }
  village: {
    id: string
    name: string
  }
}

/**
 * School statistics - COMPREHENSIVE
 */
export interface SchoolStatistics {
  totalSchools: number
  activeSchools: number
  suspendedSchools: number
  inactiveSchools: number
  totalStudents: number
  targetStudents: number
  activeStudents: number
  maleStudents: number
  femaleStudents: number
  averageAttendanceRate: number
  averageSatisfactionScore: number
  totalMealsServed: number
  totalDistributions: number
  byType: {
    type: SchoolType
    count: number
    students: number
  }[]
  byStatus: {
    status: SchoolStatus
    count: number
  }[]
  byProgram: {
    programId: string
    programName: string
    count: number
    students: number
  }[]
  byProvince: {
    provinceId: string
    provinceName: string
    count: number
    students: number
  }[]
  byRegency: {
    regencyId: string
    regencyName: string
    count: number
    students: number
  }[]
}

/**
 * School type options (Indonesia specific) - COMPREHENSIVE 12 TYPES
 */
export const SCHOOL_TYPES = [
  { value: 'SD', label: 'Sekolah Dasar (SD)' },
  { value: 'SMP', label: 'Sekolah Menengah Pertama (SMP)' },
  { value: 'SMA', label: 'Sekolah Menengah Atas (SMA)' },
  { value: 'SMK', label: 'Sekolah Menengah Kejuruan (SMK)' },
  { value: 'MI', label: 'Madrasah Ibtidaiyah (MI)' },
  { value: 'MTS', label: 'Madrasah Tsanawiyah (MTS)' },
  { value: 'MA', label: 'Madrasah Aliyah (MA)' },
  { value: 'PAUD', label: 'Pendidikan Anak Usia Dini (PAUD)' },
  { value: 'TK', label: 'Taman Kanak-Kanak (TK)' },
  { value: 'SLB', label: 'Sekolah Luar Biasa (SLB)' },
  { value: 'PONDOK_PESANTREN', label: 'Pondok Pesantren' },
  { value: 'LAINNYA', label: 'Lainnya' },
] as const

/**
 * School status options - COMPREHENSIVE 6 STATUSES
 */
export const SCHOOL_STATUSES = [
  { value: 'NEGERI', label: 'Negeri' },
  { value: 'SWASTA', label: 'Swasta' },
  { value: 'TERAKREDITASI_A', label: 'Terakreditasi A' },
  { value: 'TERAKREDITASI_B', label: 'Terakreditasi B' },
  { value: 'TERAKREDITASI_C', label: 'Terakreditasi C' },
  { value: 'BELUM_TERAKREDITASI', label: 'Belum Terakreditasi' },
] as const

/**
 * Serving method options - COMPREHENSIVE 5 METHODS
 */
export const SERVING_METHODS = [
  { value: 'CAFETERIA', label: 'Kantin/Cafeteria' },
  { value: 'CLASSROOM', label: 'Di Kelas' },
  { value: 'OUTDOOR', label: 'Area Terbuka' },
  { value: 'TAKEAWAY', label: 'Bawa Pulang' },
  { value: 'HYBRID', label: 'Kombinasi/Hybrid' },
] as const

/**
 * Days of week for feeding schedule
 */
export const FEEDING_DAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
  { value: 7, label: 'Minggu' },
] as const

/**
 * Road condition options (for logistics)
 */
export const ROAD_CONDITIONS = [
  { value: 'BAIK', label: 'Baik' },
  { value: 'SEDANG', label: 'Sedang' },
  { value: 'BURUK', label: 'Buruk' },
] as const

/**
 * Urban/Rural classification
 */
export const URBAN_RURAL = [
  { value: 'URBAN', label: 'Perkotaan (Urban)' },
  { value: 'RURAL', label: 'Pedesaan (Rural)' },
] as const

/**
 * Accreditation grades
 */
export const ACCREDITATION_GRADES = [
  { value: 'A', label: 'A (Sangat Baik)' },
  { value: 'B', label: 'B (Baik)' },
  { value: 'C', label: 'C (Cukup)' },
] as const

/**
 * School input data for creation
 */
export interface SchoolInput {
  // Core
  programId: string
  schoolName: string
  schoolCode?: string | null
  schoolType: SchoolType
  schoolStatus: SchoolStatus
  
  // Identification
  npsn?: string | null
  dapodikId?: string | null
  kemendikbudId?: string | null
  accreditationGrade?: string | null
  accreditationYear?: number | null
  
  // Contact
  principalName: string
  principalNip?: string | null
  contactPhone: string
  contactEmail?: string | null
  alternatePhone?: string | null
  whatsappNumber?: string | null
  
  // Address
  schoolAddress: string
  villageId: string
  districtId: string
  regencyId: string
  provinceId: string
  postalCode?: string | null
  coordinates?: string | null
  urbanRural?: string | null
  
  // Students
  totalStudents: number
  targetStudents: number
  maleStudents?: number | null
  femaleStudents?: number | null
  students4to6Years?: number
  students7to12Years?: number
  students13to15Years?: number
  students16to18Years?: number
  
  // Feeding
  feedingDays: number[]
  mealsPerDay?: number
  feedingTime?: string | null
  breakfastTime?: string | null
  lunchTime?: string | null
  snackTime?: string | null
  servingMethod?: SchoolServingMethod
  
  // Delivery
  deliveryAddress: string
  deliveryContact: string
  deliveryPhone?: string | null
  deliveryInstructions?: string | null
  preferredDeliveryTime?: string | null
  
  // Facilities
  hasKitchen?: boolean
  hasStorage?: boolean
  storageCapacity?: string | null
  hasCleanWater?: boolean
  hasElectricity?: boolean
  hasRefrigerator?: boolean
  hasDiningArea?: boolean
  diningCapacity?: number | null
  hasHandwashing?: boolean
  
  // Budget
  contractNumber?: string | null
  contractStartDate?: Date | null
  contractEndDate?: Date | null
  contractValue?: number | null
  monthlyBudgetAllocation?: number | null
  budgetPerStudent?: number | null
  
  // Logistics
  distanceFromSppg?: number | null
  estimatedTravelTime?: number | null
  accessRoadCondition?: string | null
  
  // Dietary
  beneficiaryType?: BeneficiaryType
  specialDietary?: string[]
  allergyAlerts?: string[]
  culturalReqs?: string[]
  religiousReqs?: string[]
  
  // Notes
  notes?: string | null
  specialInstructions?: string | null
}

/**
 * School update data (partial)
 */
export type SchoolUpdate = Partial<SchoolInput>

/**
 * School filter options
 */
/**
 * School filter parameters - COMPREHENSIVE (26 options)
 */
export interface SchoolFilter {
  // Mode selection
  mode?: 'autocomplete' | 'full' | 'standard'
  
  // Program & Status
  sppgId?: string
  programId?: string
  isActive?: boolean
  
  // School Classification
  schoolType?: SchoolType
  schoolStatus?: SchoolStatus
  
  // Regional Filters (Hierarchical)
  provinceId?: string
  regencyId?: string
  districtId?: string
  villageId?: string
  urbanRural?: 'URBAN' | 'RURAL'
  
  // Student Range
  minStudents?: number
  maxStudents?: number
  
  // Contract Filters
  hasContract?: boolean
  contractExpiring?: boolean
  
  // Performance Filters
  minAttendanceRate?: number
  minSatisfactionScore?: number
  
  // Facility Filters
  hasKitchen?: boolean
  hasRefrigerator?: boolean
  hasDiningArea?: boolean
  
  // Search
  search?: string
  searchQuery?: string  // Legacy support
  
  // Pagination
  page?: number
  limit?: number
  
  // Sorting
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * School performance metrics
 */
export interface SchoolPerformanceMetrics {
  schoolId: string
  schoolName: string
  attendanceRate: number
  participationRate: number
  satisfactionScore: number
  totalMealsServed: number
  totalDistributions: number
  lastDistributionDate: Date | null
  contractStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_CONTRACT'
  budgetUtilization: number
}

/**
 * School contract summary
 */
export interface SchoolContractSummary {
  schoolId: string
  schoolName: string
  contractNumber: string | null
  contractStartDate: Date | null
  contractEndDate: Date | null
  contractValue: number | null
  monthlyBudgetAllocation: number | null
  totalStudents: number
  costPerStudent: number | null
  daysRemaining: number | null
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_CONTRACT'
}

/**
 * School logistics summary
 */
export interface SchoolLogisticsSummary {
  schoolId: string
  schoolName: string
  distanceFromSppg: number | null
  estimatedTravelTime: number | null
  accessRoadCondition: string | null
  deliveryAddress: string
  deliveryContact: string
  preferredDeliveryTime: string | null
  coordinates: string | null
}
