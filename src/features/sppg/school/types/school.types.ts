/**
 * @fileoverview School Master TypeScript Types
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { BeneficiaryType } from '@prisma/client'

/**
 * School master data structure (from database)
 */
export interface SchoolMaster {
  id: string
  programId: string
  schoolName: string
  schoolCode: string | null
  schoolType: string
  schoolStatus: string
  principalName: string
  contactPhone: string
  contactEmail: string | null
  schoolAddress: string
  villageId: string
  postalCode: string | null
  coordinates: string | null
  totalStudents: number
  targetStudents: number
  activeStudents: number
  students4to6Years: number
  students7to12Years: number
  students13to15Years: number
  students16to18Years: number
  feedingDays: number[]
  mealsPerDay: number
  feedingTime: string | null
  deliveryAddress: string
  deliveryContact: string
  deliveryInstructions: string | null
  storageCapacity: string | null
  servingMethod: string
  hasKitchen: boolean
  hasStorage: boolean
  hasCleanWater: boolean
  hasElectricity: boolean
  enrollmentDate: Date
  isActive: boolean
  suspendedAt: Date | null
  suspensionReason: string | null
  beneficiaryType: BeneficiaryType
  specialDietary: string[]
  allergyAlerts: string[]
  culturalReqs: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * School master with relations
 */
export interface SchoolMasterWithRelations extends SchoolMaster {
  program: {
    id: string
    name: string
  }
  village: {
    id: string
    name: string
    district: {
      id: string
      name: string
      regency: {
        id: string
        name: string
        province: {
          id: string
          name: string
        }
      }
    }
  }
}

/**
 * School statistics
 */
export interface SchoolStatistics {
  totalSchools: number
  activeSchools: number
  suspendedSchools: number
  totalStudents: number
  targetStudents: number
  activeStudents: number
  byType: {
    type: string
    count: number
  }[]
  byProgram: {
    programId: string
    programName: string
    count: number
  }[]
}

/**
 * School serving method enum
 */
export type ServingMethod = 'CAFETERIA' | 'CLASSROOM' | 'TAKEAWAY' | 'OTHER'

/**
 * School type options (Indonesia specific)
 */
export const SCHOOL_TYPES = [
  { value: 'TK', label: 'Taman Kanak-Kanak (TK)' },
  { value: 'SD', label: 'Sekolah Dasar (SD)' },
  { value: 'SMP', label: 'Sekolah Menengah Pertama (SMP)' },
  { value: 'SMA', label: 'Sekolah Menengah Atas (SMA)' },
  { value: 'SMK', label: 'Sekolah Menengah Kejuruan (SMK)' },
  { value: 'PAUD', label: 'Pendidikan Anak Usia Dini (PAUD)' },
] as const

/**
 * School status options
 */
export const SCHOOL_STATUSES = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'SUSPENDED', label: 'Ditangguhkan' },
  { value: 'INACTIVE', label: 'Tidak Aktif' },
  { value: 'GRADUATED', label: 'Lulus Program' },
] as const

/**
 * Serving method options
 */
export const SERVING_METHODS = [
  { value: 'CAFETERIA', label: 'Kantin/Cafeteria' },
  { value: 'CLASSROOM', label: 'Di Kelas' },
  { value: 'TAKEAWAY', label: 'Bawa Pulang' },
  { value: 'OTHER', label: 'Lainnya' },
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
