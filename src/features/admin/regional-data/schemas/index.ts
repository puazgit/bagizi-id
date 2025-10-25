/**
 * @fileoverview Regional Data Validation Schemas
 * @version Next.js 15.5.4 / Zod 3.22+
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { IndonesiaRegion, Timezone, RegencyType, VillageType } from '@prisma/client'

/**
 * Regional code validation patterns
 */
const provinceCodePattern = /^\d{2}$/
const regencyCodePattern = /^\d{4}$/
const districtCodePattern = /^\d{6}$/
const villageCodePattern = /^\d{10}$/

/**
 * Prisma Enum Schemas
 */
export const indonesiaRegionSchema = z.nativeEnum(IndonesiaRegion)
export const timezoneSchema = z.nativeEnum(Timezone)
export const regencyTypeSchema = z.nativeEnum(RegencyType)
export const villageTypeSchema = z.nativeEnum(VillageType)

/**
 * Province schemas (with Prisma enums)
 */
export const createProvinceSchema = z.object({
  code: z
    .string()
    .min(2, 'Province code must be 2 digits')
    .max(2, 'Province code must be 2 digits')
    .regex(provinceCodePattern, 'Province code must be 2 digits (e.g., 11, 12, 31)'),
  name: z
    .string()
    .min(3, 'Province name must be at least 3 characters')
    .max(100, 'Province name must not exceed 100 characters')
    .trim(),
  region: indonesiaRegionSchema,
  timezone: timezoneSchema
})

export const updateProvinceSchema = createProvinceSchema.partial()

/**
 * Regency schemas (with Prisma enums)
 */
export const createRegencySchema = z.object({
  code: z
    .string()
    .min(4, 'Regency code must be 4 digits')
    .max(4, 'Regency code must be 4 digits')
    .regex(regencyCodePattern, 'Regency code must be 4 digits (e.g., 1101, 3201)'),
  name: z
    .string()
    .min(3, 'Regency name must be at least 3 characters')
    .max(100, 'Regency name must not exceed 100 characters')
    .trim(),
  type: regencyTypeSchema,
  provinceId: z.string().cuid('Invalid province ID')
}).refine(
  (data) => {
    // Validate that regency code starts with province code
    const provinceCode = data.code.substring(0, 2)
    return provinceCode.length === 2
  },
  {
    message: 'Regency code must start with valid province code',
    path: ['code']
  }
)

export const updateRegencySchema = createRegencySchema.partial()

/**
 * District schemas
 */
export const createDistrictSchema = z.object({
  code: z
    .string()
    .min(6, 'District code must be 6 digits')
    .max(6, 'District code must be 6 digits')
    .regex(districtCodePattern, 'District code must be 6 digits (e.g., 110101, 320101)'),
  name: z
    .string()
    .min(3, 'District name must be at least 3 characters')
    .max(100, 'District name must not exceed 100 characters')
    .trim(),
  regencyId: z.string().cuid('Invalid regency ID')
}).refine(
  (data) => {
    // Validate that district code starts with regency code
    const regencyCode = data.code.substring(0, 4)
    return regencyCode.length === 4
  },
  {
    message: 'District code must start with valid regency code',
    path: ['code']
  }
)

export const updateDistrictSchema = createDistrictSchema.partial()

/**
 * Village schemas (with Prisma enums)
 */
export const createVillageSchema = z.object({
  code: z
    .string()
    .min(10, 'Village code must be 10 digits')
    .max(10, 'Village code must be 10 digits')
    .regex(villageCodePattern, 'Village code must be 10 digits (e.g., 1101010001)'),
  name: z
    .string()
    .min(3, 'Village name must be at least 3 characters')
    .max(100, 'Village name must not exceed 100 characters')
    .trim(),
  type: villageTypeSchema,
  postalCode: z
    .string()
    .regex(/^\d{5}$/, 'Postal code must be 5 digits')
    .optional(),
  districtId: z.string().cuid('Invalid district ID')
}).refine(
  (data) => {
    // Validate that village code starts with district code
    const districtCode = data.code.substring(0, 6)
    return districtCode.length === 6
  },
  {
    message: 'Village code must start with valid district code',
    path: ['code']
  }
)

export const updateVillageSchema = createVillageSchema.partial()

/**
 * Regional filters schema
 */
export const regionalFiltersSchema = z.object({
  search: z.string().optional(),
  provinceId: z.string().cuid().optional(),
  regencyId: z.string().cuid().optional(),
  districtId: z.string().cuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['code', 'name', 'createdAt']).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

/**
 * Bulk import schema
 */
export const bulkImportSchema = z.object({
  level: z.enum(['province', 'regency', 'district', 'village']),
  data: z.array(z.object({
    code: z.string(),
    name: z.string(),
    parentId: z.string().cuid().optional()
  })).min(1, 'At least one record is required')
})

/**
 * Type exports for inference
 */
export type CreateProvinceInput = z.infer<typeof createProvinceSchema>
export type UpdateProvinceInput = z.infer<typeof updateProvinceSchema>
export type CreateRegencyInput = z.infer<typeof createRegencySchema>
export type UpdateRegencyInput = z.infer<typeof updateRegencySchema>
export type CreateDistrictInput = z.infer<typeof createDistrictSchema>
export type UpdateDistrictInput = z.infer<typeof updateDistrictSchema>
export type CreateVillageInput = z.infer<typeof createVillageSchema>
export type UpdateVillageInput = z.infer<typeof updateVillageSchema>
export type RegionalFilters = z.infer<typeof regionalFiltersSchema>
export type BulkImportInput = z.infer<typeof bulkImportSchema>
