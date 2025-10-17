/**
 * @fileoverview Procurement domain Zod validation schemas
 * @version Next.js 15.5.4 / Zod / Enterprise-grade validation
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { z } from 'zod'
import { 
  ProcurementStatus, 
  ProcurementMethod, 
  QualityGrade,
  InventoryCategory,
  SupplierType 
} from '@prisma/client'

// ================================ ENUM SCHEMAS ================================

export const procurementStatusSchema = z.nativeEnum(ProcurementStatus)
export const procurementMethodSchema = z.nativeEnum(ProcurementMethod)
export const qualityGradeSchema = z.nativeEnum(QualityGrade)
export const inventoryCategorySchema = z.nativeEnum(InventoryCategory)
export const supplierTypeSchema = z.nativeEnum(SupplierType)

// ================================ PROCUREMENT PLAN SCHEMAS ================================

/**
 * Procurement plan creation schema with comprehensive validation
 */
export const procurementPlanCreateSchema = z.object({
  programId: z.string().cuid('Program ID harus valid').optional(),
  
  // Planning Period - Required
  planName: z.string()
    .min(5, 'Nama rencana minimal 5 karakter')
    .max(100, 'Nama rencana maksimal 100 karakter')
    .regex(/^[a-zA-Z0-9\s\-\_\/]+$/, 'Nama rencana mengandung karakter tidak valid'),
  
  planMonth: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Format bulan harus YYYY-MM (contoh: 2025-10)')
    .refine((val) => {
      const [year, month] = val.split('-').map(Number)
      return year >= 2020 && year <= 2100 && month >= 1 && month <= 12
    }, 'Bulan tidak valid'),
  
  planYear: z.number()
    .int('Tahun harus bilangan bulat')
    .min(2020, 'Tahun minimal 2020')
    .max(2100, 'Tahun maksimal 2100'),
  
  planQuarter: z.number()
    .int('Quarter harus bilangan bulat')
    .min(1, 'Quarter minimal 1')
    .max(4, 'Quarter maksimal 4')
    .optional(),
  
  // Budget Planning - Required
  totalBudget: z.number()
    .min(1000000, 'Anggaran total minimal Rp 1.000.000')
    .max(10000000000, 'Anggaran total maksimal Rp 10.000.000.000'),
  
  // Categories Budget - Optional
  proteinBudget: z.number()
    .min(0, 'Anggaran protein tidak boleh negatif')
    .optional(),
  
  carbBudget: z.number()
    .min(0, 'Anggaran karbohidrat tidak boleh negatif')
    .optional(),
  
  vegetableBudget: z.number()
    .min(0, 'Anggaran sayur tidak boleh negatif')
    .optional(),
  
  fruitBudget: z.number()
    .min(0, 'Anggaran buah tidak boleh negatif')
    .optional(),
  
  otherBudget: z.number()
    .min(0, 'Anggaran lainnya tidak boleh negatif')
    .optional(),
  
  // Targets - Required
  targetRecipients: z.number()
    .int('Jumlah penerima harus bilangan bulat')
    .min(1, 'Jumlah penerima minimal 1')
    .max(100000, 'Jumlah penerima maksimal 100.000'),
  
  targetMeals: z.number()
    .int('Jumlah makanan harus bilangan bulat')
    .min(1, 'Jumlah makanan minimal 1')
    .max(10000000, 'Jumlah makanan maksimal 10.000.000'),
  
  costPerMeal: z.number()
    .min(1000, 'Biaya per makanan minimal Rp 1.000')
    .max(100000, 'Biaya per makanan maksimal Rp 100.000')
    .optional(),
  
  // Planning Details
  notes: z.string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .optional(),
  
  emergencyBuffer: z.number()
    .min(0, 'Buffer darurat tidak boleh negatif')
    .max(1000000000, 'Buffer darurat terlalu besar')
    .optional()
}).refine((data) => {
  // Validate category budgets don't exceed total budget if provided
  const categoryTotal = (data.proteinBudget || 0) + 
                       (data.carbBudget || 0) + 
                       (data.vegetableBudget || 0) + 
                       (data.fruitBudget || 0) + 
                       (data.otherBudget || 0)
  return categoryTotal === 0 || categoryTotal <= data.totalBudget
}, {
  message: 'Total anggaran kategori tidak boleh melebihi anggaran total',
  path: ['totalBudget']
})

