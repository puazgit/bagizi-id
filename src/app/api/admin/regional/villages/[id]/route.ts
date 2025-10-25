/**
 * @fileoverview Admin Regional Village Detail API Endpoint
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
import { updateVillageSchema } from '@/features/admin/regional-data/schemas'

/**
 * GET /api/admin/regional/villages/[id]
 * Fetch single village by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[GET Village] Fetching village:', id)

      const village = await db.village.findUnique({
        where: { id: id },
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

      if (!village) {
        return NextResponse.json(
          { error: 'Village not found' },
          { status: 404 }
        )
      }

      console.log('[GET Village] Found:', village.name)

      // Transform data to include regencyId and provinceId for easier cascade access
      const villageWithParentIds = {
        ...village,
        district: village.district ? {
          ...village.district,
          regencyId: village.district.regency?.id, // Add regencyId for cascade
          regency: village.district.regency ? {
            ...village.district.regency,
            provinceId: village.district.regency.province?.id, // Add provinceId for cascade
          } : undefined
        } : undefined
      }

      return NextResponse.json({
        success: true,
        data: villageWithParentIds,
      })
    } catch (error) {
      console.error('GET /api/admin/regional/villages/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch village',
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
 * PUT /api/admin/regional/villages/[id]
 * Update village
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[PUT Village] Updating village:', id)

      const body = await request.json()
      
      // Validate input
      const validated = updateVillageSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Check if village exists
      const existing = await db.village.findUnique({
        where: { id: id },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Village not found' },
          { status: 404 }
        )
      }

      // Check for duplicate code if code OR districtId is being updated
      if (validated.data.code || validated.data.districtId) {
        const newCode = validated.data.code || existing.code
        const newDistrictId = validated.data.districtId || existing.districtId
        
        const duplicate = await db.village.findUnique({
          where: {
            districtId_code: {
              districtId: newDistrictId,
              code: newCode,
            },
          },
        })

        if (duplicate && duplicate.id !== id) {
          return NextResponse.json(
            { error: 'Village code already exists in this district' },
            { status: 409 }
          )
        }
      }

      // If districtId is being updated, verify it exists
      if (validated.data.districtId) {
        const districtExists = await db.district.findUnique({
          where: { id: validated.data.districtId },
        })

        if (!districtExists) {
          return NextResponse.json(
            { error: 'District not found' },
            { status: 404 }
          )
        }
      }

      // Update village
      const updated = await db.village.update({
        where: { id: id },
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

      console.log('[PUT Village] Updated:', updated.name)

      return NextResponse.json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('PUT /api/admin/regional/villages/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update village',
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
 * DELETE /api/admin/regional/villages/[id]
 * Delete village
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    const { id } = await params
    try {
      console.log('[DELETE Village] Deleting village:', id)

      // Check if village exists
      const village = await db.village.findUnique({
        where: { id: id },
      })

      if (!village) {
        return NextResponse.json(
          { error: 'Village not found' },
          { status: 404 }
        )
      }

      // Delete village (no dependencies to check for villages)
      await db.village.delete({
        where: { id: id },
      })

      console.log('[DELETE Village] Deleted:', village.name)

      return NextResponse.json({
        success: true,
        message: 'Village deleted successfully',
      })
    } catch (error) {
      console.error('DELETE /api/admin/regional/villages/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete village',
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
