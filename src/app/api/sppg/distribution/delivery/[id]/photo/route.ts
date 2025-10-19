/**
 * @fileoverview API route - Upload delivery photo
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/photo
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { uploadPhotoSchema } from '@/features/sppg/distribution/delivery/schemas'

/**
 * POST /api/sppg/distribution/delivery/:id/photo
 * Upload delivery photo with GPS tagging
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
        currentLocation: true,
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
    const validated = uploadPhotoSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
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

    // 6. Create photo record
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

    return Response.json({
      success: true,
      data: photo,
      message: 'Foto pengiriman berhasil diunggah',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/photo error:', error)
    return Response.json(
      {
        error: 'Gagal mengunggah foto pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
