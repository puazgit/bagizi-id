/**
 * @fileoverview Admin Regional Districts API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withAdminAuth (admin roles only)
 * - Automatic audit logging
 * - Cascading data: Districts belong to regencies
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createDistrictSchema } from '@/features/admin/regional-data/schemas'

/**
 * GET /api/admin/regional/districts
 * Fetch all districts with optional regency filter
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const regencyId = searchParams.get('regencyId')
      const search = searchParams.get('search')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '100')
      const sortBy = searchParams.get('sortBy') || 'code'
      const sortOrder = searchParams.get('sortOrder') || 'asc'

      // Build where clause
      const where: {
        regencyId?: string
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' }
          code?: { contains: string; mode: 'insensitive' }
        }>
      } = {}

      if (regencyId) {
        where.regencyId = regencyId
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
        ]
      }

      // Fetch total count
      const total = await db.district.count({ where })

      // Fetch districts with pagination
      const districts = await db.district.findMany({
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
          regencyId: true,
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
          _count: {
            select: {
              villages: true,
            },
          },
        },
      })

      // Transform data to include regencyName, provinceName, and villageCount
      const transformedData = districts.map((district) => ({
        id: district.id,
        code: district.code,
        name: district.name,
        regencyId: district.regencyId,
        regencyName: district.regency?.name || '',
        provinceName: district.regency?.province?.name || '',
        villageCount: district._count.villages,
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
      console.error('GET /api/admin/regional/districts error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch districts',
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
 * POST /api/admin/regional/districts
 * Create new district
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('[POST District] Creating new district')

      const body = await request.json()
      
      // Validate input
      const validated = createDistrictSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Check if regency exists
      const regencyExists = await db.regency.findUnique({
        where: { id: validated.data.regencyId },
      })

      if (!regencyExists) {
        return NextResponse.json(
          { error: 'Regency not found' },
          { status: 404 }
        )
      }

      // Check for duplicate code (compound unique: regencyId + code)
      const existing = await db.district.findUnique({
        where: {
          regencyId_code: {
            regencyId: validated.data.regencyId,
            code: validated.data.code,
          },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'District code already exists' },
          { status: 409 }
        )
      }

      // Create district
      const district = await db.district.create({
        data: validated.data,
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
          _count: {
            select: {
              villages: true,
            },
          },
        },
      })

      console.log('[POST District] Created:', district.name)

      return NextResponse.json(
        {
          success: true,
          data: district,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/admin/regional/districts error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create district',
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
