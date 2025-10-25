/**
 * @fileoverview Distribution Schedule Remove Vehicle Assignment API
 * @route DELETE /api/sppg/distribution/schedule/[id]/remove-vehicle/[assignmentId]
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

/**
 * DELETE /api/sppg/distribution/schedule/[id]/remove-vehicle/[assignmentId]
 * Remove vehicle assignment from distribution schedule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: scheduleId, assignmentId } = await params

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
        id: scheduleId,
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
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // 4. Validate schedule status (cannot remove vehicle if IN_PROGRESS or COMPLETED)
    if (['IN_PROGRESS', 'COMPLETED'].includes(schedule.status)) {
      return NextResponse.json(
        {
          error: 'Cannot remove vehicle',
          details: 'Kendaraan tidak dapat dihapus saat distribusi sedang berlangsung atau sudah selesai',
        },
        { status: 400 }
      )
    }

    // 5. Check if assignment exists and belongs to this schedule
    const assignment = await db.vehicleAssignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        vehicle: {
          select: {
            licensePlate: true,
          },
        },
        schedule: {
          select: {
            id: true,
            sppgId: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Vehicle assignment not found' },
        { status: 404 }
      )
    }

    // 6. Verify assignment belongs to the schedule and SPPG
    if (
      assignment.scheduleId !== scheduleId ||
      !assignment.schedule ||
      assignment.schedule.sppgId !== session.user.sppgId
    ) {
      return NextResponse.json(
        { error: 'Access denied or invalid assignment' },
        { status: 403 }
      )
    }

    // 7. Store data for audit log before deletion
    const vehiclePlate = assignment.vehicle.licensePlate
    const oldData = {
      id: assignment.id,
      scheduleId: assignment.scheduleId,
      vehicleId: assignment.vehicleId,
      driverId: assignment.driverId,
      helpers: assignment.helpers,
    }

    // 8. Delete Vehicle Assignment
    await db.vehicleAssignment.delete({
      where: {
        id: assignmentId,
      },
    })

    // 9. Get updated schedule
    const updatedSchedule = await db.distributionSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          },
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

    // 10. Audit Log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'DELETE',
        entityType: 'VehicleAssignment',
        entityId: assignmentId,
        description: `Removed vehicle ${vehiclePlate} from schedule ${schedule.production.menu.menuName} - ${schedule.production.batchNumber}`,
        oldValues: oldData,
        metadata: {
          scheduleId,
          vehiclePlate,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
      message: `Penugasan kendaraan ${vehiclePlate} berhasil dihapus`,
    })
  } catch (error) {
    console.error(
      'DELETE /api/sppg/distribution/schedule/[id]/remove-vehicle/[assignmentId] error:',
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove vehicle assignment',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
  })
}
