/**
 * @fileoverview Distribution Schedule Statistics API
 * @route GET /api/sppg/distribution/schedule/statistics
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/distribution/schedule/statistics
 * Get overall distribution schedule statistics
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

      // Parse Query Parameters (optional date filtering)
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter: Record<string, unknown> = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    const whereClause: Record<string, unknown> = {
      sppgId: session.user.sppgId!,
    }

    if (Object.keys(dateFilter).length > 0) {
      whereClause.distributionDate = dateFilter
    }

    // 4. Get Overall Statistics
    const [
      totalSchedules,
      plannedSchedules,
      assignedSchedules,
      confirmedSchedules,
      inProgressSchedules,
      completedSchedules,
      cancelledSchedules,
    ] = await Promise.all([
      // Total schedules
      db.distributionSchedule.count({
        where: whereClause,
      }),

      // By status
      db.distributionSchedule.count({
        where: { ...whereClause, status: 'PLANNED' },
      }),
      db.distributionSchedule.count({
        where: { ...whereClause, status: 'PREPARED' },
      }),
      db.distributionSchedule.count({
        where: { ...whereClause, status: 'IN_PROGRESS' },
      }),
      db.distributionSchedule.count({
        where: { ...whereClause, status: 'COMPLETED' },
      }),
      db.distributionSchedule.count({
        where: { ...whereClause, status: 'COMPLETED' },
      }),
      db.distributionSchedule.count({
        where: { ...whereClause, status: 'CANCELLED' },
      }),
    ])

    // 5. Get Aggregated Data
    const schedules = await db.distributionSchedule.findMany({
      where: whereClause,
      include: {
        production: {
          select: {
            actualPortions: true,
          }
        },
        distribution_deliveries: true,
        vehicleAssignments: true,
      },
    })

    // Calculate totals
    let totalPlannedPortions = 0
    let totalDeliveries = 0
    let totalVehiclesAssigned = 0
    let totalEstimatedCost = 0
    let totalActualCost = 0

    schedules.forEach((schedule) => {
      totalPlannedPortions += schedule.production.actualPortions || 0
      totalDeliveries += schedule.distribution_deliveries.length
      totalVehiclesAssigned += schedule.vehicleAssignments.length
      // Note: estimatedTotalCost and actualTotalCost don't exist in schema yet
      // Would be calculated from packagingCost + fuelCost + other costs
      totalEstimatedCost += Number(schedule.packagingCost || 0) + Number(schedule.fuelCost || 0)
      totalActualCost += Number(schedule.packagingCost || 0) + Number(schedule.fuelCost || 0)
    })

    // 6. Get Today's Statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaySchedules = await db.distributionSchedule.findMany({
      where: {
        sppgId: session.user.sppgId!,
        distributionDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        production: {
          select: {
            actualPortions: true,
          }
        },
        distribution_deliveries: true,
      },
    })

    const todayStats = {
      total: todaySchedules.length,
      inProgress: todaySchedules.filter((s) => s.status === 'IN_PROGRESS').length,
      completed: todaySchedules.filter((s) => s.status === 'COMPLETED').length,
      totalPortions: todaySchedules.reduce(
        (sum, s) => sum + (s.production.actualPortions || 0),
        0
      ),
      totalDeliveries: todaySchedules.reduce(
        (sum, s) => sum + s.distribution_deliveries.length,
        0
      ),
    }

    // 7. Get Upcoming Statistics (next 7 days)
    const nextWeek = new Date(tomorrow)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const upcomingSchedules = await db.distributionSchedule.findMany({
      where: {
        sppgId: session.user.sppgId!,
        distributionDate: {
          gte: tomorrow,
          lt: nextWeek,
        },
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
      include: {
        production: {
          select: {
            actualPortions: true,
          }
        },
        distribution_deliveries: true,
      },
    })

    const upcomingStats = {
      total: upcomingSchedules.length,
      planned: upcomingSchedules.filter((s) => s.status === 'PLANNED').length,
      prepared: upcomingSchedules.filter((s) => s.status === 'PREPARED').length,
      inProgress: upcomingSchedules.filter((s) => s.status === 'IN_PROGRESS').length,
      totalPortions: upcomingSchedules.reduce(
        (sum, s) => sum + (s.production.actualPortions || 0),
        0
      ),
      totalDeliveries: upcomingSchedules.reduce(
        (sum, s) => sum + s.distribution_deliveries.length,
        0
      ),
    }

    // 8. Get Performance Metrics
    const completedSchedulesData = await db.distributionSchedule.findMany({
      where: {
        ...whereClause,
        status: 'COMPLETED',
      },
      include: {
        distribution_deliveries: true,
      },
    })

    let onTimeDeliveries = 0
    let lateDeliveries = 0

    completedSchedulesData.forEach((schedule) => {
      schedule.distribution_deliveries.forEach((delivery) => {
        if (
          delivery.actualArrival &&
          delivery.estimatedArrival
        ) {
          if (delivery.actualArrival <= delivery.estimatedArrival) {
            onTimeDeliveries++
          } else {
            lateDeliveries++
          }
        }
      })
    })

    const totalTimedDeliveries = onTimeDeliveries + lateDeliveries
    const onTimePercentage =
      totalTimedDeliveries > 0
        ? Math.round((onTimeDeliveries / totalTimedDeliveries) * 100)
        : 0

    // 9. Build Response
    const statistics = {
      overall: {
        totalSchedules,
        totalPlannedPortions,
        totalDeliveries,
        totalVehiclesAssigned,
        totalEstimatedCost,
        totalActualCost,
      },
      byStatus: {
        planned: plannedSchedules,
        assigned: assignedSchedules,
        confirmed: confirmedSchedules,
        inProgress: inProgressSchedules,
        completed: completedSchedules,
        cancelled: cancelledSchedules,
      },
      today: todayStats,
      upcoming: upcomingStats,
      performance: {
        onTimeDeliveries,
        lateDeliveries,
        onTimePercentage,
        totalCompletedSchedules: completedSchedules,
      },
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    }

    return NextResponse.json({
      success: true,
      data: statistics,
    })
  } catch (error) {
    console.error(
      'GET /api/sppg/distribution/schedule/statistics error:',
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
  })
}
