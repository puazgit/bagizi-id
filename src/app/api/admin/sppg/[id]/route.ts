/**
 * Admin SPPG Detail API Endpoints
 * Handles GET (detail), PUT (update), and DELETE (soft delete) operations
 * 
 * @route GET /api/admin/sppg/[id] - Get single SPPG detail
 * @route PUT /api/admin/sppg/[id] - Update SPPG
 * @route DELETE /api/admin/sppg/[id] - Soft delete SPPG
 * 
 * @version Next.js 15.5.4 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateSppgSchema } from '@/features/admin/sppg-management/schemas'

/**
 * GET /api/admin/sppg/[id]
 * Get single SPPG detail with all relationships
 * 
 * @access Platform Admin (SUPERADMIN, SUPPORT, ANALYST) - automatic via withAdminAuth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      
      // Fetch SPPG with relationships
    const sppg = await db.sPPG.findUnique({
      where: { id },
      include: {
        province: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        regency: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        district: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        village: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        _count: {
          select: {
            users: true,
            nutritionPrograms: true,
            schoolBeneficiaries: true,
            foodProductions: true,
            foodDistributions: true,
            inventoryItems: true,
            procurements: true,
          }
        }
      }
    })

    // 4. Check if SPPG exists
    if (!sppg) {
      return NextResponse.json(
        { success: false, error: 'SPPG ID tidak ditemukan' },
        { status: 404 }
      )
    }

    // Return SPPG detail - simplified structure
    return NextResponse.json({
      success: true,
      data: sppg
    })

    } catch (error) {
      console.error('[GET /api/admin/sppg/[id]] Error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch SPPG',
          details: error instanceof Error ? error.message : undefined
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/admin/sppg/[id]
 * Update SPPG data
 * 
 * @access Platform SUPERADMIN only - automatic via withAdminAuth
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      
      // Check if SPPG exists
    const existingSppg = await db.sPPG.findUnique({
      where: { id }
    })

    if (!existingSppg) {
      return NextResponse.json(
        { success: false, error: 'SPPG not found' },
        { status: 404 }
      )
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = updateSppgSchema.parse(body)

    // 5. Check for duplicate code/email if being updated
    if (validated.code && validated.code !== existingSppg.code) {
      const duplicateCode = await db.sPPG.findUnique({
        where: { code: validated.code }
      })
      if (duplicateCode) {
        return NextResponse.json(
          { success: false, error: 'SPPG code already exists' },
          { status: 409 }
        )
      }
    }

    if (validated.email && validated.email !== existingSppg.email) {
      const duplicateEmail = await db.sPPG.findFirst({
        where: { 
          email: validated.email,
          id: { not: id }
        }
      })
      if (duplicateEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    // 6. Update SPPG
    const updatedSppg = await db.sPPG.update({
      where: { id },
      data: {
        // Basic Info
        ...(validated.code && { code: validated.code }),
        ...(validated.name && { name: validated.name }),
        ...(validated.organizationType && { organizationType: validated.organizationType }),
        ...(validated.establishedYear && { establishedYear: validated.establishedYear }),
        ...(validated.targetRecipients && { targetRecipients: validated.targetRecipients }),
        ...(validated.description && { description: validated.description }),

        // Location
        ...(validated.addressDetail && { addressDetail: validated.addressDetail }),
        ...(validated.postalCode && { postalCode: validated.postalCode }),
        ...(validated.provinceId && { provinceId: validated.provinceId }),
        ...(validated.regencyId && { regencyId: validated.regencyId }),
        ...(validated.districtId && { districtId: validated.districtId }),
        ...(validated.villageId && { villageId: validated.villageId }),
        ...(validated.coordinates && { coordinates: validated.coordinates }),
        ...(validated.maxRadius && { maxRadius: validated.maxRadius }),
        ...(validated.maxTravelTime && { maxTravelTime: validated.maxTravelTime }),

        // Contact
        ...(validated.phone && { phone: validated.phone }),
        ...(validated.email && { email: validated.email }),

        // PIC
        ...(validated.picName && { picName: validated.picName }),
        ...(validated.picPosition && { picPosition: validated.picPosition }),
        ...(validated.picPhone && { picPhone: validated.picPhone }),
        ...(validated.picEmail && { picEmail: validated.picEmail }),
        // picIdNumber, workingDays, budgetSource tidak ada di schema

        // Operations
        ...(validated.operationStartDate && { operationStartDate: validated.operationStartDate }),
        ...(validated.operationEndDate && { operationEndDate: validated.operationEndDate }),
        ...(validated.timezone && { timezone: validated.timezone }),

        // Budget
        ...(validated.monthlyBudget !== undefined && { monthlyBudget: validated.monthlyBudget }),
        ...(validated.yearlyBudget !== undefined && { yearlyBudget: validated.yearlyBudget }),
        ...(validated.budgetStartDate && { budgetStartDate: validated.budgetStartDate }),
        ...(validated.budgetEndDate && { budgetEndDate: validated.budgetEndDate }),

        // Demo Settings
        ...(validated.isDemoAccount !== undefined && { isDemoAccount: validated.isDemoAccount }),
        ...(validated.demoExpiresAt && { demoExpiresAt: validated.demoExpiresAt }),
        ...(validated.demoMaxBeneficiaries && { demoMaxBeneficiaries: validated.demoMaxBeneficiaries }),
        ...(validated.demoAllowedFeatures && { demoAllowedFeatures: validated.demoAllowedFeatures }),

        // Status
        ...(validated.status && { status: validated.status }),

        // Metadata
        updatedAt: new Date(),
      },
      include: {
        province: { select: { id: true, name: true, code: true } },
        regency: { select: { id: true, name: true, code: true } },
        district: { select: { id: true, name: true, code: true } },
        village: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            users: true,
            nutritionPrograms: true,
            schoolBeneficiaries: true,
          }
        }
      }
    })

    // Return updated SPPG
    return NextResponse.json({
      success: true,
      data: updatedSppg,
      message: 'SPPG updated successfully'
    })

    } catch (error) {
      console.error('[PUT /api/admin/sppg/[id]] Error:', error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: 'errors' in error ? error.errors : undefined
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update SPPG',
          details: error instanceof Error ? error.message : undefined
        },
        { status: 500 }
      )
    }
  }, { requireSuperAdmin: true })
}

/**
 * DELETE /api/admin/sppg/[id]
 * Soft delete SPPG (set status to INACTIVE)
 * 
 * @access Platform SUPERADMIN only - automatic via withAdminAuth
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      
      // Check if SPPG exists
    const existingSppg = await db.sPPG.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            nutritionPrograms: true,
            schoolBeneficiaries: true,
          }
        }
      }
    })

    if (!existingSppg) {
      return NextResponse.json(
        { success: false, error: 'SPPG not found' },
        { status: 404 }
      )
    }

    // 4. Check if SPPG can be deleted (has no dependencies)
    const hasUsers = existingSppg._count.users > 0
    const hasPrograms = existingSppg._count.nutritionPrograms > 0
    const hasBeneficiaries = existingSppg._count.schoolBeneficiaries > 0

    if (hasUsers || hasPrograms || hasBeneficiaries) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete SPPG with existing users, programs, or beneficiaries',
          details: {
            users: existingSppg._count.users,
            programs: existingSppg._count.nutritionPrograms,
            beneficiaries: existingSppg._count.schoolBeneficiaries,
          }
        },
        { status: 409 }
      )
    }

    // 5. Soft delete - set status to INACTIVE
    const deletedSppg = await db.sPPG.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updatedAt: new Date(),
      }
    })

    // Return success
    return NextResponse.json({
      success: true,
      message: 'SPPG deleted successfully',
      data: deletedSppg
    })

    } catch (error) {
      console.error('[DELETE /api/admin/sppg/[id]] Error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete SPPG',
          details: error instanceof Error ? error.message : undefined
        },
        { status: 500 }
      )
    }
  }, { requireSuperAdmin: true })
}
