/**
 * @fileoverview Zod Validation Schemas for Distribution Execution
 * @version Next.js 15.5.4 / Zod v4
 * @description Comprehensive validation schemas for execution operations
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_PHASE2_EXECUTION_PLAN.md} PHASE 2 Plan
 */

import { z } from 'zod'
import { DistributionStatus } from '@prisma/client'

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Distribution status validation - uses Prisma enum
 */
export const distributionStatusSchema = z.nativeEnum(DistributionStatus, {
  message: 'Status distribusi tidak valid',
})

/**
 * Issue type validation
 */
export const issueTypeSchema = z.enum(
  [
    'VEHICLE_BREAKDOWN',
    'WEATHER_DELAY',
    'TRAFFIC_JAM',
    'ACCESS_DENIED',
    'RECIPIENT_UNAVAILABLE',
    'FOOD_QUALITY',
    'SHORTAGE',
    'OTHER',
  ],
  {
    message: 'Tipe masalah tidak valid',
  }
)

/**
 * Issue severity validation
 */
export const issueSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
  message: 'Tingkat keparahan tidak valid',
})

// ============================================================================
// START EXECUTION SCHEMA
// ============================================================================

/**
 * Start execution validation schema
 */
export const startExecutionSchema = z.object({
  scheduleId: z
    .string({
      message: 'ID jadwal harus diisi',
    })
    .cuid('ID jadwal tidak valid')
    .trim(),

  notes: z
    .string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .trim()
    .optional(),
})

/**
 * Type inference from schema
 */
export type StartExecutionInput = z.infer<typeof startExecutionSchema>

// ============================================================================
// UPDATE EXECUTION SCHEMA
// ============================================================================

/**
 * Update execution validation schema
 */
