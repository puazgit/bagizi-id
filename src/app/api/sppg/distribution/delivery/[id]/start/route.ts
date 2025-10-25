/**
 * @fileoverview API route - Start delivery (departure)
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/start
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { startDeliverySchema } from '@/features/sppg/distribution/delivery/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/distribution/delivery/:id/start
 * Start delivery - mark departure with GPS location
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // 1. Get delivery ID from params
      const { id } = await params

      // 2. Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // 3. Verify ownership and status
      const existing = await db.distributionDelivery.findFirst({
      where: {
        id,
        schedule: {
          sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant security
        },
      },
      select: { 
        id: true, 
        status: true,
        departureTime: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 4. Check if delivery can be started
    if (existing.status !== 'ASSIGNED') {
      return NextResponse.json(
        {
          error: 'Pengiriman tidak dapat dimulai',
          details: `Status saat ini: ${existing.status}. Hanya pengiriman dengan status ASSIGNED yang dapat dimulai.`,
        },
        { status: 400 }
      )
    }

    if (existing.departureTime) {
      return NextResponse.json(
        {
          error: 'Pengiriman sudah dimulai sebelumnya',
          details: `Waktu keberangkatan: ${existing.departureTime}`,
        },
        { status: 400 }
      )
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = startDeliverySchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
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

    // 6. Update delivery - start journey
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

    // 7. Create initial tracking point
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

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Pengiriman berhasil dimulai',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/start error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memulai pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}
