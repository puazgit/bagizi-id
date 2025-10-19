/**
 * @fileoverview Zod Validation Schemas for Distribution Schedule
 * @version Next.js 15.5.4 / Zod v3
 * @description Comprehensive validation schemas for schedule creation, updates, and status transitions
 * @author Bagizi-ID Development Team
 */

import { z } from 'zod'
import { 
  DistributionWave, 
  BeneficiaryCategory,
} from '@prisma/client'

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Distribution wave validation
 */
export const distributionWaveSchema = z.nativeEnum(DistributionWave, {
  message: 'Gelombang distribusi tidak valid',
})

/**
 * Beneficiary category validation
 */
export const beneficiaryCategorySchema = z.nativeEnum(BeneficiaryCategory, {
  message: 'Kategori penerima tidak valid',
})

/**
 * Schedule status validation - manual enum since Prisma schema uses String
 */
export const scheduleStatusSchema = z.enum([
  'PLANNED',
  'PREPARED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DELAYED',
], {
  message: 'Status jadwal tidak valid',
})

// ============================================================================
// CREATE SCHEDULE SCHEMA
// ============================================================================

/**
 * Create schedule validation schema
 */
export const createScheduleSchema = z
  .object({
    // Schedule Details
    distributionDate: z.coerce
      .date({
        message: 'Format tanggal tidak valid',
      })
      .refine(
        (date) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return date >= today
        },
        {
          message: 'Tanggal distribusi tidak boleh di masa lalu',
        }
      ),

    wave: distributionWaveSchema,

    // Target Information
    targetCategories: z
      .array(beneficiaryCategorySchema)
      .min(1, 'Minimal pilih 1 kategori penerima')
      .max(10, 'Maksimal 10 kategori penerima'),

    estimatedBeneficiaries: z
      .number({
        message: 'Estimasi penerima harus berupa angka',
      })
      .int('Estimasi penerima harus bilangan bulat')
      .min(1, 'Minimal 1 penerima')
      .max(100000, 'Maksimal 100,000 penerima'),

    // Menu & Portion
    menuName: z
      .string({
        message: 'Nama menu harus diisi',
      })
      .min(3, 'Nama menu minimal 3 karakter')
      .max(200, 'Nama menu maksimal 200 karakter')
      .trim(),

    menuDescription: z
      .string()
      .max(1000, 'Deskripsi menu maksimal 1000 karakter')
      .trim()
      .optional(),

    portionSize: z
      .number({
        message: 'Ukuran porsi harus berupa angka',
      })
      .positive('Ukuran porsi harus lebih dari 0')
      .max(5000, 'Ukuran porsi maksimal 5000 gram'),

    totalPortions: z
      .number({
        message: 'Total porsi harus berupa angka',
      })
      .int('Total porsi harus bilangan bulat')
      .min(1, 'Minimal 1 porsi')
      .max(100000, 'Maksimal 100,000 porsi'),

    // Packaging
    packagingType: z
      .string({
        message: 'Jenis kemasan harus diisi',
      })
      .min(2, 'Jenis kemasan minimal 2 karakter')
      .max(100, 'Jenis kemasan maksimal 100 karakter')
      .trim(),

    packagingCost: z
      .number({
        message: 'Biaya kemasan harus berupa angka',
      })
      .nonnegative('Biaya kemasan tidak boleh negatif')
      .max(1000000000, 'Biaya kemasan terlalu besar')
      .optional(),

    // Distribution Method
    deliveryMethod: z
      .string({
        message: 'Metode pengiriman harus diisi',
      })
      .min(3, 'Metode pengiriman minimal 3 karakter')
      .max(100, 'Metode pengiriman maksimal 100 karakter')
      .trim(),

    distributionTeam: z
      .array(
        z.string().cuid('ID anggota tim tidak valid').trim(),
        {
          message: 'Tim distribusi harus berupa array',
        }
      )
      .min(1, 'Minimal 1 anggota tim')
      .max(50, 'Maksimal 50 anggota tim'),

    // Logistics
    estimatedTravelTime: z
      .number({
        message: 'Estimasi waktu tempuh harus berupa angka',
      })
      .int('Estimasi waktu tempuh harus bilangan bulat')
      .min(1, 'Estimasi waktu tempuh minimal 1 menit')
      .max(1440, 'Estimasi waktu tempuh maksimal 1440 menit (24 jam)')
      .optional(),

    fuelCost: z
      .number({
        message: 'Biaya bahan bakar harus berupa angka',
      })
      .nonnegative('Biaya bahan bakar tidak boleh negatif')
      .max(100000000, 'Biaya bahan bakar terlalu besar')
      .optional(),
  })
  .refine(
    (data) => {
      // Validate total portions vs estimated beneficiaries
      return data.totalPortions >= data.estimatedBeneficiaries
    },
    {
      message:
        'Total porsi harus sama atau lebih besar dari estimasi penerima',
      path: ['totalPortions'],
    }
  )
  .refine(
    (data) => {
      // Validate distribution date is not too far in future (max 1 year)
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      return data.distributionDate <= oneYearFromNow
    },
    {
      message: 'Tanggal distribusi maksimal 1 tahun dari sekarang',
      path: ['distributionDate'],
    }
  )

