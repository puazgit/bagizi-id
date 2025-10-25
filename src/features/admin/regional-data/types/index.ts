/**
 * @fileoverview Regional Data Types & Interfaces
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type {
  IndonesiaRegion,
  Timezone,
  RegencyType,
  VillageType
} from '@prisma/client'

// Re-export Prisma enum types
export type { IndonesiaRegion, Timezone, RegencyType, VillageType }

/**
 * Province entity (with Prisma enum types)
 */
export interface Province {
  id: string
  code: string
  name: string
  region: IndonesiaRegion
  timezone: Timezone
  createdAt?: Date
  updatedAt?: Date
  _count?: {
    regencies: number
    sppgs: number
  }
}

/**
 * Regency (Kabupaten/Kota) entity (with Prisma enum types)
 */
export interface Regency {
  id: string
  code: string
  name: string
  type: RegencyType
  provinceId: string
  province?: Province
  createdAt?: Date
  updatedAt?: Date
  _count?: {
    districts: number
    sppgs: number
  }
}

/**
 * District (Kecamatan) entity
 */
export interface District {
  id: string
  code: string
  name: string
  regencyId: string
  regency?: Regency & { province?: Province }
  createdAt?: Date
  updatedAt?: Date
  _count?: {
    villages: number
    sppgs: number
  }
}

/**
 * Village (Desa/Kelurahan) entity (with Prisma enum types)
 */
export interface Village {
  id: string
  code: string
  name: string
  type: VillageType
  postalCode?: string | null
  districtId: string
  district?: District & { 
    regency?: Regency & { 
      province?: Province 
    } 
  }
  createdAt?: Date
  updatedAt?: Date
  _count?: {
    sppgs: number
    employees: number
    schoolBeneficiary: number
  }
}

/**
 * Province list item for table display
 */
export interface ProvinceListItem extends Province {
  regencyCount: number
  regionLabel: string
  timezoneLabel: string
}

/**
 * Regency list item for table display
 */
export interface RegencyListItem extends Regency {
  provinceName: string
  districtCount: number
  typeLabel: string
}

/**
 * District list item for table display
 */
export interface DistrictListItem extends District {
  regencyName: string
  provinceName: string
  villageCount: number
}

/**
 * Village list item for table display
 */
export interface VillageListItem extends Village {
  districtName: string
  regencyName: string
  provinceName: string
  typeLabel: string
}

/**
 * Create province input (with Prisma enum types)
 */
export interface CreateProvinceInput {
  code: string
  name: string
  region: IndonesiaRegion
  timezone: Timezone
}

/**
 * Update province input
 */
export interface UpdateProvinceInput {
  code?: string
  name?: string
  region?: IndonesiaRegion
  timezone?: Timezone
}

/**
 * Create regency input (with Prisma enum types)
 */
export interface CreateRegencyInput {
  code: string
  name: string
  type: RegencyType
  provinceId: string
}

/**
 * Update regency input
 */
export interface UpdateRegencyInput {
  code?: string
  name?: string
  type?: RegencyType
  provinceId?: string
}

/**
 * Create district input
 */
export interface CreateDistrictInput {
  code: string
  name: string
  regencyId: string
}

/**
 * Update district input
 */
export interface UpdateDistrictInput {
  code?: string
  name?: string
  regencyId?: string
}

/**
 * Create village input (with Prisma enum types)
 */
export interface CreateVillageInput {
  code: string
  name: string
  type: VillageType
  postalCode?: string
  districtId: string
}

/**
 * Update village input
 */
export interface UpdateVillageInput {
  code?: string
  name?: string
  type?: VillageType
  postalCode?: string
  districtId?: string
}

/**
 * Regional data filters
 */
