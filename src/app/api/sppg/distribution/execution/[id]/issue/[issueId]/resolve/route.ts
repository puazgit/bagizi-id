/**
 * @fileoverview Distribution Execution Issue Resolution API Route
 * @version Next.js 15.5.4
 * @description API endpoint to resolve reported issues
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { resolveIssueSchema } from '@/features/sppg/distribution/execution/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/distribution/execution/[id]/issue/[issueId]/resolve
 * Resolve reported issue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; issueId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id, issueId } = await params

      // 2. Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // 3. Verify Execution Exists & Belongs to SPPG
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
      }, { status: 400 })
    }

    // 4. Verify Issue Exists & Belongs to Execution
    const issue = await db.distributionIssue.findFirst({
      where: {
        id: issueId,
        distributionId: id,
      },
    })

    if (!issue) {
      return NextResponse.json({ 
        error: 'Issue not found' 
      }, { status: 404 })
    }

    // 5. Parse & Validate Request Body
    const body = await request.json()
    const validated = resolveIssueSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 6. Business Logic Validation
    if (issue.resolvedAt) {
      return NextResponse.json({ 
        error: 'Issue already resolved' 
      }, { status: 400 })
    }

    // 6. Resolve Issue
    await db.distributionIssue.update({
      where: { id: issueId },
      data: {
        resolvedAt: validated.data.resolvedAt,
        resolutionNotes: validated.data.resolutionNotes,
        resolvedBy: session.user.id,
      },
    })

    // 7. Fetch Updated Execution
    const updatedExecution = await db.foodDistribution.findFirst({
      where: { id },
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
      message: 'Issue resolved successfully'
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/execution/[id]/issue/[issueId]/resolve error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to resolve issue',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
