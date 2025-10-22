/**
 * @fileoverview Distribution Execution API Routes - Individual Operations
 * @version Next.js 15.5.4
 * @description API endpoints for single execution operations (GET, PUT, DELETE)
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { updateExecutionSchema } from '@/features/sppg/distribution/execution/schemas'

/**
 * GET /api/sppg/distribution/execution/[id]
 * Fetch single execution by ID
 */
export async function GET(
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

    // 3. Fetch Execution (Multi-tenant Safe)
    const execution = await db.foodDistribution.findFirst({
      where: { 
        id,
        schedule: {
          sppgId: session.user.sppgId, // CRITICAL: Multi-tenant filtering
        },
      },
      include: {
        production: {
          select: {
            // Cost fields not yet implemented in FoodProduction schema
            // estimatedCost: true,
            // actualCost: true,
            // costPerPortion: true,
            plannedPortions: true,
            actualPortions: true,
            id: true,
            batchNumber: true,
          },
        },
        schedule: {
          include: {
            production: {
              select: {
                id: true,
                batchNumber: true,
                menu: {
                  select: {
                    id: true,
                    menuName: true,
                    servingSize: true,
                  }
                }
              }
            },
            vehicleAssignments: {
              include: {
                vehicle: true,
              },
            },
            distribution_deliveries: {
              include: {
                schoolBeneficiary: true,
              },
            },
          },
        },
        vehicle: true, // Include vehicle information
        deliveries: {
          include: {
            schoolBeneficiary: {
              select: {
                schoolName: true,
                schoolAddress: true,
                principalName: true,
                contactPhone: true,
              },
            },
          },
          orderBy: {
            estimatedArrival: 'asc',
          },
        },
        issues: {
          orderBy: {
            reportedAt: 'desc',
          },
        },
      },
    })

    if (!execution) {
      return Response.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    return Response.json({ 
      success: true, 
      data: execution 
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution/[id] error:', error)
    
    return Response.json({ 
      error: 'Failed to fetch execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

/**
 * PUT /api/sppg/distribution/execution/[id]
 * Update execution progress
 */
export async function PUT(
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
    })

    if (!existingExecution) {
      return Response.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    // 4. Parse & Validate Request Body
    const body = await request.json()
    const validated = updateExecutionSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 5. Business Logic Validation
    if (existingExecution.status === 'COMPLETED') {
      return Response.json({ 
        error: 'Cannot update completed execution' 
      }, { status: 400 })
    }

    if (existingExecution.status === 'CANCELLED') {
      return Response.json({ 
        error: 'Cannot update cancelled execution' 
      }, { status: 400 })
    }

    // 6. Update Execution
    const execution = await db.foodDistribution.update({
      where: { id },
      data: validated.data,
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

    return Response.json({ 
      success: true, 
      data: execution 
    })
  } catch (error) {
    console.error('PUT /api/sppg/distribution/execution/[id] error:', error)
    
    return Response.json({ 
      error: 'Failed to update execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

/**
 * DELETE /api/sppg/distribution/execution/[id]
 * Delete execution (only if not started)
 */
export async function DELETE(
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

    // 4. Business Logic Validation
    if (execution.status !== 'SCHEDULED') {
      return Response.json({ 
        error: 'Hanya execution dengan status SCHEDULED yang dapat dihapus' 
      }, { status: 400 })
    }

    // 5. Delete Execution
    await db.foodDistribution.delete({
      where: { id },
    })

    return Response.json({ 
      success: true,
      message: 'Execution deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/sppg/distribution/execution/[id] error:', error)
    
    return Response.json({ 
      error: 'Failed to delete execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
