/**
 * @fileoverview Cost Report API - Get detailed cost breakdown and analysis
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// ================================ GET /api/sppg/menu/[id]/cost-report ================================

export async function GET(
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

    // 3. Fetch menu with cost calculation and ingredients (multi-tenant security)
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
            name: true,
            sppgId: true
          }
        },
        costCalc: true,
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                itemName: true,
                itemCode: true,
                unit: true,
                costPerUnit: true,
                preferredSupplier: {
                  select: {
                    supplierName: true,
                    supplierCode: true
                  }
                }
              }
            }
          },
          orderBy: {
            inventoryItem: {
              itemName: 'asc'
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

    // 4. Check if cost calculation exists
    if (!menu.costCalc) {
      return Response.json({
        success: false,
        error: 'Cost not yet calculated. Please calculate cost first.'
      }, { status: 404 })
    }

    // 5. Prepare comprehensive cost report matching CostReport type
    const report = {
      menuId: menu.id,
      menuName: menu.menuName,
      servingSize: menu.servingSize,
      servingsPerRecipe: 1, // Default to 1
      
      // Cost Breakdown (flat structure)
      costBreakdown: {
        ingredientsCost: menu.costCalc.totalIngredientCost || 0,
        laborCost: menu.costCalc.totalLaborCost || 0,
        utilitiesCost: menu.costCalc.totalUtilityCost || 0,
        operationalCost: (menu.costCalc.packagingCost || 0) + (menu.costCalc.equipmentCost || 0) + (menu.costCalc.cleaningCost || 0),
        overheadCost: menu.costCalc.overheadCost || 0,
        totalDirectCost: menu.costCalc.totalDirectCost || 0,
        totalCost: menu.costCalc.grandTotalCost || 0
      },
      
      // Labor Cost Detail
      laborCost: {
        preparationHours: menu.costCalc.preparationHours || 0,
        cookingHours: menu.costCalc.cookingHours || 0,
        totalHours: (menu.costCalc.preparationHours || 0) + (menu.costCalc.cookingHours || 0),
        laborCostPerHour: menu.costCalc.laborCostPerHour || 0,
        totalLaborCost: menu.costCalc.totalLaborCost || 0
      },
      
      // Utilities Cost Detail
      utilitiesCost: {
        gasCost: menu.costCalc.gasCost || 0,
        electricityCost: menu.costCalc.electricityCost || 0,
        waterCost: menu.costCalc.waterCost || 0,
        totalUtilitiesCost: menu.costCalc.totalUtilityCost || 0
      },
      
      // Operational Cost Detail
      operationalCost: {
        packagingCost: menu.costCalc.packagingCost || 0,
        equipmentMaintenanceCost: menu.costCalc.equipmentCost || 0,
        cleaningSuppliesCost: menu.costCalc.cleaningCost || 0,
        totalOperationalCost: (menu.costCalc.packagingCost || 0) + (menu.costCalc.equipmentCost || 0) + (menu.costCalc.cleaningCost || 0)
      },
      
      // Cost Ratios
      costRatios: {
        ingredientCostRatio: menu.costCalc.ingredientCostRatio || 0,
        laborCostRatio: menu.costCalc.laborCostRatio || 0,
        overheadCostRatio: menu.costCalc.overheadCostRatio || 0
      },
      
      // Budget Planning (for SPPG budget allocation)
      budgetPlanning: menu.costCalc.budgetAllocation ? {
        budgetAllocation: menu.costCalc.budgetAllocation,
        budgetUtilization: menu.costCalc.grandTotalCost && menu.costCalc.budgetAllocation 
          ? (menu.costCalc.grandTotalCost / menu.costCalc.budgetAllocation) * 100 
          : 0,
        budgetRemaining: menu.costCalc.budgetAllocation && menu.costCalc.grandTotalCost
          ? menu.costCalc.budgetAllocation - menu.costCalc.grandTotalCost
          : 0
      } : undefined,
      
      // Per Unit Costs
      costPerServing: menu.costCalc.costPerPortion || 0,
      costPerGram: menu.servingSize > 0 ? (menu.costCalc.costPerPortion || 0) / menu.servingSize : 0,
      
      // Ingredients Detail
      ingredients: menu.ingredients.map(ing => ({
        ingredientName: ing.inventoryItem.itemName,
        quantity: ing.quantity,
        unit: ing.inventoryItem.unit,
        costPerUnit: ing.inventoryItem.costPerUnit || 0,
        totalCost: ing.quantity * (ing.inventoryItem.costPerUnit || 0),
        inventoryItem: ing.inventoryItem ? {
          itemName: ing.inventoryItem.itemName,
          itemCode: ing.inventoryItem.itemCode || ing.id, // Use actual itemCode with fallback to ingredient ID
          preferredSupplier: ing.inventoryItem.preferredSupplier ? {
            supplierName: ing.inventoryItem.preferredSupplier.supplierName,
            supplierCode: ing.inventoryItem.preferredSupplier.supplierCode || ing.inventoryItem.preferredSupplier.supplierName // Use actual code with fallback
          } : undefined
        } : undefined
      })),
      
      // Metadata
      calculatedAt: menu.costCalc.calculatedAt.toISOString()
    }

    return Response.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('GET /api/sppg/menu/[id]/cost-report error:', error)
    return Response.json({
      success: false,
      error: 'Failed to generate cost report',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
