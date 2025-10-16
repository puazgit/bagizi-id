/**
 * @fileoverview Menu Planning Utility Functions
 * @version Next.js 15.5.4
 * @see {@link /docs/copilot-instructions.md} Utility patterns
 */

import { MenuPlanStatus, MealType } from '@prisma/client'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for className merging (shadcn/ui pattern)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get status badge color
 */
export function getStatusColor(status: MenuPlanStatus): string {
  const colors: Record<MenuPlanStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    PENDING_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    REVIEWED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    PUBLISHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    COMPLETED: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
    ARCHIVED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  }
  return colors[status] || colors.DRAFT
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: MenuPlanStatus): string {
  const labels: Record<MenuPlanStatus, string> = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Menunggu Review',
    REVIEWED: 'Di-review',
    PENDING_APPROVAL: 'Menunggu Persetujuan',
    APPROVED: 'Disetujui',
    PUBLISHED: 'Dipublikasikan',
    ACTIVE: 'Aktif',
    COMPLETED: 'Selesai',
    ARCHIVED: 'Diarsipkan',
    CANCELLED: 'Dibatalkan',
  }
  return labels[status] || status
}

/**
 * Get meal type label in Indonesian
 */
export function getMealTypeLabel(mealType: MealType): string {
  const labels: Record<MealType, string> = {
    SARAPAN: 'Sarapan',
    MAKAN_SIANG: 'Makan Siang',
    SNACK_PAGI: 'Snack Pagi',
    SNACK_SORE: 'Snack Sore',
    MAKAN_MALAM: 'Makan Malam',
  }
  return labels[mealType] || mealType
}

/**
 * Get meal type icon
 */
export function getMealTypeIcon(mealType: MealType): string {
  const icons: Record<MealType, string> = {
    SARAPAN: '🌅',
    MAKAN_SIANG: '�',
    SNACK_PAGI: '🍪',
    SNACK_SORE: '☕',
    MAKAN_MALAM: '🌙',
  }
  return icons[mealType] || '🍽️'
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Calculate date range in days
 */
export function calculateDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end dates
}

/**
 * Generate array of dates between start and end
 */
export function getDateRange(startDate: Date | string, endDate: Date | string): Date[] {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  const dates: Date[] = []
  const currentDate = new Date(start)
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * Check if date is within range
 */
export function isDateInRange(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  return checkDate >= start && checkDate <= end
}

/**
 * Get day of week in Indonesian
 */
export function getDayOfWeek(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[dateObj.getDay()]
}

/**
 * Calculate coverage percentage
 */
export function calculateCoverage(assigned: number, total: number): number {
  if (total === 0) return 0
  return Math.round((assigned / total) * 100)
}

/**
 * Format nutrition value
 */
export function formatNutrition(value: number, unit: string): string {
  return `${Math.round(value)}${unit}`
}

/**
 * Get variety score color
 */
export function getVarietyScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600 dark:text-green-400'
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

/**
 * Get compliance rate color
 */
export function getComplianceRateColor(rate: number): string {
  if (rate >= 90) return 'text-green-600 dark:text-green-400'
  if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Check if plan can be edited
 */
export function canEditPlan(status: MenuPlanStatus): boolean {
  return ['DRAFT', 'PENDING_REVIEW'].includes(status)
}

/**
 * Check if plan can be deleted
 */
export function canDeletePlan(status: MenuPlanStatus): boolean {
  return ['DRAFT', 'PENDING_REVIEW'].includes(status)
}

/**
 * Check if plan can be submitted
 */
export function canSubmitPlan(status: MenuPlanStatus): boolean {
  return ['DRAFT', 'REVIEWED'].includes(status)
}

/**
 * Check if plan can be approved
 */
export function canApprovePlan(status: MenuPlanStatus): boolean {
  return status === 'PENDING_APPROVAL'
}

/**
 * Check if plan can be published
 */
export function canPublishPlan(status: MenuPlanStatus): boolean {
  return status === 'APPROVED'
}

/**
 * Sort meal types in order
 */
export function sortMealTypes(mealTypes: MealType[]): MealType[] {
  const order: Record<MealType, number> = {
    SARAPAN: 1,
    SNACK_PAGI: 2,
    MAKAN_SIANG: 3,
    SNACK_SORE: 4,
    MAKAN_MALAM: 5,
  }
  return mealTypes.sort((a, b) => order[a] - order[b])
}
