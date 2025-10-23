/**
 * @fileoverview Regional Regencies API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/regencies
 * Fetch regencies, optionally filtered by province
 * @param searchParams.provinceId - Optional province ID to filter
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get province filter from query params
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get('provinceId')

    // Fetch regencies with optional province filter
    const regencies = await db.regency.findMany({
      where: provinceId ? {
        provinceId: provinceId
      } : undefined,
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        provinceId: true,
        code: true,
        name: true,
        type: true,
        province: {
          select: {
            name: true
          }
        }
      }
    })

    return Response.json({ 
      success: true, 
      data: regencies 
    })
  } catch (error) {
    console.error('GET /api/sppg/regional/regencies error:', error)
    return Response.json({ 
      error: 'Failed to fetch regencies',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
