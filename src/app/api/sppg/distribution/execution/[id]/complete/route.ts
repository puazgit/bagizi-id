/**
 * @fileoverview Distribution Execution Complete API Route
 * @version Next.js 15.5.4
 * @description API endpoint to complete execution with validation
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { completeExecutionSchema } from '@/features/sppg/distribution/execution/schemas'

/**
 * POST /api/sppg/distribution/execution/[id]/complete
 * Complete execution with final data
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
    const existingExecution = await db.foodDistribution.findFirst({
      where: { 
        id,
        schedule: {
          sppgId: session.user.sppgId, // Multi-tenant safety
        },
      },
      include: {
        deliveries: true,
        issues: {
          where: {
            resolvedAt: null,
          },
        },
      },
    })

    if (!existingExecution) {
      return Response.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    // 4. Parse & Validate Request Body
    const body = await request.json()
    const validated = completeExecutionSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 5. Business Logic Validation
    if (existingExecution.status === 'COMPLETED') {
      return Response.json({ 
        error: 'Execution already completed' 
      }, { status: 400 })
    }

    if (existingExecution.status === 'CANCELLED') {
      return Response.json({ 
        error: 'Cannot complete cancelled execution' 
      }, { status: 400 })
    }

    if (existingExecution.status === 'SCHEDULED') {
      return Response.json({ 
        error: 'Execution belum dimulai' 
      }, { status: 400 })
    }

    // Check for unresolved issues
    if (existingExecution.issues.length > 0) {
      return Response.json({ 
        error: `Masih ada ${existingExecution.issues.length} issue yang belum diselesaikan` 
      }, { status: 400 })
    }

    // Validate deliveries exist
    if (existingExecution.deliveries.length === 0) {
      return Response.json({ 
        error: 'Tidak ada delivery yang tercatat untuk execution ini' 
      }, { status: 400 })
    }

    // 6. Complete Execution
    const execution = await db.foodDistribution.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEndTime: validated.data.actualEndTime,
        totalPortionsDelivered: validated.data.totalPortionsDelivered,
        totalBeneficiariesReached: validated.data.totalBeneficiariesReached,
        completionNotes: validated.data.completionNotes,
      },
      include: {
        schedule: {
          include: {
            vehicleAssignments: {
              include: {
                vehicle: true,
              },
            },
          },
        },
        deliveries: {
          include: {
            schoolBeneficiary: {
              select: {
                schoolName: true,
              },
            },
          },
        },
        issues: true,
      },
    })

    // 7. Update Schedule Status (if scheduleId exists)
    if (existingExecution.scheduleId) {
      await db.distributionSchedule.update({
        where: { id: existingExecution.scheduleId },
        data: { status: 'COMPLETED' },
      })
    }

    return Response.json({ 
      success: true, 
      data: execution,
      message: 'Execution completed successfully'
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/execution/[id]/complete error:', error)
    
    return Response.json({ 
      error: 'Failed to complete execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
