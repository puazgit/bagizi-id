/**
 * @fileoverview Admin Demo Request - Assign Action
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - POST: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * 
 * Assign demo request to platform user
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * Assign demo request to platform user
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
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

      // 2. Parse request body - assignedTo is REQUIRED
      const body = await request.json()

      if (!body.assignedTo) {
        return NextResponse.json(
          {
            success: false,
            error: 'assignedTo (user ID) is required',
          },
          { status: 400 }
        )
      }

      // 3. Verify assigned user exists and has platform role
      const assignedUser = await db.user.findUnique({
        where: { id: body.assignedTo },
      })

      if (!assignedUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Assigned user not found',
          },
          { status: 404 }
        )
      }

      // Verify user has platform role (PLATFORM_SUPERADMIN or PLATFORM_SUPPORT)
      if (!assignedUser.userRole || !['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT'].includes(assignedUser.userRole)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Assigned user must have platform role (PLATFORM_SUPERADMIN or PLATFORM_SUPPORT)',
          },
          { status: 400 }
        )
      }

      // 4. Update demo request with assignment
      const assignedRequest = await db.demoRequest.update({
        where: { id },
        data: {
          assignedTo: body.assignedTo,
          assignedAt: new Date(),
          notes: `${existingRequest.notes || ''}\n\n[ASSIGNED to ${assignedUser.name} (${assignedUser.email}) by ${session.user.email} at ${new Date().toISOString()}]${body.notes ? `\n${body.notes}` : ''}`,
        },
      })

      // TODO: Send assignment email notification to assignedUser
      // TODO: Create task/reminder for assignedUser

      return NextResponse.json({
        success: true,
        data: assignedRequest,
        message: `Demo request assigned to ${assignedUser.name} successfully`,
      })
    } catch (error) {
      console.error('POST /api/admin/demo-requests/[id]/assign error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to assign demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
