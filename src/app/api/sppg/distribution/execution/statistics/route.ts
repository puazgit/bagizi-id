/**
 * @fileoverview Distribution Execution Statistics API Route
 * @version Next.js 15.5.4
 * @description API endpoint to fetch execution statistics
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/distribution/execution/statistics
 * Fetch execution statistics with optional date filtering
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenant Security)
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG not found or access denied' }, { status: 403 })
    }

    // 3. Parse Query Parameters
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

    // 4. Build Where Clause (Multi-tenant Safe)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schedule: {
        sppgId: session.user.sppgId, // CRITICAL: Multi-tenant filtering
      },
    }

    if (dateFrom || dateTo) {
      where.actualStartTime = {}
      if (dateFrom) {
        where.actualStartTime.gte = dateFrom
      }
      if (dateTo) {
        where.actualStartTime.lte = dateTo
      }
    }

    // 5. Fetch Statistics
    const [
      total,
      byStatus,
      totalPortions,
      totalBeneficiaries,
      totalIssues,
      unresolvedIssues,
    ] = await Promise.all([
      // Total executions
      db.foodDistribution.count({ where }),

      // Count by status
      db.foodDistribution.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      // Total portions delivered
      db.foodDistribution.aggregate({
        where: {
          ...where,
          status: 'COMPLETED',
        },
        _sum: {
          totalPortionsDelivered: true,
        },
      }),

      // Total beneficiaries reached
      db.foodDistribution.aggregate({
        where: {
          ...where,
          status: 'COMPLETED',
        },
        _sum: {
          totalBeneficiariesReached: true,
        },
      }),

      // Total issues
      db.distributionIssue.count({
        where: {
          distribution: {
            schedule: {
              sppgId: session.user.sppgId,
            },
            ...(dateFrom || dateTo ? {
              actualStartTime: where.actualStartTime,
            } : {}),
          },
        },
      }),

      // Unresolved issues
      db.distributionIssue.count({
        where: {
          distribution: {
            schedule: {
              sppgId: session.user.sppgId,
            },
            ...(dateFrom || dateTo ? {
              actualStartTime: where.actualStartTime,
            } : {}),
          },
          resolvedAt: null,
        },
      }),
    ])

    // 6. Format Statistics
    const statusCounts = byStatus.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
      acc[item.status] = item._count
      return acc
    }, {})

    const completedCount = statusCounts.COMPLETED || 0

    const statistics = {
      total,
      byStatus: statusCounts,
      totalPortionsDelivered: totalPortions._sum.totalPortionsDelivered || 0,
      totalBeneficiariesReached: totalBeneficiaries._sum.totalBeneficiariesReached || 0,
      totalIssues,
      unresolvedIssues,
      issueRate: total > 0 ? (totalIssues / total) * 100 : 0,
      completionRate: total > 0 ? (completedCount / total) * 100 : 0,
    }

    return Response.json({ 
      success: true, 
      data: statistics 
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution/statistics error:', error)
    
    return Response.json({ 
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
