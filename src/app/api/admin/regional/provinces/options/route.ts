/**
 * @fileoverview Admin Province Options Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch provinces as cascade options (simplified format for dropdowns)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/regional/provinces/options
 * Fetch all provinces as cascade options for dropdown
 * 
 * @rbac Protected by withAdminAuth
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      // Fetch all provinces
      const provinces = await db.province.findMany({
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
      const options = provinces.map((province) => ({
        value: province.id,
        label: province.name,
        code: province.code,
      }))

      return NextResponse.json({
        success: true,
        data: options,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/provinces/options error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch province options',
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
