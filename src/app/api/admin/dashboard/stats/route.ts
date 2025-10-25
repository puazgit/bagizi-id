/**
 * Admin Dashboard Stats API Endpoint
 * Returns comprehensive statistics for admin platform dashboard
 * 
 * @route GET /api/admin/dashboard/stats
 * @access Admin only (PLATFORM_SUPERADMIN, PLATFORM_SUPPORT, PLATFORM_ANALYST)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
  // Calculate all statistics in parallel for better performance
  const [
    // Demo Requests Statistics
    totalDemoRequests,
    submittedDemoRequests,
    approvedDemoRequests,
    rejectedDemoRequests,
    convertedDemoRequests,
    recentDemoRequests,
    allDemoRequests,

    // SPPG Statistics
    totalSppg,
    activeSppg,
    demoSppg,
    
    // User Statistics
    totalUsers,
    
    // Previous period for growth calculation
    previousPeriodRequests,
  ] = await Promise.all([
    // Demo Requests counts by status
    db.demoRequest.count(),
    db.demoRequest.count({ where: { status: 'SUBMITTED' } }),
    db.demoRequest.count({ where: { status: 'APPROVED' } }),
    db.demoRequest.count({ where: { status: 'REJECTED' } }),
    db.demoRequest.count({ where: { status: 'CONVERTED' } }),
    
    // Recent demo requests (last 10)
    db.demoRequest.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        organizationName: true,
        organizationType: true,
        status: true,
        picName: true,
        targetBeneficiaries: true,
        createdAt: true,
        convertedAt: true,
      },
    }),
    
    // All demo requests for conversion probability calculation
    db.demoRequest.findMany({
      where: {
        conversionProbability: { not: null },
      },
      select: {
        conversionProbability: true,
      },
    }),
    // SPPG counts
    db.sPPG.count(),
    db.sPPG.count({ 
      where: { 
        status: 'ACTIVE',
      },
    }),
    db.sPPG.count({ where: { isDemoAccount: true } }),
    
    // User count
    db.user.count(),
    
    // Previous month requests for growth calculation
    db.demoRequest.count({
      where: {
        createdAt: {
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        },
      },
    }),
  ])

  // Calculate conversion rate
  const conversionRate = totalDemoRequests > 0 
    ? Math.round((convertedDemoRequests / totalDemoRequests) * 100)
    : 0

  // Calculate average conversion probability
  const averageConversionProbability = allDemoRequests.length > 0
    ? Math.round(
        allDemoRequests.reduce((sum, req) => sum + (req.conversionProbability || 0), 0) / 
        allDemoRequests.length
      )
    : 0

  // Calculate growth rate (compared to previous month)
  const currentMonthRequests = await db.demoRequest.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  })

  const requestsGrowth = previousPeriodRequests > 0
    ? Math.round(((currentMonthRequests - previousPeriodRequests) / previousPeriodRequests) * 100)
    : currentMonthRequests > 0 ? 100 : 0

  // Format recent activities
  const recentActivities = recentDemoRequests.map((request) => ({
    id: request.id,
    type: request.status === 'CONVERTED' ? ('conversion' as const) : ('demo_request' as const),
    organizationName: request.organizationName,
    organizationType: request.organizationType,
    status: request.status,
    picName: request.picName,
    targetBeneficiaries: request.targetBeneficiaries,
    timestamp: request.status === 'CONVERTED' && request.convertedAt 
      ? request.convertedAt 
      : request.createdAt,
  }))

  // Separate activities by type
  const demoRequestActivities = recentActivities
    .filter(a => a.type === 'demo_request')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ type, ...rest }) => rest)
  
  const conversionActivities = recentActivities
    .filter(a => a.type === 'conversion')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ type, ...rest }) => rest)

  // Return comprehensive statistics matching DashboardStats type
  return NextResponse.json({
    success: true,
    data: {
      demoRequests: {
        total: totalDemoRequests,
        byStatus: {
          submitted: submittedDemoRequests,
          underReview: 0, // We don't have UNDER_REVIEW in our data yet
          approved: approvedDemoRequests,
          demoActive: 0, // We don't count DEMO_ACTIVE separately yet
          converted: convertedDemoRequests,
          rejected: rejectedDemoRequests,
        },
        thisMonth: currentMonthRequests,
        growth: requestsGrowth,
      },
      sppg: {
        total: totalSppg,
        active: activeSppg,
        trial: 0, // We don't track trial separately yet
        demo: demoSppg,
      },
      users: {
        total: totalUsers,
        platformAdmins: 0, // We could add this query if needed
        sppgUsers: 0, // We could add this query if needed
      },
      conversion: {
        rate: conversionRate,
        thisMonth: convertedDemoRequests, // Approximate, could be more specific
        averageProbability: averageConversionProbability,
      },
      recentActivities: {
        demoRequests: demoRequestActivities,
        conversions: conversionActivities,
      },
    },
  })
  })
}
