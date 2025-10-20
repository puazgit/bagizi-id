/**
 * @fileoverview School Beneficiary API Routes - Individual School Operations
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { updateSchoolMasterSchema } from '@/features/sppg/school/schemas'

/**
 * GET /api/sppg/schools/[id]
 * Get single school by ID with full details
 * 
 * @param params - Route params with school ID (async in Next.js 15)
 * @returns School data with relations
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
    const school = await db.schoolBeneficiary.findFirst({
      where: {
        id,
        program: {
          sppgId: session.user.sppgId
        }
      },
      include: {
        program: {
          select: {
            id: true,
            name: true
          }
        },
        village: {
          select: {
            id: true,
            name: true,
            district: {
              select: {
                id: true,
                name: true,
                regency: {
                  select: {
                    id: true,
                    name: true,
                    province: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
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
 * Update school beneficiary
 * 
 * @param request - Request with updated school data
 * @param params - Route params with school ID (async in Next.js 15)
 * @returns Updated school data
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
        program: {
          sppgId: session.user.sppgId
        }
      }
    })

    if (!existingSchool) {
      return Response.json({ error: 'School not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = updateSchoolMasterSchema.safeParse(body)
    
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

    // Update school
    const updatedSchool = await db.schoolBeneficiary.update({
      where: {
        id
      },
      data: {
        ...validated.data,
        suspendedAt: validated.data.suspendedAt 
          ? new Date(validated.data.suspendedAt) 
          : validated.data.suspendedAt === null 
          ? null 
          : undefined
      },
      include: {
        program: {
          select: {
            id: true,
            name: true
          }
        },
        village: {
          select: {
            id: true,
            name: true,
            district: {
              select: {
                id: true,
                name: true,
                regency: {
                  select: {
                    id: true,
                    name: true,
                    province: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return Response.json({ success: true, data: updatedSchool })
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
 * DELETE /api/sppg/schools/[id]
 * Soft delete school (sets isActive = false)
 * 
 * @param params - Route params with school ID (async in Next.js 15)
 * @returns Success response
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
        program: {
          sppgId: session.user.sppgId
        }
      }
    })

    if (!existingSchool) {
      return Response.json({ error: 'School not found' }, { status: 404 })
    }

    // Soft delete - set isActive to false
    await db.schoolBeneficiary.update({
      where: {
        id
      },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspensionReason: 'Dihapus oleh pengguna'
      }
    })

    return Response.json({ success: true })
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
