/**
 * @fileoverview Regional Districts API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/districts
 * Fetch districts, optionally filtered by regency
 * @param searchParams.regencyId - Optional regency ID to filter
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return Response.json({ 
      success: true, 
      data: districts 
    })
  } catch (error) {
    console.error('GET /api/sppg/regional/districts error:', error)
    return Response.json({ 
      error: 'Failed to fetch districts',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
