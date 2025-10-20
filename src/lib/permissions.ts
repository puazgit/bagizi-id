/**
 * @fileoverview RBAC Permissions Helper Functions
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Security Guidelines
 * 
 * ENTERPRISE SECURITY:
 * - Role-based access control (RBAC)
 * - Multi-tenant data isolation
 * - SPPG access verification
 * - Fine-grained permissions
 */

import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'

// ================================ PERMISSION TYPES ================================

export type PermissionType =
  | 'ALL'
  | 'READ'
  | 'WRITE'
  | 'DELETE'
  | 'APPROVE'
  | 'MENU_MANAGE'
  | 'SCHOOL_MANAGE'
  | 'PROCUREMENT_MANAGE'
  | 'PRODUCTION_MANAGE'
  | 'DISTRIBUTION_MANAGE'
  | 'FINANCIAL_MANAGE'
  | 'HR_MANAGE'
  | 'QUALITY_MANAGE'
  | 'USER_MANAGE'
  | 'ANALYTICS_VIEW'
  | 'REPORTS_VIEW'

// ================================ ROLE PERMISSIONS MAPPING ================================

const rolePermissions: Record<UserRole, PermissionType[]> = {
  // Platform Level
  PLATFORM_SUPERADMIN: ['ALL'],
  PLATFORM_SUPPORT: ['READ', 'REPORTS_VIEW'],
  PLATFORM_ANALYST: ['READ', 'ANALYTICS_VIEW'],

  // SPPG Management
  SPPG_KEPALA: [
    'READ',
    'WRITE',
    'DELETE',
    'APPROVE',
    'MENU_MANAGE',
    'SCHOOL_MANAGE',
    'PROCUREMENT_MANAGE',
    'PRODUCTION_MANAGE',
    'DISTRIBUTION_MANAGE',
    'FINANCIAL_MANAGE',
    'HR_MANAGE',
  ],
  SPPG_ADMIN: [
    'READ',
    'WRITE',
    'MENU_MANAGE',
    'SCHOOL_MANAGE',
    'PROCUREMENT_MANAGE',
    'PRODUCTION_MANAGE',
    'USER_MANAGE',
  ],

  // SPPG Operational
  SPPG_AHLI_GIZI: ['READ', 'WRITE', 'MENU_MANAGE', 'SCHOOL_MANAGE', 'QUALITY_MANAGE', 'PRODUCTION_MANAGE'],  // ✅ Added for production access
  SPPG_AKUNTAN: ['READ', 'WRITE', 'FINANCIAL_MANAGE', 'PROCUREMENT_MANAGE'],
  SPPG_PRODUKSI_MANAGER: [
    'READ',
    'WRITE',
    'PRODUCTION_MANAGE',
    'QUALITY_MANAGE',
  ],
  SPPG_DISTRIBUSI_MANAGER: ['READ', 'WRITE', 'DISTRIBUTION_MANAGE'],
  SPPG_HRD_MANAGER: ['READ', 'WRITE', 'HR_MANAGE'],

  // SPPG Staff
  SPPG_STAFF_DAPUR: ['READ', 'PRODUCTION_MANAGE'],
  SPPG_STAFF_DISTRIBUSI: ['READ', 'DISTRIBUTION_MANAGE'],
  SPPG_STAFF_ADMIN: ['READ', 'WRITE'],
  SPPG_STAFF_QC: ['READ', 'QUALITY_MANAGE', 'PRODUCTION_MANAGE'],  // ✅ Added for production access

  // Limited
  SPPG_VIEWER: ['READ'],
  DEMO_USER: ['READ'],
}

// ================================ PERMISSION CHECK FUNCTIONS ================================

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns boolean - Whether the role has the permission
 */
export function hasPermission(
  role: UserRole,
  permission: PermissionType
): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes('ALL') || permissions.includes(permission)
}

/**
 * Check if user can manage menus
 */
export function canManageMenu(role: UserRole): boolean {
  return hasPermission(role, 'MENU_MANAGE')
}

/**
 * Check if user can manage schools
 */
export function canManageSchool(role: UserRole): boolean {
  return hasPermission(role, 'SCHOOL_MANAGE')
}

/**
 * Check if user can manage procurement
 */
export function canManageProcurement(role: UserRole): boolean {
  return hasPermission(role, 'PROCUREMENT_MANAGE')
}

/**
 * Check if user can manage production
 */
export function canManageProduction(role: UserRole): boolean {
  return hasPermission(role, 'PRODUCTION_MANAGE')
}

/**
 * Check if user can manage distribution
 */
export function canManageDistribution(role: UserRole): boolean {
  return hasPermission(role, 'DISTRIBUTION_MANAGE')
}

/**
 * Check if user can approve transactions
 */
export function canApprove(role: UserRole): boolean {
  return hasPermission(role, 'APPROVE')
}

// ================================ SPPG ACCESS VERIFICATION ================================

/**
 * Check SPPG access and verify it's active
 * CRITICAL FOR MULTI-TENANT SECURITY
 * 
 * @param sppgId - SPPG ID to verify
 * @returns SPPG entity or null if not found/inactive
 */
export async function checkSppgAccess(sppgId: string | null) {
  if (!sppgId) return null

  try {
    const sppg = await db.sPPG.findFirst({
      where: {
        id: sppgId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        isDemoAccount: true,
        demoExpiresAt: true,
        demoAllowedFeatures: true,
      },
    })

    // Check if demo account is expired
    if (sppg?.isDemoAccount && sppg.demoExpiresAt) {
      if (new Date() > sppg.demoExpiresAt) {
        return null // Demo expired
      }
    }

    return sppg
  } catch (error) {
    console.error('Error checking SPPG access:', error)
    return null
  }
}

/**
 * Check if a feature is allowed for the SPPG
 * @param sppg - SPPG entity from checkSppgAccess
 * @param featureName - Feature to check
 */
export function isFeatureAllowed(
  sppg: Awaited<ReturnType<typeof checkSppgAccess>>,
  featureName: string
): boolean {
  if (!sppg) return false

  // Demo accounts have limited features
  if (sppg.isDemoAccount) {
    return (sppg.demoAllowedFeatures || []).includes(featureName)
  }

  // Non-demo accounts: check subscription plan
  // TODO: Implement subscription plan feature checks
  return true
}
