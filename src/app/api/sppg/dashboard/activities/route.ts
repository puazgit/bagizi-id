/**
 * @fileoverview Dashboard Activities API - Recent activities for SPPG dashboard
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging for activity views
 * - Multi-tenant: Activities filtered by session.user.sppgId
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/dashboard/activities
 * Fetch recent activities for authenticated SPPG user
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      const sppgId = session.user.sppgId

      // Fetch audit logs as activities (last 50 activities)
      const auditLogs = await db.auditLog.findMany({
        where: {
          sppgId,
          action: {
            in: ['CREATE', 'UPDATE', 'DELETE']
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          description: true,
          createdAt: true,
          userName: true
        }
      })

      // Transform audit logs to activity items
    const activities = auditLogs.map(log => {
      let type: 'menu' | 'distribution' | 'procurement' | 'production' = 'menu'
      let badge = 'Activity'
      
      if (log.entityType.includes('Menu')) {
        type = 'menu'
        badge = 'Menu'
      } else if (log.entityType.includes('Distribution')) {
        type = 'distribution'
        badge = 'Distribusi'
      } else if (log.entityType.includes('Procurement')) {
        type = 'procurement'
        badge = 'Procurement'
      } else if (log.entityType.includes('Production')) {
        type = 'production'
        badge = 'Produksi'
      }

      let status: 'success' | 'warning' | 'error' | 'info' = 'info'
      if (log.action === 'CREATE') status = 'success'
      if (log.action === 'UPDATE') status = 'info'
      if (log.action === 'DELETE') status = 'warning'

      // Calculate relative time
      const now = new Date()
      const timestamp = new Date(log.createdAt)
      const diffMs = now.getTime() - timestamp.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let relativeTime = ''
      if (diffMins < 60) {
        relativeTime = `${diffMins} menit yang lalu`
      } else if (diffHours < 24) {
        relativeTime = `${diffHours} jam yang lalu`
      } else {
        relativeTime = `${diffDays} hari yang lalu`
      }

      const actor = log.userName || 'System'
      const description = `${relativeTime} • oleh ${actor}`

      return {
        id: log.id,
        type,
        title: log.description || `${log.action} ${log.entityType}`,
        description,
        timestamp: log.createdAt.toISOString(),
        actor,
        badge,
        status
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: activities
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Dashboard activities API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard activities',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
  })
}
