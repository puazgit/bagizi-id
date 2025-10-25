/**
 * @fileoverview Menu Planning Submit for Review API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { submitForReviewSchema } from '@/features/sppg/menu-planning/schemas'

/**
 * POST /api/sppg/menu-planning/[id]/submit
 * Submit plan for review (DRAFT → PENDING_REVIEW)
 * 
 * @security Multi-tenant (sppgId check), RBAC (menu-planning permission)
 * @validation Plan must be DRAFT, must have at least one assignment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // 3. Extract planId
      const { id: planId } = await params

      // 4. Parse and validate request body
      const body = await request.json()
      const validated = submitForReviewSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.format()
        }, { status: 400 })
      }

      const { submitNotes } = validated.data

      // 5. Verify plan exists and belongs to user's SPPG
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId!
        },
        include: {
          assignments: {
            select: {
              id: true
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

      // 6. Business Rule: Only DRAFT plans can be submitted
      if (plan.status !== 'DRAFT') {
      return NextResponse.json({
        success: false,
        error: `Cannot submit plan with status ${plan.status}. Only DRAFT plans can be submitted.`
      }, { status: 400 })
    }

    // 7. Business Rule: Plan must have at least one assignment
    if (!plan.assignments || plan.assignments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot submit empty plan. Please add at least one menu assignment.'
      }, { status: 400 })
    }

    // 8. Update plan status to PENDING_REVIEW
    const updatedPlan = await db.menuPlan.update({
      where: {
        id: planId
      },
      data: {
        status: 'PENDING_REVIEW',
        submittedBy: session.user.id,
        submittedAt: new Date(),
        description: submitNotes ? `${plan.description || ''}\n\nSubmit Notes: ${submitNotes}`.trim() : plan.description
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
        action: 'SUBMIT_FOR_REVIEW',
        entityType: 'MenuPlan',
        entityId: planId,
        userId: session.user.id,
        sppgId: session.user.sppgId,
        metadata: {
          planName: plan.name,
          assignmentCount: plan.assignments.length,
          submitNotes
        }
      }
    })

      return NextResponse.json({
        success: true,
        message: 'Plan submitted for review successfully',
        data: updatedPlan
      }, { status: 200 })

    } catch (error) {
      console.error('Submit for review error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to submit plan for review'
      }, { status: 500 })
    }
  })
}