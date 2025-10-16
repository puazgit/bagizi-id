/**
 * @fileoverview Authentication utilities and helper functions
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Authentication Guidelines
 */

import type { UserRole } from '@prisma/client'

/**
 * Role hierarchy mapping for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
export const roleHierarchy: Record<UserRole, number> = {
  // Platform Level (Highest)
  PLATFORM_SUPERADMIN: 100,
  PLATFORM_SUPPORT: 90,
  PLATFORM_ANALYST: 80,
  
  // SPPG Management Level
  SPPG_KEPALA: 70,
  SPPG_ADMIN: 60,
  
  // SPPG Specialist Level
  SPPG_AHLI_GIZI: 50,
  SPPG_AKUNTAN: 50,
  SPPG_PRODUKSI_MANAGER: 50,
  SPPG_DISTRIBUSI_MANAGER: 50,
  SPPG_HRD_MANAGER: 50,
  
  // SPPG Staff Level
  SPPG_STAFF_DAPUR: 30,
  SPPG_STAFF_DISTRIBUSI: 30,
  SPPG_STAFF_ADMIN: 30,
  SPPG_STAFF_QC: 30,
  
  // Limited Access
  SPPG_VIEWER: 10,
  DEMO_USER: 5,
}

/**
 * Permission mapping for each role
 */
export const rolePermissions: Record<UserRole, string[]> = {
  // Platform Level
  PLATFORM_SUPERADMIN: [
    'platform:*',
    'admin:*', 
    'sppg:*',
    'billing:*',
    'analytics:*',
    'users:*',
  ],
  PLATFORM_SUPPORT: [
    'admin:read',
    'sppg:read',
    'sppg:support',
    'billing:read',
    'users:support',
  ],
  PLATFORM_ANALYST: [
    'admin:read',
    'analytics:*',
    'reports:platform',
  ],
  
  // SPPG Management
  SPPG_KEPALA: [
    'sppg:*',
    'menu:*',
    'procurement:*',
    'production:*',
    'distribution:*',
    'inventory:*',
    'hrd:*',
    'reports:*',
    'settings:*',
    'financial:*',
  ],
  SPPG_ADMIN: [
    'sppg:manage',
    'menu:*',
    'procurement:*',
    'production:manage',
    'distribution:manage',
    'inventory:*',
    'hrd:manage',
    'reports:*',
    'users:manage',
  ],
  
  // SPPG Specialists
  SPPG_AHLI_GIZI: [
    'menu:*',
    'nutrition:*',
    'quality:*',
    'reports:nutrition',
  ],
  SPPG_AKUNTAN: [
    'financial:*',
    'procurement:*',
    'billing:manage',
    'reports:financial',
  ],
  SPPG_PRODUKSI_MANAGER: [
    'production:*',
    'inventory:manage',
    'quality:*',
    'reports:production',
  ],
  SPPG_DISTRIBUSI_MANAGER: [
    'distribution:*',
    'inventory:read',
    'reports:distribution',
  ],
  SPPG_HRD_MANAGER: [
    'hrd:*',
    'users:manage',
    'reports:hrd',
  ],
  
  // SPPG Staff
  SPPG_STAFF_DAPUR: [
    'production:execute',
    'menu:read',
    'inventory:read',
    'quality:execute',
  ],
  SPPG_STAFF_DISTRIBUSI: [
    'distribution:execute',
    'inventory:read',
  ],
  SPPG_STAFF_ADMIN: [
    'sppg:read',
    'reports:basic',
    'data:entry',
  ],
  SPPG_STAFF_QC: [
    'quality:*',
    'production:read',
    'reports:quality',
  ],
  
  // Limited Access
  SPPG_VIEWER: [
    'sppg:read',
    'reports:view',
  ],
  DEMO_USER: [
    'demo:*',
    'sppg:demo',
    'menu:demo',
  ],
}

/**
 * SPPG role categories for easier grouping
 */
