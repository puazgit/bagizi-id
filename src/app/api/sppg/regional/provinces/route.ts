/**
 * @fileoverview Regional Provinces API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 */

import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/provinces
 * Fetch all provinces
 */
export async function GET() {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return Response.json({ 
      success: true, 
      data: provinces 
    })
  } catch (error) {
    console.error('GET /api/sppg/regional/provinces error:', error)
    return Response.json({ 
      error: 'Failed to fetch provinces',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
