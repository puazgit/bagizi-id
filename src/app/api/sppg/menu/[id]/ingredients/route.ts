/**
 * @fileoverview Menu Ingredients API - Fix #1 Compatible
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @note Fix #1: inventoryItemId REQUIRED, redundant fields removed
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// ================================ VALIDATION SCHEMAS ================================

const ingredientCreateSchema = z.object({
  inventoryItemId: z.string().cuid('Invalid inventory item ID'), // ✅ Fix #1: REQUIRED
  quantity: z.number().positive('Jumlah harus lebih dari 0'),
  preparationNotes: z.string().optional().nullable(),
  isOptional: z.boolean().default(false),
  substitutes: z.array(z.string()).default([])
  // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit, totalCost
})

// ================================ GET /api/sppg/menu/[id]/ingredients ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: menuId } = await params
    
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

    // 3. Verify menu belongs to user's SPPG
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId
        }
      }
    })

    if (!menu) {
      return Response.json({ 
        success: false, 
        error: 'Menu not found or access denied' 
      }, { status: 404 })
    }

    // 4. Get ingredients with relations
    const ingredients = await db.menuIngredient.findMany({
      where: {
        menuId
      },
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            category: true,
            unit: true,
            currentStock: true,
            minStock: true,           // ✅ Added for stock status
            costPerUnit: true,        // ✅ FIX: Added missing costPerUnit field
            lastPrice: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true
          }
        }
      },
      orderBy: {
        // ✅ Fix #1: Order by inventoryItem name instead of ingredientName
        inventoryItem: {
          itemName: 'asc'
        }
      }
    })

    return Response.json({
      success: true,
      data: ingredients
    })

  } catch (error) {
    console.error('GET /api/sppg/menu/[id]/ingredients error:', error)
    
    return Response.json({
      success: false,
      error: 'Failed to fetch ingredients',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ================================ POST /api/sppg/menu/[id]/ingredients ================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: menuId } = await params
    
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

    // 3. Verify menu belongs to user's SPPG
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId
        }
      }
    })

    if (!menu) {
      return Response.json({ 
        success: false, 
        error: 'Menu not found or access denied' 
      }, { status: 404 })
    }

    // 4. Parse and validate request body
    const body = await request.json()
    
    console.log('📥 Received ingredient data:', body)
    
    // Validate with Zod
    const validationResult = ingredientCreateSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues)
      return Response.json({ 
        success: false, 
        error: 'Validation failed',
        details: validationResult.error.issues
      }, { status: 400 })
    }
    
    const validated = validationResult.data

    // 5. Verify inventoryItemId belongs to same SPPG (Fix #1: REQUIRED check)
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

    // 6. Create ingredient (Fix #1: ONLY inventoryItemId + quantity + notes)
    const ingredient = await db.menuIngredient.create({
      data: {
        menuId,
        inventoryItemId: validated.inventoryItemId, // ✅ Fix #1: REQUIRED
        quantity: validated.quantity,
        preparationNotes: validated.preparationNotes,
        isOptional: validated.isOptional,
        substitutes: validated.substitutes
        // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit, totalCost
      },
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            category: true,
            unit: true,
            currentStock: true,
            minStock: true,           // ✅ Added for stock status
            costPerUnit: true,        // ✅ FIX: Added missing costPerUnit field
            lastPrice: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true
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
      data: ingredient,
      message: 'Ingredient added successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/sppg/menu/[id]/ingredients error:', error)
    
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
      error: 'Failed to add ingredient',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
