/**
 * @fileoverview Allergen TypeScript Types
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Feature-Based Architecture
 */

import { Allergen as PrismaAllergen } from '@prisma/client'

// === BASE TYPES ===

/**
 * Base Allergen interface from Prisma
 */
export interface Allergen extends PrismaAllergen {
  id: string
  sppgId: string | null
  name: string
  description: string | null
  isCommon: boolean
  category: string | null
  localName: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Allergen input for create/update operations
 */
export interface AllergenInput {
  name: string
  description?: string | null
  category?: string | null
  localName?: string | null
  isCommon?: boolean
  isActive?: boolean
}

/**
 * Allergen response from API
 */
export interface AllergenResponse {
  id: string
  sppgId: string | null
  name: string
  description: string | null
  isCommon: boolean
  category: string | null
  localName: string | null
  isActive: boolean
  createdAt: string // ISO date string from API
  updatedAt: string // ISO date string from API
}

// === ALLERGEN CATEGORIES ===

export const ALLERGEN_CATEGORIES = {
  DAIRY: 'DAIRY',           // Produk Susu
  EGGS: 'EGGS',             // Telur
  NUTS: 'NUTS',             // Kacang-kacangan
  SEAFOOD: 'SEAFOOD',       // Makanan Laut
  GRAINS: 'GRAINS',         // Biji-bijian (Gandum, Jagung)
  SEEDS: 'SEEDS',           // Biji-bijian kecil (Wijen)
  FRUITS: 'FRUITS',         // Buah-buahan
  ADDITIVES: 'ADDITIVES',   // Bahan Tambahan (MSG, Pengawet)
  MEAT: 'MEAT',             // Daging
  OTHER: 'OTHER',           // Lainnya
} as const

export type AllergenCategory = (typeof ALLERGEN_CATEGORIES)[keyof typeof ALLERGEN_CATEGORIES]

// === CATEGORY LABELS ===

export const ALLERGEN_CATEGORY_LABELS: Record<AllergenCategory, string> = {
  DAIRY: 'Produk Susu',
  EGGS: 'Telur',
  NUTS: 'Kacang-kacangan',
  SEAFOOD: 'Makanan Laut',
  GRAINS: 'Biji-bijian',
  SEEDS: 'Biji-bijian Kecil',
  FRUITS: 'Buah-buahan',
  ADDITIVES: 'Bahan Tambahan',
  MEAT: 'Daging',
  OTHER: 'Lainnya',
}

// === FILTER & QUERY TYPES ===

/**
 * Allergen filter options
 */
export interface AllergenFilter {
  category?: AllergenCategory
  isCommon?: boolean
  isActive?: boolean
  sppgId?: string | null // null = platform allergens, string = SPPG custom
  search?: string
}

/**
 * Allergen query result
 */
export interface AllergenQueryResult {
  allergens: AllergenResponse[]
  total: number
  platformAllergens: AllergenResponse[] // sppgId = null
  customAllergens: AllergenResponse[]   // sppgId !== null
}

// === FORM TYPES ===

/**
 * Allergen form data (for creating custom allergens)
 */
export interface AllergenFormData {
  name: string
  description?: string
  category?: AllergenCategory
  localName?: string
}

// === VALIDATION HELPERS ===

/**
 * Check if allergen is platform default (available to all SPPG)
 */
export function isPlatformAllergen(allergen: Allergen | AllergenResponse): boolean {
  return allergen.sppgId === null
}

/**
 * Check if allergen is SPPG custom
 */
export function isCustomAllergen(allergen: Allergen | AllergenResponse): boolean {
  return allergen.sppgId !== null
}

/**
 * Get allergen display name (use localName if available, otherwise name)
 */
export function getAllergenDisplayName(allergen: Allergen | AllergenResponse): string {
  return allergen.localName || allergen.name
}

/**
 * Get category label in Indonesian
 */
export function getCategoryLabel(category: string | null): string {
  if (!category) return 'Lainnya'
  return ALLERGEN_CATEGORY_LABELS[category as AllergenCategory] || category
}

// === TYPE GUARDS ===

/**
 * Type guard to check if value is valid allergen category
 */
export function isValidAllergenCategory(value: string): value is AllergenCategory {
  return Object.values(ALLERGEN_CATEGORIES).includes(value as AllergenCategory)
}
