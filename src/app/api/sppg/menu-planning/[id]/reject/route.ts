/**
 * @fileoverview Menu Planning Reject API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { rejectActionSchema } from '@/features/sppg/menu-planning/schemas'

/**
 * POST /api/sppg/menu-planning/[id]/reject
 * Reject plan (PENDING_REVIEW → DRAFT for revision)
 * 
 * @security Multi-tenant (sppgId check), RBAC (APPROVE permission - SPPG_KEPALA / SPPG_ADMIN)
 * @validation Plan must be PENDING_REVIEW, rejection reason required
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
          error: 'Insufficient permissions. Only SPPG Kepala or Admin can reject plans.'
        }, { status: 403 })
      }

      // Extract planId
      const { id: planId } = await params

      // Parse and validate request body
      const body = await request.json()
      const validated = rejectActionSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.format()
        }, { status: 400 })
      }

      const { rejectionReason } = validated.data

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

      // Business Rule: Only PENDING_REVIEW plans can be rejected
      if (plan.status !== 'PENDING_REVIEW') {
        return NextResponse.json({
          success: false,
          error: `Cannot reject plan with status ${plan.status}. Only PENDING_REVIEW plans can be rejected.`
        }, { status: 400 })
      }

      // Update plan status back to DRAFT for revision
      const updatedPlan = await db.menuPlan.update({
        where: {
          id: planId
        },
        data: {
          status: 'DRAFT',
          rejectedBy: session.user.id,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason,
          description: `${plan.description || ''}\n\nRejection Reason: ${rejectionReason}\nRejected by: ${session.user.name} on ${new Date().toLocaleString('id-ID')}`.trim(),
          // Store rejection details in planningRules
          planningRules: {
            ...(plan.planningRules as Record<string, unknown> || {}),
            lastRejection: {
              reason: rejectionReason,
              rejectedBy: session.user.id,
              rejectedByName: session.user.name,
              rejectedAt: new Date().toISOString()
            }
          }
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
          _count: {
            select: {
              assignments: true
            }
          }
        }
      })

      // Audit log created automatically via withSppgAuth

      return NextResponse.json({
        success: true,
        message: 'Plan rejected and returned to DRAFT for revision',
        data: updatedPlan
      }, { status: 200 })

    } catch (error) {
      console.error('Reject plan error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to reject plan'
      }, { status: 500 })
    }
  })
}
