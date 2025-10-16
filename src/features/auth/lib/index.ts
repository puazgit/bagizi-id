/**
 * @fileoverview Authentication utilities for enterprise security
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */


import type { ExtendedSession } from '../types'

/**
 * Generate secure device fingerprint for authentication tracking
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server'
  
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Bagizi-ID Security Check', 2, 2)
    }
    
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency?.toString() || 'unknown',
      navigator.platform,
      navigator.cookieEnabled ? 'cookies' : 'no-cookies'
    ]
    
    return btoa(components.join('|')).substring(0, 32)
  } catch (error) {
    console.warn('Device fingerprinting failed:', error)
    return 'fallback-' + Date.now().toString(36)
  }
}

/**
 * Validate email domain for enterprise security
 */
export function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  
  const allowedDomains = [
    'sppg.id', 'gov.id', 'pemkot.id', 'pemkab.id', 'pemprov.id',
    'kemkes.go.id', 'kemensos.go.id', 'gmail.com', 'outlook.com'
  ]
  
  return allowedDomains.includes(domain) || domain.endsWith('.go.id')
}

/**
 * Calculate password strength with enterprise requirements
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0
  
  let strength = 0
  const checks = [
    /[a-z]/.test(password), // lowercase
    /[A-Z]/.test(password), // uppercase  
    /\d/.test(password),    // numbers
    /[^A-Za-z0-9]/.test(password), // special chars
    password.length >= 8,   // minimum length
    password.length >= 12,  // strong length
    /(.)\1{2,}/.test(password) === false, // no repetition
    !/123|abc|qwe|password|admin/.test(password.toLowerCase()), // no common patterns
  ]
  
  strength = checks.filter(Boolean).length
  return Math.min((strength / 8) * 100, 100)
}

/**
 * Get password strength description
 */
export function getPasswordStrengthDescription(strength: number): {
  color: string
  text: string
  bgColor: string
} {
  if (strength < 25) return { color: 'destructive', text: 'Sangat Lemah', bgColor: 'bg-red-600' }
  if (strength < 50) return { color: 'destructive', text: 'Lemah', bgColor: 'bg-red-500' }
  if (strength < 70) return { color: 'warning', text: 'Sedang', bgColor: 'bg-yellow-500' }
  if (strength < 85) return { color: 'info', text: 'Baik', bgColor: 'bg-blue-500' }
  return { color: 'success', text: 'Sangat Kuat', bgColor: 'bg-green-500' }
}

/**
 * Format user role for display
 */
export function formatUserRole(role: string): string {
  const roleMap: Record<string, string> = {
    'PLATFORM_SUPERADMIN': 'Super Administrator',
    'PLATFORM_SUPPORT': 'Platform Support',
    'PLATFORM_ANALYST': 'Platform Analyst',
    'SPPG_KEPALA': 'Kepala SPPG',
    'SPPG_ADMIN': 'Administrator SPPG',
    'SPPG_AHLI_GIZI': 'Ahli Gizi',
    'SPPG_AKUNTAN': 'Akuntan',
    'SPPG_PRODUKSI_MANAGER': 'Manager Produksi',
    'SPPG_DISTRIBUSI_MANAGER': 'Manager Distribusi',
    'SPPG_HRD_MANAGER': 'Manager HRD',
    'SPPG_STAFF_DAPUR': 'Staff Dapur',
    'SPPG_STAFF_DISTRIBUSI': 'Staff Distribusi',
    'SPPG_STAFF_ADMIN': 'Staff Admin',
    'SPPG_STAFF_QC': 'Staff Quality Control',
    'SPPG_VIEWER': 'Viewer',
    'DEMO_USER': 'Demo User'
  }
  
  return roleMap[role] || role
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: ExtendedSession['user'], permission: string): boolean {
  if (!user?.userRole) return false
  
  // Define role-permission mapping
  const rolePermissions: Record<string, string[]> = {
    'PLATFORM_SUPERADMIN': ['*'], // All permissions
    'PLATFORM_SUPPORT': ['read', 'reports.view'],
    'PLATFORM_ANALYST': ['read', 'analytics.view'],
    'SPPG_KEPALA': [
      'read', 'write', 'delete', 'approve',
      'menu.manage', 'procurement.manage', 
      'production.manage', 'distribution.manage',
      'financial.manage', 'hr.manage'
    ],
    'SPPG_ADMIN': [
      'read', 'write', 'menu.manage', 
      'procurement.manage', 'user.manage'
    ],
    'SPPG_AHLI_GIZI': [
      'read', 'write', 'menu.manage', 
      'quality.manage'
    ],
    'SPPG_AKUNTAN': [
      'read', 'write', 'financial.manage', 
      'procurement.manage'
    ],
    'SPPG_PRODUKSI_MANAGER': [
      'read', 'write', 'production.manage', 
      'quality.manage'
    ],
    'SPPG_DISTRIBUSI_MANAGER': [
      'read', 'write', 'distribution.manage'
    ],
    'SPPG_STAFF_DAPUR': ['read', 'production.execute'],
    'SPPG_STAFF_DISTRIBUSI': ['read', 'distribution.execute'],
    'SPPG_STAFF_QC': ['read', 'quality.execute'],
    'SPPG_VIEWER': ['read'],
    'DEMO_USER': ['read', 'demo.*']
  }
  
  const userPermissions = rolePermissions[user.userRole] || []
  return userPermissions.includes('*') || 
         userPermissions.includes(permission) ||
         userPermissions.some(p => p.endsWith('.*') && permission.startsWith(p.slice(0, -2)))
}

