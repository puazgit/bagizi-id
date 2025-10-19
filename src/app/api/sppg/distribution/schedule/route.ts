/**
 * @fileoverview Distribution Schedule API Routes - List & Create
 * @route GET/POST /api/sppg/distribution/schedule
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess } from '@/lib/permissions'
import {
  createScheduleSchema,
  scheduleFilterSchema,
  paginationSchema,
} from '@/features/sppg/distribution/schedule/schemas'
import { ScheduleStatus } from '@/features/sppg/distribution/schedule/types'

/**
 * GET /api/sppg/distribution/schedule
 * Fetch all schedules with filters and pagination
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
    
    // Filters - use safeParse to catch validation errors
    const filtersResult = scheduleFilterSchema.safeParse({
      status: statusParams.length > 0 ? statusParams : undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      wave: searchParams.get('wave') || undefined,
      deliveryMethod: searchParams.get('deliveryMethod') || undefined,
      search: searchParams.get('search') || undefined,
    })

    if (!filtersResult.success) {
      return Response.json(
        {
          error: 'Invalid filter parameters',
          details: filtersResult.error.issues,
        },
        { status: 400 }
      )
    }

    const filters = filtersResult.data

    // Pagination
    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    if (!paginationResult.success) {
      return Response.json(
        {
          error: 'Invalid pagination parameters',
          details: paginationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const pagination = paginationResult.data

    // Sort
    const sortField = searchParams.get('sortField') || 'distributionDate'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'

    // 4. Build Query
    const where: Record<string, unknown> = {
      sppgId: session.user.sppgId, // MANDATORY multi-tenant filter
    }

    // Status filter
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status]
      if (statusArray.length > 0) {
        where.status = { in: statusArray }
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.distributionDate = {}
      if (filters.dateFrom) {
        (where.distributionDate as Record<string, unknown>).gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        (where.distributionDate as Record<string, unknown>).lte = new Date(filters.dateTo)
      }
    }

    // Wave filter
    if (filters.wave) {
      where.wave = filters.wave
    }

    // Delivery method filter
    if (filters.deliveryMethod) {
      where.deliveryMethod = {
        contains: filters.deliveryMethod,
        mode: 'insensitive' as const
      }
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        {
          production: {
            menu: {
              menuName: {
                contains: filters.search,
                mode: 'insensitive' as const
              }
            }
          }
        },
        {
          deliveryMethod: {
            contains: filters.search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    // 5. Execute Query
    const [schedules, total] = await Promise.all([
      db.distributionSchedule.findMany({
        where,
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          production: {
            select: {
              id: true,
              batchNumber: true,
              actualPortions: true,
              menu: {
                select: {
                  id: true,
                  menuName: true,
                  servingSize: true,
                }
              }
            }
          },
          distribution_deliveries: {
            select: {
              id: true,
              status: true,
            },
          },
          vehicleAssignments: {
            include: {
              vehicle: {
                select: {
                  id: true,
                  licensePlate: true,
                  vehicleType: true,
                  capacity: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortField]: sortDirection,
        },
        skip: ((pagination.page || 1) - 1) * (pagination.limit || 10),
        take: pagination.limit || 10,
      }),
      db.distributionSchedule.count({ where }),
    ])    // 6. Format Response
    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      distributionDate: schedule.distributionDate,
      wave: schedule.wave,
      menuName: schedule.production.menu.menuName,
      totalPortions: schedule.production.actualPortions,
      estimatedBeneficiaries: schedule.estimatedBeneficiaries,
      status: schedule.status,
      deliveryMethod: schedule.deliveryMethod,
      vehicleCount: schedule.vehicleAssignments.length,
      deliveryCount: schedule.distribution_deliveries.length,
      createdAt: schedule.createdAt,
    }))

    return Response.json({
      success: true,
      data: formattedSchedules,
      pagination: {
        total,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: Math.ceil(total / (pagination.limit || 10)),
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/schedule error:', error)
    console.error('Error stack:', (error as Error).stack)
    console.error('Error name:', (error as Error).name)
    return Response.json(
      {
        error: 'Internal server error',
        message: 'Gagal memuat data jadwal distribusi',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      },
      { status: 500 }
    )
  }
}
/**
 * POST /api/sppg/distribution/schedule
 * Create new distribution schedule
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
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

    // 3. Parse and Validate Request Body
    const body = await request.json()
    const validated = createScheduleSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    // 4. Validate Production Exists and is COMPLETED
    const production = await db.foodProduction.findUnique({
      where: {
        id: validated.data.productionId,
      },
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            servingSize: true,
          }
        }
      }
    })

    if (!production) {
      return Response.json(
        {
          error: 'Production not found',
          details: 'Batch produksi tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Check production belongs to same SPPG
    if (production.sppgId !== session.user.sppgId) {
      return Response.json(
        {
          error: 'Access denied',
          details: 'Batch produksi bukan milik SPPG Anda',
        },
        { status: 403 }
      )
    }

    // Check production status is COMPLETED
    if (production.status !== 'COMPLETED') {
      return Response.json(
        {
          error: 'Invalid production status',
          details: 'Hanya batch produksi dengan status COMPLETED yang dapat dijadwalkan untuk distribusi',
        },
        { status: 400 }
      )
    }

    // Check if production has available portions
    if (!production.actualPortions || production.actualPortions <= 0) {
      return Response.json(
        {
          error: 'No available portions',
          details: 'Batch produksi tidak memiliki porsi yang tersedia',
        },
        { status: 400 }
      )
    }

    // 5. Business Logic Validation
    // Check if there's already a schedule for this date and wave
    const existingSchedule = await db.distributionSchedule.findFirst({
      where: {
        sppgId: session.user.sppgId,
        distributionDate: validated.data.distributionDate,
        wave: validated.data.wave,
      },
    })

    if (existingSchedule) {
      return Response.json(
        {
          error: 'Schedule conflict',
          details: 'Sudah ada jadwal untuk tanggal dan gelombang ini',
        },
        { status: 409 }
      )
    }

    // 6. Create Schedule
    const schedule = await db.distributionSchedule.create({
      data: {
        sppgId: session.user.sppgId, // Multi-tenant safety
        productionId: validated.data.productionId, // Link to production
        distributionDate: validated.data.distributionDate,
        wave: validated.data.wave,
        targetCategories: validated.data.targetCategories,
        estimatedBeneficiaries: validated.data.estimatedBeneficiaries,
        packagingType: validated.data.packagingType,
        packagingCost: validated.data.packagingCost,
        deliveryMethod: validated.data.deliveryMethod,
        distributionTeam: validated.data.distributionTeam,
        estimatedTravelTime: validated.data.estimatedTravelTime,
        fuelCost: validated.data.fuelCost,
        status: ScheduleStatus.PLANNED, // Initial status
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        production: {
          select: {
            id: true,
            batchNumber: true,
            actualPortions: true,
            menu: {
              select: {
                id: true,
                menuName: true,
                servingSize: true,
              }
            }
          }
        },
        distribution_deliveries: true,
        vehicleAssignments: {
          include: {
            vehicle: {
              select: {
                id: true,
                licensePlate: true,
                vehicleType: true,
                capacity: true,
              },
            },
          },
        },
      },
    })

        // 11. Audit Log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'CREATE',
        entityType: 'DistributionSchedule',
        entityId: schedule.id,
        description: `Created distribution schedule for ${schedule.production.menu.menuName} on ${schedule.distributionDate.toISOString()}`,
        metadata: {
          wave: schedule.wave,
          productionId: schedule.productionId,
          batchNumber: schedule.production.batchNumber,
          estimatedBeneficiaries: schedule.estimatedBeneficiaries,
        },
      },
    })

    return Response.json(
      {
        success: true,
        data: schedule,
        message: 'Jadwal distribusi berhasil dibuat',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/sppg/distribution/schedule error:', error)
    return Response.json(
      {
        error: 'Failed to create schedule',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
