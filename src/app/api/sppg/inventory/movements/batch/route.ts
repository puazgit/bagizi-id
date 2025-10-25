/**
 * @fileoverview Batch Stock Movement Creation API Route
 * @module api/sppg/inventory/movements/batch
 * @description Create multiple stock movements at once
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * @requires Zod - Request validation
 * 
 * RBAC Integration:
 * - POST: Protected by withSppgAuth
 * - Automatic audit logging
 * - Permission: INVENTORY_MANAGE
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { batchStockMovementSchema } from '@/features/sppg/inventory/schemas'
import type { Prisma } from '@prisma/client'

/**
 * POST /api/sppg/inventory/movements/batch
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_MANAGE permission
 * @body {BatchStockMovementInput} Array of stock movement data
 * @returns {Promise<Response>} Created stock movements
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
      const validated = batchStockMovementSchema.safeParse(body)
      
      if (!validated.success) {
        return NextResponse.json({ 
          error: 'Validation failed',
          message: 'Data tidak valid',
          details: validated.error.issues
        }, { status: 400 })
      }

      // Verify all inventory items exist and belong to SPPG
    const inventoryIds = validated.data.movements.map((m) => m.inventoryId)
    const inventories = await db.inventoryItem.findMany({
      where: {
        id: { in: inventoryIds },
        sppgId: session.user.sppgId!,
      }
    })

    if (inventories.length !== inventoryIds.length) {
      return NextResponse.json({
        error: 'Invalid inventory items',
        message: 'Beberapa item inventori tidak ditemukan atau tidak valid'
      }, { status: 404 })
    }

    // 6. Create map of inventory for quick lookup
    const inventoryMap = new Map<string, typeof inventories[0]>(
      inventories.map((inv) => [inv.id, inv])
    )

    // 7. Validate stock availability for OUT movements
    const errors: string[] = []
    validated.data.movements.forEach((movement, index) => {
      const inventory = inventoryMap.get(movement.inventoryId)
      if (!inventory) return

      let newStock = inventory.currentStock
      if (movement.movementType === 'IN' || movement.movementType === 'TRANSFER') {
        newStock += movement.quantity
      } else if (movement.movementType === 'OUT' || 
                 movement.movementType === 'EXPIRED' || 
                 movement.movementType === 'DAMAGED') {
        newStock -= movement.quantity
      } else if (movement.movementType === 'ADJUSTMENT') {
        newStock = movement.quantity
      }

      if (newStock < 0) {
        errors.push(
          `Item #${index + 1} (${inventory.itemName}): Stok tidak mencukupi. ` +
          `Saat ini: ${inventory.currentStock}, Diminta: ${movement.quantity}`
        )
      }
    })

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Insufficient stock',
        message: 'Beberapa item memiliki stok tidak mencukupi',
        details: errors
      }, { status: 400 })
    }

    // 8. Create all movements in a transaction
    const movements = await db.$transaction(async (tx) => {
      const createdMovements = []

      for (const movementData of validated.data.movements) {
        const inventory = inventoryMap.get(movementData.inventoryId)!
        
        // Calculate new stock
        let newStock = inventory.currentStock
        if (movementData.movementType === 'IN' || movementData.movementType === 'TRANSFER') {
          newStock += movementData.quantity
        } else if (movementData.movementType === 'OUT' || 
                   movementData.movementType === 'EXPIRED' || 
                   movementData.movementType === 'DAMAGED') {
          newStock -= movementData.quantity
        } else if (movementData.movementType === 'ADJUSTMENT') {
          newStock = movementData.quantity
        }

        // Create movement
        const movement = await tx.stockMovement.create({
          data: {
            inventoryId: movementData.inventoryId,
            movementType: movementData.movementType,
            quantity: movementData.quantity,
            unit: inventory.unit, // Use inventory unit
            referenceType: movementData.referenceType,
            referenceId: movementData.referenceId,
            referenceNumber: movementData.referenceNumber,
            notes: movementData.notes,
            movedBy: session.user.id, // Current user
            movedAt: new Date(), // Current timestamp
            expiryDate: movementData.expiryDate,
            batchNumber: movementData.batchNumber,
            unitCost: movementData.unitCost,
            totalCost: movementData.unitCost ? movementData.unitCost * movementData.quantity : null,
            documentUrl: movementData.documentUrl,
            approvedBy: null,
            approvedAt: null,
            stockBefore: inventory.currentStock,
            stockAfter: newStock,
          }
        })

        // Update inventory
        await tx.inventoryItem.update({
          where: { id: movementData.inventoryId },
          data: { currentStock: newStock }
        })

        // Update local inventory object for next iteration
        inventory.currentStock = newStock

        createdMovements.push(movement)
      }

      return createdMovements
    })

    // 9. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'CREATE',
        entityType: 'StockMovement',
        entityId: `batch-${Date.now()}`,
        description: `Created batch stock movements: ${movements.length} items`,
        newValues: {
          count: movements.length,
          movements: movements.map((m: typeof movements[0]) => ({
            inventoryId: m.inventoryId,
            movementType: m.movementType,
            quantity: m.quantity,
          })),
        } as Prisma.InputJsonValue,
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: movements,
      message: `Berhasil mencatat ${movements.length} pergerakan stok`
    }, { status: 201 })

    } catch (error) {
      return NextResponse.json({ 
        error: 'Internal server error',
        message: 'Terjadi kesalahan saat mencatat pergerakan stok batch',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
