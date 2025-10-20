/**
 * @fileoverview API endpoint untuk single Program - GET, PUT, DELETE
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Multi-tenant security - verify program belongs to user's SPPG
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { updateProgramSchema } from '@/features/sppg/program/schemas'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/program/[id]
 * Fetch single program by ID
 * Includes stats if includeStats=true query param
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Parse query params
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    // 4. Fetch program with multi-tenant security
    const program = await db.nutritionProgram.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId, // MANDATORY multi-tenant filter
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        ...(includeStats && {
          _count: {
            select: {
              menus: true,
              menuPlans: true,
              productions: true,
              distributions: true,
              schools: true,
              feedback: true,
            },
          },
        }),
      },
    })

    if (!program) {
      return Response.json({ error: 'Program not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: program })
  } catch (error) {
    console.error('GET /api/sppg/program/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to fetch program',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sppg/program/[id]
 * Update existing program
 * Only fields provided will be updated (partial update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Role Check
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

    // 4. Verify program exists and belongs to SPPG
    const existingProgram = await db.nutritionProgram.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId, // Multi-tenant security
      },
    })

    if (!existingProgram) {
      return Response.json({ error: 'Program not found' }, { status: 404 })
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = updateProgramSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    // 6. Update program
    const updatedProgram = await db.nutritionProgram.update({
      where: { id },
      data: validated.data,
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

    // 7. Log audit trail
    console.log(`Program updated: ${updatedProgram.programCode} by user: ${session.user.email}`)

    return Response.json({ success: true, data: updatedProgram })
  } catch (error) {
    console.error('PUT /api/sppg/program/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to update program',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sppg/program/[id]
 * Delete program
 * Cascade delete will remove: menus, menu plans, productions, distributions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Role Check - Only SPPG_KEPALA and SUPERADMIN can delete
    const allowedRoles: UserRole[] = [
      'PLATFORM_SUPERADMIN',
      'SPPG_KEPALA',
    ]

    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 3. SPPG Access Check
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 4. Verify program exists and belongs to SPPG
    const existingProgram = await db.nutritionProgram.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId, // Multi-tenant security
      },
      include: {
        _count: {
          select: {
            menus: true,
            menuPlans: true,
            productions: true,
            distributions: true,
          },
        },
      },
    })

    if (!existingProgram) {
      return Response.json({ error: 'Program not found' }, { status: 404 })
    }

    // 5. Check if program has dependencies (optional warning)
    const hasMenus = existingProgram._count.menus > 0
    const hasProductions = existingProgram._count.productions > 0
    const hasDistributions = existingProgram._count.distributions > 0

    if (hasMenus || hasProductions || hasDistributions) {
      console.warn(`Deleting program with dependencies: 
        Menus: ${existingProgram._count.menus}
        Productions: ${existingProgram._count.productions}
        Distributions: ${existingProgram._count.distributions}
      `)
    }

    // 6. Delete program (cascade will handle related records)
    await db.nutritionProgram.delete({
      where: { id },
    })

    // 7. Log audit trail
    console.log(`Program deleted: ${existingProgram.programCode} by user: ${session.user.email}`)

    return Response.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/sppg/program/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to delete program',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
