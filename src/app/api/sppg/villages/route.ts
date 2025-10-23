/**
 * @fileoverview Villages API endpoint
 * @version Next.js 15.5.4 / App Router API
 * @author Bagizi-ID Development Team
 */

import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/villages
 * Get all villages with location hierarchy
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return Response.json({ 
      success: true, 
      data: villages 
    })
  } catch (error) {
    console.error('GET /api/sppg/villages error:', error)
    return Response.json({ 
      error: 'Failed to fetch villages',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
