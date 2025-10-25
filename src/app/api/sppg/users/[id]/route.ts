/**
 * @fileoverview SPPG User Detail API Route - GET Single User
 * @route /api/sppg/users/[id]
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @description Get single user details for SPPG
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging for all operations
 * - Multi-tenant: User must belong to requesting SPPG
 * - Critical: Ownership verification via sppgId match
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/users/[id]
 * Get single user details with SPPG access validation
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Fetch user with multi-tenant filtering
      const user = await db.user.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId, // Multi-tenant safety (CRITICAL!)
        },
        select: {
          id: true,
          name: true,
          email: true,
          userRole: true,
          phone: true,
          isActive: true,
          profileImage: true,
          jobTitle: true,
          department: true,
          createdAt: true,
          updatedAt: true,
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })

      if (!user) {
        return NextResponse.json({
          error: 'User not found or access denied',
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: user,
      })
    } catch (error) {
      console.error('GET /api/sppg/users/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch user',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
