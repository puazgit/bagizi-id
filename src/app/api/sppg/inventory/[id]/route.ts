/**
 * @fileoverview Inventory Item Detail API Routes - Get, Update, Delete
 * @module api/sppg/inventory/[id]
 * @description Handles GET (detail), PUT (update), DELETE operations for single inventory item
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * @requires Zod - Request validation
 * 
 * RBAC Integration:
 * - GET/PUT/DELETE: Protected by withSppgAuth
 * - Automatic audit logging
 * - Permissions: INVENTORY_VIEW (GET), INVENTORY_MANAGE (PUT/DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { updateInventorySchema } from '@/features/sppg/inventory/schemas'
import { UserRole } from '@prisma/client'
import type { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/inventory/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_VIEW permission
 * @param {string} id - Inventory item ID
 * @returns {Promise<Response>} Inventory item details with relationships
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_VIEW')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk melihat inventori'
        }, { status: 403 })
      }

      // Fetch item with relationships
      const item = await db.inventoryItem.findFirst({
        where: {
          id: id,
          sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
        },
        include: {
          preferredSupplier: {
          select: {
            id: true,
            supplierName: true,
            primaryContact: true,
            phone: true,
            email: true,
            address: true,
          }
        },
        stockMovements: {
          orderBy: { movedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            movementType: true,
            quantity: true,
            unitCost: true,
            totalCost: true,
            stockBefore: true,
            stockAfter: true,
            notes: true,
            movedAt: true,
            movedBy: true,
            approvedBy: true,
            approvedAt: true,
          }
        }
      }
    })

    if (!item) {
      return NextResponse.json({ 
        error: 'Item not found',
        message: 'Item inventori tidak ditemukan'
      }, { status: 404 })
    }

    // 5. Calculate stock status
    const stockStatus = item.currentStock <= item.minStock 
      ? 'LOW' 
      : item.currentStock >= item.maxStock 
        ? 'OVERSTOCKED' 
        : 'NORMAL'

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        stockStatus,
      }
    })

  } catch (error) {
    console.error(`GET /api/sppg/inventory/[id] error:`, error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data item',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * PUT /api/sppg/inventory/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_MANAGE permission
 * @param {string} id - Inventory item ID
 * @body {UpdateInventoryInput} Updated inventory data
 * @returns {Promise<Response>} Updated inventory item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_MANAGE')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk mengelola inventori'
        }, { status: 403 })
      }

      // Check if item exists
      const existing = await db.inventoryItem.findFirst({
        where: {
          id: id,
          sppgId: session.user.sppgId!, // Multi-tenant check
        }
      })

      if (!existing) {
        return NextResponse.json({ 
          error: 'Item not found',
          message: 'Item inventori tidak ditemukan'
        }, { status: 404 })
      }
    // 5. Parse and validate request body
    const body = await request.json()
    const validated = updateInventorySchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        message: 'Data tidak valid',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 6. Check for duplicate item code if changed
    if (validated.data.itemCode && validated.data.itemCode !== existing.itemCode) {
      const duplicate = await db.inventoryItem.findFirst({
        where: {
          itemCode: validated.data.itemCode,
          sppgId: session.user.sppgId as string,
          id: { not: id }
        }
      })

      if (duplicate) {
        return NextResponse.json({
          error: 'Duplicate item code',
          message: `Kode item "${validated.data.itemCode}" sudah digunakan`
        }, { status: 409 })
      }
    }

    // 7. Verify supplier if changed
    if (validated.data.preferredSupplierId && validated.data.preferredSupplierId !== existing.preferredSupplierId) {
      const supplier = await db.supplier.findFirst({
        where: {
          id: validated.data.preferredSupplierId,
          sppgId: session.user.sppgId as string,
        }
      })

      if (!supplier) {
        return NextResponse.json({
          error: 'Supplier not found',
          message: 'Supplier tidak ditemukan'
        }, { status: 404 })
      }
    }

    // 8. Update item
    const item = await db.inventoryItem.update({
      where: { id: id },
      data: validated.data,
      include: {
        preferredSupplier: {
          select: {
            id: true,
            supplierName: true,
            primaryContact: true,
            phone: true,
          }
        }
      }
    })

    // 9. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'UPDATE',
        entityType: 'InventoryItem',
        entityId: item.id,
        description: `Updated inventory item: ${item.itemName}`,
        newValues: validated.data as Prisma.InputJsonValue,
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: item,
      message: 'Item inventori berhasil diperbarui'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat memperbarui item',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * DELETE /api/sppg/inventory/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_MANAGE permission (soft delete)
 * @param {string} id - Inventory item ID
 * @returns {Promise<Response>} Success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_MANAGE')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk mengelola inventori'
        }, { status: 403 })
      }

      // Check if item exists
      const existing = await db.inventoryItem.findFirst({
        where: {
          id: id,
          sppgId: session.user.sppgId!, // Multi-tenant check
        }
      })

      if (!existing) {
      return NextResponse.json({ 
        error: 'Item not found',
        message: 'Item inventori tidak ditemukan'
      }, { status: 404 })
    }

    // 5. Check if item is used in other records
    const [menuIngredients, procurementItems] = await Promise.all([
      db.menuIngredient.count({
        where: { inventoryItemId: id }
      }),
      db.procurementItem.count({
        where: { inventoryItemId: id }
      })
    ])

    if (menuIngredients > 0 || procurementItems > 0) {
      return NextResponse.json({
        error: 'Item in use',
        message: 'Item tidak dapat dihapus karena sedang digunakan di menu atau procurement',
        details: {
          menuIngredients,
          procurementItems,
        }
      }, { status: 409 })
    }

    // 6. Soft delete (set isActive to false)
    const item = await db.inventoryItem.update({
      where: { id: id },
      data: { isActive: false }
    })

    // 7. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'DELETE',
        entityType: 'InventoryItem',
        entityId: item.id,
        description: `Deleted inventory item: ${item.itemName} (${item.category})`,
        oldValues: { itemName: item.itemName, category: item.category } as Prisma.InputJsonValue,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Item inventori berhasil dihapus'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat menghapus item',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
