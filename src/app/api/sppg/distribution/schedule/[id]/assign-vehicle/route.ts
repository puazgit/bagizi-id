/**
 * @fileoverview Distribution Schedule Vehicle Assignment API
 * @route POST /api/sppg/distribution/schedule/[id]/assign-vehicle
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess } from '@/lib/permissions'
import { assignVehicleSchema } from '@/features/sppg/distribution/schedule/schemas'

/**
 * POST /api/sppg/distribution/schedule/[id]/assign-vehicle
 * Assign vehicle to distribution schedule
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params

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
        id: scheduleId,
        sppgId: session.user.sppgId,
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
        vehicleAssignments: {
          include: {
            vehicle: true,
          },
        },
      },
    })

    if (!schedule) {
      return Response.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // 4. Validate schedule status (only allow for PLANNED and ASSIGNED)
    if (!['PLANNED', 'ASSIGNED', 'CONFIRMED'].includes(schedule.status)) {
      return Response.json(
        {
          error: 'Cannot assign vehicle',
          details: 'Kendaraan hanya dapat ditugaskan saat status PLANNED, ASSIGNED, atau CONFIRMED',
        },
        { status: 400 }
      )
    }

    // 5. Parse and Validate Request Body
    const body = await request.json()
    const validated = assignVehicleSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const { vehicleId, driverId, helpers, estimatedDeparture, estimatedArrival, notes } =
      validated.data

    // 6. Check if vehicle exists and belongs to SPPG
    const vehicle = await db.vehicle.findUnique({
      where: {
        id: vehicleId,
        sppgId: session.user.sppgId,
      },
    })

    if (!vehicle) {
      return Response.json(
        { error: 'Vehicle not found or access denied' },
        { status: 404 }
      )
    }

    // 7. Check vehicle availability (not already assigned to another schedule on same date/time)
    const conflictingAssignment = await db.vehicleAssignment.findFirst({
      where: {
        vehicleId,
        schedule: {
          distributionDate: schedule.distributionDate,
          wave: schedule.wave,
          status: {
            notIn: ['CANCELLED', 'COMPLETED'],
          },
        },
        NOT: {
          scheduleId,
        },
      },
      include: {
        schedule: {
          include: {
            production: {
              select: {
                menu: {
                  select: {
                    menuName: true,
                  }
                }
              }
            }
          }
        },
      },
    })

    if (conflictingAssignment && conflictingAssignment.schedule) {
      return Response.json(
        {
          error: 'Vehicle conflict',
          details: `Kendaraan ${vehicle.licensePlate} sudah ditugaskan pada jadwal lain di tanggal dan waktu yang sama`,
          conflictingSchedule: {
            id: conflictingAssignment.schedule.id,
            menuName: conflictingAssignment.schedule.production.menu.menuName,
            wave: conflictingAssignment.schedule.wave,
          },
        },
        { status: 409 }
      )
    }

    // 8. Check if vehicle is already assigned to this schedule
    const existingAssignment = schedule.vehicleAssignments.find(
      (va: { vehicleId: string }) => va.vehicleId === vehicleId
    )

    if (existingAssignment) {
      return Response.json(
        {
          error: 'Vehicle already assigned',
          details: 'Kendaraan ini sudah ditugaskan pada jadwal ini',
        },
        { status: 409 }
      )
    }

    // 9. Check driver (TODO: verify driver exists and is available)
    // This would require a User/Staff model with driver role
    // For now, we'll just store the ID

    // 10. Create Vehicle Assignment
    const assignment = await db.vehicleAssignment.create({
      data: {
        sppgId: session.user.sppgId, // ✅ FIXED: Add required sppgId
        scheduleId,
        vehicleId,
        driverId,
        helpers: helpers || [],
        startTime: estimatedDeparture,
        endTime: estimatedArrival,
        startLocation: '', // TODO: Get from schedule
        endLocation: '', // TODO: Get from schedule
        notes,
      },
      include: {
        vehicle: true,
        schedule: {
          include: {
            sppg: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    })

    // 11. Update Schedule (get fresh data with all relations)
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

    // 12. Audit Log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'CREATE',
        entityType: 'VehicleAssignment',
        entityId: assignment.id,
        description: `Assigned vehicle ${vehicle.licensePlate} to schedule ${schedule.production.menu.menuName} - ${schedule.production.batchNumber}`,
        metadata: {
          scheduleId,
          vehicleId,
          driverId,
          helpers,
        },
      },
    })

    return Response.json({
      success: true,
      data: updatedSchedule,
      message: `Kendaraan ${vehicle.licensePlate} berhasil ditugaskan`,
    })
  } catch (error) {
    console.error(
      'POST /api/sppg/distribution/schedule/[id]/assign-vehicle error:',
      error
    )
    return Response.json(
      {
        error: 'Failed to assign vehicle',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
