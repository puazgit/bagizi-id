/**
 * @fileoverview Authentication schemas for enterprise login system
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'

// Enterprise-Grade Login Validation Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .refine((email) => {
      // Enterprise email domain validation
      const allowedDomains = [
        'sppg.id', 'gov.id', 'pemkot.id', 'pemkab.id', 'pemprov.id',
        'kemkes.go.id', 'kemensos.go.id', 'gmail.com', 'outlook.com'
      ]
      const domain = email.split('@')[1]?.toLowerCase()
      return allowedDomains.includes(domain) || domain?.endsWith('.go.id')
    }, 'Domain email tidak diizinkan untuk akses sistem')
    .transform(email => email.toLowerCase().trim()),
  
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter untuk keamanan')
    .max(128, 'Password maksimal 128 karakter')
    .refine((password) => {
      // Enterprise password complexity validation
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    }, 'Password harus mengandung huruf besar, kecil, angka, dan simbol'),
  
  rememberMe: z.boolean().default(false),
  deviceTrust: z.boolean().default(false),
  timezone: z.string().default('Asia/Jakarta'),
  locale: z.enum(['id', 'en']).default('id'),
})

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .transform(email => email.toLowerCase().trim()),
})

// Reset Password Schema  
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token reset tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password maksimal 128 karakter')
    .refine((password) => {
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    }, 'Password harus mengandung huruf besar, kecil, angka, dan simbol'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak sama",
  path: ["confirmPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>