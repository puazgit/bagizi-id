/**
 * @fileoverview Admin Regional District Detail API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withAdminAuth (admin roles only)
 * - PUT: Protected by withAdminAuth (admin roles only)
 * - DELETE: Protected by withAdminAuth (admin roles only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateDistrictSchema } from '@/features/admin/regional-data/schemas'

/**
 * GET /api/admin/regional/districts/[id]
 * Fetch single district by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[GET District] Fetching district:', id)

      const district = await db.district.findUnique({
        where: { id: id },
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

      if (!district) {
        return NextResponse.json(
          { error: 'District not found' },
          { status: 404 }
        )
      }

      console.log('[GET District] Found:', district.name)

      // Transform data to include provinceId at regency level for easier access
      const districtWithProvinceId = {
        ...district,
        regency: district.regency ? {
          ...district.regency,
          provinceId: district.regency.province?.id, // Add provinceId for cascade
        } : undefined
      }

      return NextResponse.json({
        success: true,
        data: districtWithProvinceId,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/districts/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch district',
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
 * PUT /api/admin/regional/districts/[id]
 * Update district
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[PUT District] Updating district:', id)

      const body = await request.json()
      
      // Validate input
      const validated = updateDistrictSchema.safeParse(body)
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
      const existing = await db.district.findUnique({
        where: { id: id },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'District not found' },
          { status: 404 }
        )
      }

      // Check for duplicate code if code OR regencyId is being updated
      if (validated.data.code || validated.data.regencyId) {
        const newCode = validated.data.code || existing.code
        const newRegencyId = validated.data.regencyId || existing.regencyId
        
        const duplicate = await db.district.findUnique({
          where: {
            regencyId_code: {
              regencyId: newRegencyId,
              code: newCode,
            },
          },
        })

        if (duplicate && duplicate.id !== id) {
          return NextResponse.json(
            { error: 'District code already exists in this regency' },
            { status: 409 }
          )
        }
      }

      // If regencyId is being updated, verify it exists
      if (validated.data.regencyId) {
        const regencyExists = await db.regency.findUnique({
          where: { id: validated.data.regencyId },
        })

        if (!regencyExists) {
          return NextResponse.json(
            { error: 'Regency not found' },
            { status: 404 }
          )
        }
      }

      // Update district
      const updated = await db.district.update({
        where: { id: id },
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

      console.log('[PUT District] Updated:', updated.name)

      return NextResponse.json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('PUT /api/admin/regional/districts/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update district',
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
 * DELETE /api/admin/regional/districts/[id]
 * Delete district (with validation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[DELETE District] Deleting district:', id)

      // Check if district exists
      const district = await db.district.findUnique({
        where: { id: id },
        include: {
          _count: {
            select: {
              villages: true,
            },
          },
        },
      })

      if (!district) {
        return NextResponse.json(
          { error: 'District not found' },
          { status: 404 }
        )
      }

      // Check if district has dependencies
      if (district._count.villages > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete district with existing villages',
            details: `District has ${district._count.villages} villages`,
          },
          { status: 409 }
        )
      }

      // Delete district
      await db.district.delete({
        where: { id: id },
      })

      console.log('[DELETE District] Deleted:', district.name)

      return NextResponse.json({
        success: true,
        message: 'District deleted successfully',
      })
    } catch (error) {
      console.error('DELETE /api/admin/regional/districts/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete district',
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
