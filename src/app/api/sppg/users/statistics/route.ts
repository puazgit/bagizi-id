/**
 * @fileoverview SPPG User Statistics API
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * API Endpoint:
 * - GET /api/sppg/users/statistics - Get user statistics
 * 
 * @rbac Protected by withSppgAuth
 * - All SPPG roles can view statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { UserRole, UserType } from '@prisma/client'

/**
 * GET /api/sppg/users/statistics
 * Get aggregated user statistics for SPPG
 * 
 * Returns:
 * - Total users count
 * - Active/inactive counts
 * - Count by role
 * - Count by type
 * - Recently added users count (last 7 days)
 * 
 * @rbac All SPPG roles can view statistics
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Multi-tenant safety: Must have sppgId
      if (!session.user.sppgId) {
        return NextResponse.json({
          success: false,
          error: 'SPPG access required'
        }, { status: 403 })
      }

      const whereClause = { sppgId: session.user.sppgId }

      // Count total users
      const totalUsers = await db.user.count({ where: whereClause })

      // Count active users
      const activeUsers = await db.user.count({
        where: {
          ...whereClause,
          isActive: true,
        }
      })

      // Count inactive users
      const inactiveUsers = totalUsers - activeUsers

      // Count by role
      const byRole: Record<string, number> = {}
      const roleValues = Object.values(UserRole)
      
      for (const role of roleValues) {
        const count = await db.user.count({
          where: {
            ...whereClause,
            userRole: role,
          }
        })
        if (count > 0) {
          byRole[role] = count
        }
      }

      // Count by type
      const byType: Record<string, number> = {}
      const typeValues = Object.values(UserType)
      
      for (const type of typeValues) {
        const count = await db.user.count({
          where: {
            ...whereClause,
            userType: type,
          }
        })
        if (count > 0) {
          byType[type] = count
        }
      }

      // Count by status
      const byStatus = {
        active: activeUsers,
        inactive: inactiveUsers,
      }

      // Count recently added (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentlyAdded = await db.user.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: sevenDaysAgo,
          }
        }
      })

      // Count users with verified email
      const emailVerified = await db.user.count({
        where: {
          ...whereClause,
          isEmailVerified: true,
        }
      })

      // Count users with 2FA enabled
      const twoFactorEnabled = await db.user.count({
        where: {
          ...whereClause,
          twoFactorEnabled: true,
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          byRole,
          byType,
          byStatus,
          recentlyAdded,
          emailVerified,
          twoFactorEnabled,
        }
      })
    } catch (error) {
      console.error('GET /api/sppg/users/statistics error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch user statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
