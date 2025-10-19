/**
 * @fileoverview SPPG User Detail API Route - GET Single User
 * @route /api/sppg/users/[id]
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @description Get single user details for SPPG
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/users/[id]
 * Get single user details with SPPG access validation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

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
      return Response.json({
        error: 'User not found or access denied',
      }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('GET /api/sppg/users/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to fetch user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
