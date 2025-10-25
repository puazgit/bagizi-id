/**
 * @fileoverview Audit Logging Utilities for Admin Access Tracking
 * Enterprise-grade audit trail for security and compliance
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Security Guidelines
 */

import { db } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'

/**
 * Audit event types for comprehensive tracking
 */
export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Admin Access Events
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  ADMIN_ACCESS_DENIED = 'ADMIN_ACCESS_DENIED',
  
  // SPPG Management Events
  SPPG_CREATED = 'SPPG_CREATED',
  SPPG_UPDATED = 'SPPG_UPDATED',
  SPPG_DELETED = 'SPPG_DELETED',
  SPPG_ACTIVATED = 'SPPG_ACTIVATED',
  SPPG_SUSPENDED = 'SPPG_SUSPENDED',
  SPPG_VIEW = 'SPPG_VIEW',
  
  // User Management Events
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_VIEW = 'USER_VIEW',
  
  // System Events
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  DATABASE_ACCESS = 'DATABASE_ACCESS',
  SECURITY_ALERT = 'SECURITY_ALERT',
  
  // Data Access Events
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  BULK_EXPORT = 'BULK_EXPORT',
  BULK_IMPORT = 'BULK_IMPORT'
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  eventType: AuditEventType
  userId?: string
  userEmail?: string
  userRole?: string
  sppgId?: string | null
  resourceType?: string
  resourceId?: string
  action: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  pathname: string
  method?: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

/**
 * Create audit log entry in database
 * 
 * @param entry - Audit log entry data
 * @returns Promise<void>
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // In production, this would write to database
    // For now, we'll use console logging with structured format
    
    const logData = {
      timestamp: entry.timestamp.toISOString(),
      eventType: entry.eventType,
      userId: entry.userId,
      userEmail: entry.userEmail,
      userRole: entry.userRole,
      sppgId: entry.sppgId,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      action: entry.action,
      pathname: entry.pathname,
      method: entry.method,
      success: entry.success,
      errorMessage: entry.errorMessage,
      ipAddress: entry.ipAddress,
      details: entry.details
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT LOG]', JSON.stringify(logData, null, 2))
    }

    if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT LOG]', JSON.stringify(logData, null, 2))
  }

  // Database logging for production
  if (process.env.NODE_ENV === 'production') {
    await db.auditLog.create({
      data: {
        entityType: entry.resourceType || 'UNKNOWN',
        entityId: entry.resourceId || 'UNKNOWN',
        action: entry.action as AuditAction,
        description: `${entry.eventType} - ${entry.action}`,
        oldValues: entry.details?.oldValues ? (entry.details.oldValues as object) : undefined,
        newValues: entry.details?.newValues ? (entry.details.newValues as object) : undefined,
        userId: entry.userId || null,
        userName: entry.userEmail?.split('@')[0] || null,
        userEmail: entry.userEmail || null,
        sppgId: entry.sppgId || null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        requestPath: entry.pathname,
        requestMethod: entry.method || null,
        metadata: entry.details ? (entry.details as object) : undefined,
      }
    })
  }
} catch (error) {
  // Don't fail the request if audit logging fails
  console.error('[AUDIT LOG ERROR]', error)
}
}

/**
 * Log admin access attempt
 * 
 * @param params - Access attempt parameters
 */
export async function logAdminAccess(params: {
  userId?: string
  userEmail?: string
  userRole?: string
  pathname: string
  method?: string
  success: boolean
  ipAddress?: string
  userAgent?: string
  errorMessage?: string
}): Promise<void> {
  await createAuditLog({
    eventType: params.success ? AuditEventType.ADMIN_ACCESS : AuditEventType.ADMIN_ACCESS_DENIED,
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    sppgId: null,
    action: params.success ? 'ADMIN_ACCESS_GRANTED' : 'ADMIN_ACCESS_DENIED',
    pathname: params.pathname,
    method: params.method,
    timestamp: new Date(),
    success: params.success,
    errorMessage: params.errorMessage,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  })
}

/**
 * Log SPPG management action
 */
export async function logSppgAction(params: {
  eventType: AuditEventType
  userId?: string
  userEmail?: string
  userRole?: string
  sppgId: string
  action: string
  details?: Record<string, unknown>
  pathname: string
  success: boolean
  errorMessage?: string
}): Promise<void> {
  await createAuditLog({
    eventType: params.eventType,
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    sppgId: params.sppgId,
    resourceType: 'SPPG',
    resourceId: params.sppgId,
    action: params.action,
    details: params.details,
    pathname: params.pathname,
    timestamp: new Date(),
    success: params.success,
    errorMessage: params.errorMessage
  })
}

/**
 * Log user management action
 */
export async function logUserAction(params: {
  eventType: AuditEventType
  adminUserId?: string
  adminUserEmail?: string
  adminUserRole?: string
  targetUserId: string
  action: string
  details?: Record<string, unknown>
  pathname: string
  success: boolean
  errorMessage?: string
}): Promise<void> {
  await createAuditLog({
    eventType: params.eventType,
    userId: params.adminUserId,
    userEmail: params.adminUserEmail,
    userRole: params.adminUserRole,
    sppgId: null,
    resourceType: 'USER',
    resourceId: params.targetUserId,
    action: params.action,
    details: params.details,
    pathname: params.pathname,
    timestamp: new Date(),
    success: params.success,
    errorMessage: params.errorMessage
  })
}

/**
 * Log system settings change
 */
export async function logSettingsChange(params: {
  userId?: string
  userEmail?: string
  userRole?: string
  settingKey: string
  oldValue: unknown
  newValue: unknown
  pathname: string
  success: boolean
}): Promise<void> {
  await createAuditLog({
    eventType: AuditEventType.SETTINGS_CHANGED,
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    sppgId: null,
    resourceType: 'SETTINGS',
    resourceId: params.settingKey,
    action: 'SETTINGS_UPDATE',
    details: {
      settingKey: params.settingKey,
      oldValue: params.oldValue,
      newValue: params.newValue
    },
    pathname: params.pathname,
    timestamp: new Date(),
    success: params.success
  })
}

/**
 * Get IP address from request headers
 */
export function getClientIp(headers: Headers): string | undefined {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    undefined
  )
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(headers: Headers): string | undefined {
  return headers.get('user-agent') || undefined
}
