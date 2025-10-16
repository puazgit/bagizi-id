/**
 * @fileoverview Authentication hooks for enterprise login system
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import type { 
  SecurityMetrics, 
  FormValidationState, 
  AuthResult,
  ExtendedSession 
} from '../types'

/**
 * Enhanced authentication hook with enterprise security features
 */
export function useAuth() {
  const { data: session, status } = useSession()
  
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  
  const user = session?.user
  
  // Enhanced logout with security cleanup
  const logout = useCallback(async () => {
    try {
      // Clear security-related localStorage
      localStorage.removeItem('bagizi-remember-email')
      localStorage.removeItem('bagizi-trusted-device')
      localStorage.removeItem('bagizi-security-context')
      
      await signOut({ 
        redirect: true,
        callbackUrl: '/login?logout=success'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])
  
  // Check user permissions for RBAC
  const hasPermission = useCallback((permission: string) => {
    if (!user?.userRole) return false
    
    // Define role-permission mapping
    const rolePermissions: Record<string, string[]> = {
      'PLATFORM_SUPERADMIN': ['*'], // All permissions
      'SPPG_KEPALA': ['menu.manage', 'procurement.manage', 'production.manage', 'distribution.manage', 'reports.view'],
      'SPPG_ADMIN': ['menu.manage', 'procurement.manage', 'reports.view'],
      'SPPG_AHLI_GIZI': ['menu.manage', 'menu.view'],
      'SPPG_AKUNTAN': ['procurement.manage', 'reports.financial'],
      'SPPG_VIEWER': ['*.view'],
    }
    
    const userPermissions = rolePermissions[user.userRole] || []
    return userPermissions.includes('*') || 
           userPermissions.includes(permission) ||
           userPermissions.includes('*.view')
  }, [user?.userRole])
  
  // Check if user can access specific SPPG features
  const canAccessSppgFeature = useCallback((feature: string) => {
    if (!user?.sppgId) return false
    return hasPermission(`${feature}.manage`) || hasPermission(`${feature}.view`)
  }, [user?.sppgId, hasPermission])
  
  return {
    // Authentication state
    isAuthenticated,
    isLoading,
    user: user as ExtendedSession['user'] | undefined,
    
    // Authentication actions
    logout,
    
    // Authorization helpers
    hasPermission,
    canAccessSppgFeature,
    
    // User context
    isSppgUser: !!user?.sppgId,
    isPlatformAdmin: user?.userRole?.startsWith('PLATFORM_'),
    isDemoUser: user?.userType === 'DEMO_REQUEST' || user?.userRole === 'DEMO_USER',
  }
}

/**
 * Login hook with enterprise security features
 */
export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginProgress, setLoginProgress] = useState(0)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Security tracking
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    attemptCount: 0,
    lastAttempt: null,
    isLocked: false,
    lockUntil: null,
    riskLevel: 'low',
    suspiciousActivity: false,
    requiresMFA: false,
    deviceFingerprint: null,
  })
  
  // Device fingerprinting
  const deviceFingerprint = useRef<string | null>(null)
  
  useEffect(() => {
    // Generate device fingerprint for security tracking
    const generateFingerprint = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Bagizi-ID Security Check', 2, 2)
      }
      
      const fingerprint = btoa([
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
        navigator.hardwareConcurrency || 'unknown'
      ].join('|'))
      
      deviceFingerprint.current = fingerprint
      setSecurityMetrics(prev => ({ ...prev, deviceFingerprint: fingerprint }))
    }

    generateFingerprint()
  }, [])
  
  // Enhanced login function
  const login = useCallback(async (
    email: string, 
    password: string, 
    options?: { 
      rememberMe?: boolean
      deviceTrust?: boolean
      callbackUrl?: string 
    }
  ): Promise<AuthResult> => {
    setIsSubmitting(true)
    setAuthError(null)
    setLoginProgress(0)
    
    try {
      // Step 1: Security pre-checks
      setLoginProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Step 2: Device fingerprinting
      setLoginProgress(40)
      
      // Prepare security context for audit logging
      const securityContext = {
        deviceFingerprint: deviceFingerprint.current,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 200),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
      
      // Step 3: Authentication attempt
      setLoginProgress(60)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: options?.callbackUrl || '/dashboard',
      })
      
      // Step 4: Process authentication result
      setLoginProgress(80)
      
      if (result?.error) {
        // Enhanced error handling with security tracking
        setSecurityMetrics(prev => ({
          ...prev,
          attemptCount: prev.attemptCount + 1,
          lastAttempt: new Date(),
          riskLevel: prev.attemptCount >= 3 ? 'high' : 'medium'
        }))
        
        const errorMessage = result.error === 'CredentialsSignin' 
          ? 'Email atau password salah' 
          : 'Terjadi kesalahan autentikasi'
        
        setAuthError(errorMessage)
        setLoginProgress(0)
        
        return {
          success: false,
          error: errorMessage
        }
      }
      
      if (result?.ok) {
        // Step 5: Success handling with security logging
        setLoginProgress(100)
        
        // Store security preferences
        if (options?.rememberMe) {
          localStorage.setItem('bagizi-remember-email', email)
        }
        
        if (options?.deviceTrust) {
          localStorage.setItem('bagizi-trusted-device', deviceFingerprint.current || '')
        }
        
        // Store security context using the prepared context
        const loginSecurityContext = {
          ...securityContext,
          loginTime: new Date().toISOString(),
        }
        localStorage.setItem('bagizi-security-context', JSON.stringify(loginSecurityContext))
        
        // Redirect with success animation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Manual redirect after successful login
        const redirectUrl = result.url || options?.callbackUrl || '/dashboard'
        
        if (typeof window !== 'undefined') {
          // Use window.location for full page reload to ensure session is loaded
          window.location.href = redirectUrl
        }
        
        return {
          success: true,
          redirectUrl
        }
      }
      
      throw new Error('Unexpected authentication result')
      
    } catch (error) {
      console.error('Enterprise login error:', error)
      const errorMessage = 'Sistem sedang mengalami gangguan. Silakan coba lagi dalam beberapa menit.'
      setAuthError(errorMessage)
      setLoginProgress(0)
      
      // Log critical errors for monitoring
      setSecurityMetrics(prev => ({
        ...prev,
        suspiciousActivity: true,
        riskLevel: 'critical'
      }))
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [])
  
  return {
    // State
    isSubmitting,
    loginProgress,
    authError,
    securityMetrics,
    
    // Actions
    login,
    clearError: () => setAuthError(null),
    
    // Security context
    deviceFingerprint: deviceFingerprint.current,
  }
}

