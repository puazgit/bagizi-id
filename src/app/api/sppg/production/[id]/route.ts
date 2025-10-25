/**
 * @fileoverview Production Detail API Route - GET, PATCH, DELETE
 * @route /api/sppg/production/[id]
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * 
 * RBAC Integration:
 * - All handlers protected by withSppgAuth
 * - Automatic audit logging
 * - Multi-tenant: Production ownership verified via sppgId
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/production/[id]
 * Get single production with all relations
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      const production = await db.foodProduction.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!,
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
        return NextResponse.json({ error: 'Production not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: production,
      })
    } catch (error) {
      console.error('GET /api/sppg/production/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch production',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PATCH /api/sppg/production/[id]
 * Update production (only if status is PLANNED)
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Check if production exists and belongs to user's SPPG
      const existing = await db.foodProduction.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!,
        },
      })

      if (!existing) {
        return NextResponse.json({ error: 'Production not found' }, { status: 404 })
      }

      // Only allow updates if status is PLANNED
      if (existing.status !== 'PLANNED') {
        return NextResponse.json(
          { error: 'Cannot update production that is not in PLANNED status' },
          { status: 400 }
        )
      }

      const body = await request.json()

      // Update production
      const production = await db.foodProduction.update({
        where: {
          id,
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

      return NextResponse.json({
        success: true,
        data: production,
      })
    } catch (error) {
      console.error('PATCH /api/sppg/production/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update production',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/production/[id]
 * Delete production (cascade delete quality checks)
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Check if production exists and belongs to user's SPPG
      const existing = await db.foodProduction.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!,
        },
      })

      if (!existing) {
        return NextResponse.json({ error: 'Production not found' }, { status: 404 })
      }

      // Delete production (cascade will handle quality checks)
      await db.foodProduction.delete({
        where: {
          id,
        },
      })

      return NextResponse.json({
        success: true,
      })
    } catch (error) {
      console.error('DELETE /api/sppg/production/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete production',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}