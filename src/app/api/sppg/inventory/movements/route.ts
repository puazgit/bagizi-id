/**
 * @fileoverview Stock Movement API Routes - List & Create
 * @module api/sppg/inventory/movements
 * @description Handles GET (list with filters) and POST (create) operations for stock movements
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * @requires Zod - Request validation
 * 
 * RBAC Integration:
 * - GET/POST: Protected by withSppgAuth
 * - Automatic audit logging
 * - Permissions: INVENTORY_VIEW (GET), INVENTORY_MANAGE (POST)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { 
  createStockMovementSchema,
  stockMovementFiltersSchema 
} from '@/features/sppg/inventory/schemas'
import { UserRole, MovementType } from '@prisma/client'
import type { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/inventory/movements
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_VIEW permission
 * @returns {Promise<Response>} List of stock movements with metadata
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_VIEW')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk melihat pergerakan stok'
        }, { status: 403 })
      }

      // Parse and validate query parameters
      const { searchParams } = new URL(request.url)
      const filters = {
        inventoryId: searchParams.get('inventoryId') || undefined,
        movementType: searchParams.get('movementType') as MovementType | undefined,
        referenceType: searchParams.get('referenceType') || undefined,
        referenceId: searchParams.get('referenceId') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        approvedBy: searchParams.get('approvedBy') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }

    console.log('📋 [Stock Movement API] Filters to validate:', JSON.stringify(filters, null, 2))

    const validated = stockMovementFiltersSchema.safeParse(filters)
    if (!validated.success) {
      console.error('❌ [Stock Movement API] Validation failed:', JSON.stringify(validated.error.issues, null, 2))
      return NextResponse.json({ 
        error: 'Invalid filters',
        details: validated.error.issues
      }, { status: 400 })
    }

    console.log('✅ [Stock Movement API] Validation passed:', validated.data)

    // 5. Build where clause for Prisma query
    const where: {
      inventory: { sppgId: string }
      inventoryId?: string
      movementType?: MovementType
      referenceType?: string
      referenceId?: string
      approvedBy?: string | null
      movedAt?: { gte?: Date; lte?: Date }
    } = {
      inventory: {
        sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
      }
    }

    // Apply filters
    if (validated.data.inventoryId) {
      where.inventoryId = validated.data.inventoryId
    }

    if (validated.data.movementType) {
      where.movementType = validated.data.movementType
    }

    if (validated.data.referenceType) {
      where.referenceType = validated.data.referenceType
    }

    if (validated.data.referenceId) {
      where.referenceId = validated.data.referenceId
    }

    // Filter by approval status (check if approvedBy exists)
    if (validated.data.approvedBy) {
      where.approvedBy = validated.data.approvedBy
    }

    // Date range filter
    if (validated.data.startDate || validated.data.endDate) {
      where.movedAt = {}
      if (validated.data.startDate) {
        where.movedAt.gte = new Date(validated.data.startDate)
      }
      if (validated.data.endDate) {
        where.movedAt.lte = new Date(validated.data.endDate)
      }
    }

    // 6. Execute query with pagination
    const skip = (validated.data.page - 1) * validated.data.pageSize
    const take = validated.data.pageSize

    const [movements, total] = await Promise.all([
      db.stockMovement.findMany({
        where,
        include: {
          inventory: {
            select: {
              id: true,
              itemName: true,
              itemCode: true,
              category: true,
              unit: true,
            }
          }
        },
        orderBy: { movedAt: 'desc' },
        skip,
        take,
      }),
      db.stockMovement.count({ where })
    ])

    // 7. Calculate metadata
    const totalPages = Math.ceil(total / validated.data.pageSize)
    const hasNextPage = validated.data.page < totalPages
    const hasPreviousPage = validated.data.page > 1

    return NextResponse.json({
      success: true,
      data: movements,
      meta: {
        total,
        page: validated.data.page,
        pageSize: validated.data.pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      }
    })

  } catch (error) {
    console.error('GET /api/sppg/inventory/movements error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data pergerakan stok',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * POST /api/sppg/inventory/movements
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_MANAGE permission
 * @body {CreateStockMovementInput} Stock movement data
 * @returns {Promise<Response>} Created stock movement
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_MANAGE')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk mengelola pergerakan stok'
        }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = createStockMovementSchema.safeParse(body)
      
      if (!validated.success) {
        return NextResponse.json({ 
          error: 'Validation failed',
          message: 'Data tidak valid',
          details: validated.error.issues
        }, { status: 400 })
      }

      // Verify inventory item exists and belongs to SPPG
      const inventory = await db.inventoryItem.findFirst({
        where: {
          id: validated.data.inventoryId,
          sppgId: session.user.sppgId!, // Multi-tenant check
        }
    })

    if (!inventory) {
      return NextResponse.json({
        error: 'Inventory item not found',
        message: 'Item inventori tidak ditemukan'
      }, { status: 404 })
    }

    // 6. Calculate new stock based on movement type
    let newStock = inventory.currentStock
    if (validated.data.movementType === 'IN' || validated.data.movementType === 'TRANSFER') {
      newStock += validated.data.quantity
    } else if (validated.data.movementType === 'OUT' || 
               validated.data.movementType === 'EXPIRED' || 
               validated.data.movementType === 'DAMAGED') {
      newStock -= validated.data.quantity
    } else if (validated.data.movementType === 'ADJUSTMENT') {
      // For adjustment, quantity can be positive or negative
      newStock = validated.data.quantity
    }

    // 7. Check if stock will go negative
    if (newStock < 0) {
      return NextResponse.json({
        error: 'Insufficient stock',
        message: `Stok tidak mencukupi. Stok saat ini: ${inventory.currentStock} ${inventory.unit}`,
        details: {
          currentStock: inventory.currentStock,
          requestedQuantity: validated.data.quantity,
          resultingStock: newStock,
        }
      }, { status: 400 })
    }

    // 8. Create stock movement and update inventory in transaction
    const movement = await db.$transaction(async (tx) => {
      // Create movement record
      const newMovement = await tx.stockMovement.create({
        data: {
          inventoryId: validated.data.inventoryId,
          movementType: validated.data.movementType,
          quantity: validated.data.quantity,
          unit: inventory.unit, // Use inventory unit
          referenceType: validated.data.referenceType,
          referenceId: validated.data.referenceId,
          referenceNumber: validated.data.referenceNumber,
          notes: validated.data.notes,
          movedBy: session.user.id, // Current user
          movedAt: new Date(), // Current timestamp
          expiryDate: validated.data.expiryDate,
          batchNumber: validated.data.batchNumber,
          unitCost: validated.data.unitCost,
          totalCost: validated.data.unitCost ? validated.data.unitCost * validated.data.quantity : null,
          documentUrl: validated.data.documentUrl,
          approvedBy: null,
          approvedAt: null,
          stockBefore: inventory.currentStock,
          stockAfter: newStock,
        },
        include: {
          inventory: {
            select: {
              id: true,
              itemName: true,
              itemCode: true,
              category: true,
              unit: true,
            }
          }
        }
      })

      // Update inventory stock
      await tx.inventoryItem.update({
        where: { id: validated.data.inventoryId },
        data: { currentStock: newStock }
      })

      return newMovement
    })

    // 9. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'CREATE',
        entityType: 'StockMovement',
        entityId: movement.id,
        description: `Created stock movement for ${inventory.itemName}`,
        newValues: {
          inventoryItem: inventory.itemName,
          movementType: movement.movementType,
          quantity: movement.quantity,
          stockBefore: inventory.currentStock,
          stockAfter: newStock,
        } as Prisma.InputJsonValue,
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: movement,
      message: 'Pergerakan stok berhasil dicatat'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mencatat pergerakan stok',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
