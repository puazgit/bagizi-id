/**
 * @fileoverview Authentication module exports
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

// Auth hooks
export {
  useAuth,
  useRequireAuth,
  useRequireRole,
  useRequireSppg,
  type UseAuthReturn,
} from './use-auth'

// Auth utilities  
export {
  roleHierarchy,
  rolePermissions,
  sppgRoleCategories,
  platformRoleCategories,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isRoleInCategory,
  isSppgRole,
  isPlatformRole,
  getRoleLevel,
  roleHasHigherOrEqualAccess,
  getRoleDisplayName,
  getDefaultRedirectPath,
  canChangeRole,
  routeAccess,
  requiresAuth,
  isAdminRoute,
  isSppgRoute,
  auditEvents,
  type AuditEvent,
} from '../lib/auth-utils'

// Re-export Auth.js types for convenience
export type { Session } from 'next-auth'
export type { UserRole, UserType } from '@prisma/client'