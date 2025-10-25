/**
 * @fileoverview Individual Procurement Plan API endpoints - GET, PUT, DELETE
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
  procurementPlanUpdateSchema,
  procurementPlanApprovalSchema
} from '@/features/sppg/procurement/schemas'

// ================================ GET /api/sppg/procurement/plans/[id] ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Fetch procurement plan with multi-tenant check
      const plan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId! // CRITICAL: Ensure plan belongs to user's SPPG
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
          include: {
            supplier: {
              select: {
                id: true,
                supplierCode: true,
                supplierName: true
              }
            },
            items: {
              select: {
                id: true,
                itemName: true,
                orderedQuantity: true,
                unit: true,
                finalPrice: true
              }
            }
          },
          orderBy: {
            procurementDate: 'desc'
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Procurement plan not found or access denied' 
      }, { status: 404 })
    }

    // 4. Calculate statistics
    const totalProcurements = plan.procurements.length
    const completedProcurements = plan.procurements.filter(p => p.status === 'COMPLETED').length
    const pendingProcurements = plan.procurements.filter(p => 
      p.status === 'DRAFT' || p.status === 'PENDING_APPROVAL' || p.status === 'APPROVED'
    ).length
    const budgetUtilization = plan.totalBudget > 0 
      ? (plan.usedBudget / plan.totalBudget) * 100 
      : 0

    // Success response
    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        totalProcurements,
        completedProcurements,
        pendingProcurements,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100
      }
    })

    } catch (error) {
      console.error('GET /api/sppg/procurement/plans/[id] error:', error)
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ PUT /api/sppg/procurement/plans/[id] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Verify plan exists and belongs to SPPG
      const existingPlan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        }
      })

      if (!existingPlan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement plan not found or access denied' 
        }, { status: 404 })
      }

      // Check if plan can be edited (not approved or completed)
      if (existingPlan.approvalStatus === 'APPROVED') {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot edit approved procurement plan. Request revision first.' 
        }, { status: 403 })
      }

      // Role Check - Only certain roles can edit
      const allowedRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_AKUNTAN',
      'SPPG_PRODUKSI_MANAGER'
    ]
    
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = procurementPlanUpdateSchema.parse(body)

    // Verify program belongs to SPPG if programId changed
    if (validated.programId && validated.programId !== existingPlan.programId) {
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: validated.programId,
          sppgId: session.user.sppgId! as string
        }
      })

      if (!program) {
        return NextResponse.json({ 
          success: false, 
          error: 'Program not found or does not belong to your SPPG' 
        }, { status: 404 })
      }
    }

    // 8. Calculate remaining budget if total budget changed
    let remainingBudget = existingPlan.remainingBudget
    if (validated.totalBudget !== undefined) {
      remainingBudget = validated.totalBudget - existingPlan.usedBudget
    }

    // 9. Update procurement plan
    const updatedPlan = await db.procurementPlan.update({
      where: { id },
      data: {
        ...validated,
        remainingBudget,
        ...(validated.approvalStatus === 'SUBMITTED' && {
          submittedAt: new Date(),
          submittedBy: session.user.id
        }),
        ...(validated.approvalStatus === 'APPROVED' && {
          approvedAt: new Date(),
          approvedBy: session.user.id
        })
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

    // 10. Success response
    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: 'Procurement plan updated successfully'
    })

    } catch (error) {
      console.error('PUT /api/sppg/procurement/plans/[id] error:', error)
      
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Validation failed',
          details: error 
        }, { status: 400 })
      }

      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ DELETE /api/sppg/procurement/plans/[id] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Verify plan exists and belongs to SPPG
      const plan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        },
        include: {
        procurements: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Procurement plan not found or access denied' 
      }, { status: 404 })
    }

    // 5. Check if plan can be deleted (no completed procurements)
    const hasCompletedProcurements = plan.procurements.some(p => p.status === 'COMPLETED')
    if (hasCompletedProcurements) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete plan with completed procurements' 
      }, { status: 403 })
    }

    // 6. Delete procurement plan (cascade will delete related procurements)
    await db.procurementPlan.delete({
      where: { id }
    })

    // 7. Success response
    return NextResponse.json({
      success: true,
      message: 'Procurement plan deleted successfully'
    })

    } catch (error) {
      console.error('DELETE /api/sppg/procurement/plans/[id] error:', error)
      
      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ PATCH /api/sppg/procurement/plans/[id] (Approval) ================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      
      // Permission Check - Approval requires APPROVE permission
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'APPROVE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions - Only Kepala SPPG can approve/reject procurement plans'
        }, { status: 403 })
      }

      // Verify plan exists and belongs to SPPG
      const plan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        }
      })

      if (!plan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement plan not found or access denied' 
        }, { status: 404 })
      }

      // Check if plan is in correct status for approval
      if (plan.approvalStatus !== 'SUBMITTED') {
        return NextResponse.json({ 
          success: false, 
          error: 'Only submitted plans can be approved/rejected' 
        }, { status: 403 })
      }

      // Parse and validate approval action
    const body = await request.json()
    const validated = procurementPlanApprovalSchema.parse(body)

    // 7. Update plan based on approval action
    let newStatus: string
    let rejectionReason: string | undefined

    switch (validated.action) {
      case 'APPROVE':
        newStatus = 'APPROVED'
        break
      case 'REJECT':
        newStatus = 'REJECTED'
        rejectionReason = validated.rejectionReason
        break
      case 'REQUEST_REVISION':
        newStatus = 'REVISION'
        rejectionReason = validated.rejectionReason
        break
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid approval action' 
        }, { status: 400 })
    }

    const updateData = {
      approvedBy: session.user.id,
      approvedAt: new Date(),
      ...(rejectionReason && { rejectionReason })
    }

    const updatedPlan = await db.procurementPlan.update({
      where: { id },
      data: {
        approvalStatus: newStatus,
        ...updateData
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

    // 8. Success response
    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: `Procurement plan ${validated.action.toLowerCase()}d successfully`
    })

    } catch (error) {
      console.error('PATCH /api/sppg/procurement/plans/[id] error:', error)
      
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Validation failed',
          details: error 
        }, { status: 400 })
      }

      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process approval',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
