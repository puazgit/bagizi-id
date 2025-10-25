/**
 * @fileoverview Admin Cascading Regencies by Province Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch regencies for cascade select component (Province → Regency)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/regional/provinces/[id]/regencies
 * Fetch regencies by province ID for cascade dropdown
 * 
 * @rbac Protected by withAdminAuth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id: provinceId } = await params

      // Fetch regencies for this province
      const regencies = await db.regency.findMany({
        where: {
          provinceId,
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
      const options = regencies.map((regency) => ({
        value: regency.id,
        label: regency.name,
        code: regency.code,
      }))

      return NextResponse.json({
        success: true,
        data: options,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/provinces/[id]/regencies error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch regencies',
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
