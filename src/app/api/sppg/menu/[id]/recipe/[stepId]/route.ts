/**
 * @fileoverview Individual Recipe Step API - Update/Delete specific step
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// ================================ VALIDATION SCHEMAS ================================

const recipeStepUpdateSchema = z.object({
  stepNumber: z.number().int().positive().optional(),
  title: z.string().optional().nullable(),
  instruction: z.string().min(1).optional(),
  duration: z.number().int().positive().optional().nullable(),
  temperature: z.number().int().optional().nullable(),
  equipment: z.array(z.string()).optional(),
  qualityCheck: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable()
})

// ================================ PUT /api/sppg/menu/[id]/recipe/[stepId] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: menuId, stepId } = await params
    
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

    // 3. Verify recipe step and menu belong to user's SPPG
    const recipeStep = await db.recipeStep.findFirst({
      where: {
        id: stepId,
        menuId,
        menu: {
          program: {
            sppgId: session.user.sppgId
          }
        }
      }
    })

    if (!recipeStep) {
      return Response.json({ 
        success: false, 
        error: 'Recipe step not found or access denied' 
      }, { status: 404 })
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = recipeStepUpdateSchema.parse(body)

    // 5. If step number is being changed, check for conflicts
    if (validated.stepNumber && validated.stepNumber !== recipeStep.stepNumber) {
      const conflictingStep = await db.recipeStep.findFirst({
        where: {
          menuId,
          stepNumber: validated.stepNumber,
          id: { not: stepId }
        }
      })

      if (conflictingStep) {
        return Response.json({ 
          success: false, 
          error: `Step number ${validated.stepNumber} already exists` 
        }, { status: 400 })
      }
    }

    // 6. Update recipe step
    const updatedStep = await db.recipeStep.update({
      where: { id: stepId },
      data: validated
    })

    // 7. Update menu's updatedAt timestamp
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: { updatedAt: new Date() }
    })

    return Response.json({
      success: true,
      data: updatedStep,
      message: 'Recipe step updated successfully'
    })

  } catch (error) {
    console.error('PUT /api/sppg/menu/[id]/recipe/[stepId] error:', error)
    
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
      error: 'Failed to update recipe step',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ================================ DELETE /api/sppg/menu/[id]/recipe/[stepId] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: menuId, stepId } = await params
    
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

    // 3. Verify recipe step and menu belong to user's SPPG
    const recipeStep = await db.recipeStep.findFirst({
      where: {
        id: stepId,
        menuId,
        menu: {
          program: {
            sppgId: session.user.sppgId
          }
        }
      }
    })

    if (!recipeStep) {
      return Response.json({ 
        success: false, 
        error: 'Recipe step not found or access denied' 
      }, { status: 404 })
    }

    // 4. Delete recipe step
    await db.recipeStep.delete({
      where: { id: stepId }
    })

    // 5. Update menu's updatedAt timestamp
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: { updatedAt: new Date() }
    })

    return Response.json({
      success: true,
      message: 'Recipe step deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/sppg/menu/[id]/recipe/[stepId] error:', error)
    
    return Response.json({
      success: false,
      error: 'Failed to delete recipe step',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
