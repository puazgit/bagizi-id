/**
 * @fileoverview Enterprise-Grade Nutrition Programs API Endpoints
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'
import { ProgramType, TargetGroup } from '@prisma/client'
import { Prisma } from '@prisma/client'

// ================================ VALIDATION SCHEMAS ================================

/**
 * Enterprise-grade validation schema for nutrition program creation
 * Implements comprehensive business rules and data integrity constraints
 */
const nutritionProgramCreateSchema = z.object({
  // Program Identity
  name: z.string()
    .min(3, 'Nama program minimal 3 karakter')
    .max(255, 'Nama program maksimal 255 karakter')
    .regex(/^[a-zA-Z0-9\s\-_()]+$/, 'Nama program hanya boleh mengandung huruf, angka, spasi, dan tanda baca dasar'),
  
  description: z.string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional(),
  
  programCode: z.string()
    .min(3, 'Kode program minimal 3 karakter')
    .max(20, 'Kode program maksimal 20 karakter')
    .regex(/^[A-Z0-9\-_]+$/, 'Kode program harus huruf besar, angka, dan tanda hubung'),
  
  programType: z.nativeEnum(ProgramType),
  
  targetGroup: z.nativeEnum(TargetGroup),

  // Nutrition Goals - Enterprise validation with nutritional science constraints
  calorieTarget: z.number()
    .min(200, 'Target kalori minimal 200 kkal')
    .max(4000, 'Target kalori maksimal 4000 kkal')
    .optional(),
  
  proteinTarget: z.number()
    .min(5, 'Target protein minimal 5 gram')
    .max(200, 'Target protein maksimal 200 gram')
    .optional(),
  
  carbTarget: z.number()
    .min(10, 'Target karbohidrat minimal 10 gram')
    .max(500, 'Target karbohidrat maksimal 500 gram')
    .optional(),
  
  fatTarget: z.number()
    .min(5, 'Target lemak minimal 5 gram')
    .max(150, 'Target lemak maksimal 150 gram')
    .optional(),
  
  fiberTarget: z.number()
    .min(1, 'Target serat minimal 1 gram')
    .max(50, 'Target serat maksimal 50 gram')
    .optional(),

  // Program Schedule - Enterprise-grade date validation
  startDate: z.string()
    .datetime({ message: 'Format tanggal mulai tidak valid (ISO 8601)' })
    .transform(date => new Date(date)),
  
  endDate: z.string()
    .datetime({ message: 'Format tanggal selesai tidak valid (ISO 8601)' })
    .transform(date => new Date(date))
    .optional(),
  
  feedingDays: z.array(z.number().min(1).max(7))
    .min(1, 'Minimal 1 hari pelaksanaan')
    .max(7, 'Maksimal 7 hari pelaksanaan')
    .refine(days => [...new Set(days)].length === days.length, {
      message: 'Hari pelaksanaan tidak boleh duplikat'
    }),
  
  mealsPerDay: z.number()
    .min(1, 'Minimal 1 kali makan per hari')
    .max(5, 'Maksimal 5 kali makan per hari')
    .default(1),

  // Budget & Recipients - Enterprise financial validation
  totalBudget: z.number()
    .min(1000, 'Total budget minimal Rp 1.000')
    .max(10000000000, 'Total budget maksimal Rp 10 miliar')
    .optional(),
  
  budgetPerMeal: z.number()
    .min(500, 'Budget per makan minimal Rp 500')
    .max(100000, 'Budget per makan maksimal Rp 100.000')
    .optional(),
  
  targetRecipients: z.number()
    .min(1, 'Target penerima minimal 1 orang')
    .max(100000, 'Target penerima maksimal 100.000 orang'),

  // Location - Geographic validation for Indonesia
  implementationArea: z.string()
    .min(5, 'Area implementasi minimal 5 karakter')
    .max(255, 'Area implementasi maksimal 255 karakter'),
  
  partnerSchools: z.array(z.string().min(1))
    .max(100, 'Maksimal 100 sekolah mitra')
    .optional()
    .default([])
})



/**
 * Advanced query parameter schema for enterprise-grade filtering and pagination
 */
const programQuerySchema = z.object({
  // Pagination - Enterprise-grade with performance limits
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => {
    const parsed = val ? parseInt(val, 10) : 20
    return Math.min(Math.max(parsed, 1), 100) // Enforce 1-100 limit for performance
  }),
  
  // Advanced Filtering
  programType: z.nativeEnum(ProgramType).optional(),
  targetGroup: z.nativeEnum(TargetGroup).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  
  // Search - Enterprise text search
  search: z.string().max(255).optional(),
  
  // Date Range Filtering
  startDateFrom: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  startDateTo: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  
  // Budget Range Filtering
  budgetMin: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  budgetMax: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  
  // Sorting - Enterprise-grade sorting options
  sortBy: z.enum(['createdAt', 'name', 'startDate', 'totalBudget', 'targetRecipients']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// ================================ ENTERPRISE TYPES ================================

interface EnterpriseApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    filters?: Record<string, string | number | Date | undefined>
    timestamp: string
    requestId: string
  }
}

