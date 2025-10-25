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

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import type { PhotoType ,  UserRole } from '@prisma/client'

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
  return withSppgAuth(request, async (session) => {
    try {
      // 1. Get execution ID from params (await in Next.js 15)
      const params = await props.params
      const executionId = params.id

      // 2. Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // 3. Verify execution belongs to user's SPPG
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
      return NextResponse.json(
        { error: 'Execution not found or access denied' },
        { status: 404 }
      )
    }

    // 4. Parse query parameters
    const { searchParams } = new URL(request.url)
    const photoType = searchParams.get('photoType') as PhotoType | null

    // 5. Fetch photos from all deliveries in this execution
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
                production: {
                  select: {
                    menu: {
                      select: {
                        menuName: true,
                      }
                    }
                  }
                }
              },
            },
          },
        },
      },
      orderBy: {
        takenAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        photos,
        total: photos.length,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution/[id]/photos error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch photos',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}
