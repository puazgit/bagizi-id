/**
 * @fileoverview Inventory Item Detail API Routes - Get, Update, Delete
 * @module api/sppg/inventory/[id]
 * @description Handles GET (detail), PUT (update), DELETE operations for single inventory item
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * @requires Zod - Request validation
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { updateInventorySchema } from '@/features/sppg/inventory/schemas'
import type { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/inventory/[id]
 * Fetch single inventory item by ID
 * @security Requires authentication and INVENTORY_VIEW permission
 * @param {string} id - Inventory item ID
 * @returns {Promise<Response>} Inventory item details with relationships
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Permission Check
    if (!session.user.userRole || !hasPermission(session.user.userRole, 'INVENTORY_VIEW')) {
      return Response.json({ 
        error: 'Insufficient permissions',
        message: 'Anda tidak memiliki akses untuk melihat inventori'
      }, { status: 403 })
    }

    // 3. Multi-tenant Check
    if (!session.user.sppgId) {
      return Response.json({ 
        error: 'SPPG access required',
        message: 'Akses SPPG diperlukan'
      }, { status: 403 })
    }

    // 4. Fetch item with relationships
    const item = await db.inventoryItem.findFirst({
      where: {
        id: id,
        sppgId: session.user.sppgId, // CRITICAL: Multi-tenant filtering
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
      return Response.json({ 
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

    return Response.json({
      success: true,
      data: {
        ...item,
        stockStatus,
      }
    })

  } catch (error) {
    console.error(`GET /api/sppg/inventory/[id] error:`, error)
    return Response.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data item',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

/**
 * PUT /api/sppg/inventory/[id]
 * Update inventory item
 * @security Requires authentication and INVENTORY_MANAGE permission
 * @param {string} id - Inventory item ID
 * @body {UpdateInventoryInput} Updated inventory data
 * @returns {Promise<Response>} Updated inventory item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Permission Check
    if (!session.user.userRole || !hasPermission(session.user.userRole, 'INVENTORY_MANAGE')) {
      return Response.json({ 
        error: 'Insufficient permissions',
        message: 'Anda tidak memiliki akses untuk mengelola inventori'
      }, { status: 403 })
    }

    // 3. Multi-tenant Check
    if (!session.user.sppgId) {
      return Response.json({ 
        error: 'SPPG access required',
        message: 'Akses SPPG diperlukan'
      }, { status: 403 })
    }

    // 4. Check if item exists
    const existing = await db.inventoryItem.findFirst({
      where: {
        id: id,
        sppgId: session.user.sppgId, // Multi-tenant check
      }
    })

    if (!existing) {
      return Response.json({ 
        error: 'Item not found',
        message: 'Item inventori tidak ditemukan'
      }, { status: 404 })
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = updateInventorySchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
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
          sppgId: session.user.sppgId,
          id: { not: id }
        }
      })

      if (duplicate) {
        return Response.json({
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
          sppgId: session.user.sppgId,
        }
      })

      if (!supplier) {
        return Response.json({
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

    return Response.json({ 
      success: true, 
      data: item,
      message: 'Item inventori berhasil diperbarui'
    })

  } catch (error) {
    console.error(`PUT /api/sppg/inventory/[id] error:`, error)
    return Response.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat memperbarui item',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

/**
 * DELETE /api/sppg/inventory/[id]
 * Delete inventory item (soft delete by setting isActive to false)
 * @security Requires authentication and INVENTORY_MANAGE permission
 * @param {string} id - Inventory item ID
 * @returns {Promise<Response>} Success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Permission Check
    if (!session.user.userRole || !hasPermission(session.user.userRole, 'INVENTORY_MANAGE')) {
      return Response.json({ 
        error: 'Insufficient permissions',
        message: 'Anda tidak memiliki akses untuk mengelola inventori'
      }, { status: 403 })
    }

    // 3. Multi-tenant Check
    if (!session.user.sppgId) {
      return Response.json({ 
        error: 'SPPG access required',
        message: 'Akses SPPG diperlukan'
      }, { status: 403 })
    }

    // 4. Check if item exists
    const existing = await db.inventoryItem.findFirst({
      where: {
        id: id,
        sppgId: session.user.sppgId, // Multi-tenant check
      }
    })

    if (!existing) {
      return Response.json({ 
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
      return Response.json({
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

    return Response.json({ 
      success: true,
      message: 'Item inventori berhasil dihapus'
    })

  } catch (error) {
    console.error(`DELETE /api/sppg/inventory/[id] error:`, error)
    return Response.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat menghapus item',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
