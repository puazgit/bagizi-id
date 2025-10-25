/**
 * @fileoverview API route - Get/Update single delivery
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint GET /api/sppg/distribution/delivery/:id
 * @endpoint PUT /api/sppg/distribution/delivery/:id
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { deliveryDetailInclude } from '@/features/sppg/distribution/delivery/types'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/distribution/delivery/:id
 * Get single delivery detail with all relations
 */
export async function GET(
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

      // 3. Fetch delivery with multi-tenant security
      const delivery = await db.distributionDelivery.findFirst({
      where: {
        id,
        schedule: {
          sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant security
        },
      },
      include: deliveryDetailInclude,
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 4. Calculate metrics (simplified - can be enhanced)
    const metrics = {
      isOnTime: delivery.plannedTime && delivery.actualTime
        ? new Date(delivery.actualTime) <= new Date(delivery.plannedTime)
        : false,
      isDelayed: delivery.plannedTime && delivery.actualTime
        ? new Date(delivery.actualTime) > new Date(delivery.plannedTime)
        : false,
      delayMinutes: 0, // TODO: Calculate
      estimatedArrivalTime: null,
      totalDuration: null,
      inTransitDuration: null,
      totalDistance: null,
      averageSpeed: null,
      routeDeviation: null,
      portionsFulfillment: delivery.portionsPlanned > 0
        ? (delivery.portionsDelivered / delivery.portionsPlanned) * 100
        : 0,
      hasIssues: delivery.issues.length > 0,
      unresolvedIssuesCount: delivery.issues.filter((i: { resolvedAt: Date | null }) => !i.resolvedAt).length,
      photoCount: delivery.photos.length,
      trackingPointsCount: delivery.trackingPoints.length,
      qualityCheckPassed: delivery.foodQualityChecked,
      temperatureInRange: delivery.foodTemperature
        ? delivery.foodTemperature.gte(60) && delivery.foodTemperature.lte(80)
        : false,
      isPending: delivery.status === 'ASSIGNED',
      isInTransit: delivery.status === 'DEPARTED',
      isArrived: delivery.status === 'DELIVERED',
      isDelivered: delivery.status === 'DELIVERED',
      isFailed: delivery.status === 'FAILED',
      isCancelled: delivery.status === 'CANCELLED',
    }

    // 5. Parse locations
    const parseLocation = (gps: string | null) => {
      if (!gps) return null
      const [lat, lng] = gps.split(',').map(Number)
      return { latitude: lat, longitude: lng }
    }

    const parsedLocations = {
      departure: parseLocation(delivery.departureLocation),
      arrival: parseLocation(delivery.arrivalLocation),
      current: parseLocation(delivery.currentLocation),
    }

    // 6. Parse route points
    const routePoints = (delivery.routeTrackingPoints || []).map((point: string) => {
      const [lat, lng] = point.split(',').map(Number)
      return {
        latitude: lat,
        longitude: lng,
        status: 'UNKNOWN', // Status not stored in string array
        timestamp: null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...delivery,
        metrics,
        parsedLocations,
        routePoints,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/delivery/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil detail pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}

/**
 * PUT /api/sppg/distribution/delivery/:id
 * Update delivery (generic update)
 */
export async function PUT(
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

      // 3. Verify ownership
      const existing = await db.distributionDelivery.findFirst({
      where: {
        id,
        schedule: {
          sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant security
        },
      },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 4. Parse request body
    const body = await request.json()

    // 5. Update delivery
    const updated = await db.distributionDelivery.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: deliveryDetailInclude,
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('PUT /api/sppg/distribution/delivery/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memperbarui pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}
