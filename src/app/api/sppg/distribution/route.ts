/**
 * @fileoverview Distribution Overview API Routes - Combined data from all distribution modules
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Enterprise API endpoints for distribution overview dashboard
 * Aggregates data from DistributionSchedule, FoodDistribution, and DistributionDelivery
 * 
 * Routes:
 * - GET /api/sppg/distribution - List all distributions with filters and aggregation
 * 
 * Security:
 * - Multi-tenant filtering by sppgId
 * - Role-based access control
 * - Input validation with Zod
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// Filter schema
const distributionFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  mealType: z.enum(['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER', 'SUPPLEMENT']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

/**
 * GET /api/sppg/distribution
 * 
 * Retrieves aggregated distribution data across all modules
 * Combines DistributionSchedule, FoodDistribution, and DistributionDelivery
 * 
 * Query Parameters:
 * - search: string (optional) - Search term for location/menu
 * - status: string (optional) - Filter by status
 * - mealType: enum (optional) - Filter by meal type
 * - dateFrom: string (optional) - Filter by date range start (ISO date)
 * - dateTo: string (optional) - Filter by date range end (ISO date)
 * - page: number (default: 1) - Page number
 * - limit: number (default: 10, max: 100) - Items per page
 * 
 * @returns {Promise<Response>} Aggregated distribution list with summary stats
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

    // 3. Parse and Validate Query Parameters
    const { searchParams } = new URL(request.url)
    const filters = distributionFiltersSchema.safeParse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      mealType: searchParams.get('mealType') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
    })

    if (!filters.success) {
      return Response.json({ 
        error: 'Invalid filters',
        details: filters.error.issues
      }, { status: 400 })
    }

    const { search, status, mealType, dateFrom, dateTo, page, limit } = filters.data
    const skip = (page - 1) * limit

    // 4. Build WHERE clause for filtering
    const whereClause: Record<string, unknown> = {
      sppgId: session.user.sppgId
    }

    // Status filter
    if (status) {
      whereClause.status = status
    }

    // Meal type filter
    if (mealType) {
      whereClause.mealType = mealType
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.distributionDate = {}
      if (dateFrom) {
        const distributionDate = whereClause.distributionDate as Record<string, unknown> || {}
        distributionDate.gte = new Date(dateFrom)
        whereClause.distributionDate = distributionDate
      }
      if (dateTo) {
        const distributionDate = whereClause.distributionDate as Record<string, unknown> || {}
        distributionDate.lte = new Date(dateTo)
        whereClause.distributionDate = distributionDate
      }
    }

    // Search filter (distribution point or address)
    if (search) {
      whereClause.OR = [
        {
          distributionPoint: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          address: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // 5. Fetch Distributions with Aggregated Data
    const [distributions, total] = await Promise.all([
      db.foodDistribution.findMany({
        where: whereClause,
        include: {
          program: {
            select: {
              name: true,
            }
          },
          _count: {
            select: {
              issues: true,
              vehicleAssignments: true,
              deliveries: true,
            }
          }
        },
        orderBy: {
          distributionDate: 'desc'
        },
        skip,
        take: limit,
      }),
      
      // Count total matching records
      db.foodDistribution.count({
        where: whereClause,
      })
    ])

    // 6. Transform data for response
    const transformedDistributions = distributions.map((dist) => ({
      id: dist.id,
      sppgId: dist.sppgId,
      programId: dist.programId,
      schoolId: dist.schoolId,
      scheduleId: dist.scheduleId,
      distributionCode: dist.distributionCode,
      distributionDate: dist.distributionDate.toISOString(),
      mealType: dist.mealType,
      status: dist.status,
      distributionPoint: dist.distributionPoint,
      distributionMethod: dist.distributionMethod,
      plannedRecipients: dist.plannedRecipients,
      actualRecipients: dist.actualRecipients,
      notes: dist.notes,
      createdAt: dist.createdAt.toISOString(),
      updatedAt: dist.updatedAt.toISOString(),
      program: dist.program ? {
        id: dist.programId,
        name: dist.program.name,
        sppgId: dist.sppgId,
      } : null,
    }))

    // 7. Calculate Summary Statistics
    const statusCounts = await db.foodDistribution.groupBy({
      by: ['status'],
      where: {
        sppgId: session.user.sppgId
      },
      _count: true
    })

    const summary = {
      total,
      scheduled: statusCounts.find((s) => s.status === 'SCHEDULED')?._count || 0,
      preparing: statusCounts.find((s) => s.status === 'PREPARING')?._count || 0,
      inTransit: statusCounts.find((s) => s.status === 'IN_TRANSIT')?._count || 0,
      distributing: statusCounts.find((s) => s.status === 'DISTRIBUTING')?._count || 0,
      completed: statusCounts.find((s) => s.status === 'COMPLETED')?._count || 0,
      cancelled: statusCounts.find((s) => s.status === 'CANCELLED')?._count || 0,
    }

    // 8. Calculate Pagination
    const totalPages = Math.ceil(total / limit)

    return Response.json({
      success: true,
      data: {
        distributions: transformedDistributions,
        total,
        page,
        limit,
        totalPages,
        summary
      }
    })

  } catch (error) {
    console.error('GET /api/sppg/distribution error:', error)
    return Response.json({ 
      error: 'Failed to fetch distributions',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
