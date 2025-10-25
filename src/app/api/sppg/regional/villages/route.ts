/**
 * @fileoverview Regional Villages API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging
 * - Platform data: Villages shared across all SPPG
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/villages
 * Fetch villages, optionally filtered by district
 * 
 * @param searchParams.districtId - Optional district ID to filter
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async () => {
    try {
      // Get district filter from query params
      const { searchParams } = new URL(request.url)
      const districtId = searchParams.get('districtId')

      // Fetch villages with optional district filter
      const villages = await db.village.findMany({
        where: districtId ? {
          districtId: districtId
        } : undefined,
        orderBy: {
          name: 'asc'
        },
        select: {
          id: true,
          districtId: true,
          code: true,
          name: true,
          type: true,
          postalCode: true,
          district: {
            select: {
              name: true,
              regency: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: villages 
      })
    } catch (error) {
      console.error('GET /api/sppg/regional/villages error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch villages',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
