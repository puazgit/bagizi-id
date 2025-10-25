/**
 * @fileoverview Admin Demo Request - Approve Action
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - POST: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * 
 * Workflow: SUBMITTED → APPROVED
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * Approve demo request
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * @workflow SUBMITTED/REVIEWED → APPROVED
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

      // 2. Validate status (can only approve SUBMITTED or REVIEWED)
      if (!['SUBMITTED', 'REVIEWED'].includes(existingRequest.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot approve demo request with status ${existingRequest.status}`,
          },
          { status: 400 }
        )
      }

      // 3. Parse request body (optional fields)
      const body = await request.json()

      // 4. Update demo request to APPROVED
      const approvedRequest = await db.demoRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          
          // Optional: Update scheduling info
          ...(body.scheduledDate && { 
            scheduledDate: new Date(body.scheduledDate),
            status: 'SCHEDULED', // Auto-schedule if date provided
          }),
          ...(body.assignedTo && {
            assignedTo: body.assignedTo,
            assignedAt: new Date(),
          }),
          ...(body.demoSppgId && { demoSppgId: body.demoSppgId }),
          ...(body.notes && { 
            notes: `${existingRequest.notes || ''}\n\n[APPROVED by ${session.user.email} at ${new Date().toISOString()}]\n${body.notes}`,
          }),
        },
      })

      // TODO: Send approval email notification
      // TODO: Create calendar event if scheduledDate provided
      // TODO: Assign demo SPPG if demoSppgId provided

      return NextResponse.json({
        success: true,
        data: approvedRequest,
        message: 'Demo request approved successfully',
      })
    } catch (error) {
      console.error('POST /api/admin/demo-requests/[id]/approve error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to approve demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
