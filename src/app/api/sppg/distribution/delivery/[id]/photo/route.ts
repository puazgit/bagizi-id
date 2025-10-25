/**
 * @fileoverview API route - Upload delivery photo
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/photo
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { uploadPhotoSchema } from '@/features/sppg/distribution/delivery/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/distribution/delivery/:id/photo
 * Upload delivery photo with GPS tagging
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
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
      select: { 
        id: true,
        status: true,
        currentLocation: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = uploadPhotoSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Data foto tidak valid',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const {
      photoUrl,
      photoType,
      caption,
      locationTaken,
      fileSize,
      mimeType,
    } = validated.data

    // 5. Create photo record
    const photo = await db.deliveryPhoto.create({
      data: {
        deliveryId: id,
        photoUrl,
        photoType,
        caption: caption || undefined,
        locationTaken: locationTaken || existing.currentLocation || undefined,
        fileSize: fileSize || undefined,
        mimeType: mimeType || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      data: photo,
      message: 'Foto pengiriman berhasil diunggah',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/photo error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengunggah foto pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}
