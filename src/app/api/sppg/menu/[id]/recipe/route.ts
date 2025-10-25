/**
 * @fileoverview Recipe Steps API - Manage cooking steps for a specific menu
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// ================================ VALIDATION SCHEMAS ================================

const recipeStepCreateSchema = z.object({
  stepNumber: z.number().int().positive('Nomor langkah harus bilangan positif'),
  title: z.string().optional().nullable(),
  instruction: z.string().min(1, 'Instruksi harus diisi'),
  duration: z.number().int().positive().optional().nullable(),
  temperature: z.number().int().optional().nullable(),
  equipment: z.array(z.string()).default([]),
  qualityCheck: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable()
})

// ================================ GET /api/sppg/menu/[id]/recipe ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: menuId } = await params

      // Verify menu belongs to user's SPPG
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: menuId,
          program: {
            sppgId: session.user.sppgId!
          }
        }
      })

      if (!menu) {
        return NextResponse.json({ 
          success: false, 
          error: 'Menu not found or access denied' 
        }, { status: 404 })
      }

      // Get recipe steps ordered by step number
      const recipeSteps = await db.recipeStep.findMany({
        where: {
          menuId
        },
        orderBy: {
          stepNumber: 'asc'
        }
      })

      return NextResponse.json({
        success: true,
        data: recipeSteps
      })

    } catch (error) {
      console.error('GET /api/sppg/menu/[id]/recipe error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch recipe steps',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/menu/[id]/recipe ================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: menuId } = await params

      // Verify menu belongs to user's SPPG
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: menuId,
          program: {
            sppgId: session.user.sppgId!
          }
        }
      })

      if (!menu) {
        return NextResponse.json({ 
          success: false, 
          error: 'Menu not found or access denied' 
        }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = recipeStepCreateSchema.parse(body)

      // Check if step number already exists
      const existingStep = await db.recipeStep.findFirst({
        where: {
          menuId,
          stepNumber: validated.stepNumber
        }
      })

      if (existingStep) {
        return NextResponse.json({ 
          success: false, 
          error: `Step number ${validated.stepNumber} already exists. Please use a different number.` 
        }, { status: 400 })
      }

      // Create recipe step
      const recipeStep = await db.recipeStep.create({
        data: {
          menuId,
          stepNumber: validated.stepNumber,
          title: validated.title,
          instruction: validated.instruction,
          duration: validated.duration,
          temperature: validated.temperature,
          equipment: validated.equipment,
          qualityCheck: validated.qualityCheck,
          imageUrl: validated.imageUrl,
          videoUrl: validated.videoUrl
        }
      })

      // Update menu's updatedAt timestamp
      await db.nutritionMenu.update({
        where: { id: menuId },
        data: { updatedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        data: recipeStep,
        message: 'Recipe step added successfully'
      }, { status: 201 })

    } catch (error) {
      console.error('POST /api/sppg/menu/[id]/recipe error:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.issues
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to add recipe step',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
