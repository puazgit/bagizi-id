/**
 * @fileoverview Distribution Schedule API Routes - Detail Operations
 * @route GET/PUT/DELETE /api/sppg/distribution/schedule/[id]
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { updateScheduleSchema } from '@/features/sppg/distribution/schedule/schemas'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/distribution/schedule/[id]
 * Fetch schedule detail by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Fetch Schedule
    const schedule = await db.distributionSchedule.findUnique({
      where: {
        id,
        sppgId: session.user.sppgId!, // Multi-tenant safety
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
        distribution_deliveries: {
          include: {
            receipts: true,
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
                status: true,
              },
            },
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // 4. Calculate Statistics
    const stats = {
      totalDeliveries: schedule.distribution_deliveries.length,
      completedDeliveries: schedule.distribution_deliveries.filter(
        (d: { status: string }) => d.status === 'DELIVERED'
      ).length,
      totalPortions: schedule.production.actualPortions || 0,
      deliveredPortions: schedule.distribution_deliveries.reduce(
        (sum: number, d: { portionsDelivered: number }) => sum + d.portionsDelivered,
        0
      ),
      totalBeneficiaries: schedule.estimatedBeneficiaries,
      assignedVehicles: schedule.vehicleAssignments.length,
      estimatedCost:
        (schedule.packagingCost || 0) + (schedule.fuelCost || 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        ...schedule,
        stats,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/schedule/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
  })
}

/**
 * PUT /api/sppg/distribution/schedule/[id]
 * Update existing schedule
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Check if schedule exists and belongs to SPPG
    const existingSchedule = await db.distributionSchedule.findUnique({
      where: {
        id,
        sppgId: session.user.sppgId!,
      },
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // 4. Validate update is allowed (cannot edit if IN_PROGRESS or COMPLETED)
    if (['IN_PROGRESS', 'COMPLETED'].includes(existingSchedule.status)) {
      return NextResponse.json(
        {
          error: 'Cannot edit schedule',
          details: 'Tidak dapat mengubah jadwal yang sedang berjalan atau selesai',
        },
        { status: 400 }
      )
    }

    // 5. Parse and Validate Request Body
    const body = await request.json()
    const validated = updateScheduleSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    // 6. Update Schedule
    const updatedSchedule = await db.distributionSchedule.update({
      where: { id },
      data: validated.data,
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
            menu: {
              select: {
                id: true,
                menuName: true,
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

    // 7. Audit Log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'UPDATE',
        entityType: 'DistributionSchedule',
        entityId: id,
        description: `Updated distribution schedule ${updatedSchedule.production.menu.menuName} - ${updatedSchedule.production.batchNumber}`,
        oldValues: existingSchedule,
        newValues: updatedSchedule,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
    })
  } catch (error) {
    console.error('PUT /api/sppg/distribution/schedule/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
  })
}

/**
 * DELETE /api/sppg/distribution/schedule/[id]
 * Delete schedule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Check if schedule exists and belongs to SPPG
    const schedule = await db.distributionSchedule.findUnique({
      where: {
        id,
        sppgId: session.user.sppgId!,
      },
      include: {
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
        },
        distribution_deliveries: true,
        vehicleAssignments: true,
      },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // 4. Validate deletion is allowed
    if (['IN_PROGRESS', 'COMPLETED'].includes(schedule.status)) {
      return NextResponse.json(
        {
          error: 'Cannot delete schedule',
          details: 'Tidak dapat menghapus jadwal yang sedang berjalan atau selesai',
        },
        { status: 400 }
      )
    }

    // Check if there are deliveries
    if (schedule.distribution_deliveries.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete schedule',
          details: 'Jadwal memiliki delivery yang terkait',
        },
        { status: 400 }
      )
    }

    // 5. Delete Schedule (cascade will handle related records)
    await db.distributionSchedule.delete({
      where: { id },
    })

    // 6. Audit Log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'DELETE',
        entityType: 'DistributionSchedule',
        entityId: id,
        description: `Deleted distribution schedule ${schedule.production.menu.menuName} - ${schedule.production.batchNumber}`,
        oldValues: schedule,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('DELETE /api/sppg/distribution/schedule/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
  })
}
