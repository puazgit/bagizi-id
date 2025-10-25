/**
 * @fileoverview Individual Procurement API endpoints - GET, PUT, DELETE
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth
 * - PUT: Protected by withSppgAuth
 * - DELETE: Protected by withSppgAuth
 * - Automatic audit logging
 * - Permission: READ, PROCUREMENT_MANAGE
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { procurementUpdateSchema } from '@/features/sppg/procurement/schemas'

// ================================ GET /api/sppg/procurement/[id] ================================

/**
 * GET /api/sppg/procurement/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires READ permission
 * @param {string} id - Procurement ID
 * @returns {Promise<Response>} Procurement details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      const { id } = await params

      // Fetch procurement with multi-tenant check
      const procurement = await db.procurement.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId! // CRITICAL: Ensure procurement belongs to user's SPPG
        },
      include: {
        sppg: {
          select: {
            id: true,
            name: true
          }
        },
        plan: {
          select: {
            id: true,
            planName: true,
            planMonth: true,
            totalBudget: true,
            remainingBudget: true
          }
        },
        supplier: {
          select: {
            id: true,
            supplierCode: true,
            supplierName: true,
            businessName: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            overallRating: true,
            paymentTerms: true
          }
        },
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                itemCode: true,
                currentStock: true,
                unit: true
              }
            }
          },
          orderBy: {
            itemName: 'asc'
          }
        }
      }
    })

    if (!procurement) {
      return NextResponse.json({ 
        success: false, 
        error: 'Procurement not found or access denied' 
      }, { status: 404 })
    }

    // 4. Calculate statistics
    const totalItems = procurement.items.length
    const totalQuantity = procurement.items.reduce((sum, item) => sum + item.orderedQuantity, 0)
    const receivedItems = procurement.items.filter(item => item.receivedQuantity && item.receivedQuantity > 0).length
    const acceptedItems = procurement.items.filter(item => item.isAccepted).length
    const rejectedItems = procurement.items.filter(item => !item.isAccepted).length

    // 5. Success response
    return NextResponse.json({
      success: true,
      data: {
        ...procurement,
        totalItems,
        totalQuantity,
        receivedItems,
        acceptedItems,
        rejectedItems,
      }
    })

    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch procurement',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ PUT /api/sppg/procurement/[id] ================================

/**
 * PUT /api/sppg/procurement/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires PROCUREMENT_MANAGE permission
 * @param {string} id - Procurement ID
 * @body {ProcurementUpdateInput} Update data
 * @returns {Promise<Response>} Updated procurement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      const { id} = await params

      // Verify procurement exists and belongs to SPPG
      const existingProcurement = await db.procurement.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        }
      })

      if (!existingProcurement) {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement not found or access denied' 
        }, { status: 404 })
      }

      // Check if procurement can be edited
    if (existingProcurement.status === 'COMPLETED' || existingProcurement.status === 'CANCELLED') {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot edit ${existingProcurement.status.toLowerCase()} procurement` 
      }, { status: 403 })
    }

    // 5. Role Check - Only certain roles can edit
    const allowedRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_AKUNTAN',
      'SPPG_PRODUKSI_MANAGER'
    ]
    
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = procurementUpdateSchema.parse(body)

    // Verify supplier if changed
    if (validated.supplierId && validated.supplierId !== existingProcurement.supplierId) {
      const supplierWhere: {
        id: string
        sppgId: string
        isActive: boolean
        isBlacklisted: boolean
      } = {
        id: validated.supplierId,
        sppgId: session.user.sppgId!,
        isActive: true,
        isBlacklisted: false
      }

      const supplier = await db.supplier.findFirst({
        where: supplierWhere
      })

      if (!supplier) {
        return NextResponse.json({ 
          success: false, 
          error: 'Supplier not found, inactive, or blacklisted' 
        }, { status: 404 })
      }
    }

    // 8. Update procurement
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { planId, supplierId, items, ...updateData } = validated
    const updatedProcurement = await db.procurement.update({
      where: { id },
      data: {
        ...updateData,
        ...(planId && {
          plan: {
            connect: { id: planId }
          }
        }),
        ...(supplierId && {
          supplier: {
            connect: { id: supplierId }
          }
        }),
        ...(validated.status === 'FULLY_RECEIVED' && {
          actualDelivery: validated.actualDelivery || new Date()
        }),
        ...(validated.inspectedBy && {
          inspectedAt: new Date()
        })
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            supplierCode: true,
            supplierName: true
          }
        },
        items: true
      }
    })

    // 9. Success response
    return NextResponse.json({
      success: true,
      data: updatedProcurement,
      message: 'Procurement updated successfully'
    })

    } catch (error) {
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Validation failed',
          details: error 
        }, { status: 400 })
      }

      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update procurement',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ DELETE /api/sppg/procurement/[id] ================================

/**
 * DELETE /api/sppg/procurement/[id]
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires PROCUREMENT_MANAGE permission
 * @param {string} id - Procurement ID
 * @returns {Promise<Response>} Success confirmation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      const { id } = await params

      // Verify procurement exists and belongs to SPPG
      const procurement = await db.procurement.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        }
      })

      if (!procurement) {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement not found or access denied' 
        }, { status: 404 })
      }

    // 5. Check if procurement can be deleted
    if (procurement.status === 'COMPLETED' || procurement.status === 'FULLY_RECEIVED') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete completed or received procurement. Cancel it instead.' 
      }, { status: 403 })
    }

    // 6. Delete procurement in transaction (restore budget if linked to plan)
    await db.$transaction(async (tx) => {
      // Restore plan budget if linked
      if (procurement.planId) {
        await tx.procurementPlan.update({
          where: { id: procurement.planId },
          data: {
            allocatedBudget: { decrement: procurement.totalAmount },
            remainingBudget: { increment: procurement.totalAmount }
          }
        })
      }

      // Update supplier statistics
      await tx.supplier.update({
        where: { id: procurement.supplierId },
        data: {
          totalOrders: { decrement: 1 }
        }
      })

      // Delete procurement (cascade will delete items)
      await tx.procurement.delete({
        where: { id }
      })
    })

      // Success response
      return NextResponse.json({
        success: true,
        message: 'Procurement deleted successfully'
      })

    } catch (error) {
      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete procurement',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
