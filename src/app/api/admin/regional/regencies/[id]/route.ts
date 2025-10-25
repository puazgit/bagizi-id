/**
 * @fileoverview Admin Regional Regency Detail API Endpoint
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
import { updateRegencySchema } from '@/features/admin/regional-data/schemas'

/**
 * GET /api/admin/regional/regencies/[id]
 * Fetch single regency by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[GET Regency] Fetching regency:', id)

      const regency = await db.regency.findUnique({
        where: { id: id },
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

      if (!regency) {
        return NextResponse.json(
          { error: 'Regency not found' },
          { status: 404 }
        )
      }

      console.log('[GET Regency] Found:', regency.name)

      return NextResponse.json({
        success: true,
        data: regency,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/regencies/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch regency',
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
 * PUT /api/admin/regional/regencies/[id]
 * Update regency
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[PUT Regency] Updating regency:', id)

      const body = await request.json()
      
      // Validate input
      const validated = updateRegencySchema.safeParse(body)
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
      const existing = await db.regency.findUnique({
        where: { id: id },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Regency not found' },
          { status: 404 }
        )
      }

      // Check for duplicate code if code OR provinceId is being updated
      if (validated.data.code || validated.data.provinceId) {
        const newCode = validated.data.code || existing.code
        const newProvinceId = validated.data.provinceId || existing.provinceId
        
        const duplicate = await db.regency.findUnique({
          where: {
            provinceId_code: {
              provinceId: newProvinceId,
              code: newCode,
            },
          },
        })

        if (duplicate && duplicate.id !== id) {
          return NextResponse.json(
            { error: 'Regency code already exists in this province' },
            { status: 409 }
          )
        }
      }

      // If provinceId is being updated, verify it exists
      if (validated.data.provinceId) {
        const provinceExists = await db.province.findUnique({
          where: { id: validated.data.provinceId },
        })

        if (!provinceExists) {
          return NextResponse.json(
            { error: 'Province not found' },
            { status: 404 }
          )
        }
      }

      // Update regency
      const updated = await db.regency.update({
        where: { id: id },
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

      console.log('[PUT Regency] Updated:', updated.name)

      return NextResponse.json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('PUT /api/admin/regional/regencies/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update regency',
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
 * DELETE /api/admin/regional/regencies/[id]
 * Delete regency (with validation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[DELETE Regency] Deleting regency:', id)

      // Check if regency exists
      const regency = await db.regency.findUnique({
        where: { id: id },
        include: {
          _count: {
            select: {
              districts: true,
              sppgs: true,
            },
          },
        },
      })

      if (!regency) {
        return NextResponse.json(
          { error: 'Regency not found' },
          { status: 404 }
        )
      }

      // Check if regency has dependencies
      if (regency._count.districts > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete regency with existing districts',
            details: `Regency has ${regency._count.districts} districts`,
          },
          { status: 409 }
        )
      }

      if (regency._count.sppgs > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete regency with existing SPPGs',
            details: `Regency has ${regency._count.sppgs} SPPGs`,
          },
          { status: 409 }
        )
      }

      // Delete regency
      await db.regency.delete({
        where: { id: id },
      })

      console.log('[DELETE Regency] Deleted:', regency.name)

      return NextResponse.json({
        success: true,
        message: 'Regency deleted successfully',
      })
    } catch (error) {
      console.error('DELETE /api/admin/regional/regencies/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete regency',
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
