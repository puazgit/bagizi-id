/**
 * @fileoverview Stock Movement Validation Schemas
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { MovementType } from '@prisma/client'

/**
 * Movement Type Enum Schema
 */
export const movementTypeSchema = z.nativeEnum(MovementType)

/**
 * Reference Type Schema
 */
export const referenceTypeSchema = z.enum([
  'PROCUREMENT',
  'PRODUCTION',
  'DISTRIBUTION',
  'RETURN',
  'DONATION',
  'WASTE',
  'EXPIRED',
  'DAMAGED',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'COUNT_ADJUSTMENT',
  'SYSTEM_CORRECTION',
  'OTHER',
])

/**
 * Create Stock Movement Schema
 */
export const createStockMovementSchema = z.object({
  inventoryId: z
    .string()
    .cuid('ID inventory tidak valid'),
  
  movementType: movementTypeSchema,
  
  quantity: z
    .number()
    .positive('Jumlah harus lebih dari 0'),
  
  unitCost: z
    .number()
    .min(0, 'Biaya per unit tidak boleh negatif')
    .optional()
    .nullable(),
  
  referenceType: referenceTypeSchema.optional().nullable(),
  
  referenceId: z
    .string()
    .cuid('ID referensi tidak valid')
    .optional()
    .nullable(),
  
  referenceNumber: z
    .string()
    .max(100, 'Nomor referensi maksimal 100 karakter')
    .optional()
    .nullable(),
  
  batchNumber: z
    .string()
    .max(100, 'Nomor batch maksimal 100 karakter')
    .optional()
    .nullable(),
  
  expiryDate: z
    .union([z.date(), z.string().datetime()])
    .optional()
    .nullable(),
  
  notes: z
    .string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .optional()
    .nullable(),
  
  documentUrl: z
    .string()
    .url('URL dokumen tidak valid')
    .max(500, 'URL dokumen maksimal 500 karakter')
    .optional()
    .nullable(),
})

/**
 * Update Stock Movement Schema (for approval)
 */
export const updateStockMovementSchema = z.object({
  id: z.string().cuid('ID movement tidak valid'),
  approvedBy: z.string().cuid('ID approver tidak valid'),
  notes: z.string().max(1000, 'Catatan approval maksimal 1000 karakter').optional().nullable(),
})

/**
 * Stock Movement Filters Schema
 */
export const stockMovementFiltersSchema = z.object({
  inventoryId: z.string().cuid().optional(),
  movementType: movementTypeSchema.optional(),
  referenceType: referenceTypeSchema.optional(),
  referenceId: z.string().cuid().optional(), // Added for filtering by reference
  startDate: z.union([z.date(), z.string().datetime()]).optional(),
  endDate: z.union([z.date(), z.string().datetime()]).optional(),
  movedBy: z.string().cuid().optional(),
  approvedBy: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
})

/**
 * Batch Stock Movement Schema
 */
export const batchStockMovementSchema = z.object({
  movements: z.array(createStockMovementSchema).min(1, 'Minimal 1 movement diperlukan'),
  referenceType: z.string().min(1, 'Tipe referensi wajib diisi'),
  referenceId: z.string().cuid('ID referensi tidak valid'),
  referenceNumber: z.string().min(1, 'Nomor referensi wajib diisi'),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
})

/**
 * Type exports for use in components
 */
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>
export type UpdateStockMovementInput = z.infer<typeof updateStockMovementSchema>
export type StockMovementFiltersInput = z.infer<typeof stockMovementFiltersSchema>
export type BatchStockMovementInput = z.infer<typeof batchStockMovementSchema>
export type ReferenceTypeValue = z.infer<typeof referenceTypeSchema>

/**
 * Movement Type Labels
 */
export const movementTypeLabels: Record<MovementType, string> = {
  IN: 'Stok Masuk',
  OUT: 'Stok Keluar',
  ADJUSTMENT: 'Penyesuaian',
  EXPIRED: 'Kadaluarsa',
  DAMAGED: 'Rusak',
  TRANSFER: 'Transfer',
}

/**
 * Movement Type Colors
 */
export const movementTypeColors: Record<MovementType, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  IN: 'success',
  OUT: 'destructive',
  ADJUSTMENT: 'warning',
  EXPIRED: 'destructive',
  DAMAGED: 'destructive',
  TRANSFER: 'secondary',
}

/**
 * Reference Type Labels
 */
export const referenceTypeLabels: Record<ReferenceTypeValue, string> = {
  PROCUREMENT: 'Pengadaan',
  PRODUCTION: 'Produksi',
  DISTRIBUTION: 'Distribusi',
  RETURN: 'Retur',
  DONATION: 'Donasi',
  WASTE: 'Terbuang',
  EXPIRED: 'Kadaluarsa',
  DAMAGED: 'Rusak',
  TRANSFER_IN: 'Transfer Masuk',
  TRANSFER_OUT: 'Transfer Keluar',
  COUNT_ADJUSTMENT: 'Penyesuaian Stok Opname',
  SYSTEM_CORRECTION: 'Koreksi Sistem',
  OTHER: 'Lainnya',
}

/**
 * Reference Type to Movement Type Mapping
 */
export const referenceTypeMovementMapping: Record<ReferenceTypeValue, MovementType> = {
  PROCUREMENT: MovementType.IN,
  PRODUCTION: MovementType.OUT,
  DISTRIBUTION: MovementType.OUT,
  RETURN: MovementType.IN,
  DONATION: MovementType.IN,
  WASTE: MovementType.OUT,
  EXPIRED: MovementType.EXPIRED,
  DAMAGED: MovementType.DAMAGED,
  TRANSFER_IN: MovementType.TRANSFER,
  TRANSFER_OUT: MovementType.TRANSFER,
  COUNT_ADJUSTMENT: MovementType.ADJUSTMENT,
  SYSTEM_CORRECTION: MovementType.ADJUSTMENT,
  OTHER: MovementType.ADJUSTMENT,
}
