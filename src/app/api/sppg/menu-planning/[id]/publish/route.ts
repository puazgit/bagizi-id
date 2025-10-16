/**
 * @fileoverview Menu Planning Publish API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { publishActionSchema } from '@/features/sppg/menu-planning/schemas'

/**
 * POST /api/sppg/menu-planning/[id]/publish
 * Publish plan (APPROVED → ACTIVE)
 * 
 * @security Multi-tenant (sppgId check), RBAC (SPPG_KEPALA / SPPG_ADMIN only)
 * @validation Plan must be APPROVED, no overlapping active plans
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

    // 3. Role-based access check (only SPPG_KEPALA and SPPG_ADMIN can publish)
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN']
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({
        success: false,
        error: 'Insufficient permissions. Only SPPG Kepala or Admin can publish plans.'
      }, { status: 403 })
    }

    // 4. Extract planId
    const { id: planId } = await params

    // 5. Parse and validate request body (optional notes)
    const body = await request.json().catch(() => ({}))
    const validated = publishActionSchema.safeParse(body)

    if (!validated.success) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        details: validated.error.format()
      }, { status: 400 })
    }

    const { publishNotes } = validated.data

    // 6. Verify plan exists and belongs to user's SPPG
    const plan = await db.menuPlan.findFirst({
      where: {
        id: planId,
        sppgId: session.user.sppgId
      },
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    if (!plan) {
      return Response.json({
        success: false,
        error: 'Menu plan not found or access denied'
      }, { status: 404 })
    }

    // 7. Business Rule: Only APPROVED plans can be published
    if (plan.status !== 'APPROVED') {
      return Response.json({
        success: false,
        error: `Cannot publish plan with status ${plan.status}. Only APPROVED plans can be published.`
      }, { status: 400 })
    }

    // 8. Validation: Must have assignments
    if (plan._count.assignments === 0) {
      return Response.json({
        success: false,
        error: 'Cannot publish plan without menu assignments'
      }, { status: 400 })
    }

    // 9. Check for overlapping active plans
    const overlappingPlans = await db.menuPlan.findMany({
      where: {
        sppgId: session.user.sppgId,
        programId: plan.programId,
        status: 'ACTIVE',
        id: { not: planId },
        OR: [
          {
            startDate: {
              lte: plan.endDate
            },
            endDate: {
              gte: plan.startDate
            }
          }
        ]
      }
    })

    if (overlappingPlans.length > 0) {
      return Response.json({
        success: false,
        error: 'Cannot publish: There are overlapping active plans for this program',
        details: overlappingPlans.map(p => ({
          id: p.id,
          name: p.name,
          startDate: p.startDate,
          endDate: p.endDate
        }))
      }, { status: 400 })
    }

    // 10. Publish the plan (APPROVED → ACTIVE)
    const publishedPlan = await db.menuPlan.update({
      where: { id: planId },
      data: {
        status: 'ACTIVE',
        isActive: true,
        publishedBy: session.user.id,
        publishedAt: new Date(),
        description: publishNotes ? `${plan.description || ''}\n\nPublish Notes: ${publishNotes}`.trim() : plan.description
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
        publishedByUser: {
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

    // 11. Create audit log
    await db.auditLog.create({
      data: {
        action: 'PUBLISH_PLAN',
        entityType: 'MenuPlan',
        entityId: planId,
        userId: session.user.id,
        sppgId: session.user.sppgId,
        metadata: {
          planName: plan.name,
          publishNotes,
          publishedByName: session.user.name,
          publishedByRole: session.user.userRole,
          startDate: plan.startDate,
          endDate: plan.endDate
        }
      }
    })

    // TODO: Send notifications to relevant teams
    // await sendNotifications({
    //   type: 'PLAN_PUBLISHED',
    //   planId,
    //   recipients: ['kitchen', 'procurement', 'distribution']
    // })

    return Response.json({
      success: true,
      message: 'Plan published successfully and is now active',
      data: publishedPlan
    }, { status: 200 })

  } catch (error) {
    console.error('Publish plan error:', error)
    return Response.json({
      success: false,
      error: 'Failed to publish plan'
    }, { status: 500 })
  }
}
