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

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

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
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Get Distribution ID from params
      const { id } = await params

      // Fetch Distribution with multi-tenant security
      const distribution = await db.foodDistribution.findFirst({
        where: { 
          id,
          sppgId: session.user.sppgId!
        },
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
      return NextResponse.json({ 
        success: false,
        error: 'Distribution not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: distribution
    })

  } catch (error) {
    console.error('GET /api/sppg/distribution/[id] error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch distribution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
})
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
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Get Distribution ID from params
      const { id } = await params

      // Verify Distribution Exists and Ownership
      const distribution = await db.foodDistribution.findFirst({
        where: { 
          id,
          sppgId: session.user.sppgId!
        },
        select: {
          id: true,
          status: true,
          sppgId: true,
        }
      })

      if (!distribution) {
        return NextResponse.json({ 
          success: false,
          error: 'Distribution not found' 
        }, { status: 404 })
      }

      // Check if distribution can be deleted
      if (distribution.status === 'IN_TRANSIT' || distribution.status === 'DISTRIBUTING') {
        return NextResponse.json({ 
          success: false,
          error: 'Cannot delete distribution that is in progress',
          details: 'Complete or cancel the distribution first'
        }, { status: 400 })
      }

      // Delete Distribution (Cascade deletes related data)
      await db.foodDistribution.delete({
        where: { id }
      })

      return NextResponse.json({
        success: true,
        message: 'Distribution deleted successfully'
      })

    } catch (error) {
      console.error('DELETE /api/sppg/distribution/[id] error:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to delete distribution',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
