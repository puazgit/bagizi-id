/**
 * @fileoverview Admin Demo Request Detail API
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * - PUT: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * - DELETE: PLATFORM_SUPERADMIN only
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ GET /api/admin/demo-requests/[id] ================================

/**
 * Get demo request detail
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params

      const demoRequest = await db.demoRequest.findUnique({
        where: { id },
        include: {
          demoSppg: {
            select: {
              id: true,
              name: true,
              code: true,
              isDemoAccount: true,
              demoExpiresAt: true,
              status: true,
            },
          },
          productionSppg: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
            },
          },
        },
      })

      if (!demoRequest) {
        return NextResponse.json(
          {
            success: false,
            error: 'Demo request not found',
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: demoRequest,
      })
    } catch (error) {
      console.error('GET /api/admin/demo-requests/[id] error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

// ================================ PUT /api/admin/demo-requests/[id] ================================

/**
 * Update demo request
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
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

      // 2. Parse request body
      const body = await request.json()

      // 3. Update demo request
      const updatedRequest = await db.demoRequest.update({
        where: { id },
        data: {
          // Update only provided fields
          ...(body.picName && { picName: body.picName }),
          ...(body.firstName && { firstName: body.firstName }),
          ...(body.lastName && { lastName: body.lastName }),
          ...(body.picEmail && { picEmail: body.picEmail }),
          ...(body.picPhone && { picPhone: body.picPhone }),
          ...(body.picPosition !== undefined && { picPosition: body.picPosition }),
          
          ...(body.organizationName && { organizationName: body.organizationName }),
          ...(body.organizationType && { organizationType: body.organizationType }),
          ...(body.numberOfSPPG !== undefined && { numberOfSPPG: body.numberOfSPPG }),
          ...(body.operationalArea !== undefined && { operationalArea: body.operationalArea }),
          ...(body.currentSystem !== undefined && { currentSystem: body.currentSystem }),
          ...(body.currentChallenges && { currentChallenges: body.currentChallenges }),
          ...(body.expectedGoals && { expectedGoals: body.expectedGoals }),

          ...(body.demoType && { demoType: body.demoType }),
          ...(body.requestedFeatures && { requestedFeatures: body.requestedFeatures }),
          ...(body.specialRequirements !== undefined && { specialRequirements: body.specialRequirements }),
          ...(body.requestMessage !== undefined && { requestMessage: body.requestMessage }),

          ...(body.preferredStartDate && { preferredStartDate: new Date(body.preferredStartDate) }),
          ...(body.preferredTime && { preferredTime: body.preferredTime }),
          ...(body.timezone && { timezone: body.timezone }),
          ...(body.estimatedDuration !== undefined && { estimatedDuration: body.estimatedDuration }),
          ...(body.demoDuration !== undefined && { demoDuration: body.demoDuration }),
          ...(body.demoMode && { demoMode: body.demoMode }),

          ...(body.status && { status: body.status }),
          ...(body.assignedTo !== undefined && {
            assignedTo: body.assignedTo,
            assignedAt: body.assignedTo ? new Date() : null,
          }),

          ...(body.scheduledDate && { scheduledDate: new Date(body.scheduledDate) }),
          ...(body.actualDate && { actualDate: new Date(body.actualDate) }),
          ...(body.attendanceStatus && { attendanceStatus: body.attendanceStatus }),
          
          ...(body.feedbackScore !== undefined && { feedbackScore: body.feedbackScore }),
          ...(body.feedback !== undefined && { feedback: body.feedback }),
          ...(body.nextSteps && { nextSteps: body.nextSteps }),

          ...(body.conversionProbability !== undefined && { conversionProbability: body.conversionProbability }),
          
          ...(body.followUpRequired !== undefined && { followUpRequired: body.followUpRequired }),
          ...(body.followUpDate && { followUpDate: new Date(body.followUpDate) }),
          ...(body.lastContactAt && { lastContactAt: new Date(body.lastContactAt) }),
          ...(body.emailsSent !== undefined && { emailsSent: body.emailsSent }),
          ...(body.callsMade !== undefined && { callsMade: body.callsMade }),
          ...(body.notes !== undefined && { notes: body.notes }),
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedRequest,
        message: 'Demo request updated successfully',
      })
    } catch (error) {
      console.error('PUT /api/admin/demo-requests/[id] error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

// ================================ DELETE /api/admin/demo-requests/[id] ================================

/**
 * Delete demo request (soft delete - mark as cancelled)
 * @rbac PLATFORM_SUPERADMIN only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      // 1. Check if user is SUPERADMIN
      if (session.user.userRole !== 'PLATFORM_SUPERADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Only PLATFORM_SUPERADMIN can delete demo requests',
          },
          { status: 403 }
        )
      }

      const { id } = await params

      // 2. Verify demo request exists
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

      // 3. Soft delete - mark as REJECTED/CANCELLED
      const deletedRequest = await db.demoRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: 'Deleted by admin',
          notes: `${existingRequest.notes || ''}\n\n[DELETED by ${session.user.email} at ${new Date().toISOString()}]`,
        },
      })

      return NextResponse.json({
        success: true,
        data: deletedRequest,
        message: 'Demo request deleted successfully',
      })
    } catch (error) {
      console.error('DELETE /api/admin/demo-requests/[id] error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
