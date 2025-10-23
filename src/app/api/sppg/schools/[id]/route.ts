/**
 * @fileoverview Individual School Beneficiary API Routes - Comprehensive CRUD Operations
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/SCHOOL_BENEFICIARY_COMPREHENSIVE_IMPROVEMENTS.md}
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { schoolMasterSchema } from '@/features/sppg/school/schemas'

/**
 * GET /api/sppg/schools/[id]
 * Get single school by ID with comprehensive relations (all 82 fields)
 * 
 * @param params - Route params with school ID (async in Next.js 15)
 * @returns School data with flat regional relations
 * 
 * @example
 * GET /api/sppg/schools/cm5abc123
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params

    // Fetch school with multi-tenancy check (CRITICAL!)
    // Use direct sppgId check for better query performance
    const school = await db.schoolBeneficiary.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId  // Direct multi-tenancy filter
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        program: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        province: {
          select: {
            id: true,
            name: true
          }
        },
        regency: {
          select: {
            id: true,
            name: true
          }
        },
        district: {
          select: {
            id: true,
            name: true
          }
        },
        village: {
          select: {
            id: true,
            name: true,
            postalCode: true
          }
        }
      }
    })

    if (!school) {
      return Response.json({ error: 'School not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: school })
  } catch (error) {
    console.error('GET /api/sppg/schools/[id] error:', error)
    return Response.json(
      { 
        error: 'Failed to fetch school',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sppg/schools/[id]
 * Full update school beneficiary (all 82 fields with comprehensive validation)
 * 
 * @param request - Request with complete school data (all required fields)
 * @param params - Route params with school ID (async in Next.js 15)
 * @returns Updated school data with flat regional relations
 * 
 * @example
 * PUT /api/sppg/schools/cm5abc123
 * Body: { ...all 82 fields }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params

    // Verify school exists and belongs to user's SPPG (CRITICAL!)
    const existingSchool = await db.schoolBeneficiary.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId  // Direct multi-tenancy check
      }
    })

    if (!existingSchool) {
      return Response.json({ error: 'School not found' }, { status: 404 })
    }

    // Parse and validate request body with comprehensive schema
    const body = await request.json()
    
    // Ensure sppgId cannot be changed (security)
    const dataWithSppg = {
      ...body,
      sppgId: session.user.sppgId
    }
    
    const validated = schoolMasterSchema.safeParse(dataWithSppg)
    
    if (!validated.success) {
      return Response.json(
        { 
          error: 'Validation failed',
          details: validated.error.issues
        },
        { status: 400 }
      )
    }

    // If programId is being changed, verify new program belongs to SPPG
    if (validated.data.programId !== existingSchool.programId) {
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: validated.data.programId,
          sppgId: session.user.sppgId
        }
      })

      if (!program) {
        return Response.json(
          { error: 'Program not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Verify regional hierarchy if village changed
    if (validated.data.villageId && validated.data.villageId !== existingSchool.villageId) {
      const village = await db.village.findUnique({
        where: { id: validated.data.villageId },
        include: {
          district: {
            include: {
              regency: {
                include: {
                  province: true
                }
              }
            }
          }
        }
      })

      if (!village) {
        return Response.json(
          { error: 'Invalid village ID' },
          { status: 400 }
        )
      }

      // Auto-fill regional IDs from village hierarchy
      validated.data.districtId = village.districtId
      validated.data.regencyId = village.district.regencyId
      validated.data.provinceId = village.district.regency.provinceId
    }

    // Update school with all fields
    const updatedSchool = await db.schoolBeneficiary.update({
      where: { id },
      data: validated.data,
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        program: {
          select: {
            id: true,
            name: true
          }
        },
        province: {
          select: {
            id: true,
            name: true
          }
        },
        regency: {
          select: {
            id: true,
            name: true
          }
        },
        district: {
          select: {
            id: true,
            name: true
          }
        },
        village: {
          select: {
            id: true,
            name: true,
            postalCode: true
          }
        }
      }
    })

    return Response.json({ 
      success: true, 
      data: updatedSchool,
      message: 'School updated successfully'
    })
  } catch (error) {
    console.error('PUT /api/sppg/schools/[id] error:', error)
    return Response.json(
      { 
        error: 'Failed to update school',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sppg/schools/[id]
 * Partial update school beneficiary (only provided fields with validation)
 * 
 * @param request - Request with partial school data
 * @param params - Route params with school ID (async in Next.js 15)
 * @returns Updated school data with flat regional relations
 * 
 * @example
 * PATCH /api/sppg/schools/cm5abc123
 * Body: { totalStudents: 150, activeStudents: 145, attendanceRate: 95.5 }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params

    // Verify school exists and belongs to user's SPPG (CRITICAL!)
    const existingSchool = await db.schoolBeneficiary.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId  // Direct multi-tenancy check
      }
    })

    if (!existingSchool) {
      return Response.json({ error: 'School not found' }, { status: 404 })
    }

    // Parse and validate request body (partial schema)
    const body = await request.json()
    
    // Remove immutable fields
    delete body.id
    delete body.sppgId
    delete body.createdAt
    delete body.updatedAt
    
    // Validate partial update with schema
    const validated = schoolMasterSchema.partial().safeParse(body)
    
    if (!validated.success) {
      return Response.json(
        { 
          error: 'Validation failed',
          details: validated.error.issues
        },
        { status: 400 }
      )
    }

    // Verify program if being changed
    if (validated.data.programId) {
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: validated.data.programId,
          sppgId: session.user.sppgId
        }
      })

      if (!program) {
        return Response.json(
          { error: 'Program not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Verify regional hierarchy if village being changed
    if (validated.data.villageId) {
      const village = await db.village.findUnique({
        where: { id: validated.data.villageId },
        include: {
          district: {
            include: {
              regency: {
                include: {
                  province: true
                }
              }
            }
          }
        }
      })

      if (!village) {
        return Response.json(
          { error: 'Invalid village ID' },
          { status: 400 }
        )
      }

      // Auto-fill regional IDs from village hierarchy
      validated.data.districtId = village.districtId
      validated.data.regencyId = village.district.regencyId
      validated.data.provinceId = village.district.regency.provinceId
    }

    // 5. Update school
    const school = await db.schoolBeneficiary.update({
      where: { id },
      data: validated.data,
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        program: {
          select: {
            id: true,
            name: true
          }
        },
        province: {
          select: {
            id: true,
            name: true
          }
        },
        regency: {
          select: {
            id: true,
            name: true
          }
        },
        district: {
          select: {
            id: true,
            name: true
          }
        },
        village: {
          select: {
            id: true,
            name: true,
            postalCode: true
          }
        }
      }
    })

    return Response.json({ 
      success: true, 
      data: school,
      message: 'School partially updated successfully'
    })
  } catch (error) {
    console.error('PATCH /api/sppg/schools/[id] error:', error)
    return Response.json(
      { 
        error: 'Failed to update school',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sppg/schools/[id]
 * Soft delete school beneficiary (sets isActive = false)
 * Hard delete available with ?permanent=true query param (admin only)
 * 
 * @param request - Request with optional ?permanent=true query
 * @param params - Route params with school ID (async in Next.js 15)
 * @returns Success message or deleted school data
 * 
 * @example
 * DELETE /api/sppg/schools/cm5abc123 (soft delete)
 * DELETE /api/sppg/schools/cm5abc123?permanent=true (hard delete)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params

    // Verify school exists and belongs to user's SPPG (CRITICAL!)
    const existingSchool = await db.schoolBeneficiary.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId  // Direct multi-tenancy check
      }
    })

    if (!existingSchool) {
      return Response.json({ error: 'School not found' }, { status: 404 })
    }

    // Check delete type (soft vs permanent)
    const { searchParams } = new URL(request.url)
    const isPermanent = searchParams.get('permanent') === 'true'

    if (isPermanent) {
      // Hard delete - only for admin roles
      const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'PLATFORM_SUPERADMIN']
      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
        return Response.json(
          { error: 'Insufficient permissions for permanent delete' },
          { status: 403 }
        )
      }

      // Permanent delete
      await db.schoolBeneficiary.delete({
        where: { id }
      })

      return Response.json({ 
        success: true, 
        message: 'School permanently deleted',
        deletedId: id
      })
    } else {
      // Soft delete - set isActive to false
      const deletedSchool = await db.schoolBeneficiary.update({
        where: { id },
        data: {
          isActive: false,
          suspendedAt: new Date(),
          suspensionReason: 'Dihapus oleh pengguna'
        },
        select: {
          id: true,
          schoolName: true,
          schoolCode: true,
          isActive: true,
          suspendedAt: true,
          suspensionReason: true
        }
      })

      return Response.json({ 
        success: true, 
        message: 'School deactivated (soft delete)',
        data: deletedSchool
      })
    }
  } catch (error) {
    console.error('DELETE /api/sppg/schools/[id] error:', error)
    return Response.json(
      { 
        error: 'Failed to delete school',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
