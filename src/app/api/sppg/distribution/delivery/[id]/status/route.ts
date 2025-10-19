/**
 * @fileoverview API route - Update delivery status
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint PUT /api/sppg/distribution/delivery/:id/status
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { updateDeliveryStatusSchema } from '@/features/sppg/distribution/delivery/schemas'

/**
 * PUT /api/sppg/distribution/delivery/:id/status
 * Update delivery status with optional GPS location
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Multi-tenant check
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Get delivery ID from params
    const { id } = await params

    // 4. Verify ownership
    const existing = await db.distributionDelivery.findFirst({
      where: {
        id,
        schedule: {
          sppgId: session.user.sppgId, // CRITICAL: Multi-tenant security
        },
      },
      select: { 
        id: true, 
        status: true,
        departureTime: true,
        arrivalTime: true,
      },
    })

    if (!existing) {
      return Response.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = updateDeliveryStatusSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Data tidak valid',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const { status, currentLocation, notes } = validated.data

    // 6. Status transition validation
    const validTransitions: Record<string, string[]> = {
      ASSIGNED: ['DEPARTED', 'CANCELLED', 'FAILED'],
      DEPARTED: ['DELIVERED', 'FAILED', 'CANCELLED'],
      DELIVERED: [], // Final state
      FAILED: [], // Final state
      CANCELLED: [], // Final state
    }

    const allowedNextStatuses = validTransitions[existing.status] || []
    if (!allowedNextStatuses.includes(status)) {
      return Response.json(
        {
          error: 'Transisi status tidak valid',
          details: `Tidak dapat mengubah status dari ${existing.status} ke ${status}`,
        },
        { status: 400 }
      )
    }

    // 7. Update delivery status
    const updated = await db.distributionDelivery.update({
      where: { id },
      data: {
        status,
        currentLocation: currentLocation || undefined,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    })

    return Response.json({
      success: true,
      data: updated,
      message: `Status pengiriman berhasil diubah menjadi ${status}`,
    })
  } catch (error) {
    console.error('PUT /api/sppg/distribution/delivery/[id]/status error:', error)
    return Response.json(
      {
        error: 'Gagal memperbarui status pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
