/**
 * @fileoverview API route - Get deliveries by execution ID
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint GET /api/sppg/distribution/delivery/execution/:executionId
 * @access Protected - SPPG users only
 * @security Multi-tenant with sppgId filtering
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { deliveryFiltersSchema } from '@/features/sppg/distribution/delivery/schemas'
import { deliveryListInclude } from '@/features/sppg/distribution/delivery/types'

/**
 * GET /api/sppg/distribution/delivery/execution/:executionId
 * Get deliveries by execution ID with optional filters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Multi-tenant check - user must have sppgId
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Get execution ID from params
    const { executionId } = await params

    // 4. Verify execution belongs to user's SPPG
    const execution = await db.foodDistribution.findFirst({
      where: {
        id: executionId,
        sppgId: session.user.sppgId, // CRITICAL: Multi-tenant security
      },
      select: { id: true, sppgId: true },
    })

    if (!execution) {
      return Response.json(
        { error: 'Eksekusi distribusi tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 5. Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const filtersInput = {
      distributionId: executionId,
      status: searchParams.getAll('status'),
      hasIssues: searchParams.get('hasIssues'),
      qualityChecked: searchParams.get('qualityChecked'),
      driverName: searchParams.get('driverName'),
      search: searchParams.get('search'),
    }

    const validated = deliveryFiltersSchema.safeParse(filtersInput)
    if (!validated.success) {
      return Response.json(
        {
          error: 'Invalid filter parameters',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    // 6. Build where clause with multi-tenant security
    const where: Record<string, unknown> = {
      distributionId: executionId,
      schedule: {
        sppgId: session.user.sppgId, // CRITICAL: Multi-tenant security
      },
    }

    // Add optional filters
    if (validated.data.status) {
      if (Array.isArray(validated.data.status)) {
        where.status = { in: validated.data.status }
      } else {
        where.status = validated.data.status
      }
    }

    if (validated.data.driverName) {
      where.driverName = { contains: validated.data.driverName, mode: 'insensitive' }
    }

    if (validated.data.search) {
      where.OR = [
        { targetName: { contains: validated.data.search, mode: 'insensitive' } },
        { targetAddress: { contains: validated.data.search, mode: 'insensitive' } },
        { driverName: { contains: validated.data.search, mode: 'insensitive' } },
      ]
    }

    // 7. Fetch deliveries with relations
    const deliveries = await db.distributionDelivery.findMany({
      where,
      include: deliveryListInclude,
      orderBy: [
        { plannedTime: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // 8. Calculate statistics
    type DeliveryWithCounts = typeof deliveries[number]
    
    const total = deliveries.length
    const byStatus = deliveries.reduce((acc, d: DeliveryWithCounts) => {
      acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const withIssues = deliveries.filter((d: DeliveryWithCounts) => 
      d._count && d._count.issues > 0
    ).length

    const onTime = deliveries.filter((d: DeliveryWithCounts) => {
      if (!d.plannedTime || !d.actualTime) return false
      return new Date(d.actualTime) <= new Date(d.plannedTime)
    }).length

    const statistics = {
      total,
      byStatus,
      onTimeCount: onTime,
      delayedCount: total - onTime,
      withIssuesCount: withIssues,
      avgDeliveryTime: 0, // TODO: Calculate from actual data
      avgPortionsFulfillment: 0, // TODO: Calculate
      totalPhotos: deliveries.reduce((sum: number, d: DeliveryWithCounts) => sum + (d._count?.photos || 0), 0),
      totalIssues: deliveries.reduce((sum: number, d: DeliveryWithCounts) => sum + (d._count?.issues || 0), 0),
      totalTrackingPoints: deliveries.reduce((sum: number, d: DeliveryWithCounts) => sum + (d._count?.trackingPoints || 0), 0),
    }

    return Response.json({
      success: true,
      data: deliveries,
      statistics,
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/delivery/execution/[id] error:', error)
    return Response.json(
      {
        error: 'Gagal mengambil data pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
