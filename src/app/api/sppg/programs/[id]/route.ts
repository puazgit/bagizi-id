/**
 * @fileoverview Individual Program API endpoints for SPPG
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// Program update schema
const programUpdateSchema = z.object({
  programName: z.string().min(3, 'Nama program minimal 3 karakter').optional(),
  description: z.string().optional(),
  targetBeneficiaries: z.number().min(1, 'Target minimal 1 benefisiari').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED']).optional(),
})

// ================================ GET /api/sppg/programs/[id] ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params
    
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - Login required' 
      }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenancy)
    if (!session.user.sppgId) {
      return Response.json({ 
        success: false, 
        error: 'SPPG access required' 
      }, { status: 403 })
    }

    // 3. Fetch program with comprehensive data
    const program = await db.nutritionProgram.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId // Multi-tenant safety
      },
      include: {
        menus: {
          select: {
            id: true,
            menuName: true,
            mealType: true,
            isActive: true,
            costPerServing: true
          },
          orderBy: {
            menuName: 'asc'
          }
        },
        schools: {
          select: {
            id: true,
            schoolName: true,
            totalStudents: true
          }
        },
        _count: {
          select: {
            menus: true,
            schools: true
          }
        }
      }
    })

    if (!program) {
      return Response.json({
        success: false,
        error: 'Program not found or access denied'
      }, { status: 404 })
    }

    // 4. Calculate program statistics
    const totalMenuCost = program.menus.reduce((sum, menu) => sum + menu.costPerServing, 0)
    const averageCostPerMenu = program.menus.length > 0 ? totalMenuCost / program.menus.length : 0

    // 5. Return program with statistics
    return Response.json({
      success: true,
      data: {
        ...program,
        statistics: {
          totalMenus: program._count.menus,
          activeSchools: program._count.schools,
          totalMenuCost,
          averageCostPerMenu,
          dailyCostEstimate: averageCostPerMenu * program.targetRecipients
        }
      }
    })

  } catch (error) {
    console.error(`GET /api/sppg/programs/[id] error:`, error)
    
    return Response.json({
      success: false,
      error: 'Failed to fetch program',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ================================ PUT /api/sppg/programs/[id] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params
    
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - Login required' 
      }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenancy)
    if (!session.user.sppgId) {
      return Response.json({ 
        success: false, 
        error: 'SPPG access required' 
      }, { status: 403 })
    }

    // 3. Role Check - Only SPPG users with program management permission
    if (!session.user.userRole?.startsWith('SPPG_')) {
      return Response.json({ 
        success: false, 
        error: 'Insufficient permissions for program management' 
      }, { status: 403 })
    }

    // 4. Verify program exists and belongs to user's SPPG
    const existingProgram = await db.nutritionProgram.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId // Multi-tenant safety
      }
    })

    if (!existingProgram) {
      return Response.json({
        success: false,
        error: 'Program not found or access denied'
      }, { status: 404 })
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = programUpdateSchema.parse(body)

    // 6. Prepare update data
    const updateData: Record<string, unknown> = { ...validated }
    
    if (validated.startDate) {
      updateData.startDate = new Date(validated.startDate)
    }
    
    if (validated.endDate) {
      updateData.endDate = new Date(validated.endDate)
    }

    // 7. Update program
    const program = await db.nutritionProgram.update({
      where: {
        id
      },
      data: updateData,
      select: {
        id: true,
        sppgId: true,
        name: true,
        description: true,
        targetRecipients: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 8. Log activity for audit trail
    console.log(`Program updated: ${program.id} by user ${session.user.id}`)

    // 9. Return success response
    return Response.json({
      success: true,
      data: program,
      message: 'Program berhasil diperbarui'
    })

  } catch (error) {
    console.error(`PUT /api/sppg/programs/[id] error:`, error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 })
    }

    return Response.json({
      success: false,
      error: 'Failed to update program',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ================================ DELETE /api/sppg/programs/[id] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params
    
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - Login required' 
      }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenancy)
    if (!session.user.sppgId) {
      return Response.json({ 
        success: false, 
        error: 'SPPG access required' 
      }, { status: 403 })
    }

    // 3. Role Check - Only SPPG users with program management permission
    if (!session.user.userRole?.startsWith('SPPG_')) {
      return Response.json({ 
        success: false, 
        error: 'Insufficient permissions for program management' 
      }, { status: 403 })
    }

    // 4. Check if program can be deleted (no active menus or beneficiaries)
    const program = await db.nutritionProgram.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId // Multi-tenant safety
      },
      include: {
        _count: {
          select: {
            menus: true,
            schools: true
          }
        }
      }
    })

    if (!program) {
      return Response.json({
        success: false,
        error: 'Program not found or access denied'
      }, { status: 404 })
    }

    if (program._count.menus > 0 || program._count.schools > 0) {
      return Response.json({
        success: false,
        error: 'Cannot delete program with existing menus or schools',
        details: {
          code: 'PROGRAM_HAS_DEPENDENCIES',
          menus: program._count.menus,
          schools: program._count.schools
        }
      }, { status: 409 })
    }

    // 5. Delete program
    await db.nutritionProgram.delete({
      where: {
        id
      }
    })

    // 6. Log activity for audit trail
    console.log(`Program deleted: ${id} by user ${session.user.id}`)

    // 7. Return success response
    return Response.json({
      success: true,
      message: 'Program berhasil dihapus'
    })

  } catch (error) {
    console.error(`DELETE /api/sppg/programs/[id] error:`, error)
    
    return Response.json({
      success: false,
      error: 'Failed to delete program',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}