/**
 * Procurement plan update schema
 */
export const procurementPlanUpdateSchema = procurementPlanCreateSchema.partial().extend({
  id: z.string().cuid('ID rencana harus valid').optional(),
  
  approvalStatus: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION'])
    .optional(),
  
  rejectionReason: z.string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional()
})

/**
 * Procurement plan approval schema
 */
export const procurementPlanApprovalSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_REVISION']),
  rejectionReason: z.string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional()
}).refine((data) => {
  if (data.action !== 'APPROVE' && !data.rejectionReason) {
    return false
  }
  return true
}, {
  message: 'Alasan penolakan wajib diisi untuk penolakan atau revisi',
  path: ['rejectionReason']
})

/**
 * Procurement plan filters schema
 */
export const procurementPlanFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  approvalStatus: z.string().optional(),
  planYear: z.number().int().optional(),
  planQuarter: z.number().int().min(1).max(4).optional(),
  programId: z.string().cuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['planName', 'planMonth', 'totalBudget', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// ================================ PROCUREMENT ORDER SCHEMAS ================================

/**
 * Procurement item schema (for nested creation)
 */
export const procurementItemSchema = z.object({
  inventoryItemId: z.string().cuid('Inventory item ID harus valid').optional(),
  
  itemName: z.string()
    .min(2, 'Nama item minimal 2 karakter')
    .max(100, 'Nama item maksimal 100 karakter'),
  
  itemCode: z.string()
    .max(50, 'Kode item maksimal 50 karakter')
    .optional(),
  
  category: inventoryCategorySchema,
  
  brand: z.string()
    .max(50, 'Merek maksimal 50 karakter')
    .optional(),
  
  orderedQuantity: z.number()
    .min(0.01, 'Jumlah pesanan minimal 0.01')
    .max(1000000, 'Jumlah pesanan terlalu besar'),
  
  unit: z.string()
    .min(1, 'Unit tidak boleh kosong')
    .max(20, 'Unit maksimal 20 karakter')
    .regex(/^[a-zA-Z]+$/, 'Unit hanya boleh berupa huruf'),
  
  pricePerUnit: z.number()
    .min(0, 'Harga per unit tidak boleh negatif')
    .max(10000000, 'Harga per unit terlalu tinggi'),
  
  totalPrice: z.number()
    .min(0, 'Total harga tidak boleh negatif')
    .max(1000000000, 'Total harga terlalu tinggi'),
  
  discountPercent: z.number()
    .min(0, 'Diskon tidak boleh negatif')
    .max(100, 'Diskon maksimal 100%')
    .default(0),
  
  discountAmount: z.number()
    .min(0, 'Jumlah diskon tidak boleh negatif')
    .default(0),
  
  finalPrice: z.number()
    .min(0, 'Harga akhir tidak boleh negatif')
    .max(1000000000, 'Harga akhir terlalu tinggi'),
  
  qualityStandard: z.string()
    .max(200, 'Standar kualitas maksimal 200 karakter')
    .optional(),
  
  gradeRequested: z.string()
    .max(50, 'Grade diminta maksimal 50 karakter')
    .optional(),
  
  expiryDate: z.coerce.date()
    .min(new Date(), 'Tanggal kadaluarsa harus di masa depan')
    .optional(),
  
  storageRequirement: z.string()
    .max(200, 'Persyaratan penyimpanan maksimal 200 karakter')
    .optional(),
  
  notes: z.string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
})

/**
 * Procurement creation schema with comprehensive validation
 */
export const procurementCreateSchema = z.object({
  planId: z.string().cuid('Plan ID harus valid').optional(),
  
  procurementDate: z.coerce.date({
    message: 'Tanggal pengadaan wajib diisi dan harus format tanggal yang valid'
  }),
  
  expectedDelivery: z.coerce.date()
    .optional()
    .refine((date) => {
      if (!date) return true
      return date >= new Date()
    }, 'Tanggal pengiriman harus di masa depan'),
  
  // Supplier - Required
  supplierId: z.string().cuid('Supplier ID harus valid'),
  
  // Purchase Information
  purchaseMethod: procurementMethodSchema,
  
  paymentTerms: z.string()
    .max(100, 'Syarat pembayaran maksimal 100 karakter')
    .optional(),
  
  // Financial - Required
  subtotalAmount: z.number()
    .min(0, 'Subtotal tidak boleh negatif')
    .max(10000000000, 'Subtotal terlalu besar'),
  
  taxAmount: z.number()
    .min(0, 'Pajak tidak boleh negatif')
    .max(1000000000, 'Pajak terlalu besar')
    .default(0),
  
  discountAmount: z.number()
    .min(0, 'Diskon tidak boleh negatif')
    .max(1000000000, 'Diskon terlalu besar')
    .default(0),
  
  shippingCost: z.number()
    .min(0, 'Biaya pengiriman tidak boleh negatif')
    .max(100000000, 'Biaya pengiriman terlalu tinggi')
    .default(0),
  
  totalAmount: z.number()
    .min(0, 'Total tidak boleh negatif')
    .max(10000000000, 'Total terlalu besar'),
  
  paymentDue: z.coerce.date()
    .optional(),
  
  // Logistics
  deliveryMethod: z.string()
    .max(50, 'Metode pengiriman maksimal 50 karakter')
    .optional(),
  
  transportCost: z.number()
    .min(0, 'Biaya transport tidak boleh negatif')
    .max(100000000, 'Biaya transport terlalu tinggi')
    .optional(),
  
  packagingType: z.string()
    .max(50, 'Jenis kemasan maksimal 50 karakter')
    .optional(),
  
  // Items - Required (at least 1 item)
  items: z.array(procurementItemSchema)
    .min(1, 'Minimal 1 item harus ditambahkan')
    .max(100, 'Maksimal 100 item per pengadaan')
}).refine((data) => {
  // Validate totalAmount calculation
  const calculatedTotal = data.subtotalAmount + data.taxAmount + data.shippingCost - data.discountAmount
  const diff = Math.abs(calculatedTotal - data.totalAmount)
  return diff < 1 // Allow small rounding differences
}, {
  message: 'Total amount tidak sesuai dengan perhitungan (subtotal + pajak + ongkir - diskon)',
  path: ['totalAmount']
})

/**
 * Procurement update schema
 */
export const procurementUpdateSchema = procurementCreateSchema.partial().extend({
  id: z.string().cuid('ID pengadaan harus valid').optional(),
  
  actualDelivery: z.coerce.date().optional(),
  
  status: procurementStatusSchema.optional(),
  
  deliveryStatus: z.enum(['ORDERED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .optional(),
  
  qualityGrade: qualityGradeSchema.optional(),
  
  qualityNotes: z.string()
    .max(500, 'Catatan kualitas maksimal 500 karakter')
    .optional(),
  
  receiptNumber: z.string()
    .max(100, 'Nomor nota maksimal 100 karakter')
    .optional(),
  
  receiptPhoto: z.string()
    .url('URL foto nota tidak valid')
    .max(500, 'URL foto nota terlalu panjang')
    .optional(),
  
  deliveryPhoto: z.string()
    .url('URL foto pengiriman tidak valid')
    .max(500, 'URL foto pengiriman terlalu panjang')
    .optional(),
  
  invoiceNumber: z.string()
    .max(100, 'Nomor invoice maksimal 100 karakter')
    .optional(),
  
  inspectedBy: z.string()
    .cuid('User ID inspector harus valid')
    .optional(),
  
  inspectedAt: z.coerce.date().optional(),
  
  acceptanceStatus: z.enum(['ACCEPTED', 'REJECTED', 'PARTIAL'])
    .optional(),
  
  rejectionReason: z.string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional(),
  
  paidAmount: z.number()
    .min(0, 'Jumlah dibayar tidak boleh negatif')
    .optional(),
  
  paymentStatus: z.enum(['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'])
    .optional()
})

/**
 * Procurement item update schema (for receiving/acceptance)
 */
export const procurementItemUpdateSchema = z.object({
  receivedQuantity: z.number()
    .min(0, 'Jumlah diterima tidak boleh negatif')
    .optional(),
  
  qualityReceived: z.string()
    .max(200, 'Kualitas diterima maksimal 200 karakter')
    .optional(),
  
  gradeReceived: z.string()
    .max(50, 'Grade diterima maksimal 50 karakter')
    .optional(),
  
  expiryDate: z.coerce.date().optional(),
  
  batchNumber: z.string()
    .max(100, 'Nomor batch maksimal 100 karakter')
    .optional(),
  
  productionDate: z.coerce.date().optional(),
  
  isAccepted: z.boolean().optional(),
  
  rejectionReason: z.string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional(),
  
  returnedQuantity: z.number()
    .min(0, 'Jumlah dikembalikan tidak boleh negatif')
    .default(0),
  
  notes: z.string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
})

/**
 * Procurement filters schema
 */
export const procurementFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  status: z.array(procurementStatusSchema).optional(),
  deliveryStatus: z.array(z.string()).optional(),
  paymentStatus: z.array(z.string()).optional(),
  supplierId: z.string().cuid().optional(),
  planId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  purchaseMethod: z.array(procurementMethodSchema).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['procurementCode', 'procurementDate', 'totalAmount', 'status', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// ================================ SUPPLIER SCHEMAS ================================

/**
 * Supplier creation schema with comprehensive validation
 */
export const supplierCreateSchema = z.object({
  // Basic Information - Required
  supplierName: z.string()
    .min(3, 'Nama supplier minimal 3 karakter')
    .max(255, 'Nama supplier maksimal 255 karakter')
    .regex(/^[a-zA-Z0-9\s\.\,\-\_\(\)]+$/, 'Nama supplier mengandung karakter tidak valid'),
  
  businessName: z.string()
    .min(3, 'Nama bisnis minimal 3 karakter')
    .max(255, 'Nama bisnis maksimal 255 karakter')
    .optional(),
  
  supplierType: supplierTypeSchema,
  
  category: z.string()
    .min(2, 'Kategori minimal 2 karakter')
    .max(100, 'Kategori maksimal 100 karakter'),
  
  // Contact Information - Required
  primaryContact: z.string()
    .min(3, 'Nama kontak minimal 3 karakter')
    .max(255, 'Nama kontak maksimal 255 karakter'),
  
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid (contoh: 08123456789)'),
  
  email: z.string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .optional(),
  
  whatsapp: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor WhatsApp tidak valid')
    .optional(),
  
  website: z.string()
    .url('Format website tidak valid')
    .max(255, 'Website URL maksimal 255 karakter')
    .optional(),
  
  // Address & Location - Required
  address: z.string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),
  
  city: z.string()
    .min(2, 'Nama kota minimal 2 karakter')
    .max(100, 'Nama kota maksimal 100 karakter'),
  
  province: z.string()
    .min(2, 'Nama provinsi minimal 2 karakter')
    .max(100, 'Nama provinsi maksimal 100 karakter'),
  
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit angka')
    .optional(),
  
  coordinates: z.string()
    .regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Format koordinat tidak valid (contoh: -6.2088,106.8456)')
    .optional(),
  
  deliveryRadius: z.number()
    .min(0, 'Radius pengiriman tidak boleh negatif')
    .max(1000, 'Radius pengiriman maksimal 1000 km')
    .optional(),
  
  // Financial & Terms
  paymentTerms: z.string()
    .max(100, 'Syarat pembayaran maksimal 100 karakter')
    .default('CASH_ON_DELIVERY'),
  
  creditLimit: z.number()
    .min(0, 'Limit kredit tidak boleh negatif')
    .max(10000000000, 'Limit kredit terlalu besar')
    .optional(),
  
  // Supplier Capabilities
  minOrderValue: z.number()
    .min(0, 'Nilai pesanan minimal tidak boleh negatif')
    .optional(),
  
  maxOrderCapacity: z.number()
    .min(0, 'Kapasitas pesanan maksimal tidak boleh negatif')
    .optional(),
  
  leadTimeHours: z.number()
    .int('Lead time harus bilangan bulat')
    .min(1, 'Lead time minimal 1 jam')
    .max(720, 'Lead time maksimal 30 hari')
    .default(24),
  
  deliveryDays: z.array(z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']))
    .max(7, 'Maksimal 7 hari pengiriman')
    .default([]),
  
  specialties: z.array(z.string().max(100))
    .max(20, 'Maksimal 20 spesialisasi')
    .default([]),
  
  certifications: z.array(z.string().max(100))
    .max(20, 'Maksimal 20 sertifikasi')
    .default([]),
  
  // Compliance
  isHalalCertified: z.boolean().default(false),
  isFoodSafetyCertified: z.boolean().default(false),
  isISOCertified: z.boolean().default(false),
  
  // Digital Integration
  preferredOrderMethod: z.enum(['PHONE', 'EMAIL', 'WHATSAPP', 'API'])
    .default('PHONE')
})

/**
 * Supplier update schema
 */
export const supplierUpdateSchema = supplierCreateSchema.partial().extend({
  id: z.string().cuid('ID supplier harus valid').optional(),
  
  isActive: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  
  isBlacklisted: z.boolean().optional(),
  blacklistReason: z.string()
    .min(10, 'Alasan blacklist minimal 10 karakter')
    .max(500, 'Alasan blacklist maksimal 500 karakter')
    .optional(),
  
  complianceStatus: z.enum(['PENDING', 'VERIFIED', 'EXPIRED'])
    .optional(),
  
  partnershipLevel: z.enum(['STANDARD', 'PREFERRED', 'STRATEGIC'])
    .optional(),
  
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  
  relationshipManager: z.string()
    .max(255, 'Nama relationship manager maksimal 255 karakter')
    .optional()
})

/**
 * Supplier filters schema
 */
export const supplierFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  supplierType: z.array(supplierTypeSchema).optional(),
  category: z.array(z.string()).optional(),
  city: z.array(z.string()).optional(),
  province: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  partnershipLevel: z.array(z.string()).optional(),
  complianceStatus: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['supplierName', 'overallRating', 'totalOrders', 'createdAt']).default('supplierName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// ================================ EXPORT TYPES FROM SCHEMAS ================================

export type ProcurementPlanCreateInput = z.infer<typeof procurementPlanCreateSchema>
export type ProcurementPlanUpdateInput = z.infer<typeof procurementPlanUpdateSchema>
export type ProcurementPlanApprovalInput = z.infer<typeof procurementPlanApprovalSchema>
export type ProcurementPlanFilters = z.infer<typeof procurementPlanFiltersSchema>

export type ProcurementItemInput = z.infer<typeof procurementItemSchema>
export type ProcurementCreateInput = z.infer<typeof procurementCreateSchema>
export type ProcurementUpdateInput = z.infer<typeof procurementUpdateSchema>
export type ProcurementItemUpdateInput = z.infer<typeof procurementItemUpdateSchema>
export type ProcurementFilters = z.infer<typeof procurementFiltersSchema>

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>
export type SupplierFilters = z.infer<typeof supplierFiltersSchema>