export const updateExecutionSchema = z
  .object({
    totalPortionsDelivered: z
      .number({
        message: 'Total porsi yang dikirim harus berupa angka',
      })
      .int('Total porsi harus bilangan bulat')
      .min(0, 'Total porsi tidak boleh negatif')
      .max(100000, 'Total porsi maksimal 100,000')
      .optional(),

    totalBeneficiariesReached: z
      .number({
        message: 'Total penerima yang dijangkau harus berupa angka',
      })
      .int('Total penerima harus bilangan bulat')
      .min(0, 'Total penerima tidak boleh negatif')
      .max(100000, 'Total penerima maksimal 100,000')
      .optional(),

    issuesEncountered: z
      .string()
      .max(2000, 'Deskripsi masalah maksimal 2000 karakter')
      .trim()
      .optional(),

    resolutionNotes: z
      .string()
      .max(2000, 'Catatan resolusi maksimal 2000 karakter')
      .trim()
      .optional(),
  })
  .refine(
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
export type UpdateExecutionInput = z.infer<typeof updateExecutionSchema>

// ============================================================================
// COMPLETE EXECUTION SCHEMA
// ============================================================================

/**
 * Complete execution validation schema
 */
export const completeExecutionSchema = z.object({
  actualEndTime: z.coerce
    .date({
      message: 'Format tanggal selesai tidak valid',
    })
    .optional(),

  totalPortionsDelivered: z
    .number({
      message: 'Total porsi yang dikirim harus diisi',
    })
    .int('Total porsi harus bilangan bulat')
    .min(1, 'Minimal 1 porsi harus dikirim')
    .max(100000, 'Total porsi maksimal 100,000'),

  totalBeneficiariesReached: z
    .number({
      message: 'Total penerima yang dijangkau harus diisi',
    })
    .int('Total penerima harus bilangan bulat')
    .min(1, 'Minimal 1 penerima harus dijangkau')
    .max(100000, 'Total penerima maksimal 100,000'),

  completionNotes: z
    .string()
    .max(2000, 'Catatan penyelesaian maksimal 2000 karakter')
    .trim()
    .optional(),
})

/**
 * Type inference from schema
 */
export type CompleteExecutionInput = z.infer<typeof completeExecutionSchema>

// ============================================================================
// REPORT ISSUE SCHEMA
// ============================================================================

/**
 * Report issue validation schema
 */
export const reportIssueSchema = z.object({
  type: issueTypeSchema,

  severity: issueSeveritySchema,

  description: z
    .string({
      message: 'Deskripsi masalah harus diisi',
    })
    .min(10, 'Deskripsi masalah minimal 10 karakter')
    .max(2000, 'Deskripsi masalah maksimal 2000 karakter')
    .trim(),

  location: z
    .string()
    .max(500, 'Lokasi maksimal 500 karakter')
    .trim()
    .optional(),

  affectedDeliveries: z
    .array(
      z
        .string()
        .cuid('ID pengiriman tidak valid')
        .trim()
    )
    .default([]),
})

/**
 * Type inference from schema
 */
export type ReportIssueInput = z.infer<typeof reportIssueSchema>

// ============================================================================
// RESOLVE ISSUE SCHEMA
// ============================================================================

/**
 * Resolve issue validation schema
 */
export const resolveIssueSchema = z.object({
  resolutionNotes: z
    .string({
      message: 'Catatan resolusi harus diisi',
    })
    .min(10, 'Catatan resolusi minimal 10 karakter')
    .max(2000, 'Catatan resolusi maksimal 2000 karakter')
    .trim(),

  resolvedAt: z.coerce
    .date({
      message: 'Format tanggal resolusi tidak valid',
    })
    .optional(),
})

/**
 * Type inference from schema
 */
export type ResolveIssueInput = z.infer<typeof resolveIssueSchema>

// ============================================================================
// RECORD DELIVERY SCHEMA
// ============================================================================

/**
 * Record delivery completion schema
 */
export const recordDeliverySchema = z.object({
  deliveryId: z
    .string({
      message: 'ID pengiriman harus diisi',
    })
    .cuid('ID pengiriman tidak valid')
    .trim(),

  portionsDelivered: z
    .number({
      message: 'Jumlah porsi yang dikirim harus diisi',
    })
    .int('Jumlah porsi harus bilangan bulat')
    .min(1, 'Minimal 1 porsi')
    .max(10000, 'Maksimal 10,000 porsi per pengiriman'),

  beneficiariesReached: z
    .number({
      message: 'Jumlah penerima yang dijangkau harus diisi',
    })
    .int('Jumlah penerima harus bilangan bulat')
    .min(1, 'Minimal 1 penerima')
    .max(10000, 'Maksimal 10,000 penerima per pengiriman'),

  notes: z
    .string()
    .max(1000, 'Catatan pengiriman maksimal 1000 karakter')
    .trim()
    .optional(),
})

/**
 * Type inference from schema
 */
export type RecordDeliveryInput = z.infer<typeof recordDeliverySchema>

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

/**
 * Execution filter validation schema
 */
export const executionFilterSchema = z.object({
  status: z
    .union([distributionStatusSchema, z.array(distributionStatusSchema)])
    .optional(),

  scheduleId: z.string().cuid().trim().optional(),

  dateFrom: z.coerce.date().optional(),

  dateTo: z.coerce.date().optional(),

  hasIssues: z.boolean().optional(),

  search: z.string().max(200).trim().optional(),
})

/**
 * Type inference from schema
 */
export type ExecutionFilterInput = z.infer<typeof executionFilterSchema>

// ============================================================================
// PAGINATION SCHEMA
// ============================================================================

/**
 * Pagination validation schema
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Page harus bilangan bulat')
    .min(1, 'Page minimal 1')
    .default(1),

  pageSize: z
    .number()
    .int('Page size harus bilangan bulat')
    .min(1, 'Page size minimal 1')
    .max(100, 'Page size maksimal 100')
    .default(20),
})

/**
 * Type inference from schema
 */
export type PaginationInput = z.infer<typeof paginationSchema>

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Get executions query schema
 */
export const getExecutionsQuerySchema = executionFilterSchema.merge(paginationSchema)

/**
 * Type inference from schema
 */
export type GetExecutionsQuery = z.infer<typeof getExecutionsQuerySchema>
