/**
 * @fileoverview Menu Planning Assignment API Endpoints - Create Assignment
 * @description POST endpoint for creating new menu assignments within a plan
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/MENU_PLANNING_USER_GUIDE.md} Assignment Workflow
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { z } from 'zod'
import { MealType } from '@prisma/client'
import { recalculateMenuPlanMetrics } from '@/lib/menu-planning/calculations'

/**
 * Assignment Input Schema
 * Validates assignment creation data with business rules
 * Note: Frontend sends 'date' field, not 'assignmentDate'
 */
const assignmentInputSchema = z.object({
  date: z.string().datetime('Invalid date format'),
  mealType: z.nativeEnum(MealType),
  menuId: z.string().cuid('Invalid menu ID'),
  plannedPortions: z.number().int().positive('Portions must be positive'),
  notes: z.string().max(500, 'Notes too long').optional(),
})

type AssignmentInput = z.infer<typeof assignmentInputSchema>

/**
 * GET /api/sppg/menu-planning/[id]/assignments
 * List all menu assignments for a plan
 * 
 * @security Multi-tenant (sppgId check), RBAC (READ permission)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: planId } = await params

      // Verify plan ownership
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          program: { sppgId: session.user.sppgId! }
        }
      })

      if (!plan) {
        return NextResponse.json(
          { success: false, error: 'Menu plan not found' },
          { status: 404 }
        )
      }

      // Get all assignments
      const assignments = await db.menuAssignment.findMany({
        where: { menuPlanId: planId },
        include: {
          menu: {
            select: {
              id: true,
              menuName: true,
              menuCode: true,
              servingSize: true,
              costPerServing: true
            }
          }
        },
        orderBy: [
          { assignedDate: 'asc' },
          { mealType: 'asc' }
        ]
      })

      return NextResponse.json({ success: true, data: assignments })

    } catch (error) {
      console.error('Get assignments error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch assignments' }, { status: 500 })
    }
  })
}

/**
 * POST /api/sppg/menu-planning/[id]/assignments
 * Create new menu assignment for a specific date and meal type
 * 
 * @security Multi-tenant (sppgId check), RBAC (WRITE permission)
 * @validation Date must be within plan range, no duplicate assignments
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

      const { id: planId } = await params

      // Verify Plan Ownership & Get Plan Details
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          program: {
            sppgId: session.user.sppgId!, // Multi-tenant filter
          },
        },
        include: {
          program: {
            select: {
              id: true,
              sppgId: true,
              targetRecipients: true,
            },
          },
        },
      })

      if (!plan) {
        return NextResponse.json(
          { success: false, error: 'Menu plan not found or access denied' },
          { status: 404 }
        )
      }

      // Business Rule: Only allow editing DRAFT plans
      if (plan.status !== 'DRAFT') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot add assignments to ${plan.status} plan. Only DRAFT plans can be edited.`,
          },
          { status: 400 }
        )
      }

      // Parse and Validate Request Body
      const body = await request.json()
      const validated = assignmentInputSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      const input: AssignmentInput = validated.data
      const { date: dateStr, mealType, menuId, plannedPortions, notes } = input

      // Business Rule: Date must be within plan range
      const assignmentDate = new Date(dateStr)
      const planStartDate = new Date(plan.startDate)
      const planEndDate = new Date(plan.endDate)

      planStartDate.setHours(0, 0, 0, 0)
      planEndDate.setHours(23, 59, 59, 999)
      assignmentDate.setHours(0, 0, 0, 0)

      if (assignmentDate < planStartDate || assignmentDate > planEndDate) {
        return NextResponse.json(
          {
            success: false,
            error: `Assignment date must be between ${plan.startDate.toISOString().split('T')[0]} and ${plan.endDate.toISOString().split('T')[0]}`,
          },
          { status: 400 }
        )
      }

      // Check for duplicate assignment (same date + meal type)
      const duplicate = await db.menuAssignment.findFirst({
        where: {
          menuPlanId: planId,
          assignedDate: assignmentDate,
          mealType: mealType,
        },
      })

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `Assignment already exists for ${mealType} on ${assignmentDate.toISOString().split('T')[0]}. Please edit or delete the existing assignment.`,
          },
          { status: 409 }
        )
      }

      // Verify Menu Exists & Belongs to Same SPPG
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: menuId,
          program: {
            sppgId: session.user.sppgId!, // Multi-tenant security
          },
        },
        select: {
          id: true,
          menuName: true,
          mealType: true,
          costPerServing: true,
        },
      })

      if (!menu) {
        return NextResponse.json(
          { success: false, error: 'Menu not found or access denied' },
          { status: 404 }
        )
      }

      // Business Rule: Menu meal type should match assignment meal type
      if (menu.mealType !== input.mealType) {
        return NextResponse.json(
          {
            success: false,
            error: `Menu "${menu.menuName}" is for ${menu.mealType}, but assignment is for ${input.mealType}`,
          },
          { status: 400 }
        )
      }

      // Calculate Estimated Cost
      const estimatedCost = (menu.costPerServing ?? 0) * input.plannedPortions

      // Create assignment
      const assignment = await db.menuAssignment.create({
        data: {
          menuPlanId: planId,
          menuId: menuId,
          assignedDate: assignmentDate,
          mealType: mealType,
          plannedPortions: plannedPortions,
          estimatedCost: estimatedCost,
          notes: notes,
        },
        include: {
          menu: {
            select: {
              id: true,
              menuName: true,
              menuCode: true,
              mealType: true,
              servingSize: true,
              costPerServing: true,
            },
          },
        },
      })

      // Recalculate Plan Metrics
      try {
        await recalculateMenuPlanMetrics(planId)
      } catch (recalcError) {
        console.error('⚠️ Metrics recalculation failed (non-critical):', recalcError)
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Assignment created successfully',
          data: assignment,
        },
        { status: 201 }
      )

    } catch (error) {
      console.error('Create assignment error:', error)
      
      if (error instanceof Error && error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: 'Invalid menu or plan reference' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create assignment',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }
  })
}
