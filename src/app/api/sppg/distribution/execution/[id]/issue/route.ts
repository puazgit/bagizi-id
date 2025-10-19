/**
 * @fileoverview Distribution Execution Issue Reporting API Route
 * @version Next.js 15.5.4
 * @description API endpoint to report and manage execution issues
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { reportIssueSchema } from '@/features/sppg/distribution/execution/schemas'

/**
 * POST /api/sppg/distribution/execution/[id]/issue
 * Report new issue during execution
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // 4. Parse & Validate Request Body
    const body = await request.json()
    const validated = reportIssueSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 5. Business Logic Validation
    if (execution.status === 'COMPLETED') {
      return Response.json({ 
        error: 'Cannot report issue for completed execution' 
      }, { status: 400 })
    }

    if (execution.status === 'CANCELLED') {
      return Response.json({ 
        error: 'Cannot report issue for cancelled execution' 
      }, { status: 400 })
    }

    // 6. Create Issue Record
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

    // 7. Update Execution with Issue Note
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

    return Response.json({ 
      success: true, 
      data: updatedExecution,
      issue,
      message: 'Issue reported successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sppg/distribution/execution/[id]/issue error:', error)
    
    return Response.json({ 
      error: 'Failed to report issue',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
