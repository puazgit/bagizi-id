/**
 * @fileoverview Dashboard Notifications API - System notifications for SPPG
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/dashboard/notifications
 * Fetch unread notifications for authenticated SPPG user
 */
export async function GET() {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. SPPG Access Check
    const sppgId = session.user.sppgId
    if (!sppgId) {
      return NextResponse.json(
        { success: false, error: 'SPPG access required' },
        { status: 403 }
      )
    }

    const notifications = []

    // 3. Check for low stock items (critical notifications)
    const lowStockItems = await db.inventoryItem.count({
      where: {
        sppgId,
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
        sppgId,
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
        sppgId,
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
        sppgId,
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
}
