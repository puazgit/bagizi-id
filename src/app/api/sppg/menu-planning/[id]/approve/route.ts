/**
 * @fileoverview Menu Planning Approve API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { approveActionSchema } from '@/features/sppg/menu-planning/schemas'

/**
 * POST /api/sppg/menu-planning/[id]/approve
 * Approve plan (PENDING_REVIEW → APPROVED)
 * 
 * @security Multi-tenant (sppgId check), RBAC (APPROVE permission - SPPG_KEPALA / SPPG_ADMIN)
 * @validation Plan must be PENDING_REVIEW
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check: APPROVE permission (Kepala SPPG or Admin only)
      if (!hasPermission(session.user.userRole as UserRole, 'APPROVE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions. Only SPPG Kepala or Admin can approve plans.'
        }, { status: 403 })
      }

      // Extract planId
      const { id: planId } = await params

      // Parse and validate request body
      const body = await request.json()
      const validated = approveActionSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.format()
        }, { status: 400 })
      }

      const { approvalNotes } = validated.data

      // Verify plan exists and belongs to user's SPPG
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId!
        },
        include: {
          program: {
            select: {
              name: true
            }
          },
          submittedByUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!plan) {
        return NextResponse.json({
          success: false,
          error: 'Plan not found'
        }, { status: 404 })
      }

      // Business Rule: Only PENDING_REVIEW plans can be approved
      if (plan.status !== 'PENDING_REVIEW') {
        return NextResponse.json({
          success: false,
          error: `Cannot approve plan with status ${plan.status}. Only PENDING_REVIEW plans can be approved.`
        }, { status: 400 })
      }

      // Update plan status to APPROVED
      const updatedPlan = await db.menuPlan.update({
        where: {
          id: planId
        },
        data: {
          status: 'APPROVED',
          approvedBy: session.user.id,
          approvedAt: new Date(),
          description: approvalNotes ? `${plan.description || ''}\n\nApproval Notes: ${approvalNotes}`.trim() : plan.description
        },
        include: {
          program: {
            select: {
              name: true,
              programCode: true,
              targetRecipients: true
            }
          },
          submittedByUser: {
            select: {
              name: true,
              email: true
            }
          },
          approver: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              assignments: true
            }
          }
        }
      })

      // Create audit log (automatic via withSppgAuth)

      return NextResponse.json({
        success: true,
        message: 'Plan approved successfully',
        data: updatedPlan
      }, { status: 200 })

    } catch (error) {
      console.error('Approve plan error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to approve plan',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      }, { status: 500 })
    }
  })
}
