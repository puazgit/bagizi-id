/**
 * @fileoverview Regional Districts API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging
 * - Platform data: Districts shared across all SPPG
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/districts
 * Fetch districts, optionally filtered by regency
 * 
 * @param searchParams.regencyId - Optional regency ID to filter
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async () => {
    try {
      // Get regency filter from query params
      const { searchParams } = new URL(request.url)
      const regencyId = searchParams.get('regencyId')

      // Fetch districts with optional regency filter
      const districts = await db.district.findMany({
        where: regencyId ? {
          regencyId: regencyId
        } : undefined,
        orderBy: {
          name: 'asc'
        },
        select: {
          id: true,
          regencyId: true,
          code: true,
          name: true,
          regency: {
            select: {
              name: true
            }
          }
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: districts 
      })
    } catch (error) {
      console.error('GET /api/sppg/regional/districts error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch districts',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
