/**
 * @fileoverview SPPG Management Enum Helpers
 * Helper functions to convert enum values to display labels
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { OrganizationType, SppgStatus, Timezone } from '@prisma/client'

/**
 * Organization Type Labels
 */
export const organizationTypeLabels: Record<OrganizationType, string> = {
  PEMERINTAH: 'Pemerintah',
  SWASTA: 'Swasta',
  YAYASAN: 'Yayasan',
  KOMUNITAS: 'Komunitas',
  LAINNYA: 'Lainnya',
}

/**
 * SPPG Status Labels and Variants
 */
export const sppgStatusConfig: Record<SppgStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}> = {
  ACTIVE: {
    label: 'Aktif',
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600',
  },
  INACTIVE: {
    label: 'Tidak Aktif',
    variant: 'secondary',
    className: 'bg-gray-500 hover:bg-gray-600',
  },
  SUSPENDED: {
    label: 'Ditangguhkan',
    variant: 'destructive',
    className: 'bg-red-500 hover:bg-red-600',
  },
  PENDING_APPROVAL: {
    label: 'Menunggu Persetujuan',
    variant: 'outline',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  TERMINATED: {
    label: 'Dihentikan',
    variant: 'destructive',
    className: 'bg-black hover:bg-gray-900',
  },
}

/**
 * Timezone Labels
 */
export const timezoneLabels: Record<Timezone, string> = {
  WIB: 'WIB (UTC+7)',
  WITA: 'WITA (UTC+8)',
  WIT: 'WIT (UTC+9)',
}

/**
 * Get organization type label
 */
export function getOrganizationTypeLabel(type: OrganizationType): string {
  return organizationTypeLabels[type] || type
}

/**
 * Get SPPG status configuration
 */
export function getSppgStatusConfig(status: SppgStatus) {
  return sppgStatusConfig[status] || sppgStatusConfig.INACTIVE
}

/**
 * Get SPPG status label
 */
export function getSppgStatusLabel(status: SppgStatus): string {
  return sppgStatusConfig[status]?.label || status
}

/**
 * Get timezone label
 */
export function getTimezoneLabel(timezone: Timezone): string {
  return timezoneLabels[timezone] || timezone
}
