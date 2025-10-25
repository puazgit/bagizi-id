/**
 * @fileoverview Admin Demo Request - Convert to SPPG Action
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - POST: PLATFORM_SUPERADMIN only
 * 
 * Convert demo request to paying SPPG tenant
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * Convert demo request to SPPG
 * @rbac PLATFORM_SUPERADMIN only
 * @workflow Mark demo as converted, link to new SPPG tenant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      // 1. Check if user is SUPERADMIN (conversion requires highest privilege)
      if (session.user.userRole !== 'PLATFORM_SUPERADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Only PLATFORM_SUPERADMIN can convert demo requests to SPPG',
          },
          { status: 403 }
        )
      }

      const { id } = await params

      // 2. Verify demo request exists
      const existingRequest = await db.demoRequest.findUnique({
        where: { id },
        include: {
          demoSppg: true,
          productionSppg: true,
        },
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

      // 3. Validate status (should be COMPLETED and ATTENDED)
      if (existingRequest.status !== 'SUBMITTED') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot convert demo request with status ${existingRequest.status}. Demo must be SUBMITTED first.`,
          },
          { status: 400 }
        )
      }

      if (existingRequest.attendanceStatus && existingRequest.attendanceStatus !== 'ATTENDED') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot convert demo request with attendance status ${existingRequest.attendanceStatus}. Demo must be ATTENDED.`,
          },
          { status: 400 }
        )
      }

      // 4. Check if already converted
      if (existingRequest.isConverted) {
        return NextResponse.json(
          {
            success: false,
            error: 'Demo request already converted to SPPG',
            data: {
              convertedSppgId: existingRequest.convertedSppgId,
              convertedAt: existingRequest.convertedAt,
            },
          },
          { status: 400 }
        )
      }

      // 5. Parse request body - convertedSppgId is REQUIRED
      const body = await request.json()

      if (!body.convertedSppgId) {
        return NextResponse.json(
          {
            success: false,
            error: 'convertedSppgId is required',
          },
          { status: 400 }
        )
      }

      // 6. Verify SPPG exists and is not demo account
      const sppg = await db.sPPG.findUnique({
        where: { id: body.convertedSppgId },
      })

      if (!sppg) {
        return NextResponse.json(
          {
            success: false,
            error: 'SPPG not found',
          },
          { status: 404 }
        )
      }

      if (sppg.isDemoAccount) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot convert to demo SPPG. Must be a paying tenant.',
          },
          { status: 400 }
        )
      }

      // 7. Update demo request with conversion
      const convertedRequest = await db.demoRequest.update({
        where: { id },
        data: {
          isConverted: true,
          convertedAt: new Date(),
          convertedSppgId: body.convertedSppgId,
          conversionProbability: 100, // Auto-set to 100% when converted
          notes: `${existingRequest.notes || ''}\n\n[CONVERTED to SPPG "${sppg.name}" (${sppg.code}) by ${session.user.email} at ${new Date().toISOString()}]${body.notes ? `\n${body.notes}` : ''}`,
        },
        include: {
          productionSppg: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
              createdAt: true,
            },
          },
        },
      })

      // TODO: Send conversion success email
      // TODO: Trigger onboarding workflow for new SPPG
      // TODO: Update marketing conversion metrics
      // TODO: Create billing record for new subscription

      return NextResponse.json({
        success: true,
        data: convertedRequest,
        message: `Demo request successfully converted to SPPG "${sppg.name}"`,
      })
    } catch (error) {
      console.error('POST /api/admin/demo-requests/[id]/convert error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to convert demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
