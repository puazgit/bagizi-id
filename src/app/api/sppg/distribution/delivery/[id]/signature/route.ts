/**
 * @fileoverview Delivery Signature API Route
 * @version Next.js 15.5.4 App Router
 * @see {@link /docs/copilot-instructions.md} API Route Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * POST /api/sppg/distribution/delivery/[id]/signature
 * 
 * Add or update signature for delivery confirmation
 * 
 * @param request - Request with signature data
 * @param params - Route parameters
 * @returns Response with updated delivery
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse Parameters
    const { id: deliveryId } = await params

    // 3. Parse Request Body
    const body = await request.json()
    const {
      signatureDataUrl,
      recipientName,
      recipientTitle,
    } = body

    // 4. Validation
    if (!signatureDataUrl || !recipientName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signature data and recipient name are required',
        },
        { status: 400 }
      )
    }

    // 5. Verify Delivery Exists and Access
    const delivery = await db.distributionDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        schedule: {
          select: {
            sppgId: true,
          },
        },
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // 6. SPPG Access Check (Multi-tenant Security)
    if (
      session.user.sppgId &&
      delivery.schedule.sppgId !== session.user.sppgId
    ) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // 7. Update Delivery with Signature
    // In production, you would upload signatureDataUrl to cloud storage (S3, Cloudinary, etc.)
    // and store the URL. For now, we'll store the base64 data URL directly (not recommended for production)
    const updatedDelivery = await db.distributionDelivery.update({
      where: { id: deliveryId },
      data: {
        recipientSignature: signatureDataUrl, // Store base64 or upload to cloud storage
        recipientName,
        recipientTitle: recipientTitle || null,
        deliveredAt: delivery.deliveredAt || new Date(), // Set deliveredAt if not already set
        status:
          delivery.status === 'DEPARTED' || delivery.status === 'ASSIGNED'
            ? 'DELIVERED'
            : delivery.status,
      },
      include: {
        schedule: {
          select: {
            id: true,
            distributionDate: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: updatedDelivery,
        message: 'Signature captured successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/signature error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save signature',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sppg/distribution/delivery/[id]/signature
 * 
 * Remove signature from delivery
 * 
 * @param request - Request object
 * @param params - Route parameters
 * @returns Response with updated delivery
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse Parameters
    const { id: deliveryId } = await params

    // 3. Verify Delivery Exists and Access
    const delivery = await db.distributionDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        schedule: {
          select: {
            sppgId: true,
          },
        },
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // 4. SPPG Access Check
    if (
      session.user.sppgId &&
      delivery.schedule.sppgId !== session.user.sppgId
    ) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // 5. Remove Signature
    const updatedDelivery = await db.distributionDelivery.update({
      where: { id: deliveryId },
      data: {
        recipientSignature: null,
        recipientName: null,
        recipientTitle: null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: updatedDelivery,
        message: 'Signature removed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/sppg/distribution/delivery/[id]/signature error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove signature',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
