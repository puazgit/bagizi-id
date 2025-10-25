/**
 * @fileoverview Inventory Statistics API Route
 * @module api/sppg/inventory/stats
 * @description Provides comprehensive inventory statistics and analytics
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
import { UserRole, InventoryCategory } from '@prisma/client'

/**
 * GET /api/sppg/inventory/stats
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_VIEW permission
 * @returns {Promise<Response>} Inventory statistics and analytics
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_VIEW')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk melihat statistik inventori'
        }, { status: 403 })
      }

      // Fetch all inventory items for calculations
      const items = await db.inventoryItem.findMany({
        where: {
          sppgId: session.user.sppgId!,
          isActive: true,
        },
        select: {
          id: true,
          category: true,
          currentStock: true,
          minStock: true,
          maxStock: true,
          unit: true,
          costPerUnit: true,
        }
      })

    // 5. Calculate basic statistics
    const totalItems = items.length
    const totalValue = items.reduce((sum: number, item) => 
      sum + (item.currentStock * (item.costPerUnit || 0)), 0
    )
    const lowStockCount = items.filter((item) => 
      item.currentStock <= item.minStock
    ).length
    const outOfStockCount = items.filter((item) => 
      item.currentStock === 0
    ).length
    const overstockedCount = items.filter((item) => 
      item.currentStock >= item.maxStock
    ).length

    // 6. Calculate by category
    const byCategory = Object.values(InventoryCategory).map(category => {
      const categoryItems = items.filter((item) => item.category === category)
      const categoryValue = categoryItems.reduce((sum: number, item) => 
        sum + (item.currentStock * (item.costPerUnit || 0)), 0
      )
      
      return {
        category,
        count: categoryItems.length,
        totalValue: categoryValue,
        lowStockCount: categoryItems.filter((item) => 
          item.currentStock <= item.minStock
        ).length,
      }
    }).filter((cat) => cat.count > 0)

    // 7. Get recent stock movements (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMovements = await db.stockMovement.findMany({
      where: {
        inventory: {
          sppgId: session.user.sppgId!,
        },
        movedAt: {
          gte: thirtyDaysAgo,
        }
      },
      select: {
        movementType: true,
        quantity: true,
      }
    })

    // 8. Calculate movement statistics
    const movementStats = {
      totalIn: recentMovements
        .filter((m) => m.movementType === 'IN')
        .reduce((sum: number, m) => sum + m.quantity, 0),
      totalOut: recentMovements
        .filter((m) => m.movementType === 'OUT')
        .reduce((sum: number, m) => sum + m.quantity, 0),
      totalAdjustments: recentMovements
        .filter((m) => m.movementType === 'ADJUSTMENT')
        .reduce((sum: number, m) => sum + Math.abs(m.quantity), 0),
      totalExpired: recentMovements
        .filter((m) => m.movementType === 'EXPIRED')
        .reduce((sum: number, m) => sum + m.quantity, 0),
      totalDamaged: recentMovements
        .filter((m) => m.movementType === 'DAMAGED')
        .reduce((sum: number, m) => sum + m.quantity, 0),
    }

    // 9. Calculate turnover rate (simple calculation)
    const turnoverRate = movementStats.totalOut > 0 && totalItems > 0
      ? (movementStats.totalOut / totalItems).toFixed(2)
      : '0.00'

    // 10. Get stock level distribution
    const stockLevels = {
      outOfStock: outOfStockCount,
      lowStock: lowStockCount - outOfStockCount, // Exclude out of stock
      normal: totalItems - lowStockCount - overstockedCount,
      overstocked: overstockedCount,
    }

    // 11. Calculate percentages
    const stockLevelPercentages = {
      outOfStock: totalItems > 0 ? ((outOfStockCount / totalItems) * 100).toFixed(1) : '0.0',
      lowStock: totalItems > 0 ? (((lowStockCount - outOfStockCount) / totalItems) * 100).toFixed(1) : '0.0',
      normal: totalItems > 0 ? (((totalItems - lowStockCount - overstockedCount) / totalItems) * 100).toFixed(1) : '0.0',
      overstocked: totalItems > 0 ? ((overstockedCount / totalItems) * 100).toFixed(1) : '0.0',
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalItems,
          totalValue,
          lowStockCount,
          outOfStockCount,
          overstockedCount,
          turnoverRate: parseFloat(turnoverRate),
        },
        byCategory,
        stockLevels,
        stockLevelPercentages,
        movements: movementStats,
        period: {
          from: thirtyDaysAgo.toISOString(),
          to: new Date().toISOString(),
          days: 30,
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil statistik inventori',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
