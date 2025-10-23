/**
 * @fileoverview Zod validation schemas untuk Program domain
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { ProgramType, TargetGroup, ProgramStatus } from '@prisma/client'

/**
 * Schema untuk create program
 */
export const createProgramSchema = z.object({
  name: z
    .string()
    .min(5, 'Nama program minimal 5 karakter')
    .max(200, 'Nama program maksimal 200 karakter'),
  
  programCode: z
    .string()
    .min(3, 'Kode program minimal 3 karakter')
    .max(50, 'Kode program maksimal 50 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode program harus huruf besar, angka, dan tanda hubung'),
  
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .nullable(),
  
  programType: z.nativeEnum(ProgramType),
  
  targetGroup: z.nativeEnum(TargetGroup),
  
  status: z.nativeEnum(ProgramStatus),
  
  // Nutrition targets (optional)
  calorieTarget: z
    .number()
    .min(0, 'Target kalori tidak boleh negatif')
    .max(5000, 'Target kalori terlalu tinggi')
    .optional()
    .nullable(),
  
  proteinTarget: z
    .number()
    .min(0, 'Target protein tidak boleh negatif')
    .max(200, 'Target protein terlalu tinggi')
    .optional()
    .nullable(),
  
  carbTarget: z
    .number()
    .min(0, 'Target karbohidrat tidak boleh negatif')
    .max(500, 'Target karbohidrat terlalu tinggi')
    .optional()
    .nullable(),
  
  fatTarget: z
    .number()
    .min(0, 'Target lemak tidak boleh negatif')
    .max(200, 'Target lemak terlalu tinggi')
    .optional()
    .nullable(),
  
  fiberTarget: z
    .number()
    .min(0, 'Target serat tidak boleh negatif')
    .max(100, 'Target serat terlalu tinggi')
    .optional()
    .nullable(),
  
  // Schedule
  startDate: z.coerce.date(),
  
  endDate: z.coerce.date().optional().nullable(),
  
  feedingDays: z
    .array(z.number().min(0).max(6))
    .min(1, 'Minimal 1 hari pemberian makan')
    .max(7, 'Maksimal 7 hari pemberian makan')
    .refine(
      (days) => {
        // Check for duplicates
        const uniqueDays = new Set(days)
        return uniqueDays.size === days.length
      },
      { message: 'Hari pemberian makan tidak boleh duplikat' }
    ),
  
  mealsPerDay: z
    .number()
    .int('Jumlah makanan per hari harus bilangan bulat')
    .min(1, 'Minimal 1 makanan per hari')
    .max(5, 'Maksimal 5 makanan per hari'),
  
  // Budget
  totalBudget: z
    .number()
    .min(0, 'Total budget tidak boleh negatif')
    .optional()
    .nullable(),
  
  budgetPerMeal: z
    .number()
    .min(0, 'Budget per makanan tidak boleh negatif')
    .optional()
    .nullable(),
  
  targetRecipients: z
    .number()
    .int('Target penerima harus bilangan bulat')
    .min(1, 'Target penerima minimal 1 orang')
    .max(100000, 'Target penerima maksimal 100.000 orang'),
  
  currentRecipients: z
    .number()
    .int('Jumlah penerima saat ini harus bilangan bulat')
    .min(0, 'Jumlah penerima tidak boleh negatif')
    .optional(),
  
  // Implementation
  implementationArea: z
    .string()
    .min(3, 'Area implementasi minimal 3 karakter')
    .max(200, 'Area implementasi maksimal 200 karakter'),
  
  partnerSchools: z.array(z.string().min(1))
}).refine(
  (data) => {
    // Validate endDate is after startDate
    if (data.endDate && data.startDate) {
      return data.endDate > data.startDate
    }
    return true
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate']
  }
)

/**
 * Schema untuk update program (partial)
 */
export const updateProgramSchema = z.object({
  name: z
    .string()
    .min(5, 'Nama program minimal 5 karakter')
    .max(200, 'Nama program maksimal 200 karakter')
    .optional(),
  
  programCode: z
    .string()
    .min(3, 'Kode program minimal 3 karakter')
    .max(50, 'Kode program maksimal 50 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode program harus huruf besar, angka, dan tanda hubung')
    .optional(),
  
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .nullable(),
  
  programType: z
    .nativeEnum(ProgramType)
    .optional(),
  
  targetGroup: z
    .nativeEnum(TargetGroup)
    .optional(),
  
  status: z
    .nativeEnum(ProgramStatus)
    .optional(),
  
  calorieTarget: z
    .number()
    .min(0)
    .max(5000)
    .optional()
    .nullable(),
  
  proteinTarget: z
    .number()
    .min(0)
    .max(200)
    .optional()
    .nullable(),
  
  carbTarget: z
    .number()
    .min(0)
    .max(500)
    .optional()
    .nullable(),
  
  fatTarget: z
    .number()
    .min(0)
    .max(200)
    .optional()
    .nullable(),
  
  fiberTarget: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  
  startDate: z.coerce.date().optional(),
  
  endDate: z.coerce.date().optional().nullable(),
  
  feedingDays: z
    .array(z.number().min(0).max(6))
    .min(1)
    .max(7)
    .optional(),
  
  mealsPerDay: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional(),
  
  totalBudget: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  
  budgetPerMeal: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  
  targetRecipients: z
    .number()
    .int()
    .min(1)
    .max(100000)
    .optional(),
  
  currentRecipients: z
    .number()
    .int()
    .min(0)
    .optional(),
  
  implementationArea: z
    .string()
    .min(3)
    .max(200)
    .optional(),
  
  partnerSchools: z
    .array(z.string().min(1))
    .optional()
}).refine(
  (data) => {
    // Validate endDate is after startDate if both provided
    if (data.endDate && data.startDate) {
      return data.endDate > data.startDate
    }
    return true
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate']
  }
)

/**
 * Schema untuk filter programs
 */
export const programFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(ProgramType).optional(),
  targetGroup: z.nativeEnum(TargetGroup).optional(),
  status: z.nativeEnum(ProgramStatus).optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  endDateFrom: z.string().optional(),
  endDateTo: z.string().optional()
})

/**
 * Type inference dari schemas
 */
export type CreateProgramInput = z.infer<typeof createProgramSchema>
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>
export type ProgramFilters = z.infer<typeof programFiltersSchema>
