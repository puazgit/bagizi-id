/**
 * @fileoverview Menu Ingredient Dialog - Modal Form for Add/Edit Ingredients
 * @version Next.js 15.5.4 / shadcn/ui Dialog
 */

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MenuIngredientForm } from './MenuIngredientForm'
import type { MenuIngredient } from '@/features/sppg/menu/types/ingredient.types'

interface MenuIngredientDialogProps {
  menuId: string
  ingredient?: MenuIngredient // If provided, opens in edit mode
  trigger?: React.ReactNode // Custom trigger button
  children?: React.ReactNode // Children to use as trigger (alternative to trigger prop)
  open?: boolean // Controlled open state
  onOpenChange?: (open: boolean) => void // Controlled open state handler
}

export function MenuIngredientDialog({
  menuId,
  ingredient,
  trigger,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: MenuIngredientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const handleSuccess = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? 'Edit Bahan' : 'Tambah Bahan Baru'}
          </DialogTitle>
          <DialogDescription>
            {ingredient 
              ? 'Perbarui informasi bahan untuk menu ini'
              : 'Tambahkan bahan baru untuk menu ini. Semua field yang ditandai dengan * wajib diisi.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <MenuIngredientForm
            menuId={menuId}
            ingredient={ingredient}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
