/**
 * @fileoverview Admin Regional Province Detail API Endpoint
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
import { updateProvinceSchema } from '@/features/admin/regional-data/schemas'

/**
 * GET /api/admin/regional/provinces/[id]
 * Fetch single province by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      console.log('[GET Province] Fetching province:', id)

      const province = await db.province.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              regencies: true,
              sppgs: true,
            },
          },
        },
      })

      if (!province) {
        return NextResponse.json(
          { error: 'Province not found' },
          { status: 404 }
        )
      }

      console.log('[GET Province] Found:', province.name)

      return NextResponse.json({
        success: true,
        data: province,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/provinces/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch province',
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
 * PUT /api/admin/regional/provinces/[id]
 * Update province
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      console.log('[PUT Province] Updating province:', id)

      const body = await request.json()
      
      // Validate input
      const validated = updateProvinceSchema.safeParse(body)
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
      const existing = await db.province.findUnique({
        where: { id },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Province not found' },
          { status: 404 }
        )
      }

      // Check for duplicate code if code is being updated
      if (validated.data.code && validated.data.code !== existing.code) {
        const duplicate = await db.province.findUnique({
          where: { code: validated.data.code },
        })

        if (duplicate) {
          return NextResponse.json(
            { error: 'Province code already exists' },
            { status: 409 }
          )
        }
      }

      // Update province
      const updated = await db.province.update({
        where: { id },
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

      console.log('[PUT Province] Updated:', updated.name)

      return NextResponse.json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('PUT /api/admin/regional/provinces/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update province',
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
 * DELETE /api/admin/regional/provinces/[id]
 * Delete province (with validation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      console.log('[DELETE Province] Deleting province:', id)

      // Check if province exists
      const province = await db.province.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              regencies: true,
              sppgs: true,
            },
          },
        },
      })

      if (!province) {
        return NextResponse.json(
          { error: 'Province not found' },
          { status: 404 }
        )
      }

      // Check if province has dependencies
      if (province._count.regencies > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete province with existing regencies',
            details: `Province has ${province._count.regencies} regencies`,
          },
          { status: 409 }
        )
      }

      if (province._count.sppgs > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete province with existing SPPGs',
            details: `Province has ${province._count.sppgs} SPPGs`,
          },
          { status: 409 }
        )
      }

      // Delete province
      await db.province.delete({
        where: { id },
      })

      console.log('[DELETE Province] Deleted:', province.name)

      return NextResponse.json({
        success: true,
        message: 'Province deleted successfully',
      })
    } catch (error) {
      console.error('DELETE /api/admin/regional/provinces/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete province',
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