export const sppgRoleCategories = {
  management: ['SPPG_KEPALA', 'SPPG_ADMIN'] as UserRole[],
  specialist: [
    'SPPG_AHLI_GIZI',
    'SPPG_AKUNTAN', 
    'SPPG_PRODUKSI_MANAGER',
    'SPPG_DISTRIBUSI_MANAGER',
    'SPPG_HRD_MANAGER'
  ] as UserRole[],
  staff: [
    'SPPG_STAFF_DAPUR',
    'SPPG_STAFF_DISTRIBUSI', 
    'SPPG_STAFF_ADMIN',
    'SPPG_STAFF_QC'
  ] as UserRole[],
  limited: ['SPPG_VIEWER'] as UserRole[],
  demo: ['DEMO_USER'] as UserRole[],
}

/**
 * Platform role categories
 */
export const platformRoleCategories = {
  admin: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_ANALYST'] as UserRole[],
}

/**
 * Check if role has specific permission
 * 
 * @param role - User role to check
 * @param permission - Permission string (e.g., 'menu:create', 'sppg:*')
 * @returns {boolean} Whether role has permission
 * 
 * @example
 * hasPermission('SPPG_ADMIN', 'menu:create') // true
 * hasPermission('SPPG_VIEWER', 'menu:create') // false
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role] || []
  
  // Check exact permission match
  if (permissions.includes(permission)) {
    return true
  }
  
  // Check wildcard permissions
  const [resource] = permission.split(':')
  if (permissions.includes(`${resource}:*`)) {
    return true
  }
  
  // Check global wildcard
  if (permissions.includes('*') || permissions.includes('platform:*')) {
    return true
  }
  
  return false
}

/**
 * Check if role has any of the specified permissions
 * 
 * @param role - User role to check
 * @param permissions - Array of permission strings
 * @returns {boolean} Whether role has any of the permissions
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if role has all specified permissions
 * 
 * @param role - User role to check
 * @param permissions - Array of permission strings
 * @returns {boolean} Whether role has all permissions
 */
