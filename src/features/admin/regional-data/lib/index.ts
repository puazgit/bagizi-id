/**
 * @fileoverview Regional Data Utility Functions
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type {
  Province,
  Regency,
  District,
  Village,
  CascadeOption
} from '../types'

/**
 * Format regional code with dots (e.g., 32.01.01.2001)
 */
export function formatRegionalCode(code: string): string {
  const cleaned = code.replace(/\D/g, '')
  
  if (cleaned.length === 2) {
    // Province: 32
    return cleaned
  } else if (cleaned.length === 4) {
    // Regency: 32.01
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 4)}`
  } else if (cleaned.length === 6) {
    // District: 32.01.01
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 4)}.${cleaned.substring(4, 6)}`
  } else if (cleaned.length === 10) {
    // Village: 32.01.01.2001
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 4)}.${cleaned.substring(4, 6)}.${cleaned.substring(6, 10)}`
  }
  
  return code
}

/**
 * Parse formatted code back to plain number
 */
export function parseRegionalCode(formattedCode: string): string {
  return formattedCode.replace(/\D/g, '')
}

/**
 * Get regional level from code
 */
export function getRegionalLevel(code: string): 'province' | 'regency' | 'district' | 'village' {
  const cleaned = code.replace(/\D/g, '')
  
  if (cleaned.length === 2) return 'province'
  if (cleaned.length === 4) return 'regency'
  if (cleaned.length === 6) return 'district'
  return 'village'
}

/**
 * Validate regional code format
 */
export function isValidRegionalCode(
  code: string,
  level: 'province' | 'regency' | 'district' | 'village'
): boolean {
  const cleaned = code.replace(/\D/g, '')
  
  switch (level) {
    case 'province':
      return cleaned.length === 2 && /^\d{2}$/.test(cleaned)
    case 'regency':
      return cleaned.length === 4 && /^\d{4}$/.test(cleaned)
    case 'district':
      return cleaned.length === 6 && /^\d{6}$/.test(cleaned)
    case 'village':
      return cleaned.length === 10 && /^\d{10}$/.test(cleaned)
    default:
      return false
  }
}

/**
 * Extract parent code from regional code
 */
export function getParentCode(code: string): string | null {
  const cleaned = code.replace(/\D/g, '')
  const level = getRegionalLevel(cleaned)
  
  switch (level) {
    case 'regency':
      return cleaned.substring(0, 2) // Get province code
    case 'district':
      return cleaned.substring(0, 4) // Get regency code
    case 'village':
      return cleaned.substring(0, 6) // Get district code
    default:
      return null
  }
}

/**
 * Build full location name (hierarchical)
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

/**
 * Get region type label in Indonesian
 */
export function getRegionTypeLabel(level: 'province' | 'regency' | 'district' | 'village'): string {
  const labels = {
    province: 'Provinsi',
    regency: 'Kabupaten/Kota',
    district: 'Kecamatan',
    village: 'Desa/Kelurahan'
  }
  
  return labels[level]
}

/**
 * Get short region type label
 */
export function getShortRegionLabel(level: 'province' | 'regency' | 'district' | 'village'): string {
  const labels = {
    province: 'Prov.',
    regency: 'Kab/Kota',
    district: 'Kec.',
    village: 'Desa/Kel.'
  }
  
  return labels[level]
}

/**
 * Convert entities to cascade options
 */
export function toProvinceOptions(provinces: Province[]): CascadeOption[] {
  return provinces.map(p => ({
    value: p.id,
    label: p.name,
    count: p._count?.regencies
  }))
}

export function toRegencyOptions(regencies: Regency[]): CascadeOption[] {
  return regencies.map(r => ({
    value: r.id,
    label: r.name,
    count: r._count?.districts
  }))
}

export function toDistrictOptions(districts: District[]): CascadeOption[] {
  return districts.map(d => ({
    value: d.id,
    label: d.name,
    count: d._count?.villages
  }))
}

export function toVillageOptions(villages: Village[]): CascadeOption[] {
  return villages.map(v => ({
    value: v.id,
    label: v.name
  }))
}

/**
 * Format location display with code
 */
export function formatLocationWithCode(name: string, code: string): string {
  return `${name} (${formatRegionalCode(code)})`
}

/**
 * Search/filter locations by name or code
 */
export function filterLocations<T extends { name: string; code: string }>(
  items: T[],
  searchTerm: string
): T[] {
  if (!searchTerm) return items
  
  const term = searchTerm.toLowerCase().trim()
  
  return items.filter(item => 
    item.name.toLowerCase().includes(term) ||
    item.code.includes(term.replace(/\D/g, ''))
  )
}

/**
 * Sort locations by code or name
 */
export function sortLocations<T extends { name: string; code: string }>(
  items: T[],
  sortBy: 'code' | 'name' = 'code',
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'code') {
      return a.code.localeCompare(b.code)
    } else {
      return a.name.localeCompare(b.name, 'id-ID')
    }
  })
  
  return order === 'desc' ? sorted.reverse() : sorted
}

/**
 * Group regencies by type (Kabupaten vs Kota)
 */
export function groupRegenciesByType(regencies: Regency[]): {
  kabupaten: Regency[]
  kota: Regency[]
} {
  const kabupaten: Regency[] = []
  const kota: Regency[] = []
  
  regencies.forEach(regency => {
    if (regency.name.toLowerCase().startsWith('kota ')) {
      kota.push(regency)
    } else {
      kabupaten.push(regency)
    }
  })
  
  return { kabupaten, kota }
}

/**
 * Calculate statistics summary
 */
export function calculateRegionalSummary(data: {
  provinces: number
  regencies: number
  districts: number
  villages: number
}) {
  return {
    ...data,
    avgRegenciesPerProvince: data.provinces > 0 
      ? Math.round(data.regencies / data.provinces) 
      : 0,
    avgDistrictsPerRegency: data.regencies > 0 
      ? Math.round(data.districts / data.regencies) 
      : 0,
    avgVillagesPerDistrict: data.districts > 0 
      ? Math.round(data.villages / data.districts) 
      : 0
  }
}

/**
 * Validate code hierarchy
 * Ensures child code starts with parent code
 */
export function validateCodeHierarchy(childCode: string, parentCode: string): boolean {
  const cleanChild = childCode.replace(/\D/g, '')
  const cleanParent = parentCode.replace(/\D/g, '')
  
  return cleanChild.startsWith(cleanParent)
}

/**
 * Generate next code in sequence
 * Useful for auto-generating codes
 */
export function generateNextCode(
  existingCodes: string[],
  parentCode: string,
  level: 'regency' | 'district' | 'village'
): string {
  const cleanParent = parentCode.replace(/\D/g, '')
  
  // Filter codes that start with parent code
  const childCodes = existingCodes
    .map(c => c.replace(/\D/g, ''))
    .filter(c => c.startsWith(cleanParent))
  
  if (childCodes.length === 0) {
    // First child
    switch (level) {
      case 'regency':
        return `${cleanParent}01` // 32 -> 3201
      case 'district':
        return `${cleanParent}01` // 3201 -> 320101
      case 'village':
        return `${cleanParent}0001` // 320101 -> 3201010001
    }
  }
  
  // Find highest existing code and increment
  const lastCode = childCodes.sort().pop() || cleanParent
  const sequenceLength = level === 'village' ? 4 : 2
  const sequence = parseInt(lastCode.substring(cleanParent.length), 10) + 1
  const nextSequence = sequence.toString().padStart(sequenceLength, '0')
  
  return `${cleanParent}${nextSequence}`
}

/**
 * Export regional data to CSV
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
): void {
  // Create CSV header
  const csvHeader = headers.map(h => h.label).join(',')
  
  // Create CSV rows
  const csvRows = data.map(row => 
    headers.map(h => {
      const value = row[h.key]
      // Escape commas and quotes
      const escaped = String(value).replace(/"/g, '""')
      return `"${escaped}"`
    }).join(',')
  )
  
  // Combine header and rows
  const csv = [csvHeader, ...csvRows].join('\n')
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return formatDate(d)
}
