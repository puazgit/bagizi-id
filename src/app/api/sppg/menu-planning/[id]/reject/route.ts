/**
 * @fileoverview Menu Planning Reject API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { rejectActionSchema } from '@/features/sppg/menu-planning/schemas'

/**
 * POST /api/sppg/menu-planning/[id]/reject
 * Reject plan (PENDING_REVIEW → DRAFT for revision)
 * 
 * @security Multi-tenant (sppgId check), RBAC (SPPG_KEPALA / SPPG_ADMIN only)
 * @validation Plan must be PENDING_REVIEW, rejection reason required
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

    // 2. Multi-tenant security check
    if (!session.user.sppgId) {
      return Response.json({ 
        error: 'SPPG access required' 
      }, { status: 403 })
    }

    // 3. Role-based access check (only SPPG_KEPALA and SPPG_ADMIN can reject)
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN']
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({
        success: false,
        error: 'Insufficient permissions. Only SPPG Kepala or Admin can reject plans.'
      }, { status: 403 })
    }

    // 4. Extract planId
    const { id: planId } = await params

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = rejectActionSchema.safeParse(body)

    if (!validated.success) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        details: validated.error.format()
      }, { status: 400 })
    }

    const { rejectionReason } = validated.data

    // 6. Verify plan exists and belongs to user's SPPG
    const plan = await db.menuPlan.findFirst({
      where: {
        id: planId,
        sppgId: session.user.sppgId
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
      return Response.json({
        success: false,
        error: 'Plan not found'
      }, { status: 404 })
    }

    // 7. Business Rule: Only PENDING_REVIEW plans can be rejected
    if (plan.status !== 'PENDING_REVIEW') {
      return Response.json({
        success: false,
        error: `Cannot reject plan with status ${plan.status}. Only PENDING_REVIEW plans can be rejected.`
      }, { status: 400 })
    }

    // 8. Update plan status back to DRAFT for revision
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

    // 9. Create audit log
    await db.auditLog.create({
      data: {
        action: 'REJECT_PLAN',
        entityType: 'MenuPlan',
        entityId: planId,
        userId: session.user.id,
        sppgId: session.user.sppgId,
        metadata: {
          planName: plan.name,
          rejectionReason,
          rejectedByName: session.user.name,
          rejectedByRole: session.user.userRole,
          submittedByName: plan.submittedByUser?.name
        }
      }
    })

    // TODO: Send notification to plan creator about rejection
    // await sendNotification({
    //   userId: plan.submittedBy,
    //   type: 'PLAN_REJECTED',
    //   message: `Your plan "${plan.name}" has been rejected. Reason: ${rejectionReason}`
    // })

    return Response.json({
      success: true,
      message: 'Plan rejected and returned to DRAFT for revision',
      data: updatedPlan
    }, { status: 200 })

  } catch (error) {
    console.error('Reject plan error:', error)
    return Response.json({
      success: false,
      error: 'Failed to reject plan'
    }, { status: 500 })
  }
}
