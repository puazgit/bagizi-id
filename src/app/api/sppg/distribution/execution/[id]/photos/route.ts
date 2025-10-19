/**
 * @fileoverview API Route - Execution Photos
 * 
 * GET /api/sppg/distribution/execution/[id]/photos
 * 
 * Fetch all photos from deliveries in a specific execution
 * Photos come from DeliveryPhoto model linked to DistributionDelivery
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import type { PhotoType } from '@prisma/client'

/**
 * GET /api/sppg/distribution/execution/[id]/photos
 * 
 * Fetch all photos from deliveries in execution
 * Supports filtering by photoType
 * 
 * @param request - Next.js request object
 * @param props - Route parameters with execution ID (Promise in Next.js 15)
 * @returns Photos sorted by takenAt DESC
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (multi-tenancy)
    const sppg = await checkSppgAccess(session.user.sppgId || null)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // 3. Get execution ID from params (await in Next.js 15)
    const params = await props.params
    const executionId = params.id

    // 4. Verify execution belongs to user's SPPG
    const execution = await db.foodDistribution.findFirst({
      where: {
        id: executionId,
        sppgId: session.user.sppgId || undefined,
      },
      select: {
        id: true,
      },
    })

    if (!execution) {
      return Response.json(
        { error: 'Execution not found or access denied' },
        { status: 404 }
      )
    }

    // 5. Parse query parameters
    const { searchParams } = new URL(request.url)
    const photoType = searchParams.get('photoType') as PhotoType | null

    // 6. Fetch photos from all deliveries in this execution
    const photos = await db.deliveryPhoto.findMany({
      where: {
        delivery: {
          distributionId: executionId,
        },
        ...(photoType && { photoType }),
      },
      select: {
        id: true,
        photoUrl: true,
        photoType: true,
        caption: true,
        locationTaken: true,
        fileSize: true,
        mimeType: true,
        takenAt: true,
        deliveryId: true,
        delivery: {
          select: {
            id: true,
            targetName: true, // Use targetName as delivery identifier
            schedule: {
              select: {
                menuName: true,
              },
            },
          },
        },
      },
      orderBy: {
        takenAt: 'desc',
      },
    })

    return Response.json({
      success: true,
      data: {
        photos,
        total: photos.length,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution/[id]/photos error:', error)
    return Response.json(
      {
        error: 'Failed to fetch photos',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
