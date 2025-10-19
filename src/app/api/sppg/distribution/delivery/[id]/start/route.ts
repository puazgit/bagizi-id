/**
 * @fileoverview API route - Start delivery (departure)
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/start
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { startDeliverySchema } from '@/features/sppg/distribution/delivery/schemas'

/**
 * POST /api/sppg/distribution/delivery/:id/start
 * Start delivery - mark departure with GPS location
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
        departureTime: true,
      },
    })

    if (!existing) {
      return Response.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 5. Check if delivery can be started
    if (existing.status !== 'ASSIGNED') {
      return Response.json(
        {
          error: 'Pengiriman tidak dapat dimulai',
          details: `Status saat ini: ${existing.status}. Hanya pengiriman dengan status ASSIGNED yang dapat dimulai.`,
        },
        { status: 400 }
      )
    }

    if (existing.departureTime) {
      return Response.json(
        {
          error: 'Pengiriman sudah dimulai sebelumnya',
          details: `Waktu keberangkatan: ${existing.departureTime}`,
        },
        { status: 400 }
      )
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = startDeliverySchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Data tidak valid',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const {
      departureTime,
      departureLocation,
      vehicleInfo,
      driverName,
      helperNames,
      notes,
    } = validated.data

    // 7. Update delivery - start journey
    const updated = await db.distributionDelivery.update({
      where: { id },
      data: {
        status: 'DEPARTED',
        departureTime,
        departureLocation,
        currentLocation: departureLocation, // Set current location to departure
        vehicleInfo: vehicleInfo || undefined,
        driverName: driverName || undefined,
        helperNames: helperNames || undefined,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    })

    // 8. Create initial tracking point
    if (departureLocation) {
      const [lat, lng] = departureLocation.split(',').map(Number)
      await db.deliveryTracking.create({
        data: {
          deliveryId: id,
          latitude: lat,
          longitude: lng,
          accuracy: 10, // Default accuracy for departure point
          status: 'DEPARTED',
          notes: 'Titik keberangkatan',
        },
      })
    }

    return Response.json({
      success: true,
      data: updated,
      message: 'Pengiriman berhasil dimulai',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/start error:', error)
    return Response.json(
      {
        error: 'Gagal memulai pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
