/**
 * @fileoverview School Beneficiary API Routes - Full CRUD Operations (82 Fields)
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/SCHOOL_BENEFICIARY_COMPREHENSIVE_IMPROVEMENTS.md}
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { schoolMasterSchema, schoolMasterFilterSchema } from '@/features/sppg/school/schemas'
import { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/schools
 * Get all schools for current SPPG with comprehensive filtering
 * 
 * Query Params:
 * - mode: 'autocomplete' | 'full' | 'standard' (default)
 * - programId: Filter by program
 * - schoolType: Filter by type (SD, SMP, SMA, etc.)
 * - schoolStatus: Filter by status (NEGERI, SWASTA, etc.)
 * - isActive: Filter by active status
 * - provinceId, regencyId, districtId, villageId: Regional filters
 * - hasContract: Filter schools with contracts
 * - contractExpiring: Filter contracts expiring in 30 days
 * - minStudents, maxStudents: Student range filters
 * - search: Search by name, code, NPSN, or principal
 * - page, limit: Pagination
 * - sortBy, sortOrder: Sorting
 * 
 * @example
 * GET /api/sppg/schools?mode=autocomplete
 * GET /api/sppg/schools?schoolType=SD&isActive=true
 * GET /api/sppg/schools?hasContract=true&contractExpiring=true
 * GET /api/sppg/schools?provinceId=xxx&minStudents=100
 * 
 * @returns List of schools with comprehensive data
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

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'standard'
    
    // Build filter object from query params
    const filterParams: Record<string, string | number | boolean> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'mode') {
        // Convert boolean strings
        if (value === 'true') filterParams[key] = true
        else if (value === 'false') filterParams[key] = false
        // Convert numbers
        else if (!isNaN(Number(value)) && ['page', 'limit', 'minStudents', 'maxStudents'].includes(key)) {
          filterParams[key] = Number(value)
        }
        else filterParams[key] = value
      }
    })

    // Validate filters with Zod
    const validatedFilters = schoolMasterFilterSchema.parse(filterParams)

    // 4. Build comprehensive where clause
    const where: Prisma.SchoolBeneficiaryWhereInput = {
      sppgId: session.user.sppgId, // CRITICAL: Multi-tenancy isolation
    }

    // Program filter
    if (validatedFilters.programId) {
      where.programId = validatedFilters.programId
    }

    // School classification filters
    if (validatedFilters.schoolType) {
      where.schoolType = validatedFilters.schoolType
    }
    if (validatedFilters.schoolStatus) {
      where.schoolStatus = validatedFilters.schoolStatus
    }
    if (validatedFilters.isActive !== undefined) {
      where.isActive = validatedFilters.isActive
    }

    // Regional filters
    if (validatedFilters.provinceId) {
      where.provinceId = validatedFilters.provinceId
    }
    if (validatedFilters.regencyId) {
      where.regencyId = validatedFilters.regencyId
    }
    if (validatedFilters.districtId) {
      where.districtId = validatedFilters.districtId
    }
    if (validatedFilters.villageId) {
      where.villageId = validatedFilters.villageId
    }
    if (validatedFilters.urbanRural) {
      where.urbanRural = validatedFilters.urbanRural
    }

    // Student range filters
    if (validatedFilters.minStudents !== undefined || validatedFilters.maxStudents !== undefined) {
      where.totalStudents = {}
      if (validatedFilters.minStudents !== undefined) {
        where.totalStudents.gte = validatedFilters.minStudents
      }
      if (validatedFilters.maxStudents !== undefined) {
        where.totalStudents.lte = validatedFilters.maxStudents
      }
    }

    // Contract filters
    if (validatedFilters.hasContract) {
      where.contractNumber = { not: null }
    }
    if (validatedFilters.contractExpiring) {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      where.contractEndDate = {
        gte: new Date(),
        lte: thirtyDaysFromNow
      }
    }

    // Performance filters
    if (validatedFilters.minAttendanceRate !== undefined) {
      where.attendanceRate = { gte: validatedFilters.minAttendanceRate }
    }
    if (validatedFilters.minSatisfactionScore !== undefined) {
      where.satisfactionScore = { gte: validatedFilters.minSatisfactionScore }
    }

    // Facilities filters
    if (validatedFilters.hasKitchen !== undefined) {
      where.hasKitchen = validatedFilters.hasKitchen
    }
    if (validatedFilters.hasRefrigerator !== undefined) {
      where.hasRefrigerator = validatedFilters.hasRefrigerator
    }
    if (validatedFilters.hasDiningArea !== undefined) {
      where.hasDiningArea = validatedFilters.hasDiningArea
    }

    // Search filter
    if (validatedFilters.search) {
      where.OR = [
        { schoolName: { contains: validatedFilters.search, mode: 'insensitive' } },
        { schoolCode: { contains: validatedFilters.search, mode: 'insensitive' } },
        { npsn: { contains: validatedFilters.search, mode: 'insensitive' } },
        { principalName: { contains: validatedFilters.search, mode: 'insensitive' } }
      ]
    }

    // 5. Pagination
    const page = validatedFilters.page || 1
    const limit = validatedFilters.limit || 20
    const skip = (page - 1) * limit

    // 6. Sorting
    const orderBy: Prisma.SchoolBeneficiaryOrderByWithRelationInput = {}
    const sortBy = validatedFilters.sortBy || 'schoolName'
    const sortOrder = validatedFilters.sortOrder || 'asc'
    orderBy[sortBy] = sortOrder

    // 7. Query based on mode
    let schools
    let total = 0

    switch (mode) {
      case 'autocomplete':
        // Minimal fields for dropdowns
        schools = await db.schoolBeneficiary.findMany({
          where,
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
            schoolType: true,
            totalStudents: true
          },
          orderBy,
          take: limit,
          skip
        })
        total = await db.schoolBeneficiary.count({ where })
        break

      case 'full':
        // All fields with complete relations
        schools = await db.schoolBeneficiary.findMany({
          where,
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
                name: true
              }
            }
          },
          orderBy,
          take: limit,
          skip
        })
        total = await db.schoolBeneficiary.count({ where })
        break

      default:
        // Standard mode - comprehensive but not all relations
        schools = await db.schoolBeneficiary.findMany({
          where,
          select: {
            // Core identification
            id: true,
            schoolName: true,
            schoolCode: true,
            npsn: true,
            schoolType: true,
            schoolStatus: true,
            
            // Contact
            principalName: true,
            contactPhone: true,
            contactEmail: true,
            
            // Location
            schoolAddress: true,
            villageId: true,
            districtId: true,
            regencyId: true,
            provinceId: true,
            
            // Students
            totalStudents: true,
            targetStudents: true,
            activeStudents: true,
            maleStudents: true,
            femaleStudents: true,
            
            // Performance
            attendanceRate: true,
            participationRate: true,
            satisfactionScore: true,
            totalMealsServed: true,
            
            // Contract
            contractNumber: true,
            contractEndDate: true,
            monthlyBudgetAllocation: true,
            budgetPerStudent: true,
            
            // Status
            isActive: true,
            enrollmentDate: true,
            
            // Relations
            programId: true,
            program: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy,
          take: limit,
          skip
        })
        total = await db.schoolBeneficiary.count({ where })
    }

    // 8. Return response with pagination metadata
    return Response.json({ 
      success: true, 
      data: schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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
 * Create new school beneficiary with comprehensive 82-field data
 * 
 * @param request - Request with school data in body
 * @returns Created school with complete relations
 * 
 * @example
 * POST /api/sppg/schools
 * Body: {
 *   programId: "xxx",
 *   sppgId: "xxx",
 *   schoolName: "SDN 01 Menteng",
 *   schoolCode: "SD-001",
 *   npsn: "20104623",
 *   schoolType: "SD",
 *   schoolStatus: "NEGERI",
 *   // ... all 82 fields
 * }
 */
export async function POST(request: Request) {
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

    // 3. Parse and validate request body with comprehensive schema
    const body = await request.json()
    
    // Ensure sppgId is set from session (security)
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

    // 5. Verify regional hierarchy exists
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

      // Auto-fill regional IDs if not provided
      if (!validated.data.districtId) {
        validated.data.districtId = village.districtId
      }
      if (!validated.data.regencyId) {
        validated.data.regencyId = village.district.regencyId
      }
      if (!validated.data.provinceId) {
        validated.data.provinceId = village.district.regency.provinceId
      }
    }

    // 6. Create school with all 82 fields
    const school = await db.schoolBeneficiary.create({
      data: {
        ...validated.data,
        sppgId: session.user.sppgId, // CRITICAL: Multi-tenant safety
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
            name: true
          }
        }
      }
    })

    return Response.json({ 
      success: true, 
      data: school,
      message: 'School created successfully'
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
