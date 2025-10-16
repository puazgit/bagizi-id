/**
 * @fileoverview Ingredients list component with summary for menu ingredients tab
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { PackageOpen, TrendingUp, Calculator, DollarSign } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IngredientCard } from './IngredientCard'
import { useMenuIngredients } from '@/features/sppg/menu/hooks/useIngredients'
import type { MenuIngredient } from '@/features/sppg/menu/types/ingredient.types'

interface IngredientsListProps {
  menuId: string
  onEdit: (ingredient: MenuIngredient) => void
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate total cost from all ingredients
 */
function calculateTotalCost(ingredients: MenuIngredient[]): number {
  return ingredients.reduce((total, ingredient) => {
    return total + (ingredient.quantity * ingredient.costPerUnit)
  }, 0)
}

/**
 * Calculate average cost per ingredient
 */
function calculateAverageCost(ingredients: MenuIngredient[]): number {
  if (ingredients.length === 0) return 0
  return calculateTotalCost(ingredients) / ingredients.length
}

/**
 * Find most expensive ingredient
 */
function findMostExpensive(ingredients: MenuIngredient[]): MenuIngredient | null {
  if (ingredients.length === 0) return null
  
  return ingredients.reduce((max, ingredient) => {
    const currentTotal = ingredient.quantity * ingredient.costPerUnit
    const maxTotal = max.quantity * max.costPerUnit
    return currentTotal > maxTotal ? ingredient : max
  }, ingredients[0])
}

/**
 * Loading skeleton for ingredients list
 */
function IngredientsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}

/**
 * Empty state when no ingredients
 */
function EmptyIngredientsState() {
  return (
    <Alert>
      <PackageOpen className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium">Belum ada bahan ditambahkan</p>
        <p className="text-sm text-muted-foreground mt-1">
          Tambahkan bahan pertama menggunakan form di bawah ini.
        </p>
      </AlertDescription>
    </Alert>
  )
}

/**
 * IngredientsList component
 * Displays list of menu ingredients with summary statistics
 */
export function IngredientsList({ menuId, onEdit }: IngredientsListProps) {
  const { data: ingredients, isLoading, error } = useMenuIngredients(menuId)

  // Loading state
  if (isLoading) {
    return <IngredientsSkeleton />
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Gagal memuat daftar bahan. Silakan coba lagi.
        </AlertDescription>
      </Alert>
    )
  }

  // Empty state
  if (!ingredients || ingredients.length === 0) {
    return <EmptyIngredientsState />
  }

  // Calculate statistics
  const totalCost = calculateTotalCost(ingredients)
  const averageCost = calculateAverageCost(ingredients)
  const mostExpensive = findMostExpensive(ingredients)
  const totalItems = ingredients.length

  return (
    <div className="space-y-6">
      {/* Summary Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Ringkasan Bahan
          </CardTitle>
          <CardDescription>
            Statistik total biaya dan jumlah bahan untuk menu ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Items */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PackageOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Bahan</p>
              </div>
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-xs text-muted-foreground">
                {ingredients.filter(i => !i.isOptional).length} wajib, {' '}
                {ingredients.filter(i => i.isOptional).length} opsional
              </p>
            </div>

            {/* Total Cost */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Biaya</p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalCost)}
              </p>
              <p className="text-xs text-muted-foreground">
                Semua bahan
              </p>
            </div>

            {/* Average Cost */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Rata-rata</p>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(averageCost)}
              </p>
              <p className="text-xs text-muted-foreground">
                Per bahan
              </p>
            </div>

            {/* Most Expensive */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Termahal</p>
              </div>
              <p className="text-base font-bold truncate" title={mostExpensive?.ingredientName}>
                {mostExpensive?.ingredientName || '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {mostExpensive ? formatCurrency(mostExpensive.quantity * mostExpensive.costPerUnit) : '-'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <Calculator className="h-4 w-4 mr-2" />
              Hitung Ulang
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Daftar Bahan</h3>
            <p className="text-sm text-muted-foreground">
              {totalItems} bahan untuk menu ini
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              menuId={menuId}
              onEdit={() => onEdit(ingredient)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
