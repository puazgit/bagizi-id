/**
 * @fileoverview Cost Calculation API - Calculate menu cost from ingredients + operational costs
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { ingredientBreakdownSchema } from '@/features/sppg/menu/schemas'

// ================================ POST /api/sppg/menu/[id]/calculate-cost ================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Extract menuId
    const { id: menuId } = await params

    // 3. Verify menu belongs to user's SPPG (multi-tenant security)
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        program: {
          select: {
            sppgId: true,
            name: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                itemName: true,
                unit: true,
                currentStock: true,
                minStock: true,
                costPerUnit: true
              }
            }
          }
        }
      }
    })

    if (!menu) {
      return Response.json({ 
        error: 'Menu not found or access denied' 
      }, { status: 404 })
    }

    // 4. Check if menu has ingredients
    if (menu.ingredients.length === 0) {
      return Response.json({
        success: false,
        error: 'Tidak dapat menghitung biaya: menu belum memiliki bahan'
      }, { status: 400 })
    }

    // 5. Calculate total ingredient cost
    // CRITICAL: Scale ingredient quantities from 100g base to actual serving size
    let totalIngredientCost = new Prisma.Decimal(0)
    const ingredientBreakdown: Array<{
      inventoryItemId: string
      inventoryItemName: string
      quantity: number
      unit: string
      costPerUnit: number
      totalCost: number
    }> = []

    for (const ingredient of menu.ingredients) {
      const itemCostPerUnit = ingredient.inventoryItem.costPerUnit || 0
      
      // BUG FIX: Scale quantity from 100g base to actual serving size
      // Example: 0.12 kg (100g) → 0.156 kg (130g) for servingSize=130g
      const actualQuantity = ingredient.quantity * (menu.servingSize / 100)
      
      // Calculate cost using actual scaled quantity
      const itemTotalCost = actualQuantity * itemCostPerUnit
      const cost = new Prisma.Decimal(itemTotalCost)
      totalIngredientCost = totalIngredientCost.add(cost)

      ingredientBreakdown.push({
        inventoryItemId: ingredient.inventoryItemId,
        inventoryItemName: ingredient.inventoryItem.itemName,
        quantity: actualQuantity, // Store actual scaled quantity, not 100g base
        unit: ingredient.inventoryItem.unit,
        costPerUnit: itemCostPerUnit,
        totalCost: itemTotalCost
      })
    }

    // 6. Parse request body for cost details (optional)
    const body = await request.json().catch(() => ({}))
    
    // REALISTIC DEFAULTS based on SPPG operations in Indonesia
    // These are calculated per batch (plannedPortions or batchSize)
    const defaultPlannedPortions = body.plannedPortions || menu.batchSize || 100
    
    // Labor costs - Based on UMR Jakarta 2024 (~Rp 5,000,000/month = ~Rp 25,000/hour)
    // Typical SPPG cooking staff: Rp 15,000-25,000/hour
    const laborCostPerHour = new Prisma.Decimal(body.laborCostPerHour ?? 20000) // Rp 20,000/hour
    
    // Preparation + Cooking time estimation based on batch size
    // Small batch (<50): 1.5 hours, Medium (50-150): 2.5 hours, Large (>150): 4 hours
    let defaultHours = 2.5
    if (defaultPlannedPortions < 50) {
      defaultHours = 1.5
    } else if (defaultPlannedPortions > 150) {
      defaultHours = 4.0
    }
    
    const preparationHours = new Prisma.Decimal(body.preparationHours ?? defaultHours * 0.4) // 40% prep
    const cookingHours = new Prisma.Decimal(body.cookingHours ?? defaultHours * 0.6) // 60% cooking
    const totalLaborCost = laborCostPerHour.mul(preparationHours.add(cookingHours))

    // Utility costs per batch
    // Gas: LPG 3kg = Rp 20,000, typically used 1/4 per batch = Rp 5,000
    // Electricity: ~500W x 2 hours = 1 kWh x Rp 1,500 = Rp 1,500
    // Water: ~100 liters x Rp 10 = Rp 1,000
    const gasCost = new Prisma.Decimal(body.gasCost ?? 5000) // Rp 5,000 per batch
    const electricityCost = new Prisma.Decimal(body.electricityCost ?? 1500) // Rp 1,500 per batch
    const waterCost = new Prisma.Decimal(body.waterCost ?? 1000) // Rp 1,000 per batch
    const totalUtilityCost = gasCost.add(electricityCost).add(waterCost)

    // Other operational costs per batch
    // Packaging: Plastik/box = Rp 500-1000 per porsi
    const packagingCostPerPortion = 500 // Rp 500/porsi
    const packagingCost = new Prisma.Decimal(
      body.packagingCost ?? (packagingCostPerPortion * defaultPlannedPortions)
    )
    
    // Equipment depreciation: Kompor, panci, alat masak ~Rp 10jt / 5 tahun / 250 hari kerja = Rp 8,000/hari
    const equipmentCost = new Prisma.Decimal(body.equipmentCost ?? 8000) // Rp 8,000 per batch
    
    // Cleaning supplies: Sabun, tissue, dll = Rp 5,000 per batch
    const cleaningCost = new Prisma.Decimal(body.cleaningCost ?? 5000) // Rp 5,000 per batch

    // Overhead
    const overheadPercentage = new Prisma.Decimal(body.overheadPercentage || 15)
    const totalDirectCost = totalIngredientCost.add(totalLaborCost).add(totalUtilityCost)
    const overheadCost = totalDirectCost.mul(overheadPercentage).div(100)

    // Total indirect cost
    const totalIndirectCost = packagingCost.add(equipmentCost).add(cleaningCost).add(overheadCost)

    // Grand total
    const grandTotalCost = totalDirectCost.add(totalIndirectCost)

    // Per portion calculation
    // Use batchSize as default if plannedPortions not provided in request
    const plannedPortions = body.plannedPortions || menu.batchSize || 1
    const costPerPortion = grandTotalCost.div(plannedPortions)

    // Budget allocation (optional for SPPG budget planning)
    const budgetAllocation = body.budgetAllocation ? new Prisma.Decimal(body.budgetAllocation) : null

    // Cost ratios
    const ingredientCostRatio = totalIngredientCost.div(grandTotalCost).mul(100)
    const laborCostRatio = totalLaborCost.div(grandTotalCost).mul(100)
    const overheadCostRatio = overheadCost.div(grandTotalCost).mul(100)
    
    // 11. Validate ingredient breakdown structure
    const validatedBreakdown = ingredientBreakdownSchema.safeParse(ingredientBreakdown)
    if (!validatedBreakdown.success) {
      return Response.json({
        success: false,
        error: 'Invalid ingredient breakdown structure',
        details: validatedBreakdown.error.issues
      }, { status: 400 })
    }
    
    // 12. Upsert cost calculation
    const costCalc = await db.menuCostCalculation.upsert({
      where: { menuId },
      create: {
        menuId,
        // Ingredient costs
        totalIngredientCost: totalIngredientCost.toNumber(),
        ingredientBreakdown: ingredientBreakdown as unknown as Prisma.InputJsonValue,
        // Labor costs
        laborCostPerHour: laborCostPerHour.toNumber(),
        preparationHours: preparationHours.toNumber(),
        cookingHours: cookingHours.toNumber(),
        totalLaborCost: totalLaborCost.toNumber(),
        // Utility costs
        gasCost: gasCost.toNumber(),
        electricityCost: electricityCost.toNumber(),
        waterCost: waterCost.toNumber(),
        totalUtilityCost: totalUtilityCost.toNumber(),
        // Operational costs
        packagingCost: packagingCost.toNumber(),
        equipmentCost: equipmentCost.toNumber(),
        cleaningCost: cleaningCost.toNumber(),
        // Overhead
        overheadPercentage: overheadPercentage.toNumber(),
        overheadCost: overheadCost.toNumber(),
        // Totals
        totalDirectCost: totalDirectCost.toNumber(),
        totalIndirectCost: totalIndirectCost.toNumber(),
        grandTotalCost: grandTotalCost.toNumber(),
        // Per portion
        plannedPortions,
        costPerPortion: costPerPortion.toNumber(),
        // Budget allocation (for SPPG budget planning)
        budgetAllocation: budgetAllocation?.toNumber(),
        // Ratios
        ingredientCostRatio: ingredientCostRatio.toNumber(),
        laborCostRatio: laborCostRatio.toNumber(),
        overheadCostRatio: overheadCostRatio.toNumber(),
        // Metadata
        calculatedBy: session.user.id,
        calculatedAt: new Date(),
        calculationMethod: 'AUTO'
      },
      update: {
        // Ingredient costs
        totalIngredientCost: totalIngredientCost.toNumber(),
        ingredientBreakdown: ingredientBreakdown as unknown as Prisma.InputJsonValue,
        // Labor costs
        laborCostPerHour: laborCostPerHour.toNumber(),
        preparationHours: preparationHours.toNumber(),
        cookingHours: cookingHours.toNumber(),
        totalLaborCost: totalLaborCost.toNumber(),
        // Utility costs
        gasCost: gasCost.toNumber(),
        electricityCost: electricityCost.toNumber(),
        waterCost: waterCost.toNumber(),
        totalUtilityCost: totalUtilityCost.toNumber(),
        // Operational costs
        packagingCost: packagingCost.toNumber(),
        equipmentCost: equipmentCost.toNumber(),
        cleaningCost: cleaningCost.toNumber(),
        // Overhead
        overheadPercentage: overheadPercentage.toNumber(),
        overheadCost: overheadCost.toNumber(),
        // Totals
        totalDirectCost: totalDirectCost.toNumber(),
        totalIndirectCost: totalIndirectCost.toNumber(),
        grandTotalCost: grandTotalCost.toNumber(),
        // Per portion
        plannedPortions,
        costPerPortion: costPerPortion.toNumber(),
        // Budget allocation (for SPPG budget planning)
        budgetAllocation: budgetAllocation?.toNumber(),
        // Ratios
        ingredientCostRatio: ingredientCostRatio.toNumber(),
        laborCostRatio: laborCostRatio.toNumber(),
        overheadCostRatio: overheadCostRatio.toNumber(),
        // Metadata
        calculatedBy: session.user.id,
        calculatedAt: new Date()
      },
    })

    // 12. Update menu timestamp
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: {
        updatedAt: new Date()
      }
    })

    return Response.json({
      success: true,
      message: 'Cost calculation completed successfully',
      data: {
        totalIngredientCost: totalIngredientCost.toNumber(),
        totalLaborCost: totalLaborCost.toNumber(),
        totalUtilityCost: totalUtilityCost.toNumber(),
        totalDirectCost: totalDirectCost.toNumber(),
        totalIndirectCost: totalIndirectCost.toNumber(),
        grandTotalCost: grandTotalCost.toNumber(),
        costPerPortion: costPerPortion.toNumber(),
        budgetAllocation: budgetAllocation?.toNumber(),
        calculatedAt: costCalc.calculatedAt
      }
    })

  } catch (error) {
    console.error('POST /api/sppg/menu/[id]/calculate-cost error:', error)
    return Response.json({
      success: false,
      error: 'Gagal menghitung biaya',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
