/**
 * @fileoverview Admin Regional Regencies API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withAdminAuth (admin roles only)
 * - Automatic audit logging
 * - Cascading data: Regencies belong to provinces
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createRegencySchema } from '@/features/admin/regional-data/schemas'

/**
 * GET /api/admin/regional/regencies
 * Fetch all regencies with optional province filter
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const provinceId = searchParams.get('provinceId')
      const search = searchParams.get('search')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '100')
      const sortBy = searchParams.get('sortBy') || 'code'
      const sortOrder = searchParams.get('sortOrder') || 'asc'

      // Build where clause
      const where: {
        provinceId?: string
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' }
          code?: { contains: string; mode: 'insensitive' }
        }>
      } = {}

      if (provinceId) {
        where.provinceId = provinceId
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
        ]
      }

      // Fetch total count
      const total = await db.regency.count({ where })

      // Fetch regencies with pagination
      const regencies = await db.regency.findMany({
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
          type: true,
          provinceId: true,
          province: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              districts: true,
            },
          },
        },
      })

      // Transform data to include provinceName and districtCount
      const transformedData = regencies.map((regency) => ({
        id: regency.id,
        code: regency.code,
        name: regency.name,
        type: regency.type,
        provinceId: regency.provinceId,
        provinceName: regency.province?.name || '',
        districtCount: regency._count.districts,
        typeLabel: regency.type === 'CITY' ? 'Kota' : 'Kabupaten',
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
      console.error('GET /api/admin/regional/regencies error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch regencies',
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
 * POST /api/admin/regional/regencies
 * Create new regency
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('[POST Regency] Creating new regency')

      const body = await request.json()
      
      // Validate input
      const validated = createRegencySchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Check if province exists
      const provinceExists = await db.province.findUnique({
        where: { id: validated.data.provinceId },
      })

      if (!provinceExists) {
        return NextResponse.json(
          { error: 'Province not found' },
          { status: 404 }
        )
      }

      // Check for duplicate code (compound unique: provinceId + code)
      const existing = await db.regency.findUnique({
        where: {
          provinceId_code: {
            provinceId: validated.data.provinceId,
            code: validated.data.code,
          },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Regency code already exists' },
          { status: 409 }
        )
      }

      // Create regency
      const regency = await db.regency.create({
        data: validated.data,
        include: {
          province: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              districts: true,
              sppgs: true,
            },
          },
        },
      })

      console.log('[POST Regency] Created:', regency.name)

      return NextResponse.json(
        {
          success: true,
          data: regency,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/admin/regional/regencies error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create regency',
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
