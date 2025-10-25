/**
 * @fileoverview Nutrition Calculation API - Calculate nutrition from ingredients
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// ================================ POST /api/sppg/menu/[id]/calculate-nutrition ================================

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
        },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                // Unit (needed for conversion)
                unit: true,
                // Macronutrients
                calories: true,
                protein: true,
                carbohydrates: true,
                fat: true,
                fiber: true,
                // Vitamins (per 100g)
                vitaminA: true,
                vitaminB1: true,
                vitaminB2: true,
                vitaminB3: true,
                vitaminB6: true,
                vitaminB12: true,
                vitaminC: true,
                vitaminD: true,
                vitaminE: true,
                vitaminK: true,
                folate: true,
                // Minerals (per 100g)
                calcium: true,
                iron: true,
                magnesium: true,
                phosphorus: true,
                potassium: true,
                sodium: true,
                zinc: true,
                selenium: true,
                iodine: true
              }
            }
          }
        }
      }
    })

    if (!menu) {
      return NextResponse.json({ 
        success: false, 
        error: 'Menu not found or access denied' 
      }, { status: 404 })
    }

    if (menu.ingredients.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tidak dapat menghitung nutrisi: menu belum memiliki bahan' 
      }, { status: 400 })
    }

    // 4. Calculate total nutrition from all ingredients
    let totalCalories = new Prisma.Decimal(0)
    let totalProtein = new Prisma.Decimal(0)
    let totalCarbs = new Prisma.Decimal(0)
    let totalFat = new Prisma.Decimal(0)
    let totalFiber = new Prisma.Decimal(0)
    
    // Vitamins
    let totalVitaminA = new Prisma.Decimal(0)
    let totalVitaminB1 = new Prisma.Decimal(0)
    let totalVitaminB2 = new Prisma.Decimal(0)
    let totalVitaminB3 = new Prisma.Decimal(0)
    let totalVitaminB6 = new Prisma.Decimal(0)
    let totalVitaminB12 = new Prisma.Decimal(0)
    let totalVitaminC = new Prisma.Decimal(0)
    let totalVitaminD = new Prisma.Decimal(0)
    let totalVitaminE = new Prisma.Decimal(0)
    let totalVitaminK = new Prisma.Decimal(0)
    let totalFolate = new Prisma.Decimal(0)
    
    // Minerals
    let totalCalcium = new Prisma.Decimal(0)
    let totalIron = new Prisma.Decimal(0)
    let totalMagnesium = new Prisma.Decimal(0)
    let totalPhosphorus = new Prisma.Decimal(0)
    let totalPotassium = new Prisma.Decimal(0)
    let totalSodium = new Prisma.Decimal(0)
    let totalZinc = new Prisma.Decimal(0)
    let totalSelenium = new Prisma.Decimal(0)
    let totalIodine = new Prisma.Decimal(0)

    // Sum up nutrition from all ingredients (per 100g basis)
    for (const ingredient of menu.ingredients) {
      if (!ingredient.inventoryItem) continue

      const item = ingredient.inventoryItem
      
      // Convert quantity to grams based on unit
      let quantityInGrams = ingredient.quantity
      
      // Handle unit conversion
      const unit = item.unit?.toLowerCase() || 'kg'
      if (unit === 'kg' || unit === 'kilogram') {
        quantityInGrams = ingredient.quantity * 1000 // kg to grams
      } else if (unit === 'liter' || unit === 'l') {
        quantityInGrams = ingredient.quantity * 1000 // liter to grams (approximate for liquids)
      } else if (unit === 'lembar' || unit === 'pcs' || unit === 'piece') {
        quantityInGrams = ingredient.quantity * 100 // assume 1 piece = 100g (approximation)
      }
      // else assume already in grams
      
      const factor = quantityInGrams / 100 // Convert per 100g to actual quantity

      // Macronutrients
      totalCalories = totalCalories.add(new Prisma.Decimal(item.calories || 0).mul(factor))
      totalProtein = totalProtein.add(new Prisma.Decimal(item.protein || 0).mul(factor))
      totalCarbs = totalCarbs.add(new Prisma.Decimal(item.carbohydrates || 0).mul(factor))
      totalFat = totalFat.add(new Prisma.Decimal(item.fat || 0).mul(factor))
      totalFiber = totalFiber.add(new Prisma.Decimal(item.fiber || 0).mul(factor))
      
      // Vitamins (per 100g)
      totalVitaminA = totalVitaminA.add(new Prisma.Decimal(item.vitaminA || 0).mul(factor))
      totalVitaminB1 = totalVitaminB1.add(new Prisma.Decimal(item.vitaminB1 || 0).mul(factor))
      totalVitaminB2 = totalVitaminB2.add(new Prisma.Decimal(item.vitaminB2 || 0).mul(factor))
      totalVitaminB3 = totalVitaminB3.add(new Prisma.Decimal(item.vitaminB3 || 0).mul(factor))
      totalVitaminB6 = totalVitaminB6.add(new Prisma.Decimal(item.vitaminB6 || 0).mul(factor))
      totalVitaminB12 = totalVitaminB12.add(new Prisma.Decimal(item.vitaminB12 || 0).mul(factor))
      totalVitaminC = totalVitaminC.add(new Prisma.Decimal(item.vitaminC || 0).mul(factor))
      totalVitaminD = totalVitaminD.add(new Prisma.Decimal(item.vitaminD || 0).mul(factor))
      totalVitaminE = totalVitaminE.add(new Prisma.Decimal(item.vitaminE || 0).mul(factor))
      totalVitaminK = totalVitaminK.add(new Prisma.Decimal(item.vitaminK || 0).mul(factor))
      totalFolate = totalFolate.add(new Prisma.Decimal(item.folate || 0).mul(factor))
      
      // Minerals (per 100g)
      totalCalcium = totalCalcium.add(new Prisma.Decimal(item.calcium || 0).mul(factor))
      totalIron = totalIron.add(new Prisma.Decimal(item.iron || 0).mul(factor))
      totalMagnesium = totalMagnesium.add(new Prisma.Decimal(item.magnesium || 0).mul(factor))
      totalPhosphorus = totalPhosphorus.add(new Prisma.Decimal(item.phosphorus || 0).mul(factor))
      totalPotassium = totalPotassium.add(new Prisma.Decimal(item.potassium || 0).mul(factor))
      totalSodium = totalSodium.add(new Prisma.Decimal(item.sodium || 0).mul(factor))
      totalZinc = totalZinc.add(new Prisma.Decimal(item.zinc || 0).mul(factor))
      totalSelenium = totalSelenium.add(new Prisma.Decimal(item.selenium || 0).mul(factor))
      totalIodine = totalIodine.add(new Prisma.Decimal(item.iodine || 0).mul(factor))
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

    // 6a. Calculate nutrient status (adequate, deficient, excessive)
    const adequateNutrients: string[] = []
    const deficientNutrients: string[] = []
    const excessNutrients: string[] = []

    // Check macronutrients (adequate: 15-30% DV, deficient: <15%, excessive: >30%)
    const checkNutrient = (name: string, dvPercent: Prisma.Decimal) => {
      const dv = dvPercent.toNumber()
      if (dv >= 15 && dv <= 30) {
        adequateNutrients.push(name)
      } else if (dv < 15) {
        deficientNutrients.push(name)
      } else {
        excessNutrients.push(name)
      }
    }

    checkNutrient('Calories', caloriesDV)
    checkNutrient('Protein', proteinDV)
    checkNutrient('Carbohydrates', carbsDV)
    checkNutrient('Fat', fatDV)
    checkNutrient('Fiber', fiberDV)

    // 7. Upsert nutrition calculation
    const nutritionCalc = await db.menuNutritionCalculation.upsert({
      where: { menuId },
      create: {
        menuId,
        // Macronutrients
        totalCalories: totalCalories.toNumber(),
        totalProtein: totalProtein.toNumber(),
        totalCarbs: totalCarbs.toNumber(),
        totalFat: totalFat.toNumber(),
        totalFiber: totalFiber.toNumber(),
        // Vitamins (calculated from ingredients)
        totalVitaminA: totalVitaminA.toNumber(),
        totalVitaminB1: totalVitaminB1.toNumber(),
        totalVitaminB2: totalVitaminB2.toNumber(),
        totalVitaminB3: totalVitaminB3.toNumber(),
        totalVitaminB6: totalVitaminB6.toNumber(),
        totalVitaminB12: totalVitaminB12.toNumber(),
        totalVitaminC: totalVitaminC.toNumber(),
        totalVitaminD: totalVitaminD.toNumber(),
        totalVitaminE: totalVitaminE.toNumber(),
        totalVitaminK: totalVitaminK.toNumber(),
        totalFolate: totalFolate.toNumber(),
        // Minerals (calculated from ingredients)
        totalCalcium: totalCalcium.toNumber(),
        totalPhosphorus: totalPhosphorus.toNumber(),
        totalIron: totalIron.toNumber(),
        totalZinc: totalZinc.toNumber(),
        totalIodine: totalIodine.toNumber(),
        totalSelenium: totalSelenium.toNumber(),
        totalMagnesium: totalMagnesium.toNumber(),
        totalPotassium: totalPotassium.toNumber(),
        totalSodium: totalSodium.toNumber(),
        // Daily Value percentages
        caloriesDV: caloriesDV.toNumber(),
        proteinDV: proteinDV.toNumber(),
        carbsDV: carbsDV.toNumber(),
        fatDV: fatDV.toNumber(),
        fiberDV: fiberDV.toNumber(),
        // Nutrient status arrays
        adequateNutrients,
        deficientNutrients,
        excessNutrients,
        meetsAKG,
        calculatedBy: session.user.id,
        calculatedAt: new Date()
      },
      update: {
        // Macronutrients
        totalCalories: totalCalories.toNumber(),
        totalProtein: totalProtein.toNumber(),
        totalCarbs: totalCarbs.toNumber(),
        totalFat: totalFat.toNumber(),
        totalFiber: totalFiber.toNumber(),
        // Vitamins (calculated from ingredients)
        totalVitaminA: totalVitaminA.toNumber(),
        totalVitaminB1: totalVitaminB1.toNumber(),
        totalVitaminB2: totalVitaminB2.toNumber(),
        totalVitaminB3: totalVitaminB3.toNumber(),
        totalVitaminB6: totalVitaminB6.toNumber(),
        totalVitaminB12: totalVitaminB12.toNumber(),
        totalVitaminC: totalVitaminC.toNumber(),
        totalVitaminD: totalVitaminD.toNumber(),
        totalVitaminE: totalVitaminE.toNumber(),
        totalVitaminK: totalVitaminK.toNumber(),
        totalFolate: totalFolate.toNumber(),
        // Minerals (calculated from ingredients)
        totalCalcium: totalCalcium.toNumber(),
        totalPhosphorus: totalPhosphorus.toNumber(),
        totalIron: totalIron.toNumber(),
        totalZinc: totalZinc.toNumber(),
        totalIodine: totalIodine.toNumber(),
        totalSelenium: totalSelenium.toNumber(),
        totalMagnesium: totalMagnesium.toNumber(),
        totalPotassium: totalPotassium.toNumber(),
        totalSodium: totalSodium.toNumber(),
        // Daily Value percentages
        caloriesDV: caloriesDV.toNumber(),
        proteinDV: proteinDV.toNumber(),
        carbsDV: carbsDV.toNumber(),
        fatDV: fatDV.toNumber(),
        fiberDV: fiberDV.toNumber(),
        // Nutrient status arrays
        adequateNutrients,
        deficientNutrients,
        excessNutrients,
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

    return NextResponse.json({
      success: true,
      data: nutritionCalc,
      message: 'Nutrition calculated successfully'
    })

  } catch (error) {
    console.error('POST /api/sppg/menu/[id]/calculate-nutrition error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Gagal menghitung nutrisi',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
  })
}
