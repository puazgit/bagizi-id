/**
 * @fileoverview Production domain Zod validation schemas
 * @version Next.js 15.5.4 / Zod / Enterprise-grade validation
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { z } from 'zod'
import { ProductionStatus } from '@prisma/client'

// ================================ ENUM SCHEMAS ================================

export const productionStatusSchema = z.nativeEnum(ProductionStatus)

export const qualityCheckTypeSchema = z.enum([
  'HYGIENE',
  'TEMPERATURE',
  'TASTE',
  'APPEARANCE',
  'SAFETY',
])

export const severitySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

// ================================ PRODUCTION SCHEMAS ================================

/**
 * Production creation schema with comprehensive validation
 */
export const productionCreateSchema = z.object({
  // Required Fields
  programId: z.string().cuid('Program ID harus valid'),
  
  menuId: z.string().cuid('Menu ID harus valid'),
  
  productionDate: z.date({
    message: 'Tanggal produksi wajib diisi',
  }).refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, 'Tanggal produksi tidak boleh di masa lalu'),
  
  plannedPortions: z.number()
    .int('Jumlah porsi harus bilangan bulat')
    .min(1, 'Minimal 1 porsi')
    .max(10000, 'Maksimal 10,000 porsi'),
  
  plannedStartTime: z.date({
    message: 'Waktu mulai wajib diisi',
  }),
  
  plannedEndTime: z.date({
    message: 'Waktu selesai wajib diisi',
  }),
  
  headCook: z.string()
    .min(1, 'Kepala koki wajib diisi')
    .max(100, 'Nama kepala koki maksimal 100 karakter'),
  
  // ❌ estimatedCost removed - will be calculated by ProductionCostCalculator
  
  // Optional Fields
  batchNumber: z.string()
    .regex(/^PROD-\d{8}-\d{3}$/, 'Format batch number: PROD-YYYYMMDD-XXX')
    .optional(),
  
  assistantCooks: z.array(z.string())
    .max(10, 'Maksimal 10 asisten koki')
    .optional(),
  
  supervisorId: z.string().cuid().optional(),
  
  targetTemperature: z.number()
    .min(-20, 'Suhu minimal -20°C')
    .max(300, 'Suhu maksimal 300°C')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .optional(),
}).refine((data) => {
  // Validate time range: end must be after start
  return data.plannedEndTime > data.plannedStartTime
}, {
  message: 'Waktu selesai harus lebih lambat dari waktu mulai',
  path: ['plannedEndTime'],
}).refine((data) => {
  // Validate minimum duration: 30 minutes
  const durationMinutes = (data.plannedEndTime.getTime() - data.plannedStartTime.getTime()) / (1000 * 60)
  return durationMinutes >= 30
}, {
  message: 'Durasi produksi minimal 30 menit',
  path: ['plannedEndTime'],
})

/**
 * Production update schema (partial fields allowed)
 */
export const productionUpdateSchema = productionCreateSchema.partial().extend({
  id: z.string().cuid(),
})

/**
 * Complete production schema (for COOKING → QUALITY_CHECK)
 */
export const completeProductionSchema = z.object({
  actualPortions: z.number()
    .int('Jumlah porsi harus bilangan bulat')
    .min(1, 'Minimal 1 porsi')
    .max(10000, 'Maksimal 10,000 porsi'),
  
  // ❌ actualCost removed - will be calculated by ProductionCostCalculator
  
  actualTemperature: z.number()
    .min(-20, 'Suhu minimal -20°C')
    .max(300, 'Suhu maksimal 300°C')
    .optional(),
  
  wasteAmount: z.number()
    .nonnegative('Jumlah sisa tidak boleh negatif')
    .optional(),
  
  wasteNotes: z.string()
    .max(500, 'Catatan sisa maksimal 500 karakter')
    .optional(),
})

/**
 * Cancel production schema
 */
export const cancelProductionSchema = z.object({
  reason: z.string()
    .min(10, 'Alasan pembatalan minimal 10 karakter')
    .max(500, 'Alasan pembatalan maksimal 500 karakter'),
})

// ================================ QUALITY CHECK SCHEMAS ================================

/**
 * Quality check creation schema
 */
export const qualityCheckCreateSchema = z.object({
  checkType: qualityCheckTypeSchema,
  
  parameter: z.string()
    .min(3, 'Parameter minimal 3 karakter')
    .max(100, 'Parameter maksimal 100 karakter'),
  
  expectedValue: z.string()
    .max(100, 'Nilai yang diharapkan maksimal 100 karakter')
    .optional(),
  
  actualValue: z.string()
    .min(1, 'Nilai aktual wajib diisi')
    .max(100, 'Nilai aktual maksimal 100 karakter'),
  
  passed: z.boolean({
    message: 'Status kelulusan wajib diisi',
  }),
  
  score: z.number()
    .int('Skor harus bilangan bulat')
    .min(0, 'Skor minimal 0')
    .max(100, 'Skor maksimal 100')
    .optional(),
  
  severity: severitySchema.optional(),
  
  notes: z.string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .optional(),
  
  recommendations: z.string()
    .max(1000, 'Rekomendasi maksimal 1000 karakter')
    .optional(),
  
  actionRequired: z.boolean().optional(),
  
  actionTaken: z.string()
    .max(500, 'Tindakan yang diambil maksimal 500 karakter')
    .optional(),
})

/**
 * Quality check update schema
 */
export const qualityCheckUpdateSchema = qualityCheckCreateSchema.partial().extend({
  id: z.string().cuid(),
})

// ================================ FILTER SCHEMAS ================================

/**
 * Production filters schema
 */
export const productionFiltersSchema = z.object({
  search: z.string().optional(),
  status: productionStatusSchema.or(z.literal('ALL')).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  menuId: z.string().cuid().optional(),
  programId: z.string().cuid().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

// ================================ TYPE EXPORTS ================================

export type ProductionCreateInput = z.infer<typeof productionCreateSchema>
export type ProductionUpdateInput = z.infer<typeof productionUpdateSchema>
export type CompleteProductionInput = z.infer<typeof completeProductionSchema>
export type CancelProductionInput = z.infer<typeof cancelProductionSchema>
export type QualityCheckCreateInput = z.infer<typeof qualityCheckCreateSchema>
export type QualityCheckUpdateInput = z.infer<typeof qualityCheckUpdateSchema>
export type ProductionFiltersInput = z.infer<typeof productionFiltersSchema>
