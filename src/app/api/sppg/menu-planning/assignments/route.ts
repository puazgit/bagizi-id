/**
 * @fileoverview Menu Planning Assignments API - Create and list menu assignments
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { MealType } from '@prisma/client'

export async function GET(request: NextRequest) {
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

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const mealType = searchParams.get('mealType') as MealType | null

    // 4. Build filter query
    const where: Record<string, unknown> = {
      menuPlan: { // Fixed: relation is 'menuPlan' not 'plan'
        sppgId: session.user.sppgId
      }
    }

    if (planId) {
      where.menuPlanId = planId // Fixed: correct field name
    }

    if (startDate || endDate) {
      where.assignedDate = {} as Record<string, unknown> // Fixed: correct field name
      if (startDate) {
        (where.assignedDate as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.assignedDate as Record<string, unknown>).lte = new Date(endDate)
      }
    }    // 5. Fetch assignments
    const assignments = await db.menuAssignment.findMany({
      where,
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
            costPerServing: true
          }
        },
        menuPlan: { // Fixed: relation is 'menuPlan' not 'plan'
          select: {
            id: true,
            name: true, // Fixed: field is 'name' not 'planName'
            status: true,
            program: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { assignedDate: 'asc' }, // Fixed: correct field name
        { mealType: 'asc' }
      ]
    })

    // 6. Return assignments
    return Response.json({
      success: true,
      data: assignments,
      meta: {
        total: assignments.length,
        filters: {
          planId,
          startDate,
          endDate,
          mealType
        }
      }
    })

  } catch (error) {
    console.error('GET /api/sppg/menu-planning/assignments error:', error)
    return Response.json({
      success: false,
      error: 'Failed to fetch assignments',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // 3. Parse request body
    const body = await request.json()
    const { 
      planId, 
      menuId, 
      date, 
      mealType, 
      plannedPortions,
      notes 
    } = body

    // 4. Validation
    if (!planId || !menuId || !date || !mealType) {
      return Response.json({
        success: false,
        error: 'Missing required fields: planId, menuId, date, mealType'
      }, { status: 400 })
    }

    // Validate meal type
    if (!Object.values(MealType).includes(mealType)) {
      return Response.json({
        success: false,
        error: `Invalid mealType. Must be one of: ${Object.values(MealType).join(', ')}`
      }, { status: 400 })
    }

    // 5. Verify plan exists and belongs to user's SPPG
    const plan = await db.menuPlan.findFirst({
      where: {
        id: planId,
        sppgId: session.user.sppgId
      },
      include: {
        program: {
          select: {
            targetRecipients: true
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

    // 6. Validate date is within plan range
    const assignmentDate = new Date(date)
    if (assignmentDate < plan.startDate || assignmentDate > plan.endDate) {
      return Response.json({
        success: false,
        error: `Date must be between ${plan.startDate.toISOString().split('T')[0]} and ${plan.endDate.toISOString().split('T')[0]}`
      }, { status: 400 })
    }

    // 7. Verify menu exists and belongs to same SPPG (through program)
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId
        }
      }
    })

    if (!menu) {
      return Response.json({
        success: false,
        error: 'Menu not found or access denied'
      }, { status: 404 })
    }

    // 8. Check for duplicate assignment (same date + mealType)
    const existingAssignment = await db.menuAssignment.findFirst({
      where: {
        menuPlanId: planId, // Fixed: correct field name
        assignedDate: assignmentDate, // Fixed: correct field name
        mealType
      }
    })

    if (existingAssignment) {
      return Response.json({
        success: false,
        error: `Assignment already exists for ${mealType} on ${date}. Update or delete existing assignment first.`
      }, { status: 409 })
    }

    // 9. Calculate portions if not provided
    const finalPortions = plannedPortions || plan.program.targetRecipients || 100 // Fixed: access via program relation

    // 10. Create assignment
    const assignment = await db.menuAssignment.create({
      data: {
        menuPlanId: planId, // Fixed: correct field name
        menuId,
        assignedDate: assignmentDate, // Fixed: correct field name
        mealType,
        plannedPortions: finalPortions,
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
            costPerServing: true
          }
        },
        menuPlan: { // Fixed: correct relation name
          select: {
            id: true,
            name: true, // Fixed: correct field name
            status: true
          }
        }
      }
    })

    return Response.json({
      success: true,
      message: 'Menu assignment created successfully',
      data: assignment
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/sppg/menu-planning/assignments error:', error)
    return Response.json({
      success: false,
      error: 'Failed to create assignment',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
