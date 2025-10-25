/**
 * @fileoverview User Activity Logs API Endpoint
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/users/[id]/activity
 * Get user activity logs
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      
      console.log('📝 [GET /api/admin/users/:id/activity] Request started for ID:', id)

      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '50')

      // Check if user exists
      const user = await db.user.findUnique({
        where: { id },
        select: { id: true }
      })

      if (!user) {
        console.error('❌ [GET /api/admin/users/:id/activity] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Fetch activity logs
      const activityLogs = await db.userAuditLog.findMany({
        where: { userId: id },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          oldValues: true,
          newValues: true,
          changes: true,
          metadata: true,
          ipAddress: true,
          userAgent: true,
          resourcePath: true,
          riskLevel: true,
          flagged: true,
          timestamp: true
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit
      })

      console.log('✅ [GET /api/admin/users/:id/activity] Activity logs fetched:', activityLogs.length)

      return NextResponse.json({ 
        success: true, 
        data: activityLogs 
      })

    } catch (error) {
      console.error('❌ [GET /api/admin/users/:id/activity] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch activity logs',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
