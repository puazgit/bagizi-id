/**
 * @fileoverview Distribution Delivery API Routes - List All Deliveries
 * @route GET /api/sppg/distribution/delivery
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess } from '@/lib/permissions'

/**
 * GET /api/sppg/distribution/delivery
 * Fetch all deliveries for current SPPG with filters
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (CRITICAL FOR MULTI-TENANCY!)
    if (!session.user.sppgId) {
      return Response.json(
        { error: 'SPPG access required' },
        { status: 403 }
      )
    }
    
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json(
        { error: 'SPPG not found or access denied' },
        { status: 403 }
      )
    }

    // 3. Parse Query Parameters
    const { searchParams } = new URL(request.url)
    
    // Get status array and filter out empty values
    const statusParams = searchParams.getAll('status').filter(Boolean)
    
    // Filters
    const status = statusParams.length > 0 ? statusParams : undefined
    const driverName = searchParams.get('driverName') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const search = searchParams.get('search') || undefined

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Sort
    const sortField = searchParams.get('sortField') || 'estimatedArrival'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'

    // 4. Build Query
    const where: Record<string, unknown> = {
      schedule: {
        sppgId: session.user.sppgId, // MANDATORY multi-tenant filter via schedule
      }
    }

    // Status filter
    if (status && status.length > 0) {
      where.status = { in: status }
    }

    // Driver name filter
    if (driverName) {
      where.driverName = {
        contains: driverName,
        mode: 'insensitive' as const
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.estimatedArrival = {}
      if (dateFrom) {
        (where.estimatedArrival as Record<string, unknown>).gte = new Date(dateFrom)
      }
      if (dateTo) {
        (where.estimatedArrival as Record<string, unknown>).lte = new Date(dateTo)
      }
    }

    // Search filter (target name or address)
    if (search) {
      where.OR = [
        {
          targetName: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          targetAddress: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          driverName: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    // 5. Execute Query
    const [deliveries, total] = await Promise.all([
      db.distributionDelivery.findMany({
        where,
        include: {
          schedule: {
            select: {
              id: true,
              distributionDate: true,
              wave: true,
              production: {
                select: {
                  id: true,
                  batchNumber: true,
                  menu: {
                    select: {
                      id: true,
                      menuName: true,
                    }
                  }
                }
              }
            },
          },
          distribution: {
            select: {
              id: true,
              distributionDate: true,
              status: true,
            },
          },
          schoolBeneficiary: {
            select: {
              id: true,
              schoolName: true,
            },
          },
          issues: {
            select: {
              id: true,
              issueType: true,
              severity: true,
            },
          },
        },
        orderBy: {
          [sortField]: sortDirection,
        },
        skip,
        take: limit,
      }),
      db.distributionDelivery.count({ where }),
    ])

    // 6. Calculate Statistics
    const [
      totalPlanned,
      totalInProgress,
      totalCompleted,
      totalFailed,
    ] = await Promise.all([
      db.distributionDelivery.count({
        where: {
          ...where,
          status: 'ASSIGNED',
        },
      }),
      db.distributionDelivery.count({
        where: {
          ...where,
          status: 'DEPARTED',
        },
      }),
      db.distributionDelivery.count({
        where: {
          ...where,
          status: 'DELIVERED',
        },
      }),
      db.distributionDelivery.count({
        where: {
          ...where,
          status: 'FAILED',
        },
      }),
    ])

    // 7. Format Response
    const formattedDeliveries = deliveries.map((delivery) => ({
      id: delivery.id,
      scheduleId: delivery.scheduleId,
      distributionId: delivery.distributionId,
      targetType: delivery.targetType,
      targetName: delivery.targetName,
      targetAddress: delivery.targetAddress,
      estimatedArrival: delivery.estimatedArrival,
      actualArrival: delivery.actualArrival,
      portionsDelivered: delivery.portionsDelivered,
      portionsPlanned: delivery.portionsPlanned,
      driverName: delivery.driverName,
      helperNames: delivery.helperNames,
      status: delivery.status,
      deliveredAt: delivery.deliveredAt,
      
      // Related data
      schedule: delivery.schedule,
      distribution: delivery.distribution,
      schoolBeneficiary: delivery.schoolBeneficiary,
      
      // Metrics
      hasIssues: delivery.issues.length > 0,
      issueCount: delivery.issues.length,
      isLate: delivery.actualArrival 
        ? delivery.actualArrival > delivery.estimatedArrival
        : false,
      
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    }))

    return Response.json({
      success: true,
      data: formattedDeliveries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        total,
        planned: totalPlanned,
        inProgress: totalInProgress,
        completed: totalCompleted,
        failed: totalFailed,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/delivery error:', error)
    console.error('Error stack:', (error as Error).stack)
    console.error('Error name:', (error as Error).name)
    return Response.json(
      {
        error: 'Internal server error',
        message: 'Gagal memuat data pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      },
      { status: 500 }
    )
  }
}
