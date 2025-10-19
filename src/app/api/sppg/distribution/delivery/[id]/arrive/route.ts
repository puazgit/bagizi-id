/**
 * @fileoverview API route - Mark delivery arrival
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/arrive
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { arriveDeliverySchema } from '@/features/sppg/distribution/delivery/schemas'

/**
 * POST /api/sppg/distribution/delivery/:id/arrive
 * Mark arrival at destination with GPS location
 */
export async function POST(
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

    // 4. Verify ownership and status
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
        arrivalTime: true,
        departureTime: true,
      },
    })

    if (!existing) {
      return Response.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 5. Check if delivery can be marked as arrived
    if (existing.status !== 'DEPARTED') {
      return Response.json(
        {
          error: 'Pengiriman tidak dapat ditandai sampai',
          details: `Status saat ini: ${existing.status}. Hanya pengiriman dengan status DEPARTED yang dapat ditandai sampai.`,
        },
        { status: 400 }
      )
    }

    if (!existing.departureTime) {
      return Response.json(
        {
          error: 'Pengiriman belum dimulai',
          details: 'Mulai pengiriman terlebih dahulu sebelum menandai kedatangan.',
        },
        { status: 400 }
      )
    }

    if (existing.arrivalTime) {
      return Response.json(
        {
          error: 'Pengiriman sudah ditandai sampai sebelumnya',
          details: `Waktu kedatangan: ${existing.arrivalTime}`,
        },
        { status: 400 }
      )
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = arriveDeliverySchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Data tidak valid',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const { arrivalTime, arrivalLocation, notes } = validated.data

    // 7. Update delivery - mark arrival (but keep status as DEPARTED until completion)
    const updated = await db.distributionDelivery.update({
      where: { id },
      data: {
        // Status stays DEPARTED - will change to DELIVERED on completion
        arrivalTime,
        arrivalLocation,
        currentLocation: arrivalLocation, // Update current location to arrival
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    })

    // 8. Create tracking point for arrival
    if (arrivalLocation) {
      const [lat, lng] = arrivalLocation.split(',').map(Number)
      await db.deliveryTracking.create({
        data: {
          deliveryId: id,
          latitude: lat,
          longitude: lng,
          accuracy: 10, // Default accuracy for arrival point
          status: 'DELIVERED', // Track as delivery in progress
          notes: 'Titik kedatangan',
        },
      })
    }

    return Response.json({
      success: true,
      data: updated,
      message: 'Pengiriman berhasil ditandai sampai di tujuan',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/arrive error:', error)
    return Response.json(
      {
        error: 'Gagal menandai kedatangan pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
