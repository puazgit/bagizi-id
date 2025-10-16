/**
 * @fileoverview Allergen Zod Validation Schemas
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Validation Standards
 */

import { z } from 'zod'
import { ALLERGEN_CATEGORIES } from '../types/allergen.types'

// === ALLERGEN CREATION SCHEMA ===

/**
 * Schema for creating new allergen
 * Used in: POST /api/sppg/allergens
 */
export const allergenCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama alergen minimal 2 karakter')
    .max(100, 'Nama alergen maksimal 100 karakter')
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Nama alergen tidak boleh kosong',
    }),
  
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .trim()
    .optional()
    .nullable(),
  
  category: z
    .enum([
      ALLERGEN_CATEGORIES.DAIRY,
      ALLERGEN_CATEGORIES.EGGS,
      ALLERGEN_CATEGORIES.NUTS,
      ALLERGEN_CATEGORIES.SEAFOOD,
      ALLERGEN_CATEGORIES.GRAINS,
      ALLERGEN_CATEGORIES.SEEDS,
      ALLERGEN_CATEGORIES.FRUITS,
      ALLERGEN_CATEGORIES.ADDITIVES,
      ALLERGEN_CATEGORIES.MEAT,
      ALLERGEN_CATEGORIES.OTHER,
    ])
    .optional()
    .nullable(),
  
  localName: z
    .string()
    .max(100, 'Nama lokal maksimal 100 karakter')
    .trim()
    .optional()
    .nullable(),
  
  isCommon: z
    .boolean()
    .optional()
    .default(false),
  
  isActive: z
    .boolean()
    .optional()
    .default(true),
})

/**
 * Type inference for allergen creation
 */
export type AllergenCreateInput = z.infer<typeof allergenCreateSchema>

// === ALLERGEN UPDATE SCHEMA ===

/**
 * Schema for updating existing allergen
 * Used in: PUT /api/sppg/allergens/[id]
 */
export const allergenUpdateSchema = allergenCreateSchema.partial()

/**
 * Type inference for allergen update
 */
export type AllergenUpdateInput = z.infer<typeof allergenUpdateSchema>

// === ALLERGEN QUERY SCHEMA ===

/**
 * Schema for allergen query parameters
 * Used in: GET /api/sppg/allergens?category=NUTS&isCommon=true
 */
export const allergenQuerySchema = z.object({
  category: z
    .enum([
      ALLERGEN_CATEGORIES.DAIRY,
      ALLERGEN_CATEGORIES.EGGS,
      ALLERGEN_CATEGORIES.NUTS,
      ALLERGEN_CATEGORIES.SEAFOOD,
      ALLERGEN_CATEGORIES.GRAINS,
      ALLERGEN_CATEGORIES.SEEDS,
      ALLERGEN_CATEGORIES.FRUITS,
      ALLERGEN_CATEGORIES.ADDITIVES,
      ALLERGEN_CATEGORIES.MEAT,
      ALLERGEN_CATEGORIES.OTHER,
    ])
    .optional(),
  
  isCommon: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  
  includeCustom: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default(true),
  
  search: z
    .string()
    .max(100, 'Pencarian maksimal 100 karakter')
    .trim()
    .optional(),
})

/**
 * Type inference for allergen query
 */
export type AllergenQueryInput = z.infer<typeof allergenQuerySchema>

// === VALIDATION HELPERS ===

/**
 * Validate allergen name is unique within SPPG
 */
export function validateAllergenNameUnique(
  name: string,
  existingNames: string[]
): boolean {
  const normalizedName = name.trim().toLowerCase()
  const existingNormalized = existingNames.map((n) => n.toLowerCase())
  return !existingNormalized.includes(normalizedName)
}

/**
 * Sanitize allergen name (remove extra spaces, capitalize properly)
 */
export function sanitizeAllergenName(name: string): string {
  return name
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Validate allergen form data (client-side)
 */
export function validateAllergenForm(data: AllergenCreateInput): {
  isValid: boolean
  errors: Record<string, string>
} {
  const result = allergenCreateSchema.safeParse(data)
  
  if (result.success) {
    return { isValid: true, errors: {} }
  }
  
  const errors: Record<string, string> = {}
  result.error.issues.forEach((err) => {
    const field = err.path[0] as string
    errors[field] = err.message
  })
  
  return { isValid: false, errors }
}
