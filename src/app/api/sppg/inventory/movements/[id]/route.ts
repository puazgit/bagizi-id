/**
 * @fileoverview Stock Movement Detail API Routes - Get, Update (Approve)
 * @module api/sppg/inventory/movements/[id]
 * @description Handles GET (detail), PUT (approve/reject) operations for single stock movement
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * @requires Zod - Request validation
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { updateStockMovementSchema } from '@/features/sppg/inventory/schemas'
import type { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/inventory/movements/[id]
 * Fetch single stock movement by ID
 * @security Requires authentication and INVENTORY_VIEW permission
 * @param {string} id - Stock movement ID
 * @returns {Promise<Response>} Stock movement details with relationships
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let movementId: string | undefined
  
  try {
    const { id } = await params
    movementId = id

    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Permission Check
    if (!session.user.userRole || !hasPermission(session.user.userRole, 'INVENTORY_VIEW')) {
      return Response.json({ 
        error: 'Insufficient permissions',
        message: 'Anda tidak memiliki akses untuk melihat pergerakan stok'
      }, { status: 403 })
    }

    // 3. Multi-tenant Check
    if (!session.user.sppgId) {
      return Response.json({ 
        error: 'SPPG access required',
        message: 'Akses SPPG diperlukan'
      }, { status: 403 })
    }

    // 4. Fetch movement with relationships
    const movement = await db.stockMovement.findFirst({
      where: {
        id: movementId,
        inventory: {
          sppgId: session.user.sppgId, // CRITICAL: Multi-tenant filtering
        }
      },
      include: {
        inventory: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            category: true,
            unit: true,
            currentStock: true,
          }
        }
      }
    })

    if (!movement) {
      return Response.json({ 
        error: 'Movement not found',
        message: 'Pergerakan stok tidak ditemukan'
      }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: movement
    })

  } catch (error) {
    console.error(`GET /api/sppg/inventory/movements/${movementId || '[unknown]'} error:`, error)
    return Response.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data pergerakan',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

/**
 * PUT /api/sppg/inventory/movements/[id]
 * Approve or reject stock movement
 * @security Requires authentication and INVENTORY_APPROVE permission
 * @param {string} id - Stock movement ID
 * @body {UpdateStockMovementInput} Approval data
 * @returns {Promise<Response>} Updated stock movement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let movementId: string | undefined
  
  try {
    const { id } = await params
    movementId = id

    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Permission Check (requires APPROVE permission)
    if (!session.user.userRole || !hasPermission(session.user.userRole, 'INVENTORY_APPROVE')) {
      return Response.json({ 
        error: 'Insufficient permissions',
        message: 'Anda tidak memiliki akses untuk menyetujui pergerakan stok'
      }, { status: 403 })
    }

    // 3. Multi-tenant Check
    if (!session.user.sppgId) {
      return Response.json({ 
        error: 'SPPG access required',
        message: 'Akses SPPG diperlukan'
      }, { status: 403 })
    }

    // 4. Check if movement exists
    const existing = await db.stockMovement.findFirst({
      where: {
        id: movementId,
        inventory: {
          sppgId: session.user.sppgId, // Multi-tenant check
        }
      },
      include: {
        inventory: true
      }
    })

    if (!existing) {
      return Response.json({ 
        error: 'Movement not found',
        message: 'Pergerakan stok tidak ditemukan'
      }, { status: 404 })
    }

    // 5. Check if already approved
    if (existing.approvedBy) {
      return Response.json({ 
        error: 'Already approved',
        message: 'Pergerakan stok sudah disetujui sebelumnya',
        details: {
          approvedAt: existing.approvedAt,
          approvedBy: existing.approvedBy,
        }
      }, { status: 409 })
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = updateStockMovementSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        message: 'Data tidak valid',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 7. Update movement - set approval
    const movement = await db.stockMovement.update({
      where: { id: movementId },
      data: {
        approvedBy: validated.data.approvedBy,
        approvedAt: new Date(),
        notes: validated.data.notes,
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

    // 8. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'UPDATE',
        entityType: 'StockMovement',
        entityId: movement.id,
        description: `Approved stock movement for ${existing.inventory.itemName}`,
        newValues: {
          approvedBy: validated.data.approvedBy,
          notes: validated.data.notes,
        } as Prisma.InputJsonValue,
      }
    })

    return Response.json({ 
      success: true, 
      data: movement,
      message: 'Pergerakan stok berhasil disetujui'
    })

  } catch (error) {
    console.error(`PUT /api/sppg/inventory/movements/${movementId || '[unknown]'} error:`, error)
    return Response.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat memproses approval',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
