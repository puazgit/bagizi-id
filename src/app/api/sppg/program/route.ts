/**
 * @fileoverview API endpoint untuk Program - GET & POST
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - POST: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Programs filtered by session.user.sppgId
 * 
 * CRITICAL: Multi-tenant security with sppgId filtering
 * CRITICAL: Auto-generate programCode on creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createProgramSchema } from '@/features/sppg/program/schemas'
import { UserRole, Prisma, ProgramStatus, ProgramType, TargetGroup } from '@prisma/client'

/**
 * GET /api/sppg/program
 * Fetch all programs untuk SPPG user
 * Auto-filtered by sppgId (multi-tenant security)
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse query parameters for filtering
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') as ProgramStatus | null
      const programType = searchParams.get('programType') as ProgramType | null
      const targetGroup = searchParams.get('targetGroup') as TargetGroup | null
      const search = searchParams.get('search')

      // Build where clause with multi-tenant filtering
      const where: Prisma.NutritionProgramWhereInput = {
        sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
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

      // Fetch programs with ordering
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

      return NextResponse.json({ success: true, data: programs })
    } catch (error) {
      console.error('GET /api/sppg/program error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch programs',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/program
 * Create new program
 * Auto-populate: sppgId, programCode, currentRecipients, createdAt
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Role Check - Only certain roles can create programs
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AHLI_GIZI',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify SPPG exists and is active
      const sppg = await db.sPPG.findFirst({
        where: {
          id: session.user.sppgId!,
          status: 'ACTIVE',
        },
      })

      if (!sppg) {
        return NextResponse.json({ error: 'SPPG not found or inactive' }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = createProgramSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Generate unique programCode
      const timestamp = Date.now().toString().slice(-8)
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      const programCode = `PROG-${sppg.code}-${timestamp}-${randomSuffix}`

      // Create program with auto-populated fields
      const program = await db.nutritionProgram.create({
        data: {
          ...validated.data,
          programCode,
          sppgId: session.user.sppgId!, // Multi-tenant safety
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

      // Log audit trail
      console.log(`Program created: ${program.programCode} by user: ${session.user.email}`)

      return NextResponse.json({ success: true, data: program }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/program error:', error)

      // Handle unique constraint violation
      if ((error as { code?: string }).code === 'P2002') {
        return NextResponse.json(
          {
            error: 'Program code already exists',
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to create program',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
