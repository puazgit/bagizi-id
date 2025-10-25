/**
 * @fileoverview API route - Mark delivery arrival
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/arrive
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { arriveDeliverySchema } from '@/features/sppg/distribution/delivery/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/distribution/delivery/:id/arrive
 * Mark arrival at destination with GPS location
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
        arrivalTime: true,
        departureTime: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 4. Check if delivery can be marked as arrived
    if (existing.status !== 'DEPARTED') {
      return NextResponse.json(
        {
          error: 'Pengiriman tidak dapat ditandai sampai',
          details: `Status saat ini: ${existing.status}. Hanya pengiriman dengan status DEPARTED yang dapat ditandai sampai.`,
        },
        { status: 400 }
      )
    }

    if (!existing.departureTime) {
      return NextResponse.json(
        {
          error: 'Pengiriman belum dimulai',
          details: 'Mulai pengiriman terlebih dahulu sebelum menandai kedatangan.',
        },
        { status: 400 }
      )
    }

    if (existing.arrivalTime) {
      return NextResponse.json(
        {
          error: 'Pengiriman sudah ditandai sampai sebelumnya',
          details: `Waktu kedatangan: ${existing.arrivalTime}`,
        },
        { status: 400 }
      )
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = arriveDeliverySchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Data tidak valid',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const { arrivalTime, arrivalLocation, notes } = validated.data

    // 6. Update delivery - mark arrival (but keep status as DEPARTED until completion)
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

    // 7. Create tracking point for arrival
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

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Pengiriman berhasil ditandai sampai di tujuan',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/arrive error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menandai kedatangan pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}
