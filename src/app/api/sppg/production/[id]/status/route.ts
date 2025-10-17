/**
 * @fileoverview Production Status Transition API Route
 * @route /api/sppg/production/[id]/status
 * @version Next.js 15.5.4 / Prisma 6.17.1
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { ProductionStatus } from '@prisma/client'

/**
 * PATCH /api/sppg/production/[id]/status
 * Update production status with timestamp management
 * Valid statuses: PLANNED, PREPARING, COOKING, QUALITY_CHECK, COMPLETED, CANCELLED
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

    const body = await request.json()
    const newStatus = body.status as ProductionStatus

    // Validate status transition (using correct enum values)
    const validTransitions: Record<ProductionStatus, ProductionStatus[]> = {
      PLANNED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['COOKING', 'CANCELLED'],
      COOKING: ['QUALITY_CHECK', 'CANCELLED'],
      QUALITY_CHECK: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    }

    if (!validTransitions[existing.status]?.includes(newStatus)) {
      return Response.json(
        { error: `Cannot transition from ${existing.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Prepare update data with timestamps (using actual schema fields)
    const updateData: {
      status: ProductionStatus
      actualStartTime?: Date
      actualEndTime?: Date
      actualPortions?: number
      actualCost?: number
      wasteAmount?: number
      rejectionReason?: string
      qualityPassed?: boolean
    } = {
      status: newStatus,
    }

    // Set timestamps based on status
    switch (newStatus) {
      case 'PREPARING':
        if (!existing.actualStartTime) {
          updateData.actualStartTime = new Date()
        }
        break
      case 'COMPLETED':
        updateData.actualEndTime = new Date()
        updateData.qualityPassed = true
        // Copy from body if provided
        if (body.actualPortions) updateData.actualPortions = body.actualPortions
        if (body.actualCost) updateData.actualCost = body.actualCost
        if (body.wasteAmount) updateData.wasteAmount = body.wasteAmount
        break
      case 'CANCELLED':
        updateData.rejectionReason = body.cancellationReason || body.rejectionReason || 'Not specified'
        updateData.qualityPassed = false
        break
    }

    // Update production
    const production = await db.foodProduction.update({
      where: {
        id: params.id,
      },
      data: updateData,
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
    console.error('PATCH /api/sppg/production/[id]/status error:', error)
    return Response.json(
      {
        error: 'Failed to update production status',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
