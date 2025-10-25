/**
 * @fileoverview User Management Types
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { UserRole, UserType } from '@prisma/client'

/**
 * User list item for tables and cards
 */
export interface UserListItem {
  id: string
  email: string
  name: string | null
  avatar: string | null
  userRole: UserRole
  userType: UserType
  isActive: boolean
  emailVerified: Date | null
  sppgId: string | null
  sppg?: {
    id: string
    name: string
    code: string
  } | null
  phone: string | null
  timezone: string | null
  lastLoginAt: Date | null
  lockedUntil: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Detailed user information for detail page
 */
export interface UserDetail extends UserListItem {
  lastLoginIp: string | null
  loginAttempts: number
  lockedUntil: Date | null
  passwordChangedAt: Date | null
  notificationPreferences: Record<string, unknown> | null
  _count?: {
    sessions: number
    auditLogs: number
  }
}

/**
 * User filter parameters for list queries
 */
export interface UserFilters {
  search?: string
  userRole?: UserRole
  userType?: UserType
  isActive?: boolean
  sppgId?: string
  hasEmailVerified?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'name' | 'email' | 'lastLoginAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * User statistics for dashboard
 */
export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  lockedUsers: number
  byRole: Record<string, number>
  byType: Record<string, number>
  bySppg: Array<{
    sppgId: string
    sppgName: string
    sppgCode: string
    userCount: number
  }>
  recentlyAdded: number // Last 7 days
  recentlyActive: number // Last 24 hours
}

/**
 * Create user input
 */
export interface CreateUserInput {
  email: string
  name: string
  password: string
  userRole: UserRole
  userType: UserType
  sppgId?: string | null
  phone?: string | null
  timezone?: 'WIB' | 'WITA' | 'WIT'
  isActive?: boolean
  emailVerified?: boolean
  avatar?: string | null
}

/**
 * Update user input
 */
export interface UpdateUserInput {
  name?: string
  phone?: string | null
  timezone?: 'WIB' | 'WITA' | 'WIT'
  avatar?: string | null
  isActive?: boolean
  userRole?: UserRole
  userType?: UserType
  sppgId?: string | null
}

/**
 * Assign role input
 */
export interface AssignRoleInput {
  userRole: UserRole
  userType: UserType
  reason?: string
}

/**
 * Reset password input
 */
export interface ResetPasswordInput {
  newPassword: string
  sendEmail?: boolean
}

/**
 * User activity log entry
 */
export interface UserActivityLog {
  id: string
  eventType: string
  action: string
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  pathname: string
  success: boolean
  errorMessage: string | null
  timestamp: Date
  createdAt: Date
}

/**
 * Paginated response wrapper
 */
export interface PaginatedUsers {
  data: UserListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

/**
 * User role options for forms
 */
export const USER_ROLE_OPTIONS: Array<{
  value: UserRole
  label: string
  description: string
  category: 'platform' | 'sppg-management' | 'sppg-operational' | 'sppg-staff' | 'limited'
}> = [
  // Platform Level
  {
    value: 'PLATFORM_SUPERADMIN',
    label: 'Super Administrator',
    description: 'Full platform access with all privileges',
    category: 'platform'
  },
  {
    value: 'PLATFORM_SUPPORT',
    label: 'Platform Support',
    description: 'Support team with limited admin access',
    category: 'platform'
  },
  {
    value: 'PLATFORM_ANALYST',
    label: 'Platform Analyst',
    description: 'Read-only access for analytics and reporting',
    category: 'platform'
  },
  
  // SPPG Management
  {
    value: 'SPPG_KEPALA',
    label: 'Kepala SPPG',
    description: 'SPPG head with full SPPG access',
    category: 'sppg-management'
  },
  {
    value: 'SPPG_ADMIN',
    label: 'Administrator SPPG',
    description: 'SPPG administrator with management privileges',
    category: 'sppg-management'
  },
  
  // SPPG Operational
  {
    value: 'SPPG_AHLI_GIZI',
    label: 'Ahli Gizi',
    description: 'Nutritionist managing menus and nutrition programs',
    category: 'sppg-operational'
  },
  {
    value: 'SPPG_AKUNTAN',
    label: 'Akuntan',
    description: 'Accountant managing finances and procurement',
    category: 'sppg-operational'
  },
  {
    value: 'SPPG_PRODUKSI_MANAGER',
    label: 'Production Manager',
    description: 'Managing food production operations',
    category: 'sppg-operational'
  },
  {
    value: 'SPPG_DISTRIBUSI_MANAGER',
    label: 'Distribution Manager',
    description: 'Managing food distribution and delivery',
    category: 'sppg-operational'
  },
  {
    value: 'SPPG_HRD_MANAGER',
    label: 'HRD Manager',
    description: 'Managing human resources and staff',
    category: 'sppg-operational'
  },
  
  // SPPG Staff
  {
    value: 'SPPG_STAFF_DAPUR',
    label: 'Staff Dapur',
    description: 'Kitchen staff for food production',
    category: 'sppg-staff'
  },
  {
    value: 'SPPG_STAFF_DISTRIBUSI',
    label: 'Staff Distribusi',
    description: 'Distribution staff for delivery',
    category: 'sppg-staff'
  },
  {
    value: 'SPPG_STAFF_ADMIN',
    label: 'Staff Admin',
    description: 'Administrative staff',
    category: 'sppg-staff'
  },
  {
    value: 'SPPG_STAFF_QC',
    label: 'Quality Control',
    description: 'Quality control staff',
    category: 'sppg-staff'
  },
  
  // Limited Access
  {
    value: 'SPPG_VIEWER',
    label: 'Viewer (Read-Only)',
    description: 'Read-only access to SPPG data',
    category: 'limited'
  },
  {
    value: 'DEMO_USER',
    label: 'Demo User',
    description: 'Trial account with limited features',
    category: 'limited'
  }
]

/**
 * User type options for forms
 */
export const USER_TYPE_OPTIONS: Array<{
  value: UserType
  label: string
  description: string
}> = [
  {
    value: 'SUPERADMIN',
    label: 'Super Admin',
    description: 'Platform-level administrator'
  },
  {
    value: 'SPPG_ADMIN',
    label: 'SPPG Admin',
    description: 'SPPG-level administrator'
  },
  {
    value: 'SPPG_USER',
    label: 'SPPG User',
    description: 'Regular SPPG staff member'
  },
  {
    value: 'DEMO_REQUEST',
    label: 'Demo Request',
    description: 'Demo account requester'
  }
]

/**
 * Helper function to get role label
 */
export function getRoleLabel(role: UserRole): string {
  const option = USER_ROLE_OPTIONS.find(opt => opt.value === role)
  return option?.label || role
}

/**
 * Helper function to get role category
 */
export function getRoleCategory(role: UserRole): string {
  const option = USER_ROLE_OPTIONS.find(opt => opt.value === role)
  return option?.category || 'unknown'
}

/**
 * Helper function to get type label
 */
export function getTypeLabel(type: UserType): string {
  const option = USER_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.label || type
}

/**
 * Helper function to check if role requires SPPG assignment
 */
export function requiresSppgAssignment(role: UserRole): boolean {
  return role.startsWith('SPPG_')
}

/**
 * Helper function to check if user is platform admin
 */
export function isPlatformAdmin(role: UserRole): boolean {
  return role.startsWith('PLATFORM_')
}

/**
 * Helper function to check if user is SPPG user
 */
export function isSppgUser(role: UserRole): boolean {
  return role.startsWith('SPPG_')
}

/**
 * Timezone options for Indonesian regions
 */
export const TIMEZONE_OPTIONS = [
  { value: 'WIB', label: 'WIB (Western Indonesian Time) - Jakarta, Sumatra' },
  { value: 'WITA', label: 'WITA (Central Indonesian Time) - Bali, Kalimantan' },
  { value: 'WIT', label: 'WIT (Eastern Indonesian Time) - Papua, Maluku' }
] as const
