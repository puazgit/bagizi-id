/**
 * @fileoverview Menu Planning Assignments API - Create and list menu assignments
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { MealType } from '@prisma/client'

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const planId = searchParams.get('planId')
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')
      const mealType = searchParams.get('mealType') as MealType | null

      // Build filter query
      const where: Record<string, unknown> = {
        menuPlan: {
          sppgId: session.user.sppgId!
        }
      }

      if (planId) {
        where.menuPlanId = planId
      }

      if (startDate || endDate) {
        where.assignedDate = {} as Record<string, unknown>
        if (startDate) {
          (where.assignedDate as Record<string, unknown>).gte = new Date(startDate)
        }
        if (endDate) {
          (where.assignedDate as Record<string, unknown>).lte = new Date(endDate)
        }
      }

      if (mealType) {
        where.mealType = mealType
      }

      // Fetch assignments
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

      // Return assignments
      return NextResponse.json({
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
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch assignments',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // Parse request body
      const body = await request.json()
      const { 
        planId, 
        menuId, 
        date, 
        mealType, 
        plannedPortions,
        notes 
      } = body

      // Validation
      if (!planId || !menuId || !date || !mealType) {
        return NextResponse.json({
          success: false,
          error: 'Missing required fields: planId, menuId, date, mealType'
        }, { status: 400 })
      }

      // Validate meal type
      if (!Object.values(MealType).includes(mealType)) {
        return NextResponse.json({
          success: false,
          error: `Invalid mealType. Must be one of: ${Object.values(MealType).join(', ')}`
        }, { status: 400 })
      }

      // Verify plan exists and belongs to user's SPPG
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId!
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
        return NextResponse.json({
          success: false,
          error: 'Menu plan not found or access denied'
        }, { status: 404 })
      }

      // Validate date is within plan range
      const assignmentDate = new Date(date)
      if (assignmentDate < plan.startDate || assignmentDate > plan.endDate) {
        return NextResponse.json({
          success: false,
          error: `Date must be between ${plan.startDate.toISOString().split('T')[0]} and ${plan.endDate.toISOString().split('T')[0]}`
        }, { status: 400 })
      }

      // Verify menu exists and belongs to same SPPG
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: menuId,
          program: {
            sppgId: session.user.sppgId!
          }
        }
      })

      if (!menu) {
        return NextResponse.json({
          success: false,
          error: 'Menu not found or access denied'
        }, { status: 404 })
      }

      // Check for duplicate assignment
      const existingAssignment = await db.menuAssignment.findFirst({
        where: {
          menuPlanId: planId,
          assignedDate: assignmentDate,
          mealType
        }
      })

      if (existingAssignment) {
        return NextResponse.json({
          success: false,
          error: `Assignment already exists for ${mealType} on ${date}. Update or delete existing assignment first.`
        }, { status: 409 })
      }

      // Calculate portions if not provided
      const finalPortions = plannedPortions || plan.program.targetRecipients || 100

      // Create assignment
      const assignment = await db.menuAssignment.create({
        data: {
          menuPlanId: planId,
          menuId,
          assignedDate: assignmentDate,
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
          menuPlan: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Menu assignment created successfully',
        data: assignment
      }, { status: 201 })

    } catch (error) {
      console.error('POST /api/sppg/menu-planning/assignments error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create assignment',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
