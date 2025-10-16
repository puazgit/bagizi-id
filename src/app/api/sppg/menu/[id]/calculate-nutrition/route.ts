/**
 * @fileoverview Nutrition Calculation API - Calculate nutrition from ingredients
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// ================================ POST /api/sppg/menu/[id]/calculate-nutrition ================================

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
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                calories: true,
                protein: true,
                carbohydrates: true,
                fat: true,
                fiber: true
              }
            }
          }
        }
      }
    })

    if (!menu) {
      return Response.json({ 
        success: false, 
        error: 'Menu not found or access denied' 
      }, { status: 404 })
    }

    if (menu.ingredients.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Cannot calculate nutrition: Menu has no ingredients' 
      }, { status: 400 })
    }

    // 4. Calculate total nutrition from all ingredients
    let totalCalories = new Prisma.Decimal(0)
    let totalProtein = new Prisma.Decimal(0)
    let totalCarbs = new Prisma.Decimal(0)
    let totalFat = new Prisma.Decimal(0)
    let totalFiber = new Prisma.Decimal(0)

    // Sum up nutrition from all ingredients (per 100g basis)
    for (const ingredient of menu.ingredients) {
      if (!ingredient.inventoryItem) continue

      const item = ingredient.inventoryItem
      const quantityInGrams = ingredient.quantity // Assume already in grams
      const factor = quantityInGrams / 100 // Convert per 100g to actual quantity

      totalCalories = totalCalories.add(new Prisma.Decimal(item.calories || 0).mul(factor))
      totalProtein = totalProtein.add(new Prisma.Decimal(item.protein || 0).mul(factor))
      totalCarbs = totalCarbs.add(new Prisma.Decimal(item.carbohydrates || 0).mul(factor))
      totalFat = totalFat.add(new Prisma.Decimal(item.fat || 0).mul(factor))
      totalFiber = totalFiber.add(new Prisma.Decimal(item.fiber || 0).mul(factor))
    }

    // 5. Calculate % Daily Value (example: for adults, adjust based on requirements)
    // Standard daily values (example)
    const dailyCalories = 2000
    const dailyProtein = 50
    const dailyCarbs = 275
    const dailyFat = 78
    const dailyFiber = 28

    const caloriesDV = totalCalories.div(dailyCalories).mul(100)
    const proteinDV = totalProtein.div(dailyProtein).mul(100)
    const carbsDV = totalCarbs.div(dailyCarbs).mul(100)
    const fatDV = totalFat.div(dailyFat).mul(100)
    const fiberDV = totalFiber.div(dailyFiber).mul(100)

    // 6. Check AKG compliance (simplified - meets if protein > 20% and calories > 30%)
    const meetsAKG = proteinDV.gte(20) && caloriesDV.gte(30)

    // 7. Upsert nutrition calculation
    const nutritionCalc = await db.menuNutritionCalculation.upsert({
      where: { menuId },
      create: {
        menuId,
        totalCalories: totalCalories.toNumber(),
        totalProtein: totalProtein.toNumber(),
        totalCarbs: totalCarbs.toNumber(),
        totalFat: totalFat.toNumber(),
        totalFiber: totalFiber.toNumber(),
        // Vitamins - set to 0 for now (can be added later when InventoryItem has vitamin data)
        totalVitaminA: 0,
        totalVitaminB1: 0,
        totalVitaminB2: 0,
        totalVitaminB3: 0,
        totalVitaminB6: 0,
        totalVitaminB12: 0,
        totalVitaminC: 0,
        totalVitaminD: 0,
        totalVitaminE: 0,
        totalVitaminK: 0,
        totalFolat: 0,
        // Minerals - set to 0 for now
        totalCalcium: 0,
        totalPhosphorus: 0,
        totalIron: 0,
        totalZinc: 0,
        totalIodine: 0,
        totalSelenium: 0,
        totalMagnesium: 0,
        totalPotassium: 0,
        totalSodium: 0,
        caloriesDV: caloriesDV.toNumber(),
        proteinDV: proteinDV.toNumber(),
        carbsDV: carbsDV.toNumber(),
        fatDV: fatDV.toNumber(),
        fiberDV: fiberDV.toNumber(),
        meetsAKG,
        calculatedBy: session.user.id,
        calculatedAt: new Date()
      },
      update: {
        totalCalories: totalCalories.toNumber(),
        totalProtein: totalProtein.toNumber(),
        totalCarbs: totalCarbs.toNumber(),
        totalFat: totalFat.toNumber(),
        totalFiber: totalFiber.toNumber(),
        // Keep existing vitamin/mineral values on update
        caloriesDV: caloriesDV.toNumber(),
        proteinDV: proteinDV.toNumber(),
        carbsDV: carbsDV.toNumber(),
        fatDV: fatDV.toNumber(),
        fiberDV: fiberDV.toNumber(),
        meetsAKG,
        calculatedBy: session.user.id,
        calculatedAt: new Date()
      }
    })

    // 8. Update menu nutrition compliance flag
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: {
        nutritionStandardCompliance: meetsAKG,
        updatedAt: new Date()
      }
    })

    return Response.json({
      success: true,
      data: nutritionCalc,
      message: 'Nutrition calculated successfully'
    })

  } catch (error) {
    console.error('POST /api/sppg/menu/[id]/calculate-nutrition error:', error)
    
    return Response.json({
      success: false,
      error: 'Failed to calculate nutrition',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
