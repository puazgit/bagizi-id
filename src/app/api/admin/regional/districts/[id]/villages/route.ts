/**
 * @fileoverview Admin Cascading Villages by District Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch villages for cascade select component (District → Village)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/regional/districts/[id]/villages
 * Fetch villages by district ID for cascade dropdown
 * 
 * @rbac Protected by withAdminAuth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id: districtId } = await params

      // Fetch villages for this district
      const villages = await db.village.findMany({
        where: {
          districtId,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          code: true,
          name: true,
        },
      })

      // Transform to cascade options format
      const options = villages.map((village) => ({
        value: village.id,
        label: village.name,
        code: village.code,
      }))

      return NextResponse.json({
        success: true,
        data: options,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/districts/[id]/villages error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch villages',
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