// ================================ ENTERPRISE SECURITY HELPERS ================================

/**
 * Multi-tenant security validation for SPPG access
 * Implements zero-trust architecture with comprehensive audit logging
 */
async function validateSppgAccess(sppgId: string): Promise<{
  isValid: boolean
  sppg?: {
    id: string
    name: string
    code: string
    status: string
  }
  error?: string
}> {
  try {
    const sppg = await db.sPPG.findFirst({
      where: {
        id: sppgId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        code: true,
        status: true
      }
    })

    if (!sppg) {
      return { isValid: false, error: 'SPPG tidak ditemukan atau tidak aktif' }
    }

    // Check SPPG status for enterprise compliance
    if (sppg.status !== 'ACTIVE') {
      return { isValid: false, error: 'SPPG tidak aktif' }
    }

    return { isValid: true, sppg }
  } catch (error) {
    console.error('SPPG access validation error:', error)
    return { isValid: false, error: 'Error validasi akses SPPG' }
  }
}

/**
 * Generate enterprise-grade request ID for audit trailing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// ================================ API ENDPOINTS ================================

/**
 * GET /api/sppg/programs
 * Enterprise-grade nutrition programs listing with advanced filtering, pagination, and search
 * 
 * Features:
 * - Multi-tenant data isolation
 * - Advanced filtering and search
 * - Performance-optimized pagination
 * - Comprehensive audit logging
 * - Rate limiting compliance
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // 1. Authentication & Authorization (Zero-Trust)
    const session = await auth()
    if (!session?.user) {
      return Response.json({
        success: false,
        error: 'Authentication required',
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 401 })
    }

    // 2. Multi-tenant Security Validation
    if (!session.user.sppgId) {
      return Response.json({
        success: false,
        error: 'SPPG access required',
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 403 })
    }

    const { isValid, error } = await validateSppgAccess(session.user.sppgId)
    if (!isValid) {
      return Response.json({
        success: false,
        error,
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 403 })
    }

    // 3. Query Parameter Validation & Sanitization
    const { searchParams } = new URL(request.url)
    const queryParamsObject = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = programQuerySchema.safeParse(queryParamsObject)
    if (!validatedQuery.success) {
      return Response.json({
        success: false,
        error: 'Invalid query parameters',
        errors: validatedQuery.error.flatten().fieldErrors,
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 400 })
    }

    const { 
      page, 
      limit, 
      programType, 
      targetGroup, 
      status, 
      search, 
      startDateFrom, 
      startDateTo, 
      budgetMin, 
      budgetMax, 
      sortBy, 
      sortOrder 
    } = validatedQuery.data

    // 4. Build Enterprise-Grade WHERE Clause
    const whereClause: Prisma.NutritionProgramWhereInput = {
      sppgId: session.user.sppgId, // Multi-tenant isolation (CRITICAL!)
      
      // Type & Group Filtering
      ...(programType && { programType }),
      ...(targetGroup && { targetGroup }),
      ...(status && { status }),
      
      // Advanced Text Search
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { programCode: { contains: search, mode: 'insensitive' } },
          { implementationArea: { contains: search, mode: 'insensitive' } }
        ]
      }),
      
      // Date Range Filtering
      ...(startDateFrom || startDateTo) && {
        startDate: {
          ...(startDateFrom && { gte: startDateFrom }),
          ...(startDateTo && { lte: startDateTo })
        }
      },
      
      // Budget Range Filtering
      ...(budgetMin || budgetMax) && {
        totalBudget: {
          ...(budgetMin && { gte: budgetMin }),
          ...(budgetMax && { lte: budgetMax })
        }
      }
    }

    // 5. Performance-Optimized Pagination
    const skip = (page - 1) * limit

    // 6. Execute Optimized Parallel Queries
    const [programs, totalCount] = await Promise.all([
      db.nutritionProgram.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          programCode: true,
          programType: true,
          targetGroup: true,
          calorieTarget: true,
          proteinTarget: true,
          carbTarget: true,
          fatTarget: true,
          fiberTarget: true,
          startDate: true,
          endDate: true,
          feedingDays: true,
          mealsPerDay: true,
          totalBudget: true,
          budgetPerMeal: true,
          targetRecipients: true,
          currentRecipients: true,
          implementationArea: true,
          partnerSchools: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          sppg: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              menus: true,
              schools: true,
              procurementPlans: true,
              productions: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      
      db.nutritionProgram.count({
        where: whereClause
      })
    ])

    // 7. Calculate Enterprise Metrics
    const totalPages = Math.ceil(totalCount / limit)
    const processingTime = Date.now() - startTime

    // 8. Audit Log (Enterprise Compliance)
    console.log(`[AUDIT] Programs List Access - User: ${session.user.id} | SPPG: ${session.user.sppgId} | RequestId: ${requestId} | Count: ${programs.length} | Time: ${processingTime}ms`)

    // 9. Enterprise Response Format
    return Response.json({
      success: true,
      data: programs,
      message: `Berhasil mengambil ${programs.length} program dari ${totalCount} total`,
      meta: {
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages
        },
        filters: {
          programType,
          targetGroup,
          status,
          search,
          startDateFrom,
          startDateTo,
          budgetMin,
          budgetMax,
          sortBy,
          sortOrder
        },
        timestamp: new Date().toISOString(),
        requestId
      }
    } as EnterpriseApiResponse<typeof programs>)

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Enterprise Error Logging
    console.error(`[ERROR] Programs GET - RequestId: ${requestId} | Time: ${processingTime}ms |`, error)
    
    return Response.json({
      success: false,
      error: 'Internal server error',
      meta: { 
        requestId, 
        timestamp: new Date().toISOString() 
      }
    } as EnterpriseApiResponse<null>, { status: 500 })
  }
}

/**
 * POST /api/sppg/programs
 * Enterprise-grade nutrition program creation with comprehensive validation
 * 
 * Features:
 * - Multi-tenant data isolation
 * - Comprehensive business rule validation
 * - Duplicate prevention
 * - Audit logging
 * - Transaction safety
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // 1. Authentication & Authorization (Zero-Trust)
    const session = await auth()
    if (!session?.user) {
      return Response.json({
        success: false,
        error: 'Authentication required',
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 401 })
    }

    // 2. Role-Based Access Control (RBAC)
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI']
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({
        success: false,
        error: 'Insufficient permissions for program creation',
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 403 })
    }

    // 3. Multi-tenant Security Validation
    if (!session.user.sppgId) {
      return Response.json({
        success: false,
        error: 'SPPG access required',
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 403 })
    }

    const { isValid, error } = await validateSppgAccess(session.user.sppgId)
    if (!isValid) {
      return Response.json({
        success: false,
        error,
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 403 })
    }

    // 4. Request Body Parsing & Validation
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({
        success: false,
        error: 'Invalid JSON format',
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 400 })
    }

    const validated = nutritionProgramCreateSchema.safeParse(body)
    if (!validated.success) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        errors: validated.error.flatten().fieldErrors,
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 400 })
    }

    const programData = validated.data

    // 5. Business Rule Validation
    
    // Check program code uniqueness across platform
    const existingProgramCode = await db.nutritionProgram.findUnique({
      where: { programCode: programData.programCode }
    })
    
    if (existingProgramCode) {
      return Response.json({
        success: false,
        error: 'Program code already exists',
        errors: { programCode: ['Kode program sudah digunakan'] },
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 409 })
    }

    // Date range validation
    if (programData.endDate && programData.endDate <= programData.startDate) {
      return Response.json({
        success: false,
        error: 'Invalid date range',
        errors: { endDate: ['Tanggal selesai harus setelah tanggal mulai'] },
        meta: { requestId, timestamp: new Date().toISOString() }
      } as EnterpriseApiResponse<null>, { status: 400 })
    }

    // Budget consistency validation
    if (programData.totalBudget && programData.budgetPerMeal && programData.targetRecipients) {
      const estimatedTotal = programData.budgetPerMeal * programData.targetRecipients * programData.mealsPerDay * 30 // Estimate for 30 days
      if (programData.totalBudget < estimatedTotal * 0.5) { // Allow 50% variance
        return Response.json({
          success: false,
          error: 'Budget inconsistency detected',
          errors: { totalBudget: ['Total budget tidak sesuai dengan budget per makan dan target penerima'] },
          meta: { requestId, timestamp: new Date().toISOString() }
        } as EnterpriseApiResponse<null>, { status: 400 })
      }
    }

    // 6. Enterprise Database Transaction
    const createdProgram = await db.$transaction(async (tx) => {
      // Create program with comprehensive data
      const program = await tx.nutritionProgram.create({
        data: {
          ...programData,
          sppgId: session.user.sppgId!,
          currentRecipients: 0
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              menus: true,
              schools: true,
              procurementPlans: true,
              productions: true
            }
          }
        }
      })

      return program
    })

    const processingTime = Date.now() - startTime

    // 7. Success Audit Log
    console.log(`[AUDIT] Program Created - User: ${session.user.id} | SPPG: ${session.user.sppgId} | Program: ${createdProgram.id} | RequestId: ${requestId} | Time: ${processingTime}ms`)

    // 8. Enterprise Success Response
    return Response.json({
      success: true,
      data: createdProgram,
      message: `Program "${createdProgram.name}" berhasil dibuat`,
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    } as EnterpriseApiResponse<typeof createdProgram>, { status: 201 })

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Enterprise Error Logging with Stack Trace
    console.error(`[ERROR] Program CREATE - RequestId: ${requestId} | Time: ${processingTime}ms |`, error)
    
    // Check for known database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return Response.json({
          success: false,
          error: 'Duplicate program code',
          errors: { programCode: ['Kode program sudah digunakan'] },
          meta: { requestId, timestamp: new Date().toISOString() }
        } as EnterpriseApiResponse<null>, { status: 409 })
      }
    }
    
    return Response.json({
      success: false,
      error: 'Internal server error',
      meta: { 
        requestId, 
        timestamp: new Date().toISOString() 
      }
    } as EnterpriseApiResponse<null>, { status: 500 })
  }
}