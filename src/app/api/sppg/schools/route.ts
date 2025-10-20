/**
 * @fileoverview School Beneficiary API Routes - Full CRUD Operations
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { schoolMasterSchema } from '@/features/sppg/school/schemas'

/**
 * GET /api/sppg/schools
 * Get all schools for current SPPG with flexible query modes
 * 
 * Query Params:
 * - mode: 'autocomplete' (minimal fields) | 'full' (all fields with relations) | default (standard fields)
 * - programId: Filter by specific program
 * - isActive: Filter by active status (default: true)
 * - schoolType: Filter by school type (TK, SD, SMP, SMA, SMK, PAUD)
 * - search: Search by school name, code, or principal name
 * 
 * @example
 * GET /api/sppg/schools?mode=autocomplete
 * GET /api/sppg/schools?mode=full&programId=xxx
 * GET /api/sppg/schools?schoolType=SD&isActive=true
 * 
 * @returns List of schools based on query mode
 */
export async function GET(request: Request) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (CRITICAL FOR MULTI-TENANCY!)
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'standard'
    const programId = searchParams.get('programId')
    const isActiveParam = searchParams.get('isActive')
    const schoolType = searchParams.get('schoolType')
    const search = searchParams.get('search')

    // 4. Build where clause
    const where: {
      program: { sppgId: string }
      programId?: string
      isActive?: boolean
      schoolType?: string
      OR?: Array<Record<string, { contains: string; mode: string }>>
    } = {
      program: {
        sppgId: session.user.sppgId
      }
    }

    // Apply filters
    if (programId) {
      where.programId = programId
    }
    
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true'
    } else {
      // Default: only active schools
      where.isActive = true
    }

    if (schoolType) {
      where.schoolType = schoolType
    }

    if (search) {
      where.OR = [
        { schoolName: { contains: search, mode: 'insensitive' } },
        { schoolCode: { contains: search, mode: 'insensitive' } },
        { principalName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 5. Determine select/include based on mode
    const queryOptions = {
      where,
      orderBy: { schoolName: 'asc' as const }
    }

    let schools

    switch (mode) {
      case 'autocomplete':
        // Minimal fields for dropdowns/autocomplete
        schools = await db.schoolBeneficiary.findMany({
          ...queryOptions,
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
            schoolType: true
          },
          distinct: ['schoolName'] as const
        })
        break

      case 'full':
        // All fields with relations for management
        schools = await db.schoolBeneficiary.findMany({
          ...queryOptions,
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
        break

      default:
        // Standard mode - most common fields
        schools = await db.schoolBeneficiary.findMany({
          ...queryOptions,
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
            schoolType: true,
            schoolStatus: true,
            principalName: true,
            contactPhone: true,
            totalStudents: true,
            targetStudents: true,
            activeStudents: true,
            isActive: true,
            programId: true,
            enrollmentDate: true
          }
        })
    }

    // 6. Return schools

    return Response.json({ 
      success: true, 
      data: schools,
      count: schools.length
    })
  } catch (error) {
    console.error('GET /api/sppg/schools error:', error)
    return Response.json({ 
      error: 'Failed to fetch schools',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

/**
 * POST /api/sppg/schools
 * Create new school beneficiary
 * 
 * @param request - Request with school data in body
 * @returns Created school with relations
 */
export async function POST(request: Request) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Parse and validate request body
    const body = await request.json()
    const validated = schoolMasterSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json(
        { 
          error: 'Validation failed',
          details: validated.error.issues
        },
        { status: 400 }
      )
    }

    // 4. Verify program belongs to user's SPPG (CRITICAL!)
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

    // 5. Create school
    const school = await db.schoolBeneficiary.create({
      data: {
        ...validated.data,
        suspendedAt: validated.data.suspendedAt ? new Date(validated.data.suspendedAt) : null
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

    return Response.json({ 
      success: true, 
      data: school 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sppg/schools error:', error)
    return Response.json(
      { 
        error: 'Failed to create school',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
