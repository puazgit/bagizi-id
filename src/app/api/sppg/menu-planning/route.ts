/**
 * @fileoverview Menu Planning API - List and Create menu plans
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 * @see {@link /docs/MENU_PLANNING_DOMAIN_IMPLEMENTATION.md} Implementation guide
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { MenuPlanStatus } from '@prisma/client'
import { calculateTotalDays } from '@/lib/menu-planning/calculations'

// ================================ GET /api/sppg/menu-planning ================================

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // 3. Parse query parameters
      const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as MenuPlanStatus | null
    const programId = searchParams.get('programId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

      // 4. Build where clause with filters
      const where: Record<string, unknown> = {
        sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
        isArchived: false // Exclude archived plans from list
      }

    if (status) {
      where.status = status
    }

    if (programId) {
      where.programId = programId
    }

    if (startDate || endDate) {
      where.startDate = {} as Record<string, unknown>
      if (startDate) (where.startDate as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.startDate as Record<string, unknown>).lte = new Date(endDate)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 5. Fetch plans with relations
    const plans = await db.menuPlan.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          select: {
            id: true,
            assignedDate: true,
            mealType: true,
            plannedPortions: true,
            estimatedCost: true
          },
          orderBy: {
            assignedDate: 'asc'
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 6. Calculate summary metrics
    const summary = {
      totalPlans: plans.length,
      byStatus: {
        draft: plans.filter(p => p.status === MenuPlanStatus.DRAFT).length,
        submitted: plans.filter(p => p.status === MenuPlanStatus.PENDING_REVIEW).length,
        approved: plans.filter(p => p.status === MenuPlanStatus.APPROVED).length,
        published: plans.filter(p => p.status === MenuPlanStatus.PUBLISHED).length,
        archived: plans.filter(p => p.status === MenuPlanStatus.ARCHIVED).length,
        rejected: plans.filter(p => p.status === MenuPlanStatus.CANCELLED).length
      },
      avgBeneficiaries: 0, // TODO: Calculate from program.targetRecipients
      totalBeneficiaries: 0 // TODO: Calculate total
    }

      return NextResponse.json({
        success: true,
        data: plans, // Changed from 'plans' to 'data' to match expected response type
        summary,
        meta: {
          total: plans.length,
          filters: {
            status,
            programId,
            startDate,
            endDate,
            search
          }
        }
      })

    } catch (error) {
      console.error('GET /api/sppg/menu-planning error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch menu plans',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/menu-planning ================================

export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // 3. Parse request body
      const body = await request.json()

    // 4. Validate required fields
    if (!body.programId || !body.name || !body.startDate || !body.endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: programId, name, startDate, endDate'
      }, { status: 400 })
    }

      // 5. Verify program belongs to user's SPPG
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: body.programId,
          sppgId: session.user.sppgId!
        }
      })

    if (!program) {
      return NextResponse.json({
        success: false,
        error: 'Program not found or access denied'
      }, { status: 404 })
    }

    // 6. Validate date range
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)

    if (endDate <= startDate) {
      return NextResponse.json({
        success: false,
        error: 'End date must be after start date'
      }, { status: 400 })
    }

      // 7. Calculate total days using utility function (Phase 2)
      const totalDays = calculateTotalDays(startDate, endDate)

      // 8. Create menu plan
      const plan = await db.menuPlan.create({
        data: {
          programId: body.programId,
          sppgId: session.user.sppgId!,
          createdBy: session.user.id,
          name: body.name,
          description: body.description,
          startDate,
          endDate,
          totalDays,
          status: MenuPlanStatus.DRAFT,
          isDraft: true,
          isActive: false,
          planningRules: body.planningRules || null
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Menu plan created successfully',
        data: plan
      }, { status: 201 })

    } catch (error) {
      console.error('POST /api/sppg/menu-planning error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create menu plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}