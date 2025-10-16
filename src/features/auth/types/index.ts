/**
 * @fileoverview Authentication types for enterprise login system
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type { UserRole, UserType } from '@prisma/client'

// Security & Authentication State Management
export interface SecurityMetrics {
  attemptCount: number
  lastAttempt: Date | null
  isLocked: boolean
  lockUntil: Date | null
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  suspiciousActivity: boolean
  requiresMFA: boolean
  deviceFingerprint: string | null
}

export interface LoginState {
  isSubmitting: boolean
  currentStep: 'credentials' | 'mfa' | 'device-verification' | 'success'
  securityMetrics: SecurityMetrics
  sessionInfo: {
    userAgent: string
    ipAddress: string | null
    location: string | null
    deviceType: 'desktop' | 'mobile' | 'tablet'
  }
}

// Field validation state for real-time feedback
export interface FieldValidation {
  isValid: boolean
  strength: number
  message: string
}

export interface FormValidationState {
  email: FieldValidation
  password: FieldValidation
}

// Authentication result types
export interface AuthResult {
  success: boolean
  error?: string
  requiresMFA?: boolean
  redirectUrl?: string
  securityFlags?: {
    newDevice: boolean
    suspiciousLocation: boolean
    requiresVerification: boolean
  }
}

// Session management types
export interface ExtendedSession {
  user: {
    id: string
    email: string
    name: string
    userRole?: UserRole | null
    sppgId?: string | null
    userType?: UserType
    profileImage?: string | null
  }
  expires: string
  securityContext?: {
    deviceFingerprint: string
    ipAddress: string
    userAgent: string
    loginTime: string
  }
}

// Multi-language support
export type SupportedLocale = 'id' | 'en'

export interface LocalizedMessages {
  [key: string]: string
}

export interface AuthMessages {
  id: LocalizedMessages
  en: LocalizedMessages
}