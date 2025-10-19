/**
 * @fileoverview Distribution Detail API Routes - Individual distribution operations
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Enterprise API endpoints for individual distribution operations
 * 
 * Routes:
 * - GET /api/sppg/distribution/[id] - Get distribution detail
 * - DELETE /api/sppg/distribution/[id] - Delete distribution (cascade)
 * 
 * Security:
 * - Multi-tenant filtering by sppgId
 * - Ownership verification before operations
 * - Cascade delete handling
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/distribution/[id]
 * 
 * Retrieves detailed information for a specific distribution
 * Includes related schedules, executions, and delivery tracking
 * 
 * @param {string} id - Distribution ID
 * @returns {Promise<Response>} Distribution detail with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
    if (!session.user.sppgId) {
      console.error('[Distribution Detail GET] User has no sppgId:', {
        userId: session.user.id,
        userEmail: session.user.email,
        userRole: session.user.userRole
      })
      return Response.json({ 
        error: 'SPPG access required',
        details: 'User account is not associated with any SPPG. Please contact administrator.'
      }, { status: 403 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      console.error('[Distribution Detail GET] SPPG access check failed:', {
        sppgId: session.user.sppgId,
        userId: session.user.id,
        userEmail: session.user.email
      })
      return Response.json({ 
        error: 'SPPG not found or access denied',
        details: 'SPPG is inactive or does not exist. Please contact administrator.'
      }, { status: 403 })
    }

    // 3. Get Distribution ID from params
    const { id } = await params

    // 4. Fetch Distribution with all relations
    const distribution = await db.foodDistribution.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            sppgId: true,
          }
        },
        issues: {
          orderBy: {
            reportedAt: 'desc'
          }
        },
        vehicleAssignments: {
          include: {
            vehicle: {
              select: {
                vehicleName: true,
                licensePlate: true,
              }
            }
          }
        },
        deliveries: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        schedule: true,
        school: {
          select: {
            schoolName: true,
            schoolAddress: true,
          }
        },
      }
    })

    if (!distribution) {
      return Response.json({ error: 'Distribution not found' }, { status: 404 })
    }

    // 5. Verify Ownership (Multi-tenant Security)
    if (distribution.sppgId !== session.user.sppgId) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    return Response.json({
      success: true,
      data: distribution
    })

  } catch (error) {
    console.error('GET /api/sppg/distribution/[id] error:', error)
    return Response.json({ 
      error: 'Failed to fetch distribution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

/**
 * DELETE /api/sppg/distribution/[id]
 * 
 * Deletes a distribution and all related data (cascade)
 * Includes: schedules, execution items, delivery tracking
 * 
 * @param {string} id - Distribution ID
 * @returns {Promise<Response>} Success confirmation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG not found or access denied' }, { status: 403 })
    }

    // 3. Get Distribution ID from params
    const { id } = await params

    // 4. Verify Distribution Exists and Ownership
    const distribution = await db.foodDistribution.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        sppgId: true,
      }
    })

    if (!distribution) {
      return Response.json({ error: 'Distribution not found' }, { status: 404 })
    }

    // 5. Verify Ownership (Multi-tenant Security)
    if (distribution.sppgId !== session.user.sppgId) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    // 6. Check if distribution can be deleted
    if (distribution.status === 'IN_TRANSIT' || distribution.status === 'DISTRIBUTING') {
      return Response.json({ 
        error: 'Cannot delete distribution that is in progress',
        details: 'Complete or cancel the distribution first'
      }, { status: 400 })
    }

    // 7. Delete Distribution (Cascade deletes related data)
    await db.foodDistribution.delete({
      where: { id }
    })

    return Response.json({
      success: true,
      message: 'Distribution deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/sppg/distribution/[id] error:', error)
    return Response.json({ 
      error: 'Failed to delete distribution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