export interface RegionalFilters {
  search?: string
  provinceId?: string
  regencyId?: string
  districtId?: string
  page?: number
  limit?: number
  sortBy?: 'code' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

/**
 * Regional data statistics
 */
export interface RegionalStatistics {
  totalProvinces: number
  totalRegencies: number
  totalDistricts: number
  totalVillages: number
  lastUpdated: Date
}

/**
 * Cascade select option
 */
export interface CascadeOption {
  value: string
  label: string
  count?: number
}

// ============================================================================
// Enum Label Mappers
// ============================================================================

/**
 * Indonesia Region labels
 */
export const INDONESIA_REGION_LABELS: Record<IndonesiaRegion, string> = {
  SUMATERA: 'Sumatera',
  JAWA: 'Jawa',
  KALIMANTAN: 'Kalimantan',
  SULAWESI: 'Sulawesi',
  PAPUA: 'Papua',
  BALI_NUSRA: 'Bali & Nusa Tenggara',
  MALUKU: 'Maluku',
}

/**
 * Timezone labels
 */
export const TIMEZONE_LABELS: Record<Timezone, string> = {
  WIB: 'WIB (GMT+7)',
  WITA: 'WITA (GMT+8)',
  WIT: 'WIT (GMT+9)',
}

/**
 * Regency Type labels
 */
export const REGENCY_TYPE_LABELS: Record<RegencyType, string> = {
  REGENCY: 'Kabupaten',
  CITY: 'Kota',
}

/**
 * Village Type labels
 */
export const VILLAGE_TYPE_LABELS: Record<VillageType, string> = {
  URBAN_VILLAGE: 'Kelurahan',
  RURAL_VILLAGE: 'Desa',
}

/**
 * Get region label
 */
export function getRegionLabel(region: IndonesiaRegion): string {
  return INDONESIA_REGION_LABELS[region] || region
}

/**
 * Get timezone label
 */
export function getTimezoneLabel(timezone: Timezone): string {
  return TIMEZONE_LABELS[timezone] || timezone
}

/**
 * Get regency type label
 */
export function getRegencyTypeLabel(type: RegencyType): string {
  return REGENCY_TYPE_LABELS[type] || type
}

/**
 * Get village type label
 */
export function getVillageTypeLabel(type: VillageType): string {
  return VILLAGE_TYPE_LABELS[type] || type
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to format regional code
 */
export function formatRegionalCode(code: string): string {
  return code.replace(/(\d{2})(\d{2})?(\d{2})?(\d{4})?/, (match, p1, p2, p3, p4) => {
    const parts = [p1, p2, p3, p4].filter(Boolean)
    return parts.join('.')
  })
}

/**
 * Helper function to get regional level
 */
export function getRegionalLevel(code: string): 'province' | 'regency' | 'district' | 'village' {
  const cleaned = code.replace(/\D/g, '')
  if (cleaned.length === 2) return 'province'
  if (cleaned.length === 4) return 'regency'
  if (cleaned.length === 6) return 'district'
  return 'village'
}

/**
 * Helper function to validate regional code format
 */
export function isValidRegionalCode(code: string, level: 'province' | 'regency' | 'district' | 'village'): boolean {
  const cleaned = code.replace(/\D/g, '')
  
  switch (level) {
    case 'province':
      return cleaned.length === 2
    case 'regency':
      return cleaned.length === 4
    case 'district':
      return cleaned.length === 6
    case 'village':
      return cleaned.length === 10
    default:
      return false
  }
}

/**
 * Helper function to extract parent code
 */
export function getParentCode(code: string): string | null {
  const cleaned = code.replace(/\D/g, '')
  const level = getRegionalLevel(cleaned)
  
  switch (level) {
    case 'regency':
      return cleaned.substring(0, 2)
    case 'district':
      return cleaned.substring(0, 4)
    case 'village':
      return cleaned.substring(0, 6)
    default:
      return null
  }
}

/**
 * Helper function to build full location name
 */
export function buildFullLocationName(
  village?: string,
  district?: string,
  regency?: string,
  province?: string
): string {
  const parts = [village, district, regency, province].filter(Boolean)
  return parts.join(', ')
}
