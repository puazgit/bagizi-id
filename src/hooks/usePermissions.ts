/**
 * @fileoverview Client-side Permission Hooks
 * React hooks for checking user permissions in components
 * 
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 */

'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import {
  isPlatformAdmin,
  isSuperAdmin,
  hasWriteAccess,
  isReadOnly,
  PlatformSppgPermissions,
  PlatformUserPermissions,
  PlatformDemoRequestPermissions,
  PlatformBillingPermissions,
  PlatformSettingsPermissions,
  PlatformAnalyticsPermissions,
  PlatformRegionalPermissions,
} from '@/lib/permissions'

/**
 * Hook to get current user's role
 */
export function useUserRole(): UserRole | null {
  const { data: session } = useSession()
  return (session?.user?.userRole as UserRole) || null
}

/**
 * Hook to check if user is platform admin
 */
export function useIsPlatformAdmin(): boolean {
  const role = useUserRole()
  return isPlatformAdmin(role)
}

/**
 * Hook to check if user is superadmin
 */
export function useIsSuperAdmin(): boolean {
  const role = useUserRole()
  return isSuperAdmin(role)
}

/**
 * Hook to check if user has write access
 */
export function useHasWriteAccess(): boolean {
  const role = useUserRole()
  return hasWriteAccess(role)
}

/**
 * Hook to check if user is read-only
 */
export function useIsReadOnly(): boolean {
  const role = useUserRole()
  return isReadOnly(role)
}

/**
 * Hook for SPPG management permissions
 */
export function useSppgPermissions() {
  const role = useUserRole()
  
  if (!role) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canActivate: false,
    }
  }
  
  return {
    canView: PlatformSppgPermissions.canView(role),
    canCreate: PlatformSppgPermissions.canCreate(role),
    canEdit: PlatformSppgPermissions.canEdit(role),
    canDelete: PlatformSppgPermissions.canDelete(role),
    canActivate: PlatformSppgPermissions.canActivate(role),
  }
}

/**
 * Hook for user management permissions
 */
export function useUserPermissions() {
  const role = useUserRole()
  
  if (!role) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    }
  }
  
  return {
    canView: PlatformUserPermissions.canView(role),
    canCreate: PlatformUserPermissions.canCreate(role),
    canEdit: PlatformUserPermissions.canEdit(role),
    canDelete: PlatformUserPermissions.canDelete(role),
  }
}

/**
 * Hook for demo request permissions
 */
export function useDemoRequestPermissions() {
  const role = useUserRole()
  
  if (!role) {
    return {
      canView: false,
      canApprove: false,
      canReject: false,
      canConvert: false,
      canTakeAction: false,
    }
  }
  
  return {
    canView: PlatformDemoRequestPermissions.canView(role),
    canApprove: PlatformDemoRequestPermissions.canApprove(role),
    canReject: PlatformDemoRequestPermissions.canReject(role),
    canConvert: PlatformDemoRequestPermissions.canConvert(role),
    canTakeAction: PlatformDemoRequestPermissions.canTakeAction(role),
  }
}

/**
 * Hook for subscription & billing permissions
 */
export function useBillingPermissions() {
  const role = useUserRole()
  
  if (!role) {
    return {
      canViewSubscription: false,
      canEditSubscription: false,
      canViewBilling: false,
      canManageBilling: false,
    }
  }
  
  return {
    canViewSubscription: PlatformBillingPermissions.canViewSubscription(role),
    canEditSubscription: PlatformBillingPermissions.canEditSubscription(role),
    canViewBilling: PlatformBillingPermissions.canViewBilling(role),
    canManageBilling: PlatformBillingPermissions.canManageBilling(role),
  }
}

/**
 * Hook for platform settings permissions
 */
export function useSettingsPermissions() {
  const role = useUserRole()
  
  if (!role) {
    return {
      canView: false,
      canEdit: false,
      canAccessDatabase: false,
      canManageSecurity: false,
    }
  }
  
  return {
    canView: PlatformSettingsPermissions.canView(role),
    canEdit: PlatformSettingsPermissions.canEdit(role),
    canAccessDatabase: PlatformSettingsPermissions.canAccessDatabase(role),
    canManageSecurity: PlatformSettingsPermissions.canManageSecurity(role),
  }
}

/**
 * Hook for analytics permissions
 */
export function useAnalyticsPermissions() {
  const role = useUserRole()
  
  if (!role) {
    return {
      canView: false,
      canExport: false,
      canViewAuditLog: false,
    }
  }
  
  return {
    canView: PlatformAnalyticsPermissions.canView(role),
    canExport: PlatformAnalyticsPermissions.canExport(role),
    canViewAuditLog: PlatformAnalyticsPermissions.canViewAuditLog(role),
  }
}

/**
 * Hook for regional data permissions
 */
export function useRegionalPermissions() {
  const role = useUserRole()
  
  if (!role) {
    return {
      canManage: false,
    }
  }
  
  return {
    canManage: PlatformRegionalPermissions.canManage(role),
  }
}

/**
 * Generic permission check hook
 * @param checkFn - Permission check function
 */
export function usePermission(checkFn: (role: UserRole) => boolean): boolean {
  const role = useUserRole()
  if (!role) return false
  return checkFn(role)
}
