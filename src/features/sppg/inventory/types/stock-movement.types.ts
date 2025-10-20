/**
 * @fileoverview Stock Movement Type Definitions
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { MovementType } from '@prisma/client'

/**
 * Stock Movement Interface
 * Represents a stock in/out/adjustment transaction
 */
export interface StockMovement {
  id: string
  inventoryId: string
  movementType: MovementType
  quantity: number
  unit: string
  stockBefore: number
  stockAfter: number
  unitCost: number | null
  totalCost: number | null
  referenceType: string | null
  referenceId: string | null
  referenceNumber: string | null
  batchNumber: string | null
  expiryDate: Date | null
  notes: string | null
  documentUrl: string | null
  movedBy: string
  movedAt: Date
  approvedBy: string | null
  approvedAt: Date | null
}

/**
 * Stock Movement with Inventory Details
 */
export interface StockMovementDetail extends StockMovement {
  inventory: {
    id: string
    itemName: string
    itemCode: string | null
    category: string
    unit: string
  }
  mover?: {
    id: string
    name: string
    email: string
  }
  approver?: {
    id: string
    name: string
    email: string
  } | null
}

/**
 * Reference Type Enum
 */
export type ReferenceType =
  | 'PROCUREMENT'
  | 'PRODUCTION'
  | 'DISTRIBUTION'
  | 'RETURN'
  | 'DONATION'
  | 'WASTE'
  | 'EXPIRED'
  | 'DAMAGED'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'COUNT_ADJUSTMENT'
  | 'SYSTEM_CORRECTION'
  | 'OTHER'

/**
 * Create Stock Movement Input
 */
export interface CreateStockMovementInput {
  inventoryId: string
  movementType: MovementType
  quantity: number
  unitCost?: number | null
  referenceType?: ReferenceType | null
  referenceId?: string | null
  referenceNumber?: string | null
  batchNumber?: string | null
  expiryDate?: Date | string | null
  notes?: string | null
  documentUrl?: string | null
}

/**
 * Update Stock Movement Input (for approval)
 */
export interface UpdateStockMovementInput {
  id: string
  approvedBy?: string
  notes?: string
}

/**
 * Stock Movement Filters
 */
export interface StockMovementFilters {
  inventoryId?: string
  movementType?: MovementType
  referenceType?: string
  referenceId?: string
  startDate?: Date | string
  endDate?: Date | string
  movedBy?: string
  approvedBy?: string
  isApproved?: boolean
  search?: string
  page?: number
  pageSize?: number
}

/**
 * Movement Type Info
 */
export interface MovementTypeInfo {
  type: MovementType
  label: string
  color: 'success' | 'destructive' | 'warning' | 'secondary'
  icon: string
  description: string
  requiresApproval: boolean
}

/**
 * Stock Movement Summary
 */
export interface StockMovementSummary {
  totalMovements: number
  totalIn: number
  totalOut: number
  totalAdjustments: number
  totalValue: number
  movementsByType: Record<MovementType, number>
  movementsByMonth: Array<{
    month: string
    in: number
    out: number
    adjustment: number
  }>
  recentMovements: StockMovementDetail[]
}

/**
 * Reference Type Info
 */
export interface ReferenceTypeInfo {
  type: ReferenceType
  label: string
  movementType: MovementType
  description: string
}

/**
 * Stock Movement Response (API)
 */
export interface StockMovementResponse {
  success: boolean
  data?: StockMovement
  error?: string
  details?: Record<string, unknown>
}

/**
 * Stock Movement List Response (API)
 */
export interface StockMovementListResponse {
  success: boolean
  data?: StockMovementDetail[]
  pagination?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  error?: string
}

/**
 * Stock Movement Summary Response (API)
 */
export interface StockMovementSummaryResponse {
  success: boolean
  data?: StockMovementSummary
  error?: string
}

/**
 * Batch Stock Movement Input (for bulk operations)
 */
export interface BatchStockMovementInput {
  movements: CreateStockMovementInput[]
  referenceType: string
  referenceId: string
  referenceNumber: string
  notes?: string
}
