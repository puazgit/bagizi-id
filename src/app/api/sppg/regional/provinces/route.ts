/**
 * @fileoverview Regional Provinces API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging
 * - Platform data: Provinces shared across all SPPG
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/provinces
 * Fetch all provinces
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async () => {
    try {
      // Fetch all provinces (sorted by name)
      const provinces = await db.province.findMany({
        orderBy: {
          name: 'asc'
        },
        select: {
          id: true,
          code: true,
          name: true,
          region: true,
          timezone: true,
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: provinces 
      })
    } catch (error) {
      console.error('GET /api/sppg/regional/provinces error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch provinces',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
