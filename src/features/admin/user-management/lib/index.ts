/**
 * @fileoverview User Management Utilities
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { UserRole, UserType } from '@prisma/client'
import type { UserListItem } from '../types'

/**
 * Format user display name
 */
export function formatUserDisplayName(user: Pick<UserListItem, 'name' | 'email'>): string {
  return user.name || user.email
}

/**
 * Get user initials from name
 */
export function getUserInitials(name: string | null): string {
  if (!name) return '??'
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Get status badge variant for user
 */
export function getUserStatusVariant(
  isActive: boolean,
  emailVerified: Date | null,
  lockedUntil: Date | null
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    return 'destructive' // Locked
  }
  
  if (!isActive) {
    return 'outline' // Inactive
  }
  
  if (!emailVerified) {
    return 'secondary' // Unverified
  }
  
  return 'default' // Active
}

/**
 * Get status label for user
 */
export function getUserStatusLabel(
  isActive: boolean,
  emailVerified: Date | null,
  lockedUntil: Date | null
): string {
  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    return 'Locked'
  }
  
  if (!isActive) {
    return 'Inactive'
  }
  
  if (!emailVerified) {
    return 'Unverified'
  }
  
  return 'Active'
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  if (role.startsWith('PLATFORM_')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  }
  
  if (role === 'SPPG_KEPALA' || role === 'SPPG_ADMIN') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }
  
  if (role.startsWith('SPPG_') && role.includes('MANAGER')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  
  if (role.startsWith('SPPG_STAFF_')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
  
  if (role === 'SPPG_VIEWER' || role === 'DEMO_USER') {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

/**
 * Get type badge color
 */
export function getTypeBadgeColor(type: UserType): string {
  switch (type) {
    case 'SUPERADMIN':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'SPPG_ADMIN':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'SPPG_USER':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'DEMO_REQUEST':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

/**
 * Format phone number to Indonesian format
 */
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '-'
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.startsWith('62')) {
    // +62 format
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`
  }
  
  if (cleaned.startsWith('0')) {
    // 0xxx format
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
  }
  
  return phone
}

/**
 * Format last login time
 */
export function formatLastLogin(lastLoginAt: Date | null): string {
  if (!lastLoginAt) return 'Never'
  
  const now = new Date()
  const loginDate = new Date(lastLoginAt)
  const diffMs = now.getTime() - loginDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  
  return loginDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format date time
 */
export function formatDateTime(date: Date | null): string {
  if (!date) return '-'
  
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format date only
 */
export function formatDate(date: Date | null): string {
  if (!date) return '-'
  
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Check if user is locked
 */
export function isUserLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false
  return new Date(lockedUntil) > new Date()
}

/**
 * Get locked remaining time
 */
export function getLockedRemainingTime(lockedUntil: Date | null): string {
  if (!lockedUntil) return ''
  
  const now = new Date()
  const lockDate = new Date(lockedUntil)
  const diffMs = lockDate.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Unlocked'
  
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  
  if (diffHours > 0) return `${diffHours} hours remaining`
  return `${diffMins} minutes remaining`
}

/**
 * Validate password strength
 */
export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []
  
  // Length check
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')
  
  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Add numbers')
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('Add special characters')
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score <= 2) strength = 'weak'
  else if (score <= 4) strength = 'medium'
  else if (score <= 6) strength = 'strong'
  else strength = 'very-strong'
  
  return { strength, score, feedback }
}

/**
 * Generate random password
 */
export function generateRandomPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  const allChars = lowercase + uppercase + numbers + symbols
  
  let password = ''
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Export users to CSV
 */
export function exportUsersToCSV(users: UserListItem[]): string {
  const headers = [
    'Email',
    'Name',
    'Role',
    'Type',
    'SPPG',
    'Status',
    'Email Verified',
    'Phone',
    'Last Login',
    'Created At'
  ]
  
  const rows = users.map(user => [
    user.email,
    user.name || '',
    user.userRole,
    user.userType,
    user.sppg?.name || '-',
    getUserStatusLabel(user.isActive, user.emailVerified, null),
    user.emailVerified ? 'Yes' : 'No',
    user.phone || '-',
    formatLastLogin(user.lastLoginAt),
    formatDate(user.createdAt)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text:', err)
    return false
  }
}