export function hasAllPermissions(role: UserRole, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 * 
 * @param role - User role
 * @returns {string[]} Array of permission strings
 */
export function getRolePermissions(role: UserRole): string[] {
  return rolePermissions[role] || []
}

/**
 * Check if role is in specific category
 * 
 * @param role - User role to check
 * @param category - Category to check ('management', 'specialist', 'staff', etc.)
 * @returns {boolean} Whether role is in category
 */
export function isRoleInCategory(role: UserRole, category: keyof typeof sppgRoleCategories): boolean {
  return sppgRoleCategories[category]?.includes(role) || false
}

/**
 * Check if role is SPPG role (any SPPG-related role)
 * 
 * @param role - User role to check
 * @returns {boolean} Whether role is SPPG role
 */
export function isSppgRole(role: UserRole): boolean {
  const allSppgRoles = [
    ...sppgRoleCategories.management,
    ...sppgRoleCategories.specialist,
    ...sppgRoleCategories.staff,
    ...sppgRoleCategories.limited,
    ...sppgRoleCategories.demo,
  ]
  
  return allSppgRoles.includes(role)
}

/**
 * Check if role is platform role
 * 
 * @param role - User role to check
 * @returns {boolean} Whether role is platform role
 */
export function isPlatformRole(role: UserRole): boolean {
  return platformRoleCategories.admin.includes(role)
}

/**
 * Get role hierarchy level for permission comparison
 * 
 * @param role - User role
 * @returns {number} Hierarchy level (higher = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  return roleHierarchy[role] || 0
}

/**
 * Check if one role has higher or equal permissions than another
 * 
 * @param role1 - First role to compare
 * @param role2 - Second role to compare  
 * @returns {boolean} Whether role1 >= role2 in hierarchy
 */
export function roleHasHigherOrEqualAccess(role1: UserRole, role2: UserRole): boolean {
  return getRoleLevel(role1) >= getRoleLevel(role2)
}

/**
 * Get user display name based on role and context
 * 
 * @param role - User role
 * @returns {string} Human-readable role name in Indonesian
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    PLATFORM_SUPERADMIN: 'Super Administrator Platform',
    PLATFORM_SUPPORT: 'Tim Dukungan Platform',
    PLATFORM_ANALYST: 'Analis Platform',
    
    SPPG_KEPALA: 'Kepala SPPG',
    SPPG_ADMIN: 'Administrator SPPG',
    
    SPPG_AHLI_GIZI: 'Ahli Gizi',
    SPPG_AKUNTAN: 'Akuntan',
    SPPG_PRODUKSI_MANAGER: 'Manajer Produksi',
    SPPG_DISTRIBUSI_MANAGER: 'Manajer Distribusi',
    SPPG_HRD_MANAGER: 'Manajer SDM',
    
    SPPG_STAFF_DAPUR: 'Staff Dapur',
    SPPG_STAFF_DISTRIBUSI: 'Staff Distribusi',
    SPPG_STAFF_ADMIN: 'Staff Administrasi',
    SPPG_STAFF_QC: 'Staff Quality Control',
    
    SPPG_VIEWER: 'Pengamat',
    DEMO_USER: 'Pengguna Demo',
  }
  
  return roleNames[role] || role
}

/**
 * Get default redirect path for user role
 * 
 * @param role - User role
 * @returns {string} Default path to redirect after login
 */
export function getDefaultRedirectPath(role: UserRole): string {
  if (isPlatformRole(role)) {
    return '/admin'
  }
  
  if (isSppgRole(role)) {
    return '/dashboard'
  }
  
  return '/'
}

/**
 * Validate role transition (for role updates)
 * 
 * @param fromRole - Current role
 * @param toRole - Target role  
 * @param currentUserRole - Role of user making the change
 * @returns {boolean} Whether transition is allowed
 */
export function canChangeRole(
  fromRole: UserRole, 
  toRole: UserRole, 
  currentUserRole: UserRole
): boolean {
  const currentUserLevel = getRoleLevel(currentUserRole)
  const fromRoleLevel = getRoleLevel(fromRole)
  const toRoleLevel = getRoleLevel(toRole)
  
  // Can only change roles if current user has higher access than both roles
  return currentUserLevel > Math.max(fromRoleLevel, toRoleLevel)
}

/**
 * Route access configuration
 */
export const routeAccess = {
  // Public routes (no auth required)
  public: ['/', '/features', '/pricing', '/blog', '/case-studies'],
  
  // Auth routes (redirect if authenticated)
  auth: ['/login', '/register', '/demo-request'],
  
  // Admin routes (platform roles only) - Layer 3
  admin: ['/admin'],
  
  // SPPG routes (SPPG roles only) - Layer 2
  sppg: ['/dashboard', '/menu', '/procurement', '/production', '/distribution', '/inventory', '/hrd', '/reports', '/settings'],
  
  // Demo routes (demo users only)
  demo: ['/demo'],
}

/**
 * Check if path requires authentication
 * 
 * @param pathname - Route pathname
 * @returns {boolean} Whether path requires auth
 */
export function requiresAuth(pathname: string): boolean {
  return !routeAccess.public.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  ) && !routeAccess.auth.includes(pathname)
}

/**
 * Check if path is admin route
 * 
 * @param pathname - Route pathname
 * @returns {boolean} Whether path is admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return routeAccess.admin.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

/**
 * Check if path is SPPG route
 * 
 * @param pathname - Route pathname
 * @returns {boolean} Whether path is SPPG route
 */
export function isSppgRoute(pathname: string): boolean {
  return routeAccess.sppg.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

/**
 * Audit log helper for authentication events
 */
export const auditEvents = {
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGOUT: 'auth.logout',
  ROLE_CHANGED: 'auth.role.changed',
  PERMISSION_DENIED: 'auth.permission.denied',
  SESSION_EXPIRED: 'auth.session.expired',
} as const

export type AuditEvent = typeof auditEvents[keyof typeof auditEvents]