/**
 * @fileoverview User Management Validation Schemas
 * @version Next.js 15.5.4 / Zod 3.22+
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { UserRole, UserType } from '@prisma/client'

/**
 * Email validation with proper format
 */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase()
  .trim()

/**
 * Password validation with security requirements
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Phone number validation (Indonesian format)
 */
const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number format')
  .optional()
  .nullable()

/**
 * Timezone validation
 */
const timezoneSchema = z
  .enum(['WIB', 'WITA', 'WIT'])
  .optional()

/**
 * User role enum validation
 */
const userRoleSchema = z.nativeEnum(UserRole)

/**
 * User type enum validation
 */
const userTypeSchema = z.nativeEnum(UserType)

/**
 * Create user schema
 */
export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(3, 'Name must be at least 3 characters'),
  password: passwordSchema,
  userRole: userRoleSchema,
  userType: userTypeSchema,
  sppgId: z.string().cuid().optional().nullable(),
  phone: phoneSchema,
  timezone: timezoneSchema,
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  avatar: z.string().url().optional().nullable()
}).refine(
  (data) => {
    // Validate SPPG assignment
    if (data.userRole.startsWith('SPPG_')) {
      return data.sppgId !== null && data.sppgId !== undefined
    }
    return true
  },
  {
    message: 'SPPG ID is required for SPPG roles',
    path: ['sppgId']
  }
).refine(
  (data) => {
    // Validate platform roles don't have SPPG assignment
    if (data.userRole.startsWith('PLATFORM_')) {
      return data.sppgId === null || data.sppgId === undefined
    }
    return true
  },
  {
    message: 'Platform roles should not have SPPG assignment',
    path: ['sppgId']
  }
).refine(
  (data) => {
    // Validate userType matches userRole
    if (data.userRole.startsWith('PLATFORM_')) {
      return data.userType === 'SUPERADMIN'
    }
    if (data.userRole === 'SPPG_ADMIN') {
      return data.userType === 'SPPG_ADMIN'
    }
    if (data.userRole.startsWith('SPPG_')) {
      return data.userType === 'SPPG_USER' || data.userType === 'SPPG_ADMIN'
    }
    return true
  },
  {
    message: 'User type must match user role category',
    path: ['userType']
  }
)

/**
 * Update user schema (all fields optional)
 */
export const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  phone: phoneSchema,
  timezone: timezoneSchema.optional(),
  avatar: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  userRole: userRoleSchema.optional(),
  userType: userTypeSchema.optional(),
  sppgId: z.string().cuid().optional().nullable()
}).refine(
  (data) => {
    // If both userRole and sppgId are provided, validate consistency
    if (data.userRole && data.sppgId !== undefined) {
      if (data.userRole.startsWith('SPPG_')) {
        return data.sppgId !== null
      }
      if (data.userRole.startsWith('PLATFORM_')) {
        return data.sppgId === null
      }
    }
    return true
  },
  {
    message: 'SPPG assignment must match user role',
    path: ['sppgId']
  }
)

/**
 * Assign role schema
 */
export const assignRoleSchema = z.object({
  userRole: userRoleSchema,
  userType: userTypeSchema,
  reason: z.string().min(10, 'Please provide a reason (minimum 10 characters)').optional()
}).refine(
  (data) => {
    // Validate userType matches userRole
    if (data.userRole.startsWith('PLATFORM_')) {
      return data.userType === 'SUPERADMIN'
    }
    if (data.userRole === 'SPPG_ADMIN') {
      return data.userType === 'SPPG_ADMIN'
    }
    if (data.userRole.startsWith('SPPG_')) {
      return data.userType === 'SPPG_USER' || data.userType === 'SPPG_ADMIN'
    }
    return true
  },
  {
    message: 'User type must match user role category',
    path: ['userType']
  }
)

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  sendEmail: z.boolean().default(true)
})

/**
 * User filters schema
 */
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  userRole: userRoleSchema.optional(),
  userType: userTypeSchema.optional(),
  isActive: z.boolean().optional(),
  sppgId: z.string().cuid().optional(),
  hasEmailVerified: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'email', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

/**
 * Bulk action schema
 */
export const bulkActionSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, 'At least one user must be selected'),
  action: z.enum(['activate', 'deactivate', 'delete', 'verify-email']),
  reason: z.string().min(10, 'Please provide a reason (minimum 10 characters)').optional()
})

/**
 * Type exports
 */
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type AssignRoleInput = z.infer<typeof assignRoleSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UserFiltersInput = z.infer<typeof userFiltersSchema>
export type BulkActionInput = z.infer<typeof bulkActionSchema>
