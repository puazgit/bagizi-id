/**
 * @fileoverview Menu Ingredients API - Fix #1 Compatible
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @note Fix #1: inventoryItemId REQUIRED, redundant fields removed
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
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

      // Get ingredients with relations
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
              minStock: true,
              costPerUnit: true,
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
          inventoryItem: {
            itemName: 'asc'
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: ingredients
      })

    } catch (error) {
      console.error('GET /api/sppg/menu/[id]/ingredients error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ingredients',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/menu/[id]/ingredients ================================

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
      
      console.log('📥 Received ingredient data:', body)
      
      const validationResult = ingredientCreateSchema.safeParse(body)
      
      if (!validationResult.success) {
        console.error('❌ Validation failed:', validationResult.error.issues)
        return NextResponse.json({ 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.issues
        }, { status: 400 })
      }
      
      const validated = validationResult.data

      // Verify inventoryItemId belongs to same SPPG
      const inventoryItem = await db.inventoryItem.findFirst({
        where: {
          id: validated.inventoryItemId,
          sppgId: session.user.sppgId!
        }
      })

      if (!inventoryItem) {
        return NextResponse.json({ 
          success: false, 
          error: 'Inventory item not found or access denied' 
        }, { status: 404 })
      }

      // Create ingredient
      const ingredient = await db.menuIngredient.create({
        data: {
          menuId,
          inventoryItemId: validated.inventoryItemId,
          quantity: validated.quantity,
          preparationNotes: validated.preparationNotes,
          isOptional: validated.isOptional,
          substitutes: validated.substitutes
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
              minStock: true,
              costPerUnit: true,
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

      // Update menu's updatedAt timestamp
      await db.nutritionMenu.update({
        where: { id: menuId },
        data: { updatedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        data: ingredient,
        message: 'Ingredient added successfully'
      }, { status: 201 })

    } catch (error) {
      console.error('POST /api/sppg/menu/[id]/ingredients error:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.issues
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to add ingredient',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
