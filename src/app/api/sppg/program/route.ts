/**
 * @fileoverview API endpoint untuk Program - GET & POST
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Multi-tenant security with sppgId filtering
 * CRITICAL: Auto-generate programCode on creation
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { createProgramSchema } from '@/features/sppg/program/schemas'
import { UserRole, ProgramType, TargetGroup, ProgramStatus, Prisma } from '@prisma/client'

/**
 * GET /api/sppg/program
 * Fetch all programs untuk SPPG user
 * Auto-filtered by sppgId (multi-tenant security)
 */
export async function GET(request: NextRequest) {
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

    // 3. Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ProgramStatus | null
    const programType = searchParams.get('programType') as ProgramType | null
    const targetGroup = searchParams.get('targetGroup') as TargetGroup | null
    const search = searchParams.get('search')

    // 4. Build where clause with multi-tenant filtering
    const where: Prisma.NutritionProgramWhereInput = {
      sppgId: session.user.sppgId, // MANDATORY multi-tenant filter
      ...(status && { status }),
      ...(programType && { programType }),
      ...(targetGroup && { targetGroup }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { programCode: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    // 5. Fetch programs with ordering
    const programs = await db.nutritionProgram.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // Active programs first
        { startDate: 'desc' }, // Newest first
      ],
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return Response.json({ success: true, data: programs })
  } catch (error) {
    console.error('GET /api/sppg/program error:', error)
    return Response.json(
      {
        error: 'Failed to fetch programs',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sppg/program
 * Create new program
 * Auto-populate: sppgId, programCode, currentRecipients, createdAt
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Role Check - Only certain roles can create programs
    const allowedRoles: UserRole[] = [
      'PLATFORM_SUPERADMIN',
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_AHLI_GIZI',
    ]

    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 3. SPPG Access Check
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 4. Verify SPPG exists and is active
    const sppg = await db.sPPG.findFirst({
      where: {
        id: session.user.sppgId,
        status: 'ACTIVE',
      },
    })

    if (!sppg) {
      return Response.json({ error: 'SPPG not found or inactive' }, { status: 403 })
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = createProgramSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    // 6. Generate unique programCode
    const timestamp = Date.now().toString().slice(-8)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const programCode = `PROG-${sppg.code}-${timestamp}-${randomSuffix}`

    // 7. Create program with auto-populated fields
    const program = await db.nutritionProgram.create({
      data: {
        ...validated.data,
        programCode,
        sppgId: session.user.sppgId, // Multi-tenant safety
        currentRecipients: 0,
        status: 'ACTIVE',
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // 8. Log audit trail (optional but recommended)
    console.log(`Program created: ${program.programCode} by user: ${session.user.email}`)

    return Response.json({ success: true, data: program }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sppg/program error:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return Response.json(
        {
          error: 'Program code already exists',
        },
        { status: 409 }
      )
    }

    return Response.json(
      {
        error: 'Failed to create program',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