/**
 * Form validation hook with real-time feedback
 */
export function useFormValidation() {
  const [validation, setValidation] = useState<FormValidationState>({
    email: { isValid: false, strength: 0, message: '' },
    password: { isValid: false, strength: 0, message: '' }
  })
  
  // Advanced password strength calculation
  const calculatePasswordStrength = useCallback((password: string) => {
    let strength = 0
    const checks = [
      /[a-z]/.test(password), // lowercase
      /[A-Z]/.test(password), // uppercase  
      /\d/.test(password),    // numbers
      /[^A-Za-z0-9]/.test(password), // special chars
      password.length >= 8,   // length
      password.length >= 12,  // strong length
      /(.)\1{2,}/.test(password) === false, // no repetition
    ]
    
    strength = checks.filter(Boolean).length
    return Math.min((strength / 7) * 100, 100)
  }, [])
  
  // Real-time email validation with domain checking
  const validateEmailRealtime = useCallback((email: string) => {
    if (!email) return { isValid: false, strength: 0, message: '' }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, strength: 0, message: 'Format email tidak valid' }
    }
    
    // All valid email formats are allowed - no domain restriction for enterprise multi-tenant
    // This allows SPPG-specific domains like sppg-purwakarta.com, sppg-jakarta.com, etc.
    return {
      isValid: true,
      strength: 100,
      message: 'Format email valid'
    }
  }, [])
  
  // Validate email field
  const validateEmail = useCallback((email: string) => {
    const emailValidation = validateEmailRealtime(email)
    setValidation(prev => ({ ...prev, email: emailValidation }))
    return emailValidation
  }, [validateEmailRealtime])
  
  // Validate password field
  const validatePassword = useCallback((password: string) => {
    const strength = calculatePasswordStrength(password)
    const passwordValidation = {
      isValid: strength >= 70,
      strength,
      message: strength >= 70 ? 'Password kuat' : 'Password perlu diperkuat'
    }
    setValidation(prev => ({ ...prev, password: passwordValidation }))
    return passwordValidation
  }, [calculatePasswordStrength])
  
  return {
    validation,
    validateEmail,
    validatePassword,
    calculatePasswordStrength,
    validateEmailRealtime,
  }
}