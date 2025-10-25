/**
 * @fileoverview Stock Movement Summary API Route
 * @module api/sppg/inventory/movements/summary
 * @description Provides summary statistics for stock movements
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth
 * - Automatic audit logging
 * - Permission: INVENTORY_VIEW
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole, MovementType } from '@prisma/client'

/**
 * GET /api/sppg/inventory/movements/summary
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_VIEW permission
 * @query {string} startDate - Optional start date filter
 * @query {string} endDate - Optional end date filter
 * @returns {Promise<Response>} Movement summary by type and date range
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_VIEW')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk melihat ringkasan pergerakan stok'
        }, { status: 403 })
      }

    // 4. Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default to last 30 days if no dates provided
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    } else {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      dateFilter.gte = thirtyDaysAgo
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    // 5. Build where clause
    const where: {
      inventory: { sppgId: string }
      movedAt: { gte?: Date; lte?: Date }
    } = {
      inventory: {
        sppgId: session.user.sppgId!,
      },
      movedAt: dateFilter,
    }

    // 6. Fetch movements for summary
    const movements = await db.stockMovement.findMany({
      where,
      select: {
        movementType: true,
        quantity: true,
        unitCost: true,
        approvedBy: true,
      }
    })

    // 6. Calculate summary by movement type
    const summaryByType = Object.values(MovementType).map(type => {
      const typeMovements = movements.filter((m) => m.movementType === type)
      const totalQuantity = typeMovements.reduce((sum: number, m) => sum + m.quantity, 0)
      const totalValue = typeMovements.reduce((sum: number, m) => 
        sum + (m.quantity * (m.unitCost || 0)), 0
      )
      const approvedCount = typeMovements.filter((m) => m.approvedBy !== null).length
      const pendingCount = typeMovements.filter((m) => m.approvedBy === null).length

      return {
        movementType: type,
        count: typeMovements.length,
        totalQuantity,
        totalValue,
        approvedCount,
        pendingCount,
      }
    }).filter((summary) => summary.count > 0)

    // 7. Calculate overall totals
    const totalMovements = movements.length
    const totalApproved = movements.filter((m) => m.approvedBy !== null).length
    const totalPending = movements.filter((m) => m.approvedBy === null).length
    const totalValue = movements.reduce((sum: number, m) => 
      sum + (m.quantity * (m.unitCost || 0)), 0
    )

    // 8. Calculate IN/OUT/ADJUSTMENT totals
    const totalIn = movements
      .filter((m) => m.movementType === 'IN')
      .reduce((sum: number, m) => sum + m.quantity, 0)
    const totalOut = movements
      .filter((m) => m.movementType === 'OUT')
      .reduce((sum: number, m) => sum + m.quantity, 0)
    const totalAdjustments = movements
      .filter((m) => m.movementType === 'ADJUSTMENT')
      .reduce((sum: number, m) => sum + Math.abs(m.quantity), 0)
    const totalExpired = movements
      .filter((m) => m.movementType === 'EXPIRED')
      .reduce((sum: number, m) => sum + m.quantity, 0)
    const totalDamaged = movements
      .filter((m) => m.movementType === 'DAMAGED')
      .reduce((sum: number, m) => sum + m.quantity, 0)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalMovements,
          totalApproved,
          totalPending,
          totalValue,
        },
        byType: summaryByType,
        totals: {
          in: totalIn,
          out: totalOut,
          adjustments: totalAdjustments,
          expired: totalExpired,
          damaged: totalDamaged,
          netChange: totalIn - totalOut,
        },
        period: {
          from: dateFilter.gte?.toISOString(),
          to: dateFilter.lte?.toISOString() || new Date().toISOString(),
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil ringkasan pergerakan stok',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
