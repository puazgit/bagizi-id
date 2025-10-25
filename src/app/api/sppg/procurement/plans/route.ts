/**
 * @fileoverview Procurement Plans API endpoints - Main CRUD operations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasPermission } from '@/lib/permissions'
import { 
  procurementPlanCreateSchema, 
  procurementPlanFiltersSchema
} from '@/features/sppg/procurement/schemas'

// ================================ GET /api/sppg/procurement/plans ================================

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Parse and validate query parameters
      const url = new URL(request.url)
      const queryParams = Object.fromEntries(url.searchParams)
      
      // Convert string values to appropriate types
      const processedParams = {
        ...queryParams,
        page: queryParams.page ? parseInt(queryParams.page) : undefined,
        limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
        planYear: queryParams.planYear ? parseInt(queryParams.planYear) : undefined,
        planQuarter: queryParams.planQuarter ? parseInt(queryParams.planQuarter) : undefined,
      }

      const filters = procurementPlanFiltersSchema.parse(processedParams)

      // Build database query with multi-tenant filtering
      const where = {
        // Multi-tenant: Only get plans from user's SPPG
        sppgId: session.user.sppgId!,
        
        // Apply filters
        ...(filters.search && {
          OR: [
            { planName: { contains: filters.search, mode: 'insensitive' as const } },
          { notes: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      }),
      ...(filters.approvalStatus && { approvalStatus: filters.approvalStatus }),
      ...(filters.planYear && { planYear: filters.planYear }),
      ...(filters.planQuarter && { planQuarter: filters.planQuarter }),
      ...(filters.programId && { programId: filters.programId }),
    } as const

    // 5. Execute queries with pagination
    const [plans, total] = await Promise.all([
      db.procurementPlan.findMany({
        where,
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
            }
          },
          procurements: {
            select: {
              id: true,
              status: true,
              totalAmount: true
            }
          }
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        }
      }),
      db.procurementPlan.count({ where })
    ])

    // 6. Transform response with computed statistics
    const transformedPlans = plans.map(plan => {
      const totalProcurements = plan.procurements.length
      const completedProcurements = plan.procurements.filter(p => p.status === 'COMPLETED').length
      const pendingProcurements = plan.procurements.filter(p => 
        p.status === 'DRAFT' || p.status === 'PENDING_APPROVAL' || p.status === 'APPROVED'
      ).length
      const budgetUtilization = plan.totalBudget > 0 
        ? (plan.usedBudget / plan.totalBudget) * 100 
        : 0

      return {
        ...plan,
        totalProcurements,
        completedProcurements,
        pendingProcurements,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100 // Round to 2 decimals
      }
    })

    // 7. Success response with pagination
    return NextResponse.json({
      success: true,
      data: transformedPlans,
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    })

    } catch (error) {
      console.error('GET /api/sppg/procurement/plans error:', error)
      
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid query parameters',
          details: error 
        }, { status: 400 })
      }

      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch procurement plans',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/procurement/plans ================================

export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
        success: false, 
        error: 'SPPG access required' 
      }, { status: 403 })
    }

    // 3. Role Check - Only certain roles can create procurement plans
    const allowedRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_AKUNTAN',
      'SPPG_PRODUKSI_MANAGER'
    ]
    
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions - Only managers can create procurement plans' 
      }, { status: 403 })
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = procurementPlanCreateSchema.parse(body)

    // Verify program belongs to SPPG if programId provided
    if (validated.programId) {
      const programWhere: {
        id: string
        sppgId: string
      } = {
        id: validated.programId,
        sppgId: session.user.sppgId!
      }
      const program = await db.nutritionProgram.findFirst({
        where: programWhere
      })

      if (!program) {
        return NextResponse.json({ 
          success: false, 
          error: 'Program not found or does not belong to your SPPG' 
        }, { status: 404 })
      }
    }

    // Check for duplicate plan (same month/year)
    const planWhere: {
      sppgId: string
      planMonth: string
      planYear: number
    } = {
      sppgId: session.user.sppgId!,
      planMonth: validated.planMonth,
      planYear: validated.planYear
    }
    const existingPlan = await db.procurementPlan.findFirst({
      where: planWhere
    })

    if (existingPlan) {
      return NextResponse.json({ 
        success: false, 
        error: `Procurement plan for ${validated.planMonth} already exists` 
      }, { status: 409 })
    }

    // Calculate initial budget allocation
    const allocatedBudget = 0 // Will be updated as items are added
    const usedBudget = 0 // Will be updated as procurements are created
    const remainingBudget = validated.totalBudget

    // Create procurement plan
    const plan = await db.procurementPlan.create({
      data: {
        sppgId: session.user.sppgId!,
        programId: validated.programId,
        planName: validated.planName,
        planMonth: validated.planMonth,
        planYear: validated.planYear,
        planQuarter: validated.planQuarter,
        totalBudget: validated.totalBudget,
        allocatedBudget,
        usedBudget,
        remainingBudget,
        proteinBudget: validated.proteinBudget,
        carbBudget: validated.carbBudget,
        vegetableBudget: validated.vegetableBudget,
        fruitBudget: validated.fruitBudget,
        otherBudget: validated.otherBudget,
        targetRecipients: validated.targetRecipients,
        targetMeals: validated.targetMeals,
        costPerMeal: validated.costPerMeal,
        notes: validated.notes,
        emergencyBuffer: validated.emergencyBuffer,
        approvalStatus: 'DRAFT',
        submittedBy: session.user.id
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true
          }
        },
        program: {
          select: {
            id: true,
            name: true
          }
        },
        procurements: {
          select: {
            id: true,
            status: true,
            totalAmount: true
          }
        }
      }
    })

    // 9. Success response
    return NextResponse.json({
      success: true,
      data: plan,
      message: 'Procurement plan created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/sppg/procurement/plans error:', error)
    
    // Validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed',
        details: error 
      }, { status: 400 })
    }

    // Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement plan with this code already exists' 
        }, { status: 409 })
      }
    }

    // Internal server error
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create procurement plan',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
  })
}
