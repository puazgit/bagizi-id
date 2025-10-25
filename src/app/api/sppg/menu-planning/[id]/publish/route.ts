/**
 * @fileoverview Menu Planning Publish API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { publishActionSchema } from '@/features/sppg/menu-planning/schemas'

/**
 * POST /api/sppg/menu-planning/[id]/publish
 * Publish plan (APPROVED → ACTIVE)
 * 
 * @security Multi-tenant (sppgId check), RBAC (WRITE permission)
 * @validation Plan must be APPROVED, no overlapping active plans
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check: WRITE permission
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Extract planId
      const { id: planId } = await params

      // Parse and validate request body (optional notes)
      const body = await request.json().catch(() => ({}))
      const validated = publishActionSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.format()
        }, { status: 400 })
      }

      const { publishNotes } = validated.data

      // Verify plan exists and belongs to user's SPPG
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId!
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
        return NextResponse.json({
          success: false,
          error: 'Menu plan not found or access denied'
        }, { status: 404 })
      }

      // Business Rule: Only APPROVED plans can be published
      if (plan.status !== 'APPROVED') {
        return NextResponse.json({
          success: false,
          error: `Cannot publish plan with status ${plan.status}. Only APPROVED plans can be published.`
        }, { status: 400 })
      }

      // Validation: Must have assignments
      if (plan._count.assignments === 0) {
        return NextResponse.json({
          success: false,
          error: 'Cannot publish plan without menu assignments'
        }, { status: 400 })
      }

      // Check for overlapping active plans
      const overlappingPlans = await db.menuPlan.findMany({
        where: {
          sppgId: session.user.sppgId!,
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
        return NextResponse.json({
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

      // Publish the plan (APPROVED → ACTIVE)
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

      // Audit log created automatically via withSppgAuth

      return NextResponse.json({
        success: true,
        message: 'Plan published successfully and is now active',
        data: publishedPlan
      }, { status: 200 })

    } catch (error) {
      console.error('Publish plan error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to publish plan'
      }, { status: 500 })
    }
  })
}
