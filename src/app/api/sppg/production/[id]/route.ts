/**
 * @fileoverview Production Detail API Route - GET, PATCH, DELETE
 * @route /api/sppg/production/[id]
 * @version Next.js 15.5.4 / Prisma 6.17.1
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/production/[id]
 * Get single production with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    const production = await db.foodProduction.findUnique({
      where: {
        id: params.id,
        sppgId: session.user.sppgId,
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
            ingredients: {
              include: {
                inventoryItem: {
                  select: {
                    id: true,
                    itemName: true,
                    unit: true,
                  }
                }
              }
            }
          }
        },
        qualityChecks: {
          orderBy: {
            checkTime: 'desc',
          }
        },
      },
    })

    if (!production) {
      return Response.json({ error: 'Production not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: production,
    })
  } catch (error) {
    console.error('GET /api/sppg/production/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to fetch production',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sppg/production/[id]
 * Update production (only if status is PLANNED)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // Check if production exists and belongs to user's SPPG
    const existing = await db.foodProduction.findUnique({
      where: {
        id: params.id,
        sppgId: session.user.sppgId,
      },
    })

    if (!existing) {
      return Response.json({ error: 'Production not found' }, { status: 404 })
    }

    // Only allow updates if status is PLANNED
    if (existing.status !== 'PLANNED') {
      return Response.json(
        { error: 'Cannot update production that is not in PLANNED status' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Update production
    const production = await db.foodProduction.update({
      where: {
        id: params.id,
      },
      data: {
        programId: body.programId,
        menuId: body.menuId,
        productionDate: body.productionDate ? new Date(body.productionDate) : undefined,
        plannedPortions: body.plannedPortions,
        plannedStartTime: body.plannedStartTime ? new Date(body.plannedStartTime) : undefined,
        plannedEndTime: body.plannedEndTime ? new Date(body.plannedEndTime) : undefined,
        headCook: body.headCook,
        assistantCooks: body.assistantCooks,
        supervisorId: body.supervisorId,
        estimatedCost: body.estimatedCost,
        targetTemperature: body.targetTemperature,
        notes: body.notes,
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
          }
        },
      },
    })

    return Response.json({
      success: true,
      data: production,
    })
  } catch (error) {
    console.error('PATCH /api/sppg/production/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to update production',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sppg/production/[id]
 * Delete production (cascade delete quality checks)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // Check if production exists and belongs to user's SPPG
    const existing = await db.foodProduction.findUnique({
      where: {
        id: params.id,
        sppgId: session.user.sppgId,
      },
    })

    if (!existing) {
      return Response.json({ error: 'Production not found' }, { status: 404 })
    }

    // Delete production (cascade will handle quality checks)
    await db.foodProduction.delete({
      where: {
        id: params.id,
      },
    })

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error('DELETE /api/sppg/production/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to delete production',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
