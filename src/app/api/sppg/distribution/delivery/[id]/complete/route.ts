/**
 * @fileoverview API route - Complete delivery
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/complete
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { Prisma ,  UserRole } from '@prisma/client'
import { completeDeliverySchema } from '@/features/sppg/distribution/delivery/schemas'

/**
 * POST /api/sppg/distribution/delivery/:id/complete
 * Complete delivery with recipient signature and quality check
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
        portionsPlanned: true,
        deliveryCompletedAt: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 4. Check if delivery can be completed
    if (existing.status !== 'DEPARTED') {
      return NextResponse.json(
        {
          error: 'Pengiriman tidak dapat diselesaikan',
          details: `Status saat ini: ${existing.status}. Hanya pengiriman dengan status DEPARTED yang dapat diselesaikan.`,
        },
        { status: 400 }
      )
    }

    if (!existing.arrivalTime) {
      return NextResponse.json(
        {
          error: 'Pengiriman belum ditandai sampai',
          details: 'Tandai kedatangan terlebih dahulu sebelum menyelesaikan pengiriman.',
        },
        { status: 400 }
      )
    }

    if (existing.deliveryCompletedAt) {
      return NextResponse.json(
        {
          error: 'Pengiriman sudah diselesaikan sebelumnya',
          details: `Waktu penyelesaian: ${existing.deliveryCompletedAt}`,
        },
        { status: 400 }
      )
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = completeDeliverySchema.safeParse(body)

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

    // 6. Determine final status based on portions
    // Note: PARTIAL status removed - if less portions delivered, mark as FAILED with notes
    let finalStatus: 'DELIVERED' | 'FAILED' = 'DELIVERED'
    if (portionsDelivered < existing.portionsPlanned) {
      finalStatus = 'FAILED' // Mark as failed if not all portions delivered
    }

    // 7. Update delivery - complete
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

    // 8. Create delivery photo if provided
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

    return NextResponse.json({
      success: true,
      data: updated,
      message: finalStatus === 'DELIVERED' 
        ? 'Pengiriman berhasil diselesaikan'
        : `Pengiriman diselesaikan sebagian (${portionsDelivered}/${existing.portionsPlanned} porsi)`,
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/complete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menyelesaikan pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}
