/**
 * @fileoverview Distribution Schedule Status Update API
 * @route PATCH /api/sppg/distribution/schedule/[id]/status
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess } from '@/lib/permissions'
import { updateScheduleStatusSchema } from '@/features/sppg/distribution/schedule/schemas'
import { 
  ScheduleStatus, 
  SCHEDULE_STATUS_TRANSITIONS 
} from '@/features/sppg/distribution/schedule/types'

/**
 * PATCH /api/sppg/distribution/schedule/[id]/status
 * Update schedule status with validation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // 3. Check if schedule exists and belongs to SPPG
    const schedule = await db.distributionSchedule.findUnique({
      where: {
        id,
        sppgId: session.user.sppgId,
      },
      include: {
        vehicleAssignments: true,
        distribution_deliveries: true,
      },
    })

    if (!schedule) {
      return Response.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // 4. Parse and Validate Request Body
    const body = await request.json()
    const validated = updateScheduleStatusSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const { status: newStatus, reason, notes } = validated.data

    // 5. Validate Status Transition
    const currentStatus = schedule.status as ScheduleStatus
    const allowedTransitions = SCHEDULE_STATUS_TRANSITIONS[currentStatus]

    if (!allowedTransitions.includes(newStatus as ScheduleStatus)) {
      return Response.json(
        {
          error: 'Invalid status transition',
          details: `Tidak dapat mengubah status dari ${currentStatus} ke ${newStatus}`,
          allowedTransitions,
        },
        { status: 400 }
      )
    }

    // 6. Business Logic Validation Based on Target Status
    const validationErrors: string[] = []

    // PLANNED → PREPARED: Must have at least one vehicle assigned
    if (newStatus === ScheduleStatus.PREPARED) {
      if (schedule.vehicleAssignments.length === 0) {
        validationErrors.push('Minimal harus ada 1 kendaraan yang ditugaskan')
      }
    }

    // PREPARED → IN_PROGRESS: All vehicles must be confirmed
    if (newStatus === ScheduleStatus.IN_PROGRESS) {
      if (schedule.vehicleAssignments.length === 0) {
        validationErrors.push('Tidak ada kendaraan yang ditugaskan')
      }
      // Additional checks can be added here (e.g., driver confirmation)
    }

    // CONFIRMED → IN_PROGRESS: Ready to start
    if (newStatus === ScheduleStatus.IN_PROGRESS) {
      if (schedule.vehicleAssignments.length === 0) {
        validationErrors.push('Tidak ada kendaraan yang ditugaskan')
      }
      // Check if distribution date is today or past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const scheduleDate = new Date(schedule.distributionDate)
      scheduleDate.setHours(0, 0, 0, 0)
      
      if (scheduleDate > today) {
        validationErrors.push('Distribusi belum dapat dimulai (tanggal belum tiba)')
      }
    }

    // IN_PROGRESS → COMPLETED: All deliveries must be completed
    if (newStatus === ScheduleStatus.COMPLETED) {
      if (schedule.distribution_deliveries.length === 0) {
        validationErrors.push('Tidak ada delivery yang dibuat')
      }
      
      const pendingDeliveries = schedule.distribution_deliveries.filter(
        (d: { status: string }) => d.status !== 'DELIVERED'
      )
      
      if (pendingDeliveries.length > 0) {
        validationErrors.push(
          `Masih ada ${pendingDeliveries.length} delivery yang belum selesai`
        )
      }
    }

    // Any → CANCELLED: Requires reason
    if (newStatus === ScheduleStatus.CANCELLED) {
      if (!reason) {
        validationErrors.push('Alasan pembatalan harus diisi')
      }
    }

    if (validationErrors.length > 0) {
      return Response.json(
        {
          error: 'Status validation failed',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // 7. Update Schedule Status
    const updateData: Record<string, unknown> = {
      status: newStatus,
    }

    // Set timestamps based on status
    if (newStatus === ScheduleStatus.IN_PROGRESS && !schedule.startedAt) {
      updateData.startedAt = new Date()
    }
    if (newStatus === ScheduleStatus.COMPLETED && !schedule.completedAt) {
      updateData.completedAt = new Date()
    }

    const updatedSchedule = await db.distributionSchedule.update({
      where: { id },
      data: updateData,
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

    // 8. Audit Log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'UPDATE',
        entityType: 'DistributionSchedule',
        entityId: id,
        description: `Changed schedule status from ${currentStatus} to ${newStatus}${reason ? `: ${reason}` : ''}`,
        oldValues: { status: currentStatus },
        newValues: { status: newStatus, reason, notes },
        metadata: {
          statusTransition: {
            from: currentStatus,
            to: newStatus,
            timestamp: new Date(),
          },
        },
      },
    })

    return Response.json({
      success: true,
      data: updatedSchedule,
      message: `Status berhasil diubah ke ${newStatus}`,
    })
  } catch (error) {
    console.error(
      'PATCH /api/sppg/distribution/schedule/[id]/status error:',
      error
    )
    return Response.json(
      {
        error: 'Failed to update status',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
