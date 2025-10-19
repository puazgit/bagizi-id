/**
 * @fileoverview API route - Complete delivery
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/complete
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { completeDeliverySchema } from '@/features/sppg/distribution/delivery/schemas'

/**
 * POST /api/sppg/distribution/delivery/:id/complete
 * Complete delivery with recipient signature and quality check
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
        portionsPlanned: true,
        deliveryCompletedAt: true,
      },
    })

    if (!existing) {
      return Response.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 5. Check if delivery can be completed
    if (existing.status !== 'DEPARTED') {
      return Response.json(
        {
          error: 'Pengiriman tidak dapat diselesaikan',
          details: `Status saat ini: ${existing.status}. Hanya pengiriman dengan status DEPARTED yang dapat diselesaikan.`,
        },
        { status: 400 }
      )
    }

    if (!existing.arrivalTime) {
      return Response.json(
        {
          error: 'Pengiriman belum ditandai sampai',
          details: 'Tandai kedatangan terlebih dahulu sebelum menyelesaikan pengiriman.',
        },
        { status: 400 }
      )
    }

    if (existing.deliveryCompletedAt) {
      return Response.json(
        {
          error: 'Pengiriman sudah diselesaikan sebelumnya',
          details: `Waktu penyelesaian: ${existing.deliveryCompletedAt}`,
        },
        { status: 400 }
      )
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = completeDeliverySchema.safeParse(body)

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
      deliveryCompletedAt,
      portionsDelivered,
      recipientName,
      recipientTitle,
      recipientSignature,
      foodQualityChecked,
      foodQualityNotes,
      foodTemperature,
      deliveryNotes,
      deliveryPhoto,
    } = validated.data

    // 7. Determine final status based on portions
    // Note: PARTIAL status removed - if less portions delivered, mark as FAILED with notes
    let finalStatus: 'DELIVERED' | 'FAILED' = 'DELIVERED'
    if (portionsDelivered < existing.portionsPlanned) {
      finalStatus = 'FAILED' // Mark as failed if not all portions delivered
    }

    // 8. Update delivery - complete
    const updated = await db.distributionDelivery.update({
      where: { id },
      data: {
        status: finalStatus,
        deliveryCompletedAt,
        portionsDelivered,
        recipientName,
        recipientTitle: recipientTitle || undefined,
        recipientSignature: recipientSignature || undefined,
        foodQualityChecked,
        foodQualityNotes: foodQualityNotes || undefined,
        foodTemperature: foodTemperature 
          ? new Prisma.Decimal(foodTemperature) 
          : undefined,
        notes: deliveryNotes || undefined,
        actualTime: deliveryCompletedAt, // Set actual completion time
        updatedAt: new Date(),
      },
    })

    // 9. Create delivery photo if provided
    if (deliveryPhoto) {
      await db.deliveryPhoto.create({
        data: {
          deliveryId: id,
          photoUrl: deliveryPhoto,
          photoType: 'DELIVERY_PROOF',
          caption: 'Bukti pengiriman selesai',
          locationTaken: updated.arrivalLocation || undefined,
        },
      })
    }

    return Response.json({
      success: true,
      data: updated,
      message: finalStatus === 'DELIVERED' 
        ? 'Pengiriman berhasil diselesaikan'
        : `Pengiriman diselesaikan sebagian (${portionsDelivered}/${existing.portionsPlanned} porsi)`,
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/complete error:', error)
    return Response.json(
      {
        error: 'Gagal menyelesaikan pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
