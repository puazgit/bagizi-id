/**
 * @fileoverview SPPG Users API Route - GET Users with Role Filtering
 * @route /api/sppg/users
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @description List SPPG users with optional role filtering for ProductionForm chef selection
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/users
 * Get SPPG users with optional role filtering
 * 
 * Query Parameters:
 * - role: UserRole (optional) - Filter by specific role (e.g., SPPG_STAFF_DAPUR)
 * - search: string (optional) - Search by name or email
 * - status: string (optional) - Filter by user status
 * 
 * Examples:
 * - GET /api/sppg/users - Get all users
 * - GET /api/sppg/users?role=SPPG_STAFF_DAPUR - Get kitchen staff
 * - GET /api/sppg/users?role=SPPG_AHLI_GIZI - Get nutritionists
 * - GET /api/sppg/users?search=john - Search users
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const roleParam = searchParams.get('role')
    const searchParam = searchParams.get('search')
    const statusParam = searchParams.get('status')

    // Build where clause with multi-tenant filtering
    const whereClause: {
      sppgId: string
      userRole?: UserRole
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        email?: { contains: string; mode: 'insensitive' }
      }>
      isActive?: boolean
    } = {
      sppgId: session.user.sppgId, // Multi-tenant safety (CRITICAL!)
    }

    // Add role filtering if provided
    if (roleParam) {
      // Validate role is a valid UserRole enum
      const validRoles = Object.values(UserRole)
      if (validRoles.includes(roleParam as UserRole)) {
        whereClause.userRole = roleParam as UserRole
      } else {
        return Response.json({
          error: 'Invalid role parameter',
          validRoles,
        }, { status: 400 })
      }
    }

    // Add search filtering
    if (searchParam) {
      whereClause.OR = [
        { name: { contains: searchParam, mode: 'insensitive' } },
        { email: { contains: searchParam, mode: 'insensitive' } },
      ]
    }

    // Add status filtering
    if (statusParam) {
      whereClause.isActive = statusParam === 'active'
    }

    // Fetch users with optimized selection
    const users = await db.user.findMany({
      where: whereClause,
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
      },
      orderBy: {
        name: 'asc',
      },
    })

    return Response.json({
      success: true,
      data: users,
      meta: {
        total: users.length,
        filters: {
          role: roleParam || undefined,
          search: searchParam || undefined,
          status: statusParam || undefined,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/users error:', error)
    return Response.json(
      {
        error: 'Failed to fetch users',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