/**
 * Check if user can access SPPG feature
 */
export function canAccessSppgFeature(user: ExtendedSession['user'], feature: string): boolean {
  if (!user?.sppgId) return false
  return hasPermission(user, `${feature}.manage`) || hasPermission(user, `${feature}.view`)
}

/**
 * Get user's redirect URL based on role
 */
export function getUserRedirectUrl(user: ExtendedSession['user']): string {
  if (!user) return '/login'
  
  // Platform admin goes to admin dashboard
  if (user.userRole?.startsWith('PLATFORM_')) {
    return '/admin'
  }
  
  // SPPG users go to SPPG dashboard
  if (user.sppgId && user.userRole?.startsWith('SPPG_')) {
    return '/dashboard'
  }
  
  // Demo users go to demo dashboard
  if (user.userType === 'DEMO_REQUEST' || user.userRole === 'DEMO_USER') {
    return '/demo'
  }
  
  // Default fallback
  return '/dashboard'
}

/**
 * Generate secure session token for additional security
 */
export function generateSecurityToken(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    // Fallback for server-side
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate timezone for security consistency
 */
export function validateTimezone(timezone: string): boolean {
  try {
    // Check if timezone is valid
    Intl.DateTimeFormat('en', { timeZone: timezone })
    
    // Allow Indonesian timezones for SPPG context
    const allowedTimezones = [
      'Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura',
      'Asia/Pontianak', 'UTC'
    ]
    
    return allowedTimezones.includes(timezone)
  } catch {
    return false
  }
}

/**
 * Sanitize user input for security
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous chars
    .substring(0, 500) // Limit length
}

/**
 * Check if login attempt should be rate limited
 */
export function shouldRateLimit(attempts: number, timeWindow: number): boolean {
  // Allow 5 attempts per 15 minutes
  const maxAttempts = 5
  const windowMs = 15 * 60 * 1000 // 15 minutes
  
  return attempts >= maxAttempts && timeWindow < windowMs
}

/**
 * Format last login time for display
 */
export function formatLastLogin(date: Date | null): string {
  if (!date) return 'Belum pernah login'
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays} hari yang lalu`
  if (diffHours > 0) return `${diffHours} jam yang lalu`
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  return `${diffMinutes} menit yang lalu`
}

/**
 * Export all utilities
 */
export const authUtils = {
  generateDeviceFingerprint,
  validateEmailDomain,
  calculatePasswordStrength,
  getPasswordStrengthDescription,
  formatUserRole,
  hasPermission,
  canAccessSppgFeature,
  getUserRedirectUrl,
  generateSecurityToken,
  validateTimezone,
  sanitizeInput,
  shouldRateLimit,
  formatLastLogin
}