/**
 * @fileoverview Distribution Execution Issue Reporting API Route
 * @version Next.js 15.5.4
 * @description API endpoint to report and manage execution issues
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { reportIssueSchema } from '@/features/sppg/distribution/execution/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/distribution/execution/[id]/issue
 * Report new issue during execution
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // 1. Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // 2. Verify Execution Exists & Belongs to SPPG
      const execution = await db.foodDistribution.findFirst({
      where: { 
        id,
        schedule: {
          sppgId: session.user.sppgId!, // Multi-tenant safety
        },
      },
    })

    if (!execution) {
      return NextResponse.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    // 3. Parse & Validate Request Body
    const body = await request.json()
    const validated = reportIssueSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 4. Business Logic Validation
    if (execution.status === 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Cannot report issue for completed execution' 
      }, { status: 400 })
    }

    if (execution.status === 'CANCELLED') {
      return NextResponse.json({ 
        error: 'Cannot report issue for cancelled execution' 
      }, { status: 400 })
    }

    // 5. Create Issue Record
    const issue = await db.distributionIssue.create({
      data: {
        distributionId: id,
        issueType: validated.data.type,
        severity: validated.data.severity,
        description: validated.data.description,
        location: validated.data.location,
        reportedAt: new Date(),
        reportedBy: session.user.id,
        affectedDeliveries: validated.data.affectedDeliveries || [],
      },
    })

    // 6. Update Execution with Issue Note
    const updatedExecution = await db.foodDistribution.update({
      where: { id },
      data: {
        notes: execution.notes 
          ? `${execution.notes}\n[ISSUE] ${validated.data.type}: ${validated.data.description}`
          : `[ISSUE] ${validated.data.type}: ${validated.data.description}`,
      },
      include: {
        schedule: {
          include: {
            vehicleAssignments: {
              include: {
                vehicle: true,
              },
            },
            distribution_deliveries: true,
          },
        },
        vehicle: true,
        issues: {
          orderBy: {
            reportedAt: 'desc',
          },
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      data: updatedExecution,
      issue,
      message: 'Issue reported successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sppg/distribution/execution/[id]/issue error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to report issue',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