/**
 * Type inference from schema
 */
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>

// ============================================================================
// UPDATE SCHEDULE SCHEMA
// ============================================================================

/**
 * Update schedule validation schema (partial)
 */
export const updateScheduleSchema = createScheduleSchema.partial().refine(
  (data) => {
    // At least one field must be provided
    return Object.keys(data).length > 0
  },
  {
    message: 'Minimal satu field harus diisi untuk update',
  }
)

/**
 * Type inference from schema
 */
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>

// ============================================================================
// STATUS UPDATE SCHEMA
// ============================================================================

/**
 * Update schedule status validation schema
 */
export const updateScheduleStatusSchema = z.object({
  status: scheduleStatusSchema,
  reason: z
    .string()
    .min(10, 'Alasan minimal 10 karakter')
    .max(500, 'Alasan maksimal 500 karakter')
    .trim()
    .optional(),
  notes: z
    .string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .trim()
    .optional(),
})

/**
 * Type inference from schema
 */
export type UpdateScheduleStatusInput = z.infer<
  typeof updateScheduleStatusSchema
>

// ============================================================================
// VEHICLE ASSIGNMENT SCHEMA
// ============================================================================

/**
 * Assign vehicle validation schema
 */
export const assignVehicleSchema = z
  .object({
    vehicleId: z
      .string({
        message: 'ID kendaraan harus diisi',
      })
      .cuid('ID kendaraan tidak valid')
      .trim(),

    driverId: z
      .string({
        message: 'ID pengemudi harus diisi',
      })
      .cuid('ID pengemudi tidak valid')
      .trim(),

    helpers: z
      .array(
        z
          .string()
          .cuid('ID helper tidak valid')
          .trim()
      )
      .default([]),

    estimatedDeparture: z.coerce.date({
      message: 'Format tanggal tidak valid',
    }),

    estimatedArrival: z.coerce.date({
      message: 'Format tanggal tidak valid',
    }),

    notes: z
      .string()
      .max(500, 'Catatan maksimal 500 karakter')
      .trim()
      .optional(),
  })
  .refine(
    (data) => {
      // Validate arrival is after departure
      return data.estimatedArrival > data.estimatedDeparture
    },
    {
      message: 'Estimasi kedatangan harus setelah keberangkatan',
      path: ['estimatedArrival'],
    }
  )
  .refine(
    (data) => {
      // Validate departure is not in the past
      const now = new Date()
      return data.estimatedDeparture >= now
    },
    {
      message: 'Estimasi keberangkatan tidak boleh di masa lalu',
      path: ['estimatedDeparture'],
    }
  )
  .refine(
    (data) => {
      // Validate travel time is reasonable (max 24 hours)
      const travelTime =
        data.estimatedArrival.getTime() - data.estimatedDeparture.getTime()
      const maxTravelTime = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      return travelTime <= maxTravelTime
    },
    {
      message: 'Waktu tempuh maksimal 24 jam',
      path: ['estimatedArrival'],
    }
  )

/**
 * Type inference from schema
 */
export type AssignVehicleInput = z.infer<typeof assignVehicleSchema>

// ============================================================================
// FILTER SCHEMA
// ============================================================================

/**
 * Schedule list filter validation schema
 */
export const scheduleFilterSchema = z.object({
  status: z
    .union([scheduleStatusSchema, z.array(scheduleStatusSchema)])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  wave: distributionWaveSchema.optional(),
  deliveryMethod: z.string().trim().optional(),
  search: z.string().max(200).trim().optional(),
})

/**
 * Type inference from schema
 */
export type ScheduleFilterInput = z.infer<typeof scheduleFilterSchema>

// ============================================================================
// PAGINATION SCHEMA
// ============================================================================

/**
 * Pagination parameters validation schema
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'Halaman minimal 1')
    .default(1)
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit minimal 1')
    .max(100, 'Limit maksimal 100')
    .default(10)
    .optional(),
})

/**
 * Type inference from schema
 */
export type PaginationInput = z.infer<typeof paginationSchema>

// ============================================================================
// SORT SCHEMA
// ============================================================================

/**
 * Sort parameters validation schema
 */
export const sortSchema = z.object({
  field: z.enum(
    ['distributionDate', 'wave', 'totalPortions', 'status', 'createdAt'],
    {
      message: 'Field sort tidak valid',
    }
  ),
  direction: z.enum(['asc', 'desc'], {
    message: 'Arah sort harus "asc" atau "desc"',
  }),
})

/**
 * Type inference from schema
 */
export type SortInput = z.infer<typeof sortSchema>
