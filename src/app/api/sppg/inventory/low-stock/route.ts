/**
 * @fileoverview Low Stock Items API Route
 * @module api/sppg/inventory/low-stock
 * @description Fetch inventory items that are at or below minimum stock level
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
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/inventory/low-stock
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_VIEW permission
 * @returns {Promise<Response>} List of low stock items with urgency levels
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_VIEW')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk melihat inventori'
        }, { status: 403 })
      }

      // Fetch all items and filter for low stock
      // Note: Prisma doesn't support comparing two columns directly in where clause
      // So we fetch all and filter in application layer
      const allItems = await db.inventoryItem.findMany({
        where: {
          sppgId: session.user.sppgId!,
          isActive: true,
        },
      include: {
        preferredSupplier: {
          select: {
            id: true,
            supplierName: true,
            primaryContact: true,
            phone: true,
            leadTimeHours: true,
          }
        }
      },
      orderBy: [
        { currentStock: 'asc' }, // Most critical first
        { itemName: 'asc' }
      ]
    })

    // Filter for low stock items (currentStock <= minStock)
    const items = allItems.filter(item => item.currentStock <= item.minStock)

    // Define the item type based on Prisma query result
    type LowStockItem = typeof items[0]

    // 5. Calculate urgency levels and additional info
    const enrichedItems = items.map((item: LowStockItem) => {
      const stockPercentage = (item.currentStock / item.minStock) * 100
      const stockDifference = item.minStock - item.currentStock
      const reorderAmount = item.reorderQuantity || (item.maxStock - item.currentStock)

      // Determine urgency level
      let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM'
      if (item.currentStock === 0) {
        urgency = 'CRITICAL'
      } else if (stockPercentage <= 25) {
        urgency = 'CRITICAL'
      } else if (stockPercentage <= 50) {
        urgency = 'HIGH'
      }

      // Calculate estimated days until stockout (simple calculation)
      // This would need actual usage data in production
      const estimatedDaysUntilStockout = item.currentStock > 0 ? 
        Math.floor(item.currentStock / (item.minStock * 0.1)) : 0

      return {
        ...item,
        stockPercentage: Math.round(stockPercentage),
        stockDifference,
        reorderAmount,
        urgency,
        estimatedDaysUntilStockout,
        shouldReorder: item.currentStock <= item.minStock,
        estimatedLeadTime: item.preferredSupplier?.leadTimeHours ? Math.ceil(item.preferredSupplier.leadTimeHours / 24) : null, // Convert hours to days
      }
    })

    // 6. Calculate summary statistics
    const summary = {
      total: enrichedItems.length,
      critical: enrichedItems.filter((i: typeof enrichedItems[0]) => i.urgency === 'CRITICAL').length,
      high: enrichedItems.filter((i: typeof enrichedItems[0]) => i.urgency === 'HIGH').length,
      medium: enrichedItems.filter((i: typeof enrichedItems[0]) => i.urgency === 'MEDIUM').length,
      outOfStock: enrichedItems.filter((i: typeof enrichedItems[0]) => i.currentStock === 0).length,
    }

    return NextResponse.json({
      success: true,
      data: enrichedItems,
      summary,
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data low stock',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
