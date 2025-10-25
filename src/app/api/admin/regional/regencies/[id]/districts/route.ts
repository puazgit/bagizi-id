/**
 * @fileoverview Admin Cascading Districts by Regency Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch districts for cascade select component (Regency → District)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/regional/regencies/[id]/districts
 * Fetch districts by regency ID for cascade dropdown
 * 
 * @rbac Protected by withAdminAuth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id: regencyId } = await params

      // Fetch districts for this regency
      const districts = await db.district.findMany({
        where: {
          regencyId,
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
      const options = districts.map((district) => ({
        value: district.id,
        label: district.name,
        code: district.code,
      }))

      return NextResponse.json({
        success: true,
        data: options,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/regencies/[id]/districts error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch districts',
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
