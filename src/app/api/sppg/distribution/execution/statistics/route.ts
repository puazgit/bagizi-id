/**
 * @fileoverview Distribution Execution Statistics API Route
 * @version Next.js 15.5.4
 * @description API endpoint to fetch execution statistics
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/distribution/execution/statistics
 * Fetch execution statistics with optional date filtering
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Parse Query Parameters
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

    // 4. Build Where Clause (Multi-tenant Safe)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schedule: {
        sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
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
              sppgId: session.user.sppgId!,
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
              sppgId: session.user.sppgId!,
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

    return NextResponse.json({ 
      success: true, 
      data: statistics 
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution/statistics error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
