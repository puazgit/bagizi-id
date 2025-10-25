/**
 * @fileoverview Admin Demo Request - Reject Action
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - POST: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * 
 * Workflow: SUBMITTED → REJECTED
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * Reject demo request
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * @workflow SUBMITTED/REVIEWED → REJECTED
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params

      // 1. Verify demo request exists
      const existingRequest = await db.demoRequest.findUnique({
        where: { id },
      })

      if (!existingRequest) {
        return NextResponse.json(
          {
            success: false,
            error: 'Demo request not found',
          },
          { status: 404 }
        )
      }

      // 2. Validate status (can only reject SUBMITTED or REVIEWED)
      if (!['SUBMITTED', 'REVIEWED'].includes(existingRequest.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reject demo request with status ${existingRequest.status}`,
          },
          { status: 400 }
        )
      }

      // 3. Parse request body - rejectionReason is REQUIRED
      const body = await request.json()

      if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rejection reason is required',
          },
          { status: 400 }
        )
      }

      // 4. Update demo request to REJECTED
      const rejectedRequest = await db.demoRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: body.rejectionReason,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          notes: `${existingRequest.notes || ''}\n\n[REJECTED by ${session.user.email} at ${new Date().toISOString()}]\nReason: ${body.rejectionReason}`,
        },
      })

      // TODO: Send rejection email notification
      // TODO: Log rejection in audit trail

      return NextResponse.json({
        success: true,
        data: rejectedRequest,
        message: 'Demo request rejected successfully',
      })
    } catch (error) {
      console.error('POST /api/admin/demo-requests/[id]/reject error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to reject demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
