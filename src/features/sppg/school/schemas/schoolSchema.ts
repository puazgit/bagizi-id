/**
 * @fileoverview School Master Zod Schema
 * @version Next.js 15.5.4 / Zod
 * @author Bagizi-ID Development Team
 */

import { z } from 'zod'
import { BeneficiaryType } from '@prisma/client'

/**
 * School master creation/edit schema
 * Maps to SchoolBeneficiary database model
 */
export const schoolMasterSchema = z.object({
  // Program relation
  programId: z.string().cuid('Program ID harus valid'),

  // Basic Information
  schoolName: z.string().min(3, 'Nama sekolah minimal 3 karakter'),
  schoolCode: z.string().optional().nullable(),
  schoolType: z.string().min(1, 'Tipe sekolah wajib diisi'),
  schoolStatus: z.string().min(1, 'Status sekolah wajib diisi'),

  // Contact Information
  principalName: z.string().min(3, 'Nama kepala sekolah minimal 3 karakter'),
  contactPhone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  contactEmail: z.string().email('Email tidak valid').optional().nullable(),

  // Address
  schoolAddress: z.string().min(10, 'Alamat sekolah minimal 10 karakter'),
  villageId: z.string().cuid('Village ID harus valid'),
  postalCode: z.string().optional().nullable(),
  coordinates: z.string().optional().nullable(),

  // Student Statistics
  totalStudents: z.number().int().min(0, 'Jumlah siswa tidak boleh negatif'),
  targetStudents: z.number().int().min(0, 'Target siswa tidak boleh negatif'),
  activeStudents: z.number().int().min(0, 'Siswa aktif tidak boleh negatif'),
  students4to6Years: z.number().int().min(0),
  students7to12Years: z.number().int().min(0),
  students13to15Years: z.number().int().min(0),
  students16to18Years: z.number().int().min(0),

  // Feeding Schedule
  feedingDays: z.array(z.number().int().min(1).max(7)),
  mealsPerDay: z.number().int().min(1).max(5),
  feedingTime: z.string().optional().nullable(),

  // Delivery Information
  deliveryAddress: z.string().min(10, 'Alamat pengiriman minimal 10 karakter'),
  deliveryContact: z.string().min(10, 'Kontak pengiriman minimal 10 digit'),
  deliveryInstructions: z.string().optional().nullable(),

  // Facilities
  storageCapacity: z.string().optional().nullable(),
  servingMethod: z.enum(['CAFETERIA', 'CLASSROOM', 'TAKEAWAY', 'OTHER']),
  hasKitchen: z.boolean(),
  hasStorage: z.boolean(),
  hasCleanWater: z.boolean(),
  hasElectricity: z.boolean(),

  // Status
  isActive: z.boolean(),
  suspendedAt: z.date().optional().nullable(),
  suspensionReason: z.string().optional().nullable(),

  // Beneficiary Type
  beneficiaryType: z.nativeEnum(BeneficiaryType),

  // Special Requirements
  specialDietary: z.array(z.string()),
  allergyAlerts: z.array(z.string()),
  culturalReqs: z.array(z.string()),
})

/**
 * School master update schema (all fields optional)
 */
export const updateSchoolMasterSchema = schoolMasterSchema.partial()

/**
 * TypeScript types inferred from schemas
 */
export type SchoolMasterInput = z.infer<typeof schoolMasterSchema>
export type UpdateSchoolMasterInput = z.infer<typeof updateSchoolMasterSchema>

/**
 * School master filter schema for queries
 */
export const schoolMasterFilterSchema = z.object({
  programId: z.string().optional(),
  schoolType: z.string().optional(),
  isActive: z.boolean().optional(),
  villageId: z.string().optional(),
  search: z.string().optional(), // Search by name, code, or principal
})

export type SchoolMasterFilter = z.infer<typeof schoolMasterFilterSchema>
