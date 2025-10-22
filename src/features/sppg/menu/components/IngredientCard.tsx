/**
 * @fileoverview Ingredient card component for displaying individual menu ingredient
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { Edit, Trash2, ChefHat, AlertTriangle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MenuIngredientDialog } from './MenuIngredientDialog'
import { useDeleteIngredient } from '@/features/sppg/menu/hooks/useIngredients'
import type { MenuIngredient } from '@/features/sppg/menu/types/ingredient.types'

interface IngredientCardProps {
  ingredient: MenuIngredient
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
 * Calculate total cost for ingredient
 */
function calculateTotalCost(quantity: number, costPerUnit: number): number {
  return quantity * costPerUnit
}

/**
 * IngredientCard component
 * Displays a single ingredient with actions for edit/delete
 */
export function IngredientCard({ ingredient, menuId }: IngredientCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { mutate: deleteIngredient, isPending } = useDeleteIngredient(menuId)

  const totalCost = calculateTotalCost(ingredient.quantity, ingredient.inventoryItem.costPerUnit || 0)

  // Check if stock is low
  const isLowStock = ingredient.inventoryItem && 
    ingredient.inventoryItem.currentStock <= ingredient.inventoryItem.minStock

  const handleDelete = () => {
    deleteIngredient(ingredient.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 dark:hover:shadow-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base truncate">
                  {ingredient.inventoryItem.itemName}
                </CardTitle>
                {ingredient.isOptional && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Opsional
                  </Badge>
                )}
                {isLowStock && (
                  <Badge variant="destructive" className="text-xs shrink-0">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Stok Menipis
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                {ingredient.quantity} {ingredient.inventoryItem.unit}
              </CardDescription>
            </div>
            <div className="flex gap-1 shrink-0">
              <MenuIngredientDialog menuId={menuId} ingredient={ingredient}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Edit bahan"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit {ingredient.inventoryItem.itemName}</span>
                </Button>
              </MenuIngredientDialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Hapus bahan"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Hapus {ingredient.inventoryItem.itemName}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Stock Warning Info */}
          {ingredient.inventoryItem && (
            <div className="space-y-2 pb-2 border-b">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Stok saat ini:</span>
                <span className={`font-medium ${isLowStock ? 'text-destructive' : ''}`}>
                  {ingredient.inventoryItem.currentStock} {ingredient.inventoryItem.unit}
                </span>
              </div>
              {isLowStock && (
                <div className="flex items-start gap-2 bg-destructive/10 p-2 rounded text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    Stok tersisa {ingredient.inventoryItem.currentStock} {ingredient.inventoryItem.unit}, 
                    minimal {ingredient.inventoryItem.minStock} {ingredient.inventoryItem.unit}. 
                    Segera lakukan pemesanan ulang.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cost Information */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Harga per satuan:</span>
              <span className="font-medium">{formatCurrency(ingredient.inventoryItem.costPerUnit || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span className="text-muted-foreground">Total biaya:</span>
              <span className="font-bold text-primary text-base">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          {/* Preparation Notes */}
          {ingredient.preparationNotes && (
            <div className="pt-2 border-t">
              <div className="flex items-start gap-2">
                <ChefHat className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ingredient.preparationNotes}
                </p>
              </div>
            </div>
          )}

          {/* Substitutes */}
          {ingredient.substitutes && ingredient.substitutes.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Bahan pengganti:</p>
              <div className="flex flex-wrap gap-1">
                {ingredient.substitutes.map((substitute, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {substitute}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Link */}
          {ingredient.inventoryItem && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                📦 Dari inventory: <span className="font-medium">{ingredient.inventoryItem.itemName}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Bahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus bahan <strong>{ingredient.inventoryItem.itemName}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
