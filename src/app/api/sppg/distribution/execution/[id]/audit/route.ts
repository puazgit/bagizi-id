import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'

/**
 * GET /api/sppg/distribution/execution/[id]/audit
 * 
 * Fetch audit logs for a specific distribution execution
 * Filtered by entityType='FoodDistribution' and entityId=executionId
 * 
 * @param request - Next.js request object
 * @param props - Route parameters with execution ID (Promise in Next.js 15)
 * @returns Audit logs sorted by createdAt DESC
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get execution ID from params (await in Next.js 15)
    const params = await props.params
    const executionId = params.id

    // 3. Verify execution exists and user has access
    const execution = await db.foodDistribution.findFirst({
      where: {
        id: executionId,
        schedule: {
          sppgId: session.user.sppgId || undefined,
        },
      },
      select: {
        id: true,
        schedule: {
          select: {
            sppgId: true,
          },
        },
      },
    })

    if (!execution) {
      return Response.json(
        { error: 'Execution not found or access denied' },
        { status: 404 }
      )
    }

    // 4. Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // Filter by specific action
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 5. Fetch audit logs
    const auditLogs = await db.auditLog.findMany({
      where: {
        entityType: 'FoodDistribution',
        entityId: executionId,
        ...(action && { action: action as AuditAction }),
        sppgId: session.user.sppgId || undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    })

    // 6. Get total count for pagination
    const totalCount = await db.auditLog.count({
      where: {
        entityType: 'FoodDistribution',
        entityId: executionId,
        ...(action && { action: action as AuditAction }),
        sppgId: session.user.sppgId || undefined,
      },
    })

    // 7. Return audit logs with pagination info
    return Response.json({
      success: true,
      data: {
        logs: auditLogs,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution/[id]/audit error:', error)
    return Response.json(
      {
        error: 'Failed to fetch audit logs',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
