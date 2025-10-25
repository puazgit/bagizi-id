/**
 * @fileoverview Dashboard Notifications API - System notifications for SPPG
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging for notification access
 * - Multi-tenant: Notifications filtered by session.user.sppgId
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/dashboard/notifications
 * Fetch unread notifications for authenticated SPPG user
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      const sppgId = session.user.sppgId
      const notifications = []

      // Check for low stock items (critical notifications)
    const lowStockItems = await db.inventoryItem.count({
      where: {
        sppgId: sppgId!,
        currentStock: {
          lte: db.inventoryItem.fields.minStock
        }
      }
    })

    if (lowStockItems > 0) {
      notifications.push({
        id: `low-stock-${Date.now()}`,
        type: 'error',
        title: 'Stok Bahan Baku Menipis',
        message: `${lowStockItems} item perlu direstock segera`,
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'high'
      })
    }

    // 4. Check for pending procurement approvals
    const pendingProcurements = await db.procurement.count({
      where: {
        sppgId: sppgId!,
        status: 'PENDING_APPROVAL'
      }
    })

    if (pendingProcurements > 0) {
      notifications.push({
        id: `pending-procurement-${Date.now()}`,
        type: 'warning',
        title: 'Procurement Menunggu Persetujuan',
        message: `${pendingProcurements} procurement perlu disetujui`,
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'high'
      })
    }

    // 5. Check for today's distributions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayDistributions = await db.foodDistribution.count({
      where: {
        sppgId: sppgId!,
        distributionDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['SCHEDULED', 'PREPARING', 'IN_TRANSIT', 'DISTRIBUTING']
        }
      }
    })

    if (todayDistributions > 0) {
      notifications.push({
        id: `today-distribution-${Date.now()}`,
        type: 'info',
        title: 'Distribusi Hari Ini',
        message: `${todayDistributions} distribusi dijadwalkan hari ini`,
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'medium'
      })
    }

    // 6. Check for production schedules today
    const todayProductions = await db.foodProduction.count({
      where: {
        sppgId: sppgId!,
        productionDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['PLANNED', 'PREPARING', 'COOKING']
        }
      }
    })

    if (todayProductions > 0) {
      notifications.push({
        id: `today-production-${Date.now()}`,
        type: 'success',
        title: 'Produksi Hari Ini',
        message: `${todayProductions} batch produksi dijadwalkan`,
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'medium'
      })
    }

    // Sort by priority and timestamp
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return NextResponse.json(
      {
        success: true,
        data: notifications
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Dashboard notifications API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard notifications',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
  })
}
