/**
 * @fileoverview API route - GPS tracking history and live tracking
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint GET /api/sppg/distribution/delivery/:id/tracking
 * @endpoint POST /api/sppg/distribution/delivery/:id/tracking
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { trackLocationSchema } from '@/features/sppg/distribution/delivery/schemas'

/**
 * GET /api/sppg/distribution/delivery/:id/tracking
 * Get GPS tracking history for delivery
 */
export async function GET(
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
      select: { id: true },
    })

    if (!existing) {
      return Response.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 5. Get tracking history
    const trackingPoints = await db.deliveryTracking.findMany({
      where: { deliveryId: id },
      orderBy: { recordedAt: 'asc' },
    })

    // 6. Calculate statistics
    const totalPoints = trackingPoints.length
    const latestPoint = trackingPoints[trackingPoints.length - 1] || null
    
    // Calculate total distance (simplified - using Haversine)
    let totalDistance = 0
    for (let i = 1; i < trackingPoints.length; i++) {
      const prev = trackingPoints[i - 1]
      const curr = trackingPoints[i]
      
      // Convert Decimal to number for calculations
      const prevLat = prev.latitude.toNumber()
      const prevLng = prev.longitude.toNumber()
      const currLat = curr.latitude.toNumber()
      const currLng = curr.longitude.toNumber()
      
      // Haversine formula
      const R = 6371 // Earth radius in km
      const dLat = ((currLat - prevLat) * Math.PI) / 180
      const dLng = ((currLng - prevLng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prevLat * Math.PI) / 180) *
          Math.cos((currLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      totalDistance += R * c
    }

    return Response.json({
      success: true,
      data: trackingPoints,
      statistics: {
        totalPoints,
        totalDistance: Number(totalDistance.toFixed(2)), // km
        latestPoint: latestPoint
          ? {
              latitude: latestPoint.latitude.toNumber(),
              longitude: latestPoint.longitude.toNumber(),
              recordedAt: latestPoint.recordedAt,
              status: latestPoint.status,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/delivery/[id]/tracking error:', error)
    return Response.json(
      {
        error: 'Gagal mengambil riwayat tracking',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sppg/distribution/delivery/:id/tracking
 * Track current GPS location (live tracking)
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
        routeTrackingPoints: true,
      },
    })

    if (!existing) {
      return Response.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 5. Check if delivery is in transit
    if (existing.status !== 'DEPARTED' && existing.status !== 'DELIVERED') {
      return Response.json(
        {
          error: 'Tracking hanya tersedia untuk pengiriman yang sedang berlangsung',
          details: `Status saat ini: ${existing.status}`,
        },
        { status: 400 }
      )
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = trackLocationSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Data lokasi tidak valid',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const { latitude, longitude, accuracy, status, notes } = validated.data

    // 7. Create tracking point
    const trackingPoint = await db.deliveryTracking.create({
      data: {
        deliveryId: id,
        latitude,
        longitude,
        accuracy: accuracy || undefined,
        status: status || existing.status,
        notes: notes || undefined,
      },
    })

    // 8. Update delivery current location and route trail
    const currentLocation = `${latitude},${longitude}`
    const updatedRoute = [...(existing.routeTrackingPoints || []), currentLocation]

    await db.distributionDelivery.update({
      where: { id },
      data: {
        currentLocation,
        routeTrackingPoints: updatedRoute,
        updatedAt: new Date(),
      },
    })

    return Response.json({
      success: true,
      data: trackingPoint,
      message: 'Lokasi berhasil dilacak',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/tracking error:', error)
    return Response.json(
      {
        error: 'Gagal melacak lokasi',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
