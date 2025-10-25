/**
 * @fileoverview Admin Demo Request Analytics API
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT, PLATFORM_ANALYST
 * 
 * Provides conversion funnel, source performance, and time metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * Get demo request analytics
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT, PLATFORM_ANALYST
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      
      // Date range filters (default: last 90 days)
      const endDate = searchParams.get('endDate') 
        ? new Date(searchParams.get('endDate')!)
        : new Date()
      
      const startDate = searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago

      // ================================ CONVERSION FUNNEL ================================
      
      const totalRequests = await db.demoRequest.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const byStatus = await db.demoRequest.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      })

      const statusCounts = byStatus.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>)

      const conversionFunnel = {
        submitted: statusCounts['SUBMITTED'] || 0,
        underReview: statusCounts['UNDER_REVIEW'] || 0,
        approved: statusCounts['APPROVED'] || 0,
        demoActive: statusCounts['DEMO_ACTIVE'] || 0,
        converted: statusCounts['CONVERTED'] || 0,
        rejected: statusCounts['REJECTED'] || 0,
        expired: statusCounts['EXPIRED'] || 0,
        cancelled: statusCounts['CANCELLED'] || 0,
      }

      // ================================ ATTENDANCE & CONVERSION ================================

      const byAttendance = await db.demoRequest.groupBy({
        by: ['attendanceStatus'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          attendanceStatus: { not: null },
        },
        _count: true,
      })

      const attendanceCounts = byAttendance.reduce((acc, item) => {
        if (item.attendanceStatus) {
          acc[item.attendanceStatus] = item._count
        }
        return acc
      }, {} as Record<string, number>)

      const attendedCount = attendanceCounts.ATTENDED || 0
      const noShowCount = attendanceCounts.NO_SHOW || 0
      const rescheduledCount = attendanceCounts.RESCHEDULED || 0

      const convertedCount = await db.demoRequest.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isConverted: true,
        },
      })

      const conversionMetrics = {
        totalRequests,
        attendedDemos: attendedCount,
        convertedToSppg: convertedCount,
        
        // Conversion rates
        approvalRate: totalRequests > 0 
          ? ((conversionFunnel.approved + conversionFunnel.demoActive) / totalRequests * 100).toFixed(2) + '%'
          : '0%',
        
        attendanceRate: conversionFunnel.demoActive > 0
          ? (attendedCount / conversionFunnel.demoActive * 100).toFixed(2) + '%'
          : '0%',
        
        conversionRate: attendedCount > 0
          ? (convertedCount / attendedCount * 100).toFixed(2) + '%'
          : '0%',
        
        overallConversionRate: totalRequests > 0
          ? (convertedCount / totalRequests * 100).toFixed(2) + '%'
          : '0%',
        
        noShowRate: conversionFunnel.demoActive > 0
          ? (noShowCount / conversionFunnel.demoActive * 100).toFixed(2) + '%'
          : '0%',
      }

      // ================================ TIME METRICS ================================

      // Average time from submission to approval
      const approvedRequests = await db.demoRequest.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          approvedAt: { not: null },
        },
        select: {
          createdAt: true,
          approvedAt: true,
        },
      })

      const avgTimeToApproval = approvedRequests.length > 0
        ? approvedRequests.reduce((sum, req) => {
            const diff = req.approvedAt!.getTime() - req.createdAt.getTime()
            return sum + diff
          }, 0) / approvedRequests.length / (1000 * 60 * 60) // Convert to hours
        : 0

      // Average time from approval to demo completion
      const demoActiveRequests = await db.demoRequest.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'DEMO_ACTIVE',
          approvedAt: { not: null },
          actualDate: { not: null },
        },
        select: {
          approvedAt: true,
          actualDate: true,
        },
      })

      const avgTimeToDemo = demoActiveRequests.length > 0
        ? demoActiveRequests.reduce((sum, req) => {
            const diff = req.actualDate!.getTime() - req.approvedAt!.getTime()
            return sum + diff
          }, 0) / demoActiveRequests.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0

      // Average time from demo to conversion
      const convertedRequests = await db.demoRequest.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isConverted: true,
          actualDate: { not: null },
          convertedAt: { not: null },
        },
        select: {
          actualDate: true,
          convertedAt: true,
        },
      })

      const avgTimeToConversion = convertedRequests.length > 0
        ? convertedRequests.reduce((sum, req) => {
            const diff = req.convertedAt!.getTime() - req.actualDate!.getTime()
            return sum + diff
          }, 0) / convertedRequests.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0

      const timeMetrics = {
        avgTimeToApproval: `${avgTimeToApproval.toFixed(1)} hours`,
        avgTimeToDemo: `${avgTimeToDemo.toFixed(1)} days`,
        avgTimeToConversion: `${avgTimeToConversion.toFixed(1)} days`,
        avgTotalCycleTime: `${(avgTimeToApproval / 24 + avgTimeToDemo + avgTimeToConversion).toFixed(1)} days`,
      }

      // ================================ ORGANIZATION TYPE BREAKDOWN ================================

      const byOrgType = await db.demoRequest.groupBy({
        by: ['organizationType'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      })

      const orgTypeBreakdown = await Promise.all(
        byOrgType.map(async (item) => {
          const converted = await db.demoRequest.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              organizationType: item.organizationType,
              isConverted: true,
            },
          })

          return {
            organizationType: item.organizationType,
            requests: item._count,
            converted,
            conversionRate: item._count > 0 
              ? (converted / item._count * 100).toFixed(2) + '%'
              : '0%',
          }
        })
      )

      // ================================ MONTHLY TRENDS ================================

      // Get monthly data for the period
      const monthlyData = await db.$queryRaw<Array<{
        month: string
        total: bigint
        approved: bigint
        converted: bigint
      }>>`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COUNT(*) as total,
          COUNT(CASE WHEN status IN ('APPROVED', 'DEMO_ACTIVE') THEN 1 END) as approved,
          COUNT(CASE WHEN "isConverted" = true THEN 1 END) as converted
        FROM "DemoRequest"
        WHERE "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
      `

      const monthlyTrends = monthlyData.map(row => ({
        month: row.month,
        total: Number(row.total),
        approved: Number(row.approved),
        converted: Number(row.converted),
        conversionRate: Number(row.total) > 0 
          ? (Number(row.converted) / Number(row.total) * 100).toFixed(2) + '%'
          : '0%',
      }))

      // ================================ RESPONSE ================================

      return NextResponse.json({
        success: true,
        data: {
          period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          conversionFunnel,
          conversionMetrics,
          timeMetrics,
          orgTypeBreakdown,
          monthlyTrends,
          attendanceBreakdown: {
            attended: attendedCount,
            noShow: noShowCount,
            rescheduled: rescheduledCount,
          },
        },
      })
    } catch (error) {
      console.error('GET /api/admin/demo-requests/analytics error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch demo request analytics',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
