/**
 * @fileoverview Admin SPPG API Endpoints - List & Create
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createSppgSchema } from '@/features/admin/sppg-management/schemas'
import { SppgStatus, OrganizationType, Prisma } from '@prisma/client'

/**
 * GET /api/admin/sppg
 * Fetch all SPPG with filters and pagination
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('🔍 [GET /api/admin/sppg] Request started')
      
      // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as SppgStatus | undefined,
      organizationType: searchParams.get('organizationType') as OrganizationType | undefined,
      provinceId: searchParams.get('provinceId') || undefined,
      regencyId: searchParams.get('regencyId') || undefined,
      isDemoAccount: searchParams.get('isDemoAccount') === 'true' ? true : searchParams.get('isDemoAccount') === 'false' ? false : undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    }

    console.log('📋 [GET /api/admin/sppg] Filters:', filters)

    // 4. Use filters directly without validation for now (TEMPORARY DEBUG)
    const validatedFilters = filters
    console.log('✅ [GET /api/admin/sppg] Using filters directly (validation bypassed)')

    // // 4. Validate filters
    // let validatedFilters
    // try {
    //   validatedFilters = sppgFiltersSchema.parse(filters)
    //   console.log('✅ [GET /api/admin/sppg] Filters validated')
    // } catch (validationError) {
    //   console.error('❌ [GET /api/admin/sppg] Validation error:', validationError)
    //   throw validationError
    // }

    // 5. Build where clause
    const where: Prisma.SPPGWhereInput = {}
    
    if (validatedFilters.search) {
      where.OR = [
        { name: { contains: validatedFilters.search, mode: 'insensitive' } },
        { code: { contains: validatedFilters.search, mode: 'insensitive' } },
        { email: { contains: validatedFilters.search, mode: 'insensitive' } },
        { picName: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    if (validatedFilters.status) {
      where.status = validatedFilters.status
    }

    if (validatedFilters.organizationType) {
      where.organizationType = validatedFilters.organizationType
    }

    if (validatedFilters.provinceId) {
      where.provinceId = validatedFilters.provinceId
    }

    if (validatedFilters.regencyId) {
      where.regencyId = validatedFilters.regencyId
    }

    if (validatedFilters.isDemoAccount !== undefined) {
      where.isDemoAccount = validatedFilters.isDemoAccount
    }

    // 6. Get total count
    const total = await db.sPPG.count({ where })

    // 7. Calculate pagination
    const page = validatedFilters.page || 1
    const limit = validatedFilters.limit || 10
    const skip = (page - 1) * limit

    // 8. Fetch SPPG list
    const sppgs = await db.sPPG.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [validatedFilters.sortBy || 'createdAt']: validatedFilters.sortOrder || 'desc'
      },
      include: {
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
        },
        _count: {
          select: {
            users: true,
            nutritionPrograms: true,
            schoolBeneficiaries: true
          }
        }
      }
    })

    // 9. Return paginated response
    return NextResponse.json({
      success: true,
      data: {
        data: sppgs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

    } catch (error) {
      console.error('[GET /api/admin/sppg] Error:', error)
      console.error('[GET /api/admin/sppg] Error stack:', (error as Error).stack)
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/admin/sppg
 * Create new SPPG
 * Protected: Superadmin only (automatic via withAdminAuth)
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      // Parse request body
    const body = await request.json()

    // 4. Validate input
    const validated = createSppgSchema.parse(body)

    // 5. Check if code already exists
    const existingCode = await db.sPPG.findUnique({
      where: { code: validated.code }
    })

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Kode SPPG sudah digunakan' },
        { status: 400 }
      )
    }

    // 6. Check if email already exists
    const existingEmail = await db.sPPG.findFirst({
      where: { email: validated.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email SPPG sudah digunakan' },
        { status: 400 }
      )
    }

    // 7. Create SPPG
    const sppg = await db.sPPG.create({
      data: {
        code: validated.code,
        name: validated.name,
        description: validated.description || null,
        organizationType: validated.organizationType,
        establishedYear: validated.establishedYear || null,
        targetRecipients: validated.targetRecipients,
        
        // Location
        addressDetail: validated.addressDetail,
        provinceId: validated.provinceId,
        regencyId: validated.regencyId,
        districtId: validated.districtId,
        villageId: validated.villageId,
        postalCode: validated.postalCode || null,
        coordinates: validated.coordinates || null,
        timezone: validated.timezone,
        
        // Contact
        phone: validated.phone,
        email: validated.email,
        
        // PIC
        picName: validated.picName,
        picPosition: validated.picPosition,
        picEmail: validated.picEmail,
        picPhone: validated.picPhone,
        picWhatsapp: validated.picWhatsapp || null,
        
        // Operations
        maxRadius: validated.maxRadius,
        maxTravelTime: validated.maxTravelTime,
        operationStartDate: new Date(validated.operationStartDate),
        operationEndDate: validated.operationEndDate ? new Date(validated.operationEndDate) : null,
        
        // Budget
        monthlyBudget: validated.monthlyBudget || 50000000,
        yearlyBudget: validated.yearlyBudget || null,
        budgetCurrency: validated.budgetCurrency || 'IDR',
        budgetStartDate: validated.budgetStartDate ? new Date(validated.budgetStartDate) : new Date(),
        budgetEndDate: validated.budgetEndDate ? new Date(validated.budgetEndDate) : null,
        
        // Demo settings
        isDemoAccount: validated.isDemoAccount || false,
        demoExpiresAt: validated.demoExpiresAt ? new Date(validated.demoExpiresAt) : null,
        demoMaxBeneficiaries: validated.demoMaxBeneficiaries || null,
        demoAllowedFeatures: validated.demoAllowedFeatures || [],
        
        // Status
        status: validated.status || 'ACTIVE'
      },
      include: {
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
        },
        _count: {
          select: {
            users: true,
            nutritionPrograms: true,
            schoolBeneficiaries: true
          }
        }
      }
    })

    return NextResponse.json(
      { success: true, data: sppg },
      { status: 201 }
    )

    } catch (error) {
      console.error('[POST /api/admin/sppg] Error:', error)
      
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
          error: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        },
        { status: 500 }
      )
    }
  }, { requireSuperAdmin: true })
}
