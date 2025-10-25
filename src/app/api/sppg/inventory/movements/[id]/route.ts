/**
 * @fileoverview Stock Movement Detail API Routes - Get, Update (Approve)
 * @module api/sppg/inventory/movements/[id]
 * @description Handles GET (detail), PUT (approve/reject) operations for single stock movement
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * @requires Zod - Request validation
 * 
 * RBAC Integration:
 * - GET/PUT: Protected by withSppgAuth
 * - Automatic audit logging
 * - Permissions: INVENTORY_VIEW (GET), INVENTORY_APPROVE (PUT)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { updateStockMovementSchema } from '@/features/sppg/inventory/schemas'
import { UserRole } from '@prisma/client'
import type { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/inventory/movements/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_VIEW permission
 * @param {string} id - Stock movement ID
 * @returns {Promise<Response>} Stock movement details with relationships
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    let movementId: string | undefined
    
    try {
      const { id } = await params
      movementId = id

      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_VIEW')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk melihat pergerakan stok'
        }, { status: 403 })
      }

      // Fetch movement with relationships
      const movement = await db.stockMovement.findFirst({
        where: {
          id: movementId,
          inventory: {
            sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
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
      return NextResponse.json({ 
        error: 'Movement not found',
        message: 'Pergerakan stok tidak ditemukan'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: movement
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data pergerakan',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * PUT /api/sppg/inventory/movements/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_APPROVE permission
 * @param {string} id - Stock movement ID
 * @body {UpdateStockMovementInput} Approval data
 * @returns {Promise<Response>} Updated stock movement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    let movementId: string | undefined
    
    try {
      const { id } = await params
      movementId = id

      // Permission Check (requires APPROVE permission)
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_APPROVE')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk menyetujui pergerakan stok'
        }, { status: 403 })
      }

      // Check if movement exists
      const existing = await db.stockMovement.findFirst({
        where: {
          id: movementId,
          inventory: {
            sppgId: session.user.sppgId!, // Multi-tenant check
          }
        },
        include: {
          inventory: true
        }
      })

    if (!existing) {
      return NextResponse.json({ 
        error: 'Movement not found',
        message: 'Pergerakan stok tidak ditemukan'
      }, { status: 404 })
    }

    // 5. Check if already approved
    if (existing.approvedBy) {
      return NextResponse.json({ 
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
      return NextResponse.json({ 
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

    return NextResponse.json({ 
      success: true, 
      data: movement,
      message: 'Pergerakan stok berhasil disetujui'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat memproses approval',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
