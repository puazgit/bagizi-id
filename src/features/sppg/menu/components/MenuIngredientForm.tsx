/**
 * @fileoverview Menu Ingredient Form Component
 * @version Next.js 15.5.4 / shadcn/ui / React Hook Form + Zod
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X, Calculator, Package, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { ingredientSchema, type IngredientFormData } from '../schemas/ingredientSchema'
import { useCreateIngredient, useUpdateIngredient, useMenuIngredients } from '../hooks/useIngredients'
import { useInventoryItems } from '../hooks/useInventory'
import type { MenuIngredient } from '../types/ingredient.types'
import type { InventoryItem } from '../api/inventoryApi'

interface MenuIngredientFormProps {
  menuId: string
  ingredient?: MenuIngredient // For editing
  onSuccess?: () => void
  onCancel?: () => void
}

export function MenuIngredientForm({ 
  menuId, 
  ingredient, 
  onSuccess, 
  onCancel 
}: MenuIngredientFormProps) {
  const isEditing = !!ingredient
  
  const { mutate: createIngredient, isPending: isCreating } = useCreateIngredient(menuId)
  const { mutate: updateIngredient, isPending: isUpdating } = useUpdateIngredient(menuId)
  const { data: inventoryItems, isLoading: isLoadingInventory } = useInventoryItems()
  const { data: existingIngredients } = useMenuIngredients(menuId)
  
  const isPending = isCreating || isUpdating

  // State for stock validation & duplicate check
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateIngredient, setDuplicateIngredient] = useState<MenuIngredient | null>(null)
  const [pendingFormData, setPendingFormData] = useState<IngredientFormData | null>(null)

  const form = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      inventoryItemId: ingredient?.inventoryItemId || '',
      quantity: ingredient?.quantity || 0,
      preparationNotes: ingredient?.preparationNotes || undefined,
      isOptional: ingredient?.isOptional,
      substitutes: ingredient?.substitutes
    }
  })

  // Reset form when ingredient prop changes (for edit mode)
  useEffect(() => {
    if (ingredient) {
      form.reset({
        inventoryItemId: ingredient.inventoryItemId,
        quantity: ingredient.quantity,
        preparationNotes: ingredient.preparationNotes || undefined,
        isOptional: ingredient.isOptional,
        substitutes: ingredient.substitutes
      })
      
      // Set selected inventory item for edit mode
      if (ingredient.inventoryItem) {
        setSelectedInventoryItem({
          id: ingredient.inventoryItem.id,
          itemName: ingredient.inventoryItem.itemName,
          unit: ingredient.inventoryItem.unit,
          costPerUnit: ingredient.inventoryItem.costPerUnit || 0,
          currentStock: 0, // We don't have this in MenuIngredient type
          minStock: 0
        } as InventoryItem)
      }
    }
  }, [ingredient, form])

  // Watch values for real-time calculation
  const quantity = form.watch('quantity')
  const totalCost = quantity * (selectedInventoryItem?.costPerUnit || 0)

  // Substitute input state
  const substitutes = form.watch('substitutes') || []

  /**
   * Check for duplicate ingredients
   */
  const checkDuplicate = (inventoryItemId: string): MenuIngredient | null => {
    if (!existingIngredients || isEditing) return null
    
    const duplicate = existingIngredients.find(
      (ing) => ing.inventoryItemId === inventoryItemId
    )
    
    return duplicate || null
  }

  /**
   * Check stock availability
   */
  const checkStockAvailability = (quantity: number): { 
    hasStock: boolean
    warning: string | null 
  } => {
    if (!selectedInventoryItem) {
      return { hasStock: true, warning: null }
    }

    const available = selectedInventoryItem.currentStock
    const isLowStock = available < selectedInventoryItem.minStock
    const isOutOfStock = available === 0
    const exceedsStock = quantity > available

    if (isOutOfStock) {
      return { 
        hasStock: false, 
        warning: `Stok ${selectedInventoryItem.itemName} habis (0 ${selectedInventoryItem.unit})` 
      }
    }

    if (exceedsStock) {
      return { 
        hasStock: false, 
        warning: `Jumlah melebihi stok tersedia. Stok: ${available} ${selectedInventoryItem.unit}, Diminta: ${quantity} ${selectedInventoryItem.unit}` 
      }
    }

    if (isLowStock) {
      return { 
        hasStock: true, 
        warning: `⚠️ Stok rendah: ${available} ${selectedInventoryItem.unit} (minimum: ${selectedInventoryItem.minStock} ${selectedInventoryItem.unit})` 
      }
    }

    return { hasStock: true, warning: null }
  }

  const onSubmit = (data: IngredientFormData) => {
    // 1. Validate inventory item is selected
    if (!data.inventoryItemId) {
      toast.error('Pilih bahan dari inventory', {
        description: 'Anda harus memilih bahan dari daftar inventory'
      })
      return
    }

    // 2. Check for duplicates (only when creating)
    if (!isEditing) {
      const duplicate = checkDuplicate(data.inventoryItemId)
      if (duplicate) {
        setDuplicateIngredient(duplicate)
        setPendingFormData(data)
        setShowDuplicateDialog(true)
        return
      }
    }

    // 3. Check stock availability
    const stockCheck = checkStockAvailability(data.quantity)
    if (!stockCheck.hasStock) {
      toast.error('Stok tidak mencukupi', {
        description: stockCheck.warning || 'Jumlah bahan melebihi stok yang tersedia'
      })
      return
    }

    // 4. Proceed with creation/update
    submitForm(data)
  }

  /**
   * Submit form data (extracted for reuse)
   */
  const submitForm = (data: IngredientFormData) => {
    // Transform for API - provide defaults for optional fields
    const apiData = {
      inventoryItemId: data.inventoryItemId,
      quantity: data.quantity,
      preparationNotes: data.preparationNotes ?? undefined,
      isOptional: data.isOptional ?? false,
      substitutes: data.substitutes ?? []
    }

    if (isEditing && ingredient) {
      updateIngredient(
        { ingredientId: ingredient.id, data: apiData },
        { 
          onSuccess: () => {
            onSuccess?.()
          }
        }
      )
    } else {
      createIngredient(apiData, { 
        onSuccess: () => {
          form.reset() // Reset form after successful creation
          setSelectedInventoryItem(null) // Reset inventory selection
          onSuccess?.()
        }
      })
    }
  }

  /**
   * Handle duplicate confirmation - proceed anyway
   */
  const handleDuplicateConfirm = () => {
    if (pendingFormData) {
      submitForm(pendingFormData)
    }
    setShowDuplicateDialog(false)
    setDuplicateIngredient(null)
    setPendingFormData(null)
  }

  /**
   * Handle duplicate cancellation
   */
  const handleDuplicateCancel = () => {
    setShowDuplicateDialog(false)
    setDuplicateIngredient(null)
    setPendingFormData(null)
  }

  const addSubstitute = () => {
    const newSubstitute = (document.getElementById('substitute-input') as HTMLInputElement)?.value
    if (newSubstitute && !substitutes.includes(newSubstitute)) {
      form.setValue('substitutes', [...substitutes, newSubstitute])
      ;(document.getElementById('substitute-input') as HTMLInputElement).value = ''
    }
  }

  const removeSubstitute = (index: number) => {
    form.setValue('substitutes', substitutes.filter((_, i) => i !== index))
  }

  /**
   * Handle inventory item selection
   * Set inventoryItemId and store item for display
   */
  const handleInventorySelect = (itemId: string) => {
    const selectedItem = inventoryItems?.find(item => item.id === itemId)
    if (selectedItem) {
      // Store selected item for stock validation and display
      setSelectedInventoryItem(selectedItem)
      
      // Set inventoryItemId in form
      form.setValue('inventoryItemId', selectedItem.id)
      
      // Show info about current stock
      if (selectedItem.currentStock < selectedItem.minStock) {
        toast.warning('Stok Rendah', {
          description: `${selectedItem.itemName} memiliki stok rendah: ${selectedItem.currentStock} ${selectedItem.unit}`
        })
      }
    }
  }

  return (
    <Card className={`w-full max-w-3xl ${isEditing ? 'border-primary shadow-md' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Plus className={`h-5 w-5 ${isEditing ? 'text-primary' : 'text-primary'}`} />
              {isEditing ? 'Edit Bahan' : 'Tambah Bahan Baru'}
            </CardTitle>
            <CardDescription className="mt-2">
              {isEditing 
                ? 'Perbarui informasi bahan. Klik Batal untuk membatalkan perubahan.'
                : 'Masukkan detail bahan untuk menu ini. Total biaya akan dihitung otomatis.'
              }
            </CardDescription>
          </div>
          {isEditing && (
            <Badge variant="default" className="ml-4">
              Mode Edit
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Inventory Item Selector (REQUIRED) */}
            <div className="space-y-4">
              <Badge variant="default" className="flex items-center gap-2 w-fit">
                <Package className="h-3 w-3" />
                Pilih Bahan
              </Badge>
              
              <FormField
                control={form.control}
                name="inventoryItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bahan dari Inventory *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleInventorySelect(value)
                      }} 
                      value={field.value}
                      disabled={isEditing} // Disable when editing
                    >
                      <FormControl>
                        <SelectTrigger id="inventory-selector">
                          <SelectValue placeholder="Pilih bahan dari inventory..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingInventory ? (
                          <SelectItem value="loading" disabled>Memuat...</SelectItem>
                        ) : (
                          <>
                            {inventoryItems?.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">{item.itemName}</span>
                                  <span className="text-xs text-muted-foreground ml-4">
                                    Stock: {item.currentStock} {item.unit}
                                    {item.currentStock < item.minStock && (
                                      <span className="text-destructive ml-2">⚠️ Low</span>
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            )) || []}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih bahan dari inventory untuk menu ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Display selected item info */}
              {selectedInventoryItem && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nama:</span>
                      <p className="font-semibold">{selectedInventoryItem.itemName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Satuan:</span>
                      <p className="font-semibold">{selectedInventoryItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Harga/Unit:</span>
                      <p className="font-semibold">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(selectedInventoryItem.costPerUnit || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stok:</span>
                      <p className={`font-semibold ${
                        selectedInventoryItem.currentStock < selectedInventoryItem.minStock 
                          ? 'text-destructive' 
                          : 'text-green-600'
                      }`}>
                        {selectedInventoryItem.currentStock} {selectedInventoryItem.unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Quantity Information */}
            <div className="space-y-4">
              <Badge variant="outline">Jumlah Bahan</Badge>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah {selectedInventoryItem ? `(${selectedInventoryItem.unit})` : ''}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!selectedInventoryItem}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedInventoryItem 
                        ? `Masukkan jumlah dalam ${selectedInventoryItem.unit}`
                        : 'Pilih bahan terlebih dahulu'
                      }
                    </FormDescription>
                    <FormMessage />
                    
                    {/* Real-time Stock Validation */}
                    {selectedInventoryItem && quantity > 0 && (
                      <div className="mt-2">
                        {(() => {
                          const stockCheck = checkStockAvailability(quantity)
                          if (!stockCheck.hasStock) {
                            return (
                              <Alert variant="destructive" className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  {stockCheck.warning}
                                </AlertDescription>
                              </Alert>
                            )
                          } else if (stockCheck.warning) {
                            return (
                              <Alert className="py-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                                  {stockCheck.warning}
                                </AlertDescription>
                              </Alert>
                            )
                          }
                          return null
                        })()}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Real-time Total Cost Display */}
              {selectedInventoryItem && quantity > 0 && (
                <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Total Biaya</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(totalCost)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {quantity} {selectedInventoryItem.unit} × {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(selectedInventoryItem.costPerUnit || 0)}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <Badge variant="outline">Informasi Tambahan</Badge>
              
              <FormField
                control={form.control}
                name="preparationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Persiapan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Cuci bersih, potong dadu kecil..."
                        rows={3}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Instruksi khusus untuk persiapan bahan ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isOptional"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Bahan Opsional</FormLabel>
                      <FormDescription>
                        Tandai jika bahan ini bersifat opsional (tidak wajib)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Substitutes */}
              <div className="space-y-3">
                <Label>Bahan Pengganti</Label>
                <div className="flex gap-2">
                  <Input
                    id="substitute-input"
                    placeholder="Masukkan nama bahan pengganti"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSubstitute()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addSubstitute}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {substitutes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {substitutes.map((substitute, index) => (
                      <Badge key={index} variant="secondary" className="pl-3 pr-1">
                        {substitute}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => removeSubstitute(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Tambahkan bahan alternatif yang dapat digunakan sebagai pengganti
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Bahan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* Duplicate Warning Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Bahan Sudah Ada
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                Bahan <strong className="text-foreground">{duplicateIngredient?.inventoryItem.itemName}</strong> sudah ada dalam menu ini.
              </p>
              
              {duplicateIngredient && (
                <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah saat ini:</span>
                    <span className="font-medium text-foreground">
                      {duplicateIngredient.quantity} {duplicateIngredient.inventoryItem.unit}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Harga per unit:</span>
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(duplicateIngredient.inventoryItem.costPerUnit || 0)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Total biaya:</span>
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(duplicateIngredient.quantity * (duplicateIngredient.inventoryItem.costPerUnit || 0))}
                    </span>
                  </p>
                </div>
              )}
              
              <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                ⚠️ Menambahkan bahan yang sama dapat menyebabkan duplikasi data. 
                Apakah Anda yakin ingin melanjutkan?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDuplicateCancel}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDuplicateConfirm}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Tetap Tambahkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
