/**
 * @fileoverview Menu Planning Approve API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { approveActionSchema } from '@/features/sppg/menu-planning/schemas'

/**
 * POST /api/sppg/menu-planning/[id]/approve
 * Approve plan (PENDING_REVIEW → APPROVED)
 * 
 * @security Multi-tenant (sppgId check), RBAC (SPPG_KEPALA / SPPG_ADMIN only)
 * @validation Plan must be PENDING_REVIEW
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔵 Approve API called')
  
  try {
    // 1. Authentication check
    const session = await auth()
    console.log('🔵 Session:', session?.user?.id, session?.user?.userRole)
    
    if (!session?.user) {
      console.log('🔴 No session - returning 401')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Multi-tenant security check
    if (!session.user.sppgId) {
      console.log('🔴 No sppgId - returning 403')
      return Response.json({ 
        error: 'SPPG access required' 
      }, { status: 403 })
    }

    // 3. Role-based access check (only SPPG_KEPALA and SPPG_ADMIN can approve)
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN']
    console.log('🔵 Checking role:', session.user.userRole, 'Allowed:', allowedRoles)
    
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      console.log('🔴 Insufficient permissions - returning 403')
      return Response.json({
        success: false,
        error: 'Insufficient permissions. Only SPPG Kepala or Admin can approve plans.'
      }, { status: 403 })
    }

    // 4. Extract planId
    const { id: planId } = await params
    console.log('🔵 Plan ID:', planId)

    // 5. Parse and validate request body
    const body = await request.json()
    
    console.log('Approve request - planId:', planId)
    console.log('Approve request - body:', body)
    console.log('Approve request - user:', session.user.id, session.user.userRole)
    
    const validated = approveActionSchema.safeParse(body)

    if (!validated.success) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        details: validated.error.format()
      }, { status: 400 })
    }

    const { approvalNotes } = validated.data
    console.log('🔵 Approval notes:', approvalNotes)

    // 6. Verify plan exists and belongs to user's SPPG
    console.log('🔵 Finding plan with ID:', planId, 'SPPG:', session.user.sppgId)
    
    const plan = await db.menuPlan.findFirst({
      where: {
        id: planId,
        sppgId: session.user.sppgId
      },
      include: {
        program: {
          select: {
            name: true
          }
        },
        submittedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log('🔵 Plan found:', plan ? `Yes (status: ${plan.status})` : 'No')

    if (!plan) {
      console.log('🔴 Plan not found - returning 404')
      return Response.json({
        success: false,
        error: 'Plan not found'
      }, { status: 404 })
    }

    // 7. Business Rule: Only PENDING_REVIEW plans can be approved
    if (plan.status !== 'PENDING_REVIEW') {
      console.log('🔴 Wrong status - returning 400. Current:', plan.status, 'Expected: PENDING_REVIEW')
      return Response.json({
        success: false,
        error: `Cannot approve plan with status ${plan.status}. Only PENDING_REVIEW plans can be approved.`
      }, { status: 400 })
    }

    // 8. Update plan status to APPROVED
    console.log('🔵 Updating plan to APPROVED...')
    const updatedPlan = await db.menuPlan.update({
      where: {
        id: planId
      },
      data: {
        status: 'APPROVED',
        approvedBy: session.user.id,
        approvedAt: new Date(),
        description: approvalNotes ? `${plan.description || ''}\n\nApproval Notes: ${approvalNotes}`.trim() : plan.description
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
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    console.log('🟢 Plan updated successfully to APPROVED')

    // 9. Create audit log
    console.log('🔵 Creating audit log...')
    
    await db.auditLog.create({
      data: {
        action: 'APPROVE_PLAN',
        entityType: 'MenuPlan',
        entityId: planId,
        userId: session.user.id,
        sppgId: session.user.sppgId,
        metadata: {
          planName: plan.name,
          approvalNotes,
          approverName: session.user.name,
          approverRole: session.user.userRole
        }
      }
    })

    console.log('🟢 Audit log created')
    console.log('🟢 Returning success response')

    return Response.json({
      success: true,
      message: 'Plan approved successfully',
      data: updatedPlan
    }, { status: 200 })

  } catch (error) {
    console.error('Approve plan error:', error)
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return Response.json({
      success: false,
      error: 'Failed to approve plan',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 })
  }
}
