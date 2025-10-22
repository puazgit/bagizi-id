/**
 * @fileoverview Ingredients list component with summary for menu ingredients tab
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { PackageOpen, TrendingUp, DollarSign, Plus } from 'lucide-react'
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
import { MenuIngredientDialog } from './MenuIngredientDialog'
import { useMenuIngredients } from '@/features/sppg/menu/hooks/useIngredients'
import type { MenuIngredient } from '@/features/sppg/menu/types/ingredient.types'

interface IngredientsListProps {
  menuId: string
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
    return total + (ingredient.quantity * (ingredient.inventoryItem.costPerUnit || 0))
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
    const currentTotal = ingredient.quantity * (ingredient.inventoryItem.costPerUnit || 0)
    const maxTotal = max.quantity * (max.inventoryItem.costPerUnit || 0)
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
function EmptyIngredientsState({ menuId }: { menuId: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <PackageOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Belum ada bahan</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Tambahkan bahan pertama untuk menu ini. Klik tombol di bawah untuk memulai.
            </p>
          </div>
          <MenuIngredientDialog menuId={menuId}>
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan Pertama
            </Button>
          </MenuIngredientDialog>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * IngredientsList component
 * Displays list of menu ingredients with summary statistics
 */
export function IngredientsList({ menuId }: IngredientsListProps) {
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
    return <EmptyIngredientsState menuId={menuId} />
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
            <PackageOpen className="h-5 w-5 text-primary" />
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
              <p className="text-base font-bold truncate" title={mostExpensive?.inventoryItem.itemName}>
                {mostExpensive?.inventoryItem.itemName || '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {mostExpensive ? formatCurrency(mostExpensive.quantity * (mostExpensive.inventoryItem.costPerUnit || 0)) : '-'}
              </p>
            </div>
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
          <MenuIngredientDialog menuId={menuId}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan
            </Button>
          </MenuIngredientDialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              menuId={menuId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
