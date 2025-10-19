/**
 * @fileoverview Safe Date Formatting Utilities
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Provides safe date formatting functions that handle null/undefined values
 * and invalid dates gracefully to prevent runtime errors.
 */

import { format as dateFnsFormat, type Locale } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

/**
 * Safely format a date with null/undefined handling
 * @param date - Date string, Date object, or null/undefined
 * @param formatStr - Format string (e.g., 'dd MMM yyyy')
 * @param options - Additional options including locale
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'dd MMM yyyy',
  options: { locale?: Locale; fallback?: string } = {}
): string {
  const { locale = localeId, fallback = '-' } = options

  try {
    if (!date) {
      return fallback
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date)
      return fallback
    }

    return dateFnsFormat(dateObj, formatStr, { locale })
  } catch (error) {
    console.error('Error formatting date:', date, error)
    return fallback
  }
}

/**
 * Safely format a datetime with time
 * @param date - Date string, Date object, or null/undefined
 * @param options - Additional options
 * @returns Formatted datetime string or fallback
 */
export function safeFormatDateTime(
  date: string | Date | null | undefined,
  options: { fallback?: string } = {}
): string {
  return safeFormatDate(date, 'dd MMM yyyy, HH:mm', {
    locale: localeId,
    fallback: options.fallback || '-'
  })
}

/**
 * Safely format time only
 * @param date - Date string, Date object, or null/undefined
 * @param options - Additional options
 * @returns Formatted time string or fallback
 */
export function safeFormatTime(
  date: string | Date | null | undefined,
  options: { fallback?: string } = {}
): string {
  return safeFormatDate(date, 'HH:mm', {
    locale: localeId,
    fallback: options.fallback || '-'
  })
}

/**
 * Safely format time with seconds
 * @param date - Date string, Date object, or null/undefined
 * @param options - Additional options
 * @returns Formatted time string or fallback
 */
export function safeFormatTimeWithSeconds(
  date: string | Date | null | undefined,
  options: { fallback?: string } = {}
): string {
  return safeFormatDate(date, 'HH:mm:ss', {
    locale: localeId,
    fallback: options.fallback || '-'
  })
}

/**
 * Safely format date with full month name
 * @param date - Date string, Date object, or null/undefined
 * @param options - Additional options
 * @returns Formatted date string or fallback
 */
export function safeFormatFullDate(
  date: string | Date | null | undefined,
  options: { fallback?: string } = {}
): string {
  return safeFormatDate(date, 'dd MMMM yyyy', {
    locale: localeId,
    fallback: options.fallback || '-'
  })
}

/**
 * Safely format date with day name
 * @param date - Date string, Date object, or null/undefined
 * @param options - Additional options
 * @returns Formatted date string or fallback
 */
export function safeFormatDateWithDay(
  date: string | Date | null | undefined,
  options: { fallback?: string } = {}
): string {
  return safeFormatDate(date, 'EEEE, dd MMMM yyyy', {
    locale: localeId,
    fallback: options.fallback || '-'
  })
}

/**
 * Check if a date value is valid
 * @param date - Date string, Date object, or null/undefined
 * @returns True if date is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return !isNaN(dateObj.getTime())
  } catch {
    return false
  }
}
