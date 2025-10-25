/**
 * @fileoverview User Statistics API Endpoint
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/users/statistics
 * Get user statistics for dashboard
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('📊 [GET /api/admin/users/statistics] Request started')

      // Get current date boundaries
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Parallel queries for better performance
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        lockedUsers,
        usersByRole,
        usersByType,
        usersBySppg,
        recentlyAddedCount,
        recentlyActiveCount
      ] = await Promise.all([
        // Total users
        db.user.count(),
        
        // Active users
        db.user.count({ where: { isActive: true } }),
        
        // Inactive users
        db.user.count({ where: { isActive: false } }),
        
        // Verified users
        db.user.count({ where: { emailVerified: { not: null } } }),
        
        // Unverified users
        db.user.count({ where: { emailVerified: null } }),
        
        // Locked users
        db.user.count({ 
          where: { 
            lockedUntil: { gt: now } 
          } 
        }),
        
        // Users by role
        db.user.groupBy({
          by: ['userRole'],
          _count: true
        }),
        
        // Users by type
        db.user.groupBy({
          by: ['userType'],
          _count: true
        }),
        
        // Users by SPPG
        db.user.groupBy({
          by: ['sppgId'],
          where: { sppgId: { not: null } },
          _count: true
        }).then(async (groups) => {
          // Fetch SPPG details for each group
          const sppgIds = groups.map(g => g.sppgId).filter(Boolean) as string[]
          const sppgs = await db.sPPG.findMany({
            where: { id: { in: sppgIds } },
            select: { id: true, name: true, code: true }
          })
          
          return groups.map(group => ({
            sppgId: group.sppgId as string,
            sppgName: sppgs.find(s => s.id === group.sppgId)?.name || 'Unknown',
            sppgCode: sppgs.find(s => s.id === group.sppgId)?.code || 'Unknown',
            userCount: group._count
          }))
        }),
        
        // Recently added (last 7 days)
        db.user.count({
          where: {
            createdAt: { gte: sevenDaysAgo }
          }
        }),
        
        // Recently active (last 24 hours)
        db.user.count({
          where: {
            lastLogin: { gte: twentyFourHoursAgo }
          }
        })
      ])

      // Transform usersByRole to Record<string, number>
      const byRole: Record<string, number> = {}
      usersByRole.forEach(group => {
        if (group.userRole) {
          byRole[group.userRole] = group._count
        }
      })

      // Transform usersByType to Record<string, number>
      const byType: Record<string, number> = {}
      usersByType.forEach(group => {
        byType[group.userType] = group._count
      })

      const statistics = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        lockedUsers,
        byRole,
        byType,
        bySppg: usersBySppg,
        recentlyAdded: recentlyAddedCount,
        recentlyActive: recentlyActiveCount
      }

      console.log('✅ [GET /api/admin/users/statistics] Statistics generated')

      return NextResponse.json({ 
        success: true, 
        data: statistics 
      })

    } catch (error) {
      console.error('❌ [GET /api/admin/users/statistics] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch user statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
