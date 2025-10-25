/**
 * @fileoverview Admin Regional Provinces API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withAdminAuth (admin roles only)
 * - Automatic audit logging
 * - Platform data: Provinces are master data shared across all SPPG
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createProvinceSchema } from '@/features/admin/regional-data/schemas'
import type { IndonesiaRegion, Timezone } from '@prisma/client'

/**
 * Helper function to get region label
 */
function getRegionLabel(region: IndonesiaRegion): string {
  const labels: Record<IndonesiaRegion, string> = {
    SUMATERA: 'Sumatera',
    JAWA: 'Jawa',
    KALIMANTAN: 'Kalimantan',
    SULAWESI: 'Sulawesi',
    PAPUA: 'Papua',
    BALI_NUSRA: 'Bali & Nusa Tenggara',
    MALUKU: 'Maluku',
  }
  return labels[region] || region
}

/**
 * Helper function to get timezone label
 */
function getTimezoneLabel(timezone: Timezone): string {
  const labels: Record<Timezone, string> = {
    WIB: 'WIB',
    WITA: 'WITA',
    WIT: 'WIT',
  }
  return labels[timezone] || timezone
}

/**
 * GET /api/admin/regional/provinces
 * Fetch all provinces (for SPPG management - admin only)
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '100')
      const sortBy = searchParams.get('sortBy') || 'code'
      const sortOrder = searchParams.get('sortOrder') || 'asc'

      console.log('[GET Provinces] Starting fetch with params:', { search, page, limit, sortBy, sortOrder })

      // Build where clause for search
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}

      // Fetch total count
      const total = await db.province.count({ where })
      console.log('[GET Provinces] Total count:', total)

      // Fetch provinces with pagination
      const provinces = await db.province.findMany({
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
          region: true,
          timezone: true,
          _count: {
            select: {
              regencies: true,
            },
          },
        },
      })

      console.log('[GET Provinces] Found provinces:', provinces.length)
      console.log('[GET Provinces] Sample data:', provinces[0])

      // Transform data to include regencyCount and labels
      const transformedData = provinces.map((province) => ({
        id: province.id,
        code: province.code,
        name: province.name,
        region: province.region,
        timezone: province.timezone,
        regencyCount: province._count.regencies,
        regionLabel: getRegionLabel(province.region),
        timezoneLabel: getTimezoneLabel(province.timezone),
      }))

      const response = {
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
      }

      console.log('[GET Provinces] Returning response structure:', {
        success: response.success,
        dataCount: response.data.data.length,
        pagination: response.data.pagination
      })

      return NextResponse.json(response)
    } catch (error) {
      console.error('GET /api/admin/regional/provinces error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch provinces',
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
 * POST /api/admin/regional/provinces
 * Create new province
 * 
 * @rbac Protected by withAdminAuth
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('[POST Province] Creating new province')

      const body = await request.json()
      
      // Validate input
      const validated = createProvinceSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Check for duplicate code
      const existing = await db.province.findUnique({
        where: { code: validated.data.code },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Province code already exists' },
          { status: 409 }
        )
      }

      // Create province
      const province = await db.province.create({
        data: validated.data,
        include: {
          _count: {
            select: {
              regencies: true,
              sppgs: true,
            },
          },
        },
      })

      console.log('[POST Province] Created:', province.name)

      return NextResponse.json(
        {
          success: true,
          data: province,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/admin/regional/provinces error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create province',
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
