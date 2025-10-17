/**
 * @fileoverview Production API Route - GET & POST
 * @route /api/sppg/production
 * @version Next.js 15.5.4 / Prisma 6.17.1
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { ProductionStatus } from '@prisma/client'

/**
 * GET /api/sppg/production
 * Get all productions for authenticated user's SPPG with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') as ProductionStatus | 'ALL' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const menuId = searchParams.get('menuId')
    const programId = searchParams.get('programId')

    // Build where clause
    const where: {
      sppgId: string
      OR?: Array<{
        batchNumber?: { contains: string; mode: 'insensitive' }
        menu?: { menuName?: { contains: string; mode: 'insensitive' } }
      }>
      status?: ProductionStatus
      productionDate?: { gte?: Date; lte?: Date }
      menuId?: string
      programId?: string
    } = {
      sppgId: session.user.sppgId,
    }

    // Search filter
    if (search) {
      where.OR = [
        { batchNumber: { contains: search, mode: 'insensitive' } },
        { menu: { menuName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Date range filter
    if (startDate || endDate) {
      where.productionDate = {}
      if (startDate) {
        where.productionDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.productionDate.lte = new Date(endDate)
      }
    }

    // Menu filter
    if (menuId) {
      where.menuId = menuId
    }

    // Program filter
    if (programId) {
      where.programId = programId
    }

    // Get total count
    const total = await db.foodProduction.count({ where })

    // Get productions with pagination
    const productions = await db.foodProduction.findMany({
      where,
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        program: {
          select: {
            id: true,
            name: true,
          }
        },
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
          }
        },
        _count: {
          select: {
            qualityChecks: true,
          }
        }
      },
      orderBy: {
        productionDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return Response.json({
      success: true,
      data: productions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/production error:', error)
    return Response.json(
      {
        error: 'Failed to fetch productions',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sppg/production
 * Create new production
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    const body = await request.json()

    // Generate batch number if not provided
    const batchNumber = body.batchNumber || `BATCH-${Date.now()}`

    // Create production
    const production = await db.foodProduction.create({
      data: {
        sppgId: session.user.sppgId,
        programId: body.programId,
        menuId: body.menuId,
        productionDate: new Date(body.productionDate),
        batchNumber,
        plannedPortions: body.plannedPortions,
        plannedStartTime: new Date(body.plannedStartTime),
        plannedEndTime: new Date(body.plannedEndTime),
        headCook: body.headCook,
        assistantCooks: body.assistantCooks || [],
        supervisorId: body.supervisorId,
        estimatedCost: body.estimatedCost,
        targetTemperature: body.targetTemperature,
        notes: body.notes,
        status: 'PLANNED',
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        program: {
          select: {
            id: true,
            name: true,
          }
        },
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
            servingSize: true,
          }
        },
      },
    })

    return Response.json(
      {
        success: true,
        data: production,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/sppg/production error:', error)
    return Response.json(
      {
        error: 'Failed to create production',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
