/**
 * @fileoverview Admin Regional Statistics API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withAdminAuth (admin roles only)
 * - Returns aggregated regional data statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/regional/statistics
 * Fetch regional data statistics (for admin dashboard)
 * 
 * @rbac Protected by withAdminAuth
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('[GET Statistics] Fetching regional statistics...')

      // Fetch all counts in parallel for performance
      const [
        provinceCount,
        regencyCount,
        districtCount,
        villageCount,
      ] = await Promise.all([
        db.province.count(),
        db.regency.count(),
        db.district.count(),
        db.village.count(),
      ])

      const statistics = {
        totalProvinces: provinceCount,
        totalRegencies: regencyCount,
        totalDistricts: districtCount,
        totalVillages: villageCount,
        lastUpdated: new Date(),
      }

      console.log('[GET Statistics] Statistics:', statistics)

      return NextResponse.json({
        success: true,
        data: statistics,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/statistics error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch regional statistics',
          details:
            process.env.NODE_ENV === 'development'
              ? (error as Error).message
              : undefined,
        },
        { status: 500 }
      )
    }
  })
}
