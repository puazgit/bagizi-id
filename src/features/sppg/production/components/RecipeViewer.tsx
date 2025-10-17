/**
 * @fileoverview Recipe Viewer Component with Collapsible Sections
 * @version Next.js 15.5.4 / shadcn/ui Accordion
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  UtensilsCrossed, 
  ListOrdered, 
  AlertCircle,
  Clock,
  Flame,
  ChefHat,
  Scale
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../lib'
import type { Recipe } from '../types'

// ============================================================================
// Types
// ============================================================================

interface RecipeViewerProps {
  recipe: Recipe
  portionMultiplier?: number // For adjusting quantities
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Adjust ingredient quantity based on portion multiplier
 */
function adjustQuantity(baseQuantity: number, multiplier: number): number {
  return Math.round(baseQuantity * multiplier * 100) / 100
}



// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Component: Recipe Viewer
 */
export function RecipeViewer({ 
  recipe, 
  portionMultiplier = 1,
  className 
}: RecipeViewerProps) {
  const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0
  const hasSteps = recipe.steps && recipe.steps.length > 0
  const hasNutrition = recipe.nutrition && Object.keys(recipe.nutrition).length > 0
  const hasAllergens = recipe.allergens && recipe.allergens.length > 0

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <CardTitle>Resep Masakan</CardTitle>
        </div>
        <CardDescription>
          {recipe.menuName || 'Detail resep dan instruksi memasak'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Recipe Overview */}
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {/* Preparation Time */}
          {recipe.prepTime > 0 && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <ChefHat className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Persiapan</p>
                <p className="text-sm font-semibold">{recipe.prepTime} menit</p>
              </div>
            </div>
          )}

          {/* Cooking Time */}
          {recipe.cookTime > 0 && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Waktu Masak</p>
                <p className="text-sm font-semibold">{recipe.cookTime} menit</p>
              </div>
            </div>
          )}

          {/* Serving Size */}
          {recipe.servingSize > 0 && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ukuran Porsi</p>
                <p className="text-sm font-semibold">{recipe.servingSize}g</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Sections */}
        <Accordion type="multiple" defaultValue={['ingredients', 'steps']} className="w-full">
          {/* Ingredients Section */}
          {hasIngredients && (
            <AccordionItem value="ingredients">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Bahan-Bahan ({recipe.ingredients.length})</span>
                  {portionMultiplier !== 1 && (
                    <Badge variant="secondary" className="ml-2">
                      × {portionMultiplier}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div
                      key={ingredient.id || index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{ingredient.name}</p>
                        {ingredient.inventoryItem && (
                          <p className="text-xs text-muted-foreground">
                            Stok: {ingredient.inventoryItem.currentStock} {ingredient.inventoryItem.unit}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {adjustQuantity(ingredient.quantity, portionMultiplier)} {ingredient.unit}
                        </p>
                        {ingredient.cost && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(adjustQuantity(ingredient.cost, portionMultiplier))}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Cost */}
                  {recipe.ingredients.some(i => i.cost) && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <p className="font-semibold">Total Biaya Bahan</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(
                            recipe.ingredients.reduce((sum, i) => 
                              sum + adjustQuantity(i.cost || 0, portionMultiplier), 0
                            )
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Recipe Steps Section */}
          {hasSteps && (
            <AccordionItem value="steps">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" />
                  <span>Langkah-Langkah ({recipe.steps.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {recipe.steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step) => (
                      <div
                        key={step.stepNumber}
                        className="flex gap-4 p-4 border rounded-lg"
                      >
                        {/* Step Number */}
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {step.stepNumber}
                          </div>
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-2">
                          <p className="text-sm leading-relaxed">{step.instruction}</p>
                          
                          {/* Step Metadata */}
                          <div className="flex flex-wrap gap-2">
                            {step.duration && (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {step.duration} menit
                              </Badge>
                            )}
                            {step.temperature && (
                              <Badge variant="outline" className="gap-1">
                                <Flame className="h-3 w-3" />
                                {step.temperature}°C
                              </Badge>
                            )}
                            {step.critical && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Kritis
                              </Badge>
                            )}
                          </div>

                          {/* Tips */}
                          {step.tips && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                💡 Tips: {step.tips}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Nutrition Information */}
          {hasNutrition && (
            <AccordionItem value="nutrition">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  <span>Informasi Gizi</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pt-2">
                  {recipe.nutrition.calories && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Kalori</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.calories} kal</p>
                    </div>
                  )}
                  {recipe.nutrition.protein && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.protein}g</p>
                    </div>
                  )}
                  {recipe.nutrition.carbohydrates && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Karbohidrat</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.carbohydrates}g</p>
                    </div>
                  )}
                  {recipe.nutrition.fat && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Lemak</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.fat}g</p>
                    </div>
                  )}
                  {recipe.nutrition.fiber && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Serat</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.fiber}g</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Allergens & Dietary Info */}
          {(hasAllergens || recipe.dietary) && (
            <AccordionItem value="allergens">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Alergen & Diet</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* Dietary Badges */}
                  {recipe.dietary && recipe.dietary.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Kategori Diet</p>
                      <div className="flex flex-wrap gap-2">
                        {recipe.dietary.map((diet) => (
                          <Badge 
                            key={diet}
                            variant="secondary" 
                            className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          >
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergen Warnings */}
                  {hasAllergens && (
                    <div>
                      <p className="text-sm font-medium mb-2">Peringatan Alergen</p>
                      <div className="flex flex-wrap gap-2">
                        {recipe.allergens.map((allergen) => (
                          <Badge 
                            key={allergen} 
                            variant="destructive"
                            className="gap-1"
                          >
                            <AlertCircle className="h-3 w-3" />
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Empty State */}
        {!hasIngredients && !hasSteps && !hasNutrition && (
          <div className="text-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Resep belum tersedia untuk menu ini
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
