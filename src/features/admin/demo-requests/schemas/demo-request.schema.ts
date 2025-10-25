/**
 * @fileoverview Demo Request Zod Validation Schemas
 * @version Next.js 15.5.4 / Zod 3.23.8
 * @author Bagizi-ID Development Team
 * 
 * Validation schemas for Demo Request forms and API requests
 */

import { z } from 'zod'
import { DemoRequestStatus, OrganizationType, DemoType } from '@prisma/client'

/**
 * Demo Request create/update schema
 */
export const demoRequestFormSchema = z.object({
  // Contact Information (required)
  organizationName: z
    .string()
    .min(3, 'Nama organisasi minimal 3 karakter')
    .max(200, 'Nama organisasi maksimal 200 karakter'),
  
  picName: z
    .string()
    .min(3, 'Nama PIC minimal 3 karakter')
    .max(100, 'Nama PIC maksimal 100 karakter'),
  
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  
  picEmail: z
    .string()
    .email('Email tidak valid')
    .toLowerCase(),
  
  picPhone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[\d+\-() ]+$/, 'Format nomor telepon tidak valid'),
  
  picWhatsapp: z
    .string()
    .min(10, 'Nomor WhatsApp minimal 10 digit')
    .max(15, 'Nomor WhatsApp maksimal 15 digit')
    .regex(/^[\d+\-() ]+$/, 'Format nomor WhatsApp tidak valid')
    .optional()
    .or(z.literal('')),
  
  picPosition: z.string().max(100).optional().or(z.literal('')),
  
  // Organization Details
  organizationType: z.nativeEnum(OrganizationType),
  
  targetBeneficiaries: z
    .number()
    .int('Jumlah harus bilangan bulat')
    .min(1, 'Minimal 1 penerima manfaat')
    .max(100000, 'Maksimal 100,000 penerima manfaat')
    .optional()
    .or(z.literal(0)),
  
  operationalArea: z.string().max(200).optional().or(z.literal('')),
  
  currentSystem: z.string().max(500).optional().or(z.literal('')),
  
  currentChallenges: z.array(z.string()).optional().default([]),
  
  expectedGoals: z.array(z.string()).optional().default([]),
  
  // Demo Details
  demoType: z.nativeEnum(DemoType),
  
  requestedFeatures: z.array(z.string()).optional().default([]),
  
  specialRequirements: z.string().max(1000).optional().or(z.literal('')),
  
  preferredStartDate: z.coerce.date().optional(),
  
  estimatedDuration: z
    .number()
    .int()
    .min(7, 'Durasi minimal 7 hari')
    .max(90, 'Durasi maksimal 90 hari')
    .default(14)
    .optional(),
  
  demoDuration: z
    .number()
    .int()
    .min(30, 'Durasi demo minimal 30 menit')
    .max(240, 'Durasi demo maksimal 240 menit')
    .default(60)
    .optional(),
  
  demoMode: z
    .enum(['ONLINE', 'OFFLINE', 'HYBRID'])
    .default('ONLINE')
    .optional(),
  
  preferredTime: z
    .enum(['MORNING', 'AFTERNOON', 'EVENING', 'FLEXIBLE'])
    .default('MORNING')
    .optional(),
  
  timezone: z.string().default('Asia/Jakarta').optional(),
  
  // Status & Assignment
  status: z.nativeEnum(DemoRequestStatus).optional(),
  
  assignedTo: z.string().cuid().optional().or(z.literal('')),
  
  notes: z.string().max(2000).optional().or(z.literal('')),
  
  // Follow-up
  followUpRequired: z.boolean().default(true).optional(),
  
  followUpDate: z.coerce.date().optional(),
})

export type DemoRequestFormInput = z.infer<typeof demoRequestFormSchema>

/**
 * Demo Request filters schema
 */
export const demoRequestFiltersSchema = z.object({
  status: z.nativeEnum(DemoRequestStatus).optional(),
  organizationType: z.nativeEnum(OrganizationType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  assignedTo: z.string().optional(),
  isConverted: z.boolean().optional(),
})

export type DemoRequestFilters = z.infer<typeof demoRequestFiltersSchema>

/**
 * Demo Request approval schema
 */
export const demoRequestApprovalSchema = z.object({
  notes: z.string().max(2000).optional(),
})

export type DemoRequestApprovalInput = z.infer<typeof demoRequestApprovalSchema>

/**
 * Demo Request rejection schema
 */
export const demoRequestRejectionSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(1000, 'Alasan penolakan maksimal 1000 karakter'),
  notes: z.string().max(2000).optional(),
})

export type DemoRequestRejectionInput = z.infer<typeof demoRequestRejectionSchema>

/**
 * Demo Request assignment schema
 */
export const demoRequestAssignmentSchema = z.object({
  assignedTo: z.string().cuid('ID user tidak valid'),
  notes: z.string().max(2000).optional(),
})

export type DemoRequestAssignmentInput = z.infer<typeof demoRequestAssignmentSchema>

/**
 * Demo Request conversion schema
 */
export const demoRequestConversionSchema = z.object({
  convertedSppgId: z.string().cuid('ID SPPG tidak valid'),
  notes: z.string().max(2000).optional(),
})

export type DemoRequestConversionInput = z.infer<typeof demoRequestConversionSchema>

/**
 * Helper: Parse form data with error handling
 */
export function parseDemoRequestForm(data: unknown) {
  return demoRequestFormSchema.safeParse(data)
}

/**
 * Helper: Parse filters with error handling
 */
export function parseDemoRequestFilters(data: unknown) {
  return demoRequestFiltersSchema.safeParse(data)
}
