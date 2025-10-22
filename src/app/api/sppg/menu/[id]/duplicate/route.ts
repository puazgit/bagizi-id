/**
 * @fileoverview Menu Duplication API Endpoint
 * @version Next.js 15.5.4 / Prisma / Multi-tenant Security
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'

const duplicateMenuSchema = z.object({
  newMenuName: z.string().min(3, 'Nama menu minimal 3 karakter').max(100),
  newMenuCode: z.string().min(2, 'Kode menu minimal 2 karakter').max(20),
  programId: z.string().cuid().optional(),
  copyIngredients: z.boolean().optional().default(true),
  copyRecipeSteps: z.boolean().optional().default(true),
  copyNutritionData: z.boolean().optional().default(false),
  copyCostData: z.boolean().optional().default(false),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenant Security)
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Parse Request Body
    const body = await request.json()
    const validated = duplicateMenuSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    const { 
      newMenuName, 
      newMenuCode,
      programId,
      copyIngredients,
      copyRecipeSteps,
      copyNutritionData,
      copyCostData
    } = validated.data

    // 4. Get Original Menu with all relations
    const originalMenu = await db.nutritionMenu.findUnique({
      where: { 
        id: id,
        program: {
          sppgId: session.user.sppgId // Multi-tenant security
        }
      },
      include: {
        program: true,
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        recipeSteps: {
          orderBy: {
            stepNumber: 'asc'
          }
        },
        nutritionCalc: true,
        costCalc: true,
      }
    })

    if (!originalMenu) {
      return Response.json({ error: 'Menu not found or access denied' }, { status: 404 })
    }

    // 5. Check for duplicate menu code
    const existingMenu = await db.nutritionMenu.findFirst({
      where: {
        menuCode: newMenuCode,
        program: {
          sppgId: session.user.sppgId
        }
      }
    })

    if (existingMenu) {
      return Response.json({ 
        error: 'Menu code already exists',
        details: 'Kode menu sudah digunakan. Gunakan kode lain.'
      }, { status: 400 })
    }

    // 6. Verify program access if changing program
    let targetProgramId = originalMenu.programId
    if (programId) {
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: programId,
          sppgId: session.user.sppgId
        }
      })

      if (!program) {
        return Response.json({ 
          error: 'Program not found or access denied' 
        }, { status: 404 })
      }

      targetProgramId = programId
    }

    // 7. Duplicate Menu using Transaction
    const duplicatedMenu = await db.$transaction(async (tx) => {
      // Create new menu
      const newMenu = await tx.nutritionMenu.create({
        data: {
          menuName: newMenuName,
          menuCode: newMenuCode,
          programId: targetProgramId,
          
          // Copy basic fields
          mealType: originalMenu.mealType,
          servingSize: originalMenu.servingSize,
          description: originalMenu.description,
          
          // Copy recipe info
          preparationTime: originalMenu.preparationTime,
          cookingTime: originalMenu.cookingTime,
          difficulty: originalMenu.difficulty,
          cookingMethod: originalMenu.cookingMethod,
          batchSize: originalMenu.batchSize,
          budgetAllocation: originalMenu.budgetAllocation,
          
          // Copy cost info
          costPerServing: originalMenu.costPerServing,
          
          // Copy flags
          isHalal: originalMenu.isHalal,
          isVegetarian: originalMenu.isVegetarian,
          nutritionStandardCompliance: originalMenu.nutritionStandardCompliance,
          isActive: false, // Set as inactive by default
          
          // Copy allergens
          allergens: originalMenu.allergens,
        },
        include: {
          program: true
        }
      })

      // Copy ingredients if requested (Fix #1: ONLY copy inventoryItemId + quantity + notes)
      if (copyIngredients && originalMenu.ingredients && originalMenu.ingredients.length > 0) {
        await tx.menuIngredient.createMany({
          data: originalMenu.ingredients.map((ingredient) => ({
            menuId: newMenu.id,
            inventoryItemId: ingredient.inventoryItemId, // ✅ Fix #1: REQUIRED
            quantity: ingredient.quantity,
            preparationNotes: ingredient.preparationNotes,
            isOptional: ingredient.isOptional,
            substitutes: ingredient.substitutes
            // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit, totalCost
          }))
        })
      }

      // Copy recipe steps if requested
      if (copyRecipeSteps && originalMenu.recipeSteps && originalMenu.recipeSteps.length > 0) {
        await tx.recipeStep.createMany({
          data: originalMenu.recipeSteps.map((step) => ({
            menuId: newMenu.id,
            stepNumber: step.stepNumber,
            title: step.title,
            instruction: step.instruction,
            duration: step.duration,
            temperature: step.temperature,
            equipment: step.equipment,
            qualityCheck: step.qualityCheck,
            imageUrl: step.imageUrl,
            videoUrl: step.videoUrl,
          }))
        })
      }

      // Copy nutrition calculation if requested
      if (copyNutritionData && originalMenu.nutritionCalc) {
        const calc = originalMenu.nutritionCalc
        await tx.menuNutritionCalculation.create({
          data: {
            menuId: newMenu.id,
            requirementId: calc.requirementId,
            
            // Macronutrients
            totalCalories: calc.totalCalories,
            totalProtein: calc.totalProtein,
            totalCarbs: calc.totalCarbs,
            totalFat: calc.totalFat,
            totalFiber: calc.totalFiber,
            
            // Vitamins
            totalVitaminA: calc.totalVitaminA,
            totalVitaminB1: calc.totalVitaminB1,
            totalVitaminB2: calc.totalVitaminB2,
            totalVitaminB3: calc.totalVitaminB3,
            totalVitaminB6: calc.totalVitaminB6,
            totalVitaminB12: calc.totalVitaminB12,
            totalVitaminC: calc.totalVitaminC,
            totalVitaminD: calc.totalVitaminD,
            totalVitaminE: calc.totalVitaminE,
            totalVitaminK: calc.totalVitaminK,
            totalFolate: calc.totalFolate,
            
            // Minerals
            totalCalcium: calc.totalCalcium,
            totalPhosphorus: calc.totalPhosphorus,
            totalIron: calc.totalIron,
            totalZinc: calc.totalZinc,
            totalIodine: calc.totalIodine,
            totalSelenium: calc.totalSelenium,
            totalMagnesium: calc.totalMagnesium,
            totalPotassium: calc.totalPotassium,
            totalSodium: calc.totalSodium,
            
            // Daily Value percentages
            caloriesDV: calc.caloriesDV,
            proteinDV: calc.proteinDV,
            carbsDV: calc.carbsDV,
            fatDV: calc.fatDV,
            fiberDV: calc.fiberDV,
            
            // AKG compliance
            meetsCalorieAKG: calc.meetsCalorieAKG,
            meetsProteinAKG: calc.meetsProteinAKG,
            meetsAKG: calc.meetsAKG,
            
            // Nutrient analysis
            excessNutrients: calc.excessNutrients,
            deficientNutrients: calc.deficientNutrients,
            adequateNutrients: calc.adequateNutrients,
            
            // Metadata
            calculationMethod: 'MANUAL', // Copied from original
            calculatedBy: session.user.id,
          }
        })
      }

      // Copy cost calculation if requested
      if (copyCostData && originalMenu.costCalc) {
        const cost = originalMenu.costCalc
        await tx.menuCostCalculation.create({
          data: {
            menuId: newMenu.id,
            
            // Ingredient costs
            totalIngredientCost: cost.totalIngredientCost,
            ingredientBreakdown: cost.ingredientBreakdown ? JSON.parse(JSON.stringify(cost.ingredientBreakdown)) : null,
            
            // Labor costs
            laborCostPerHour: cost.laborCostPerHour,
            preparationHours: cost.preparationHours,
            cookingHours: cost.cookingHours,
            totalLaborCost: cost.totalLaborCost,
            
            // Utilities
            gasCost: cost.gasCost,
            electricityCost: cost.electricityCost,
            waterCost: cost.waterCost,
            totalUtilityCost: cost.totalUtilityCost,
            
            // Other operational costs
            packagingCost: cost.packagingCost,
            equipmentCost: cost.equipmentCost,
            cleaningCost: cost.cleaningCost,
            
            // Overhead
            overheadPercentage: cost.overheadPercentage,
            overheadCost: cost.overheadCost,
            
            // Total costs
            totalDirectCost: cost.totalDirectCost,
            totalIndirectCost: cost.totalIndirectCost,
            grandTotalCost: cost.grandTotalCost,
            
            // Per portion calculations
            plannedPortions: cost.plannedPortions,
            costPerPortion: cost.costPerPortion,
            
            // Budget allocation (for SPPG budget planning)
            budgetAllocation: cost.budgetAllocation,
            
            // Cost ratios
            ingredientCostRatio: cost.ingredientCostRatio,
            laborCostRatio: cost.laborCostRatio,
            overheadCostRatio: cost.overheadCostRatio,
            
            // Cost optimizations
            costOptimizations: cost.costOptimizations,
            alternativeIngredients: cost.alternativeIngredients,
            
            // Metadata
            calculationMethod: 'MANUAL', // Copied from original
            calculatedBy: session.user.id,
            isActive: true,
          }
        })
      }

      return newMenu
    })

    // 8. Return duplicated menu
    return Response.json({ 
      success: true, 
      data: duplicatedMenu,
      message: 'Menu berhasil diduplikasi'
    }, { status: 201 })

  } catch (error) {
    console.error('Duplicate menu error:', error)
    return Response.json({ 
      error: 'Failed to duplicate menu',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
