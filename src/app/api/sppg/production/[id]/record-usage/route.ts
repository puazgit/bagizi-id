/**
 * @fileoverview API Route: Record Production Stock Usage
 * @description Automatically records stock usage when production is completed
 * @version Next.js 15.5.4 / Prisma ORM 6.17.1
 * @author Bagizi-ID Development Team
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { productionCostCalculator } from '@/services/production/ProductionCostCalculator'

// ============================================================================
// POST /api/sppg/production/:id/record-usage
// ============================================================================

/**
 * Record stock usage for a completed production
 * Creates ProductionStockUsage records for all ingredients used
 * 
 * @method POST
 * @route /api/sppg/production/:id/record-usage
 * @access SPPG Users with production permissions
 * 
 * @example
 * POST /api/sppg/production/prod_123/record-usage
 * {
 *   "actualPortions": 100,
 *   "recordedBy": "user_123"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenant Safety)
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG not found or access denied' }, { status: 403 })
    }

    // 3. Parse Request Body
    const body = await request.json()
    const { actualPortions, recordedBy } = body

    if (!actualPortions || actualPortions <= 0) {
      return Response.json({ 
        error: 'actualPortions is required and must be greater than 0' 
      }, { status: 400 })
    }

    // 4. Get Production with Menu & Ingredients
    const production = await db.foodProduction.findUnique({
      where: { 
        id,
        // Multi-tenant safety: ensure production belongs to user's SPPG
        program: {
          sppgId: session.user.sppgId
        }
      },
      include: {
        menu: {
          include: {
            ingredients: {
              include: {
                inventoryItem: true
              }
            }
          }
        },
        program: {
          select: {
            sppgId: true
          }
        }
      }
    })

    if (!production) {
      return Response.json({ 
        error: 'Production not found or access denied' 
      }, { status: 404 })
    }

    // 5. Verify production belongs to user's SPPG
    if (production.program.sppgId !== session.user.sppgId) {
      return Response.json({ 
        error: 'Production does not belong to your SPPG' 
      }, { status: 403 })
    }

    // 6. Check if production is completed
    if (production.status !== 'COMPLETED') {
      return Response.json({ 
        error: 'Can only record stock usage for completed productions',
        details: { currentStatus: production.status }
      }, { status: 400 })
    }

    // 7. Check if stock usage already recorded
    const existingUsage = await db.productionStockUsage.findFirst({
      where: { productionId: id }
    })

    if (existingUsage) {
      return Response.json({ 
        error: 'Stock usage already recorded for this production',
        details: { 
          recordedAt: existingUsage.createdAt,
          recordedBy: existingUsage.recordedBy
        }
      }, { status: 409 })
    }

    // 8. Check if menu has ingredients
    if (!production.menu || !production.menu.ingredients.length) {
      return Response.json({ 
        error: 'Production menu has no ingredients to record',
        details: { menuId: production.menuId }
      }, { status: 400 })
    }

    // 9. Calculate actual quantities based on actualPortions
    const usageRecords = production.menu.ingredients.map((ingredient) => {
      // Convert menu quantities (per 100g or per serving) to actual usage
      // MenuIngredient.quantity is per portion, scale by actualPortions
      const actualQuantity = (ingredient.quantity * actualPortions) / 100

      return {
        productionId: production.id,
        inventoryItemId: ingredient.inventoryItemId,
        quantityUsed: actualQuantity,
        unit: ingredient.inventoryItem.unit,
        unitCostAtUse: ingredient.inventoryItem.costPerUnit || 0,
        totalCost: actualQuantity * (ingredient.inventoryItem.costPerUnit || 0),
        recordedBy: recordedBy || session.user.id,
        usedAt: new Date(), // Changed from recordedAt to match schema
        notes: null,
      }
    })

    // 10. Create all stock usage records in transaction
    const createdRecords = await db.$transaction(
      usageRecords.map((record) =>
        db.productionStockUsage.create({
          data: record,
        })
      )
    )

    // 11. Calculate total cost using ProductionCostCalculator
    const costSummary = await productionCostCalculator.calculateProductionCost(id)

    return Response.json({ 
      success: true, 
      data: {
        recordsCreated: createdRecords.length,
        totalCost: costSummary.totalCost,
        costPerPortion: costSummary.costPerPortion,
        ingredients: createdRecords.map((record) => ({
          inventoryItemId: record.inventoryItemId,
          quantityUsed: record.quantityUsed,
          unit: record.unit,
          totalCost: record.totalCost,
        }))
      }
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/sppg/production/:id/record-usage error:', error)
    return Response.json({ 
      error: 'Failed to record stock usage',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
