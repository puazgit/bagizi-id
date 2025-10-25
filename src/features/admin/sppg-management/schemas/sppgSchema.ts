/**
 * @fileoverview SPPG Management Schemas - Zod Validation
 * @version Next.js 15.5.4 / Zod 4.1.12
 * @author Bagizi-ID Development Team
 */

import { z } from 'zod'
import { OrganizationType, SppgStatus, Timezone } from '@prisma/client'

/**
 * Schema for creating new SPPG
 */
export const createSppgSchema = z.object({
  // Basic Info
  code: z.string()
    .min(3, 'Kode SPPG minimal 3 karakter')
    .max(20, 'Kode SPPG maksimal 20 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode hanya boleh huruf besar, angka, dan strip'),
  
  name: z.string()
    .min(3, 'Nama SPPG minimal 3 karakter')
    .max(255, 'Nama SPPG maksimal 255 karakter'),
  
  description: z.string().optional().nullable(),
  
  organizationType: z.nativeEnum(OrganizationType, {
    message: 'Tipe organisasi tidak valid'
  }),
  
  establishedYear: z.number()
    .int('Tahun harus berupa bilangan bulat')
    .min(1900, 'Tahun minimal 1900')
    .max(new Date().getFullYear(), `Tahun maksimal ${new Date().getFullYear()}`)
    .optional()
    .nullable(),
  
  targetRecipients: z.number()
    .int('Target penerima manfaat harus bilangan bulat')
    .min(1, 'Target minimal 1 penerima')
    .max(1000000, 'Target maksimal 1,000,000 penerima'),
  
  // Location
  addressDetail: z.string()
    .min(10, 'Alamat detail minimal 10 karakter')
    .max(500, 'Alamat detail maksimal 500 karakter'),
  
  provinceId: z.string()
    .min(1, 'Provinsi wajib dipilih'),
  
  regencyId: z.string()
    .min(1, 'Kabupaten/Kota wajib dipilih'),
  
  districtId: z.string()
    .min(1, 'Kecamatan wajib dipilih'),
  
  villageId: z.string()
    .min(1, 'Desa/Kelurahan wajib dipilih'),
  
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit')
    .optional()
    .nullable(),
  
  coordinates: z.string()
    .transform((val) => val?.trim().replace(/\s+/g, '')) // Remove all spaces
    .refine(
      (val) => !val || /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(val),
      'Format koordinat: latitude,longitude (contoh: -6.2088,106.8456)'
    )
    .optional()
    .nullable(),
  
  timezone: z.nativeEnum(Timezone, {
    message: 'Timezone tidak valid'
  }),
  
  // Contact
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon tidak valid'),
  
  email: z.string()
    .email('Format email tidak valid')
    .toLowerCase(),
  
  // PIC (Person In Charge)
  picName: z.string()
    .min(3, 'Nama PIC minimal 3 karakter')
    .max(255, 'Nama PIC maksimal 255 karakter'),
  
  picPosition: z.string()
    .min(2, 'Jabatan PIC minimal 2 karakter')
    .max(150, 'Jabatan PIC maksimal 150 karakter'),
  
  picEmail: z.string()
    .email('Format email PIC tidak valid')
    .toLowerCase(),
  
  picPhone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon PIC tidak valid'),
  
  picWhatsapp: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor WhatsApp tidak valid')
    .optional()
    .nullable(),
  
  // Operations
  maxRadius: z.number()
    .min(0, 'Radius minimal 0 km')
    .max(500, 'Radius maksimal 500 km'),
  
  maxTravelTime: z.number()
    .int('Waktu tempuh harus bilangan bulat')
    .min(0, 'Waktu tempuh minimal 0 menit')
    .max(1440, 'Waktu tempuh maksimal 1440 menit (24 jam)'),
  
  operationStartDate: z.coerce.date(),
  
  operationEndDate: z.coerce.date()
    .optional()
    .nullable(),
  
  // Budget
  monthlyBudget: z.number()
    .min(0, 'Anggaran bulanan minimal 0')
    .max(10000000000, 'Anggaran bulanan maksimal 10 miliar')
    .optional()
    .nullable(),
  
  yearlyBudget: z.number()
    .min(0, 'Anggaran tahunan minimal 0')
    .max(120000000000, 'Anggaran tahunan maksimal 120 miliar')
    .optional()
    .nullable(),
  
  budgetCurrency: z.string()
    .default('IDR')
    .optional(),
  
  budgetStartDate: z.coerce.date()
    .optional()
    .nullable(),
  
  budgetEndDate: z.coerce.date()
    .optional()
    .nullable(),
  
  // Demo Settings
  isDemoAccount: z.boolean()
    .default(false)
    .optional(),
  
  demoExpiresAt: z.coerce.date()
    .optional()
    .nullable(),
  
  demoMaxBeneficiaries: z.number()
    .int('Maksimal penerima demo harus bilangan bulat')
    .min(1, 'Minimal 1 penerima')
    .max(1000, 'Maksimal 1000 penerima untuk demo')
    .optional()
    .nullable(),
  
  demoAllowedFeatures: z.array(z.string())
    .optional()
    .default([]),
  
  // Status
  status: z.nativeEnum(SppgStatus, {
    message: 'Status tidak valid'
  }).default('ACTIVE').optional()
}).refine(
  (data) => {
    // Validate: operationEndDate must be after operationStartDate
    if (data.operationEndDate && data.operationStartDate) {
      return new Date(data.operationEndDate) > new Date(data.operationStartDate)
    }
    return true
  },
  {
    message: 'Tanggal berakhir operasi harus setelah tanggal mulai',
    path: ['operationEndDate']
  }
).refine(
  (data) => {
    // Validate: budgetEndDate must be after budgetStartDate
    if (data.budgetEndDate && data.budgetStartDate) {
      return new Date(data.budgetEndDate) > new Date(data.budgetStartDate)
    }
    return true
  },
  {
    message: 'Tanggal berakhir anggaran harus setelah tanggal mulai',
    path: ['budgetEndDate']
  }
).refine(
  (data) => {
    // Validate: demo account must have expiry date
    if (data.isDemoAccount && !data.demoExpiresAt) {
      return false
    }
    return true
  },
  {
    message: 'Akun demo harus memiliki tanggal kadaluarsa',
    path: ['demoExpiresAt']
  }
)

/**
 * Schema for updating existing SPPG
 */
export const updateSppgSchema = createSppgSchema.partial().extend({
  id: z.string().cuid('ID SPPG tidak valid')
})

/**
 * Schema for SPPG filters
 */
export const sppgFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(SppgStatus).optional(),
  organizationType: z.nativeEnum(OrganizationType).optional(),
  provinceId: z.string().optional(),
  regencyId: z.string().optional(),
  isDemoAccount: z.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'createdAt', 'targetRecipients']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional()
})

/**
 * Type exports from schemas
 */
export type CreateSppgInput = z.infer<typeof createSppgSchema>
export type UpdateSppgInput = z.infer<typeof updateSppgSchema>
export type SppgFiltersInput = z.infer<typeof sppgFiltersSchema>
