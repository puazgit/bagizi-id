/**
 * @fileoverview Distribution Execution Issue Resolution API Route
 * @version Next.js 15.5.4
 * @description API endpoint to resolve reported issues
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { resolveIssueSchema } from '@/features/sppg/distribution/execution/schemas'

/**
 * POST /api/sppg/distribution/execution/[id]/issue/[issueId]/resolve
 * Resolve reported issue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; issueId: string }> }
) {
  try {
    const { id, issueId } = await params

    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenant Security)
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG not found or access denied' }, { status: 403 })
    }

    // 3. Verify Execution Exists & Belongs to SPPG
    const execution = await db.foodDistribution.findFirst({
      where: { 
        id,
        schedule: {
          sppgId: session.user.sppgId, // Multi-tenant safety
        },
      },
    })

    if (!execution) {
      return Response.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    // 4. Verify Issue Exists & Belongs to Execution
    const issue = await db.distributionIssue.findFirst({
      where: {
        id: issueId,
        distributionId: id,
      },
    })

    if (!issue) {
      return Response.json({ 
        error: 'Issue not found' 
      }, { status: 404 })
    }

    // 5. Parse & Validate Request Body
    const body = await request.json()
    const validated = resolveIssueSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 6. Business Logic Validation
    if (issue.resolvedAt) {
      return Response.json({ 
        error: 'Issue already resolved' 
      }, { status: 400 })
    }

    // 7. Resolve Issue
    await db.distributionIssue.update({
      where: { id: issueId },
      data: {
        resolvedAt: validated.data.resolvedAt,
        resolutionNotes: validated.data.resolutionNotes,
        resolvedBy: session.user.id,
      },
    })

    // 8. Fetch Updated Execution
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

    return Response.json({ 
      success: true, 
      data: updatedExecution,
      message: 'Issue resolved successfully'
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/execution/[id]/issue/[issueId]/resolve error:', error)
    
    return Response.json({ 
      error: 'Failed to resolve issue',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
