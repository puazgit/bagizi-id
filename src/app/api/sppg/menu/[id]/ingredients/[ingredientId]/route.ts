/**
 * @fileoverview Individual Menu Ingredient API - Update/Delete specific ingredient
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// ================================ VALIDATION SCHEMAS ================================

const ingredientUpdateSchema = z.object({
  inventoryItemId: z.string().cuid().optional(),
  quantity: z.number().positive().optional(),
  preparationNotes: z.string().optional().nullable(),
  isOptional: z.boolean().optional(),
  substitutes: z.array(z.string()).optional()
})

// ================================ PUT /api/sppg/menu/[id]/ingredients/[ingredientId] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  try {
    const { id: menuId, ingredientId } = await params
    
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

    // 3. Verify ingredient and menu belong to user's SPPG
    const ingredient = await db.menuIngredient.findFirst({
      where: {
        id: ingredientId,
        menuId,
        menu: {
          program: {
            sppgId: session.user.sppgId
          }
        }
      }
    })

    if (!ingredient) {
      return Response.json({ 
        success: false, 
        error: 'Ingredient not found or access denied' 
      }, { status: 404 })
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = ingredientUpdateSchema.parse(body)

    // 5. If inventoryItemId provided, verify it belongs to same SPPG
    if (validated.inventoryItemId) {
      const inventoryItem = await db.inventoryItem.findFirst({
        where: {
          id: validated.inventoryItemId,
          sppgId: session.user.sppgId
        }
      })

      if (!inventoryItem) {
        return Response.json({ 
          success: false, 
          error: 'Inventory item not found or access denied' 
        }, { status: 404 })
      }
    }

    // 6. Update ingredient
    const updatedIngredient = await db.menuIngredient.update({
      where: { id: ingredientId },
      data: validated,
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            category: true,
            unit: true
          }
        }
      }
    })

    // 7. Update menu's updatedAt timestamp
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: { updatedAt: new Date() }
    })

    return Response.json({
      success: true,
      data: updatedIngredient,
      message: 'Ingredient updated successfully'
    })

  } catch (error) {
    console.error('PUT /api/sppg/menu/[id]/ingredients/[ingredientId] error:', error)
    
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
      error: 'Failed to update ingredient',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ================================ DELETE /api/sppg/menu/[id]/ingredients/[ingredientId] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  try {
    const { id: menuId, ingredientId } = await params
    
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

    // 3. Verify ingredient and menu belong to user's SPPG
    const ingredient = await db.menuIngredient.findFirst({
      where: {
        id: ingredientId,
        menuId,
        menu: {
          program: {
            sppgId: session.user.sppgId
          }
        }
      }
    })

    if (!ingredient) {
      return Response.json({ 
        success: false, 
        error: 'Ingredient not found or access denied' 
      }, { status: 404 })
    }

    // 4. Delete ingredient
    await db.menuIngredient.delete({
      where: { id: ingredientId }
    })

    // 5. Update menu's updatedAt timestamp
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: { updatedAt: new Date() }
    })

    return Response.json({
      success: true,
      message: 'Ingredient deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/sppg/menu/[id]/ingredients/[ingredientId] error:', error)
    
    return Response.json({
      success: false,
      error: 'Failed to delete ingredient',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
