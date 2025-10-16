/**
 * @fileoverview Menu Planning Assignment Detail API - Update and delete operations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { MealType } from '@prisma/client'

export async function GET(
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

    // 3. Extract assignmentId
    const { id: assignmentId } = await params

    // 4. Fetch assignment with multi-tenant security
    const assignment = await db.menuAssignment.findFirst({
      where: {
        id: assignmentId,
        menuPlan: { // Fixed: correct relation name
          sppgId: session.user.sppgId
        }
      },
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
            costPerServing: true,
            servingSize: true
          }
        },
        menuPlan: { // Fixed: correct relation name
          select: {
            id: true,
            name: true, // Fixed: correct field name
            status: true,
            startDate: true,
            endDate: true,
            program: {
              select: {
                id: true,
                name: true,
                targetRecipients: true // Fixed: correct field name
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return Response.json({
        success: false,
        error: 'Assignment not found or access denied'
      }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: assignment
    })

  } catch (error) {
    console.error('GET /api/sppg/menu-planning/assignments/[id] error:', error)
    return Response.json({
      success: false,
      error: 'Failed to fetch assignment',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

export async function PUT(
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

    // 3. Extract assignmentId
    const { id: assignmentId } = await params

    // 4. Parse request body
    const body = await request.json()
    const { 
      menuId, 
      date, 
      mealType, 
      plannedPortions,
      notes 
    } = body

    // 5. Verify assignment exists and belongs to user's SPPG
    const assignment = await db.menuAssignment.findFirst({
      where: {
        id: assignmentId,
        menuPlan: { // Fixed: correct relation name
          sppgId: session.user.sppgId
        }
      },
      include: {
        menuPlan: true // Fixed: correct relation name
      }
    })

    if (!assignment) {
      return Response.json({
        success: false,
        error: 'Assignment not found or access denied'
      }, { status: 404 })
    }

    // 6. Validate plan is not published or archived
    if (['PUBLISHED', 'ARCHIVED'].includes(assignment.menuPlan.status)) {
      return Response.json({
        success: false,
        error: `Cannot update assignment for ${assignment.menuPlan.status.toLowerCase()} plan`
      }, { status: 400 })
    }

    // 7. Build update data
    const updateData: {
      menuId?: string
      assignedDate?: Date // Fixed: correct field name
      mealType?: MealType
      plannedPortions?: number
      notes?: string | null
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    if (menuId) {
      // Verify menu exists and belongs to same SPPG
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

      updateData.menuId = menuId
    }

    if (date) {
      const newDate = new Date(date)
      
      // Validate date is within plan range
      if (newDate < assignment.menuPlan.startDate || newDate > assignment.menuPlan.endDate) {
        return Response.json({
          success: false,
          error: `Date must be between ${assignment.menuPlan.startDate.toISOString().split('T')[0]} and ${assignment.menuPlan.endDate.toISOString().split('T')[0]}`
        }, { status: 400 })
      }

      updateData.assignedDate = newDate // Fixed: correct field name
    }

    if (mealType) {
      // Validate meal type
      if (!Object.values(MealType).includes(mealType)) {
        return Response.json({
          success: false,
          error: `Invalid mealType. Must be one of: ${Object.values(MealType).join(', ')}`
        }, { status: 400 })
      }

      updateData.mealType = mealType
    }

    // Check for duplicate assignment if date or mealType changed
    if (updateData.assignedDate || updateData.mealType) {
      const checkDate = updateData.assignedDate || assignment.assignedDate // Fixed: correct field name
      const checkMealType = updateData.mealType || assignment.mealType

      const duplicate = await db.menuAssignment.findFirst({
        where: {
          menuPlanId: assignment.menuPlanId, // Fixed: correct field name
          assignedDate: checkDate, // Fixed: correct field name
          mealType: checkMealType,
          id: {
            not: assignmentId
          }
        }
      })

      if (duplicate) {
        return Response.json({
          success: false,
          error: `Assignment already exists for ${checkMealType} on ${checkDate.toISOString().split('T')[0]}`
        }, { status: 409 })
      }
    }

    if (plannedPortions !== undefined) {
      updateData.plannedPortions = plannedPortions
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    // 8. Update assignment
    const updatedAssignment = await db.menuAssignment.update({
      where: { id: assignmentId },
      data: updateData,
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
      message: 'Assignment updated successfully',
      data: updatedAssignment
    })

  } catch (error) {
    console.error('PUT /api/sppg/menu-planning/assignments/[id] error:', error)
    return Response.json({
      success: false,
      error: 'Failed to update assignment',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

export async function DELETE(
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

    // 3. Extract assignmentId
    const { id: assignmentId } = await params

    // 4. Verify assignment exists and belongs to user's SPPG
    const assignment = await db.menuAssignment.findFirst({
      where: {
        id: assignmentId,
        menuPlan: { // Fixed: correct relation name
          sppgId: session.user.sppgId
        }
      },
      include: {
        menuPlan: true // Fixed: correct relation name
      }
    })

    if (!assignment) {
      return Response.json({
        success: false,
        error: 'Assignment not found or access denied'
      }, { status: 404 })
    }

    // 5. Validate plan is not published or archived
    if (['PUBLISHED', 'ARCHIVED'].includes(assignment.menuPlan.status)) {
      return Response.json({
        success: false,
        error: `Cannot delete assignment from ${assignment.menuPlan.status.toLowerCase()} plan`
      }, { status: 400 })
    }

    // 6. Delete assignment (hard delete is OK for assignments)
    await db.menuAssignment.delete({
      where: { id: assignmentId }
    })

    return Response.json({
      success: true,
      message: 'Assignment deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/sppg/menu-planning/assignments/[id] error:', error)
    return Response.json({
      success: false,
      error: 'Failed to delete assignment',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
