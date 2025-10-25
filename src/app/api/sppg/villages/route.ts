/**
 * @fileoverview Villages API endpoint
 * @version Next.js 15.5.4 / App Router API
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging for all operations
 * - Multi-tenant safe: Villages are shared platform data (no sppgId filtering needed)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/villages
 * Get all villages with location hierarchy
 * 
 * Note: Villages are shared platform data (no sppgId filtering)
 * Auth required for security but villages accessible to all SPPG users
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async () => {
    try {
      // Fetch villages with hierarchical location data
      const villages = await db.village.findMany({
        select: {
          id: true,
          districtId: true,
          code: true,
          name: true,
          type: true,
          postalCode: true,
          district: {
            select: {
              id: true,
              name: true,
              regency: {
                select: {
                  id: true,
                  name: true,
                  province: {
                    select: {
                      id: true,
                      name: true,
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { district: { regency: { province: { name: 'asc' } } } },
          { district: { regency: { name: 'asc' } } },
          { district: { name: 'asc' } },
          { name: 'asc' }
        ],
        take: 1000, // Limit for performance
      })

      return NextResponse.json({ 
        success: true, 
        data: villages 
      })
    } catch (error) {
      console.error('GET /api/sppg/villages error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch villages',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
