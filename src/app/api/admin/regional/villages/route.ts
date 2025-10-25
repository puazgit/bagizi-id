/**
 * @fileoverview Admin Regional Villages API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withAdminAuth (admin roles only)
 * - Automatic audit logging
 * - Cascading data: Villages belong to districts
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createVillageSchema } from '@/features/admin/regional-data/schemas'

/**
 * GET /api/admin/regional/villages
 * Fetch all villages with optional district filter
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const districtId = searchParams.get('districtId')
      const search = searchParams.get('search')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '100')
      const sortBy = searchParams.get('sortBy') || 'code'
      const sortOrder = searchParams.get('sortOrder') || 'asc'

      // Build where clause
      const where: {
        districtId?: string
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' }
          code?: { contains: string; mode: 'insensitive' }
        }>
      } = {}

      if (districtId) {
        where.districtId = districtId
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
        ]
      }

      // Fetch total count
      const total = await db.village.count({ where })

      // Fetch villages with pagination
      const villages = await db.village.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          code: true,
          name: true,
          type: true,               // ✅ Added type field (URBAN_VILLAGE or RURAL_VILLAGE)
          postalCode: true,         // ✅ Added postalCode field
          districtId: true,
          district: {
            select: {
              id: true,
              name: true,
              code: true,
              regency: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  province: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      // Transform data to include districtName, regencyName, provinceName
      const transformedData = villages.map((village) => ({
        id: village.id,
        code: village.code,
        name: village.name,
        type: village.type,
        postalCode: village.postalCode,
        districtId: village.districtId,
        districtName: village.district?.name || '',
        regencyName: village.district?.regency?.name || '',
        provinceName: village.district?.regency?.province?.name || '',
        typeLabel: village.type === 'URBAN_VILLAGE' ? 'Kelurahan' : 'Desa',
      }))

      return NextResponse.json({
        success: true,
        data: {
          data: transformedData,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit),
          },
        },
      })
    } catch (error) {
      console.error('GET /api/admin/regional/villages error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch villages',
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

/**
 * POST /api/admin/regional/villages
 * Create new village
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('[POST Village] Creating new village')

      const body = await request.json()
      
      // Validate input
      const validated = createVillageSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Check if district exists
      const districtExists = await db.district.findUnique({
        where: { id: validated.data.districtId },
      })

      if (!districtExists) {
        return NextResponse.json(
          { error: 'District not found' },
          { status: 404 }
        )
      }

      // Check for duplicate code (compound unique: districtId + code)
      const existing = await db.village.findUnique({
        where: {
          districtId_code: {
            districtId: validated.data.districtId,
            code: validated.data.code,
          },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Village code already exists' },
          { status: 409 }
        )
      }

      // Create village
      const village = await db.village.create({
        data: validated.data,
        include: {
          district: {
            include: {
              regency: {
                include: {
                  province: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      console.log('[POST Village] Created:', village.name)

      return NextResponse.json(
        {
          success: true,
          data: village,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/admin/regional/villages error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create village',
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
