/**
 * @fileoverview StockMovementForm Component - Stock Movement Recording Form
 * @description Comprehensive form for recording stock IN/OUT/ADJUSTMENT movements
 * with real-time validation, stock preview, batch tracking, and expiry date management.
 * Supports automatic inventory updates and approval workflow.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  AlertCircle,
  CheckCircle,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  Info,
  Upload,
} from 'lucide-react'
import { MovementType } from '@prisma/client'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Hooks & Types
import { useInventoryList, useInventoryItem } from '../hooks/useInventory'
import { useCreateStockMovement } from '../hooks/useStockMovement'
import { createStockMovementSchema } from '../schemas/stockMovementSchema'
import { cn } from '@/lib/utils'

// Form data type from Zod schema
type FormData = z.infer<typeof createStockMovementSchema>

// Helper type for form control
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFormControl = any

interface StockMovementFormProps {
  inventoryId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function StockMovementForm({
  inventoryId: initialInventoryId,
  onSuccess,
  onCancel,
}: StockMovementFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemIdFromUrl = searchParams.get('itemId')
  const selectedInventoryId = initialInventoryId || itemIdFromUrl || ''

  const [selectedItemId, setSelectedItemId] = useState<string>(selectedInventoryId)
  const [stockPreview, setStockPreview] = useState<{
    before: number
    after: number
    valid: boolean
    message: string
  } | null>(null)

  // Data fetching
  const { data: inventoryItems } = useInventoryList()
  const { data: selectedItem } = useInventoryItem(selectedItemId, !!selectedItemId)

  // Mutation
  const { mutate: createMovement, isPending } = useCreateStockMovement()

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(createStockMovementSchema),
    defaultValues: {
      inventoryId: selectedInventoryId,
      movementType: 'IN' as MovementType,
      quantity: 0,
      unitCost: undefined,
      referenceType: undefined,
      referenceNumber: '',
      batchNumber: '',
      expiryDate: undefined,
      notes: '',
      documentUrl: '',
    },
  })

  const movementType = form.watch('movementType')
  const quantity = form.watch('quantity')

  // Update form when selected item changes
  useEffect(() => {
    if (selectedItemId) {
      form.setValue('inventoryId', selectedItemId)
    }
  }, [selectedItemId, form])

  // Calculate stock preview
  useEffect(() => {
    if (!selectedItem || !quantity || quantity <= 0) {
      setStockPreview(null)
      return
    }

    const currentStock = selectedItem.currentStock
    let afterStock = currentStock

    if (movementType === 'IN') {
      afterStock = currentStock + quantity
    } else if (movementType === 'OUT') {
      afterStock = currentStock - quantity
    } else if (movementType === 'ADJUSTMENT') {
      afterStock = quantity // Adjustment sets absolute value
    }

    const valid = afterStock >= 0

    let message = ''
    if (!valid) {
      message = 'Stok tidak mencukupi untuk pengurangan ini!'
    } else if (movementType === 'OUT' && afterStock < selectedItem.minStock) {
      message = 'Peringatan: Stok akan di bawah minimum setelah transaksi'
    } else if (afterStock >= selectedItem.maxStock) {
      message = 'Peringatan: Stok akan melebihi maksimum'
    } else {
      message = 'Stok tersedia untuk transaksi'
    }

    setStockPreview({
      before: currentStock,
      after: afterStock,
      valid,
      message,
    })
  }, [selectedItem, movementType, quantity])

  // Form submission
  const onSubmit = (data: FormData) => {
    if (!stockPreview?.valid) {
      return
    }

    createMovement(data, {
      onSuccess: () => {
        form.reset()
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/inventory/stock-movements')
        }
      },
    })
  }

  // Get movement type config
  const getMovementTypeConfig = (type: MovementType) => {
    const configs: Record<MovementType, {
      label: string
      icon: React.ReactNode
      color: string
      bgColor: string
      borderColor: string
      description: string
    }> = {
      IN: {
        label: 'Stok Masuk',
        icon: <ArrowDownToLine className="h-4 w-4" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-800',
        description: 'Penambahan stok dari pembelian, produksi, atau penerimaan',
      },
      OUT: {
        label: 'Stok Keluar',
        icon: <ArrowUpFromLine className="h-4 w-4" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        description: 'Pengurangan stok untuk distribusi, penjualan, atau pemakaian',
      },
      ADJUSTMENT: {
        label: 'Penyesuaian',
        icon: <Activity className="h-4 w-4" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        borderColor: 'border-blue-200 dark:border-blue-800',
        description: 'Koreksi stok karena stock opname, kehilangan, atau kerusakan',
      },
      EXPIRED: {
        label: 'Kedaluwarsa',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
        borderColor: 'border-orange-200 dark:border-orange-800',
        description: 'Pengurangan stok karena kedaluwarsa',
      },
      DAMAGED: {
        label: 'Rusak',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        description: 'Pengurangan stok karena kerusakan',
      },
      TRANSFER: {
        label: 'Transfer',
        icon: <Activity className="h-4 w-4" />,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
        borderColor: 'border-purple-200 dark:border-purple-800',
        description: 'Transfer stok antar lokasi',
      },
    }
    return configs[type]
  }

  const currentConfig = getMovementTypeConfig(movementType)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Catat Pergerakan Stok
        </CardTitle>
        <CardDescription>
          Tambahkan catatan pergerakan stok barang inventori (masuk, keluar, atau penyesuaian)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Movement Type Selection */}
            <FormField
              control={form.control as AnyFormControl}
              name="movementType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Jenis Pergerakan</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {(['IN', 'OUT', 'ADJUSTMENT'] as MovementType[]).map((type) => {
                        const config = getMovementTypeConfig(type)
                        return (
                          <div key={type}>
                            <RadioGroupItem
                              value={type}
                              id={type}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={type}
                              className={cn(
                                'flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer',
                                'hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary',
                                movementType === type && config.borderColor
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {config.icon}
                                <span className="font-semibold">{config.label}</span>
                              </div>
                              <p className="text-xs text-center text-muted-foreground">
                                {config.description}
                              </p>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Inventory Item Selection */}
            <FormField
              control={form.control as AnyFormControl}
              name="inventoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barang Inventori *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedItemId(value)
                    }}
                    defaultValue={field.value}
                    disabled={!!initialInventoryId || !!itemIdFromUrl}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih barang inventori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{item.itemName}</span>
                            <Badge variant="secondary" className="text-xs">
                              Stok: {item.currentStock} {item.unit}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih barang yang akan dicatat pergerakannya
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Stock Info */}
            {selectedItem && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informasi Stok Saat Ini</AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Barang</p>
                      <p className="font-semibold">{selectedItem.itemName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stok Saat Ini</p>
                      <p className="font-semibold">
                        {selectedItem.currentStock} {selectedItem.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stok Minimum</p>
                      <p className="font-semibold">
                        {selectedItem.minStock} {selectedItem.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stok Maksimum</p>
                      <p className="font-semibold">
                        {selectedItem.maxStock} {selectedItem.unit}
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Quantity Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as AnyFormControl}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {movementType === 'ADJUSTMENT'
                        ? 'Stok Baru (Jumlah Absolut) *'
                        : 'Kuantitas *'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={movementType === 'ADJUSTMENT' ? '100' : '50'}
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {movementType === 'ADJUSTMENT'
                        ? 'Masukkan jumlah stok yang benar setelah stock opname'
                        : `Jumlah ${movementType === 'IN' ? 'masuk' : 'keluar'} dalam ${selectedItem?.unit || 'unit'}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as AnyFormControl}
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya per Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15000"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Biaya per unit dalam Rupiah (opsional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock Preview */}
            {stockPreview && selectedItem && (
              <Alert
                variant={stockPreview.valid ? 'default' : 'destructive'}
                className={!stockPreview.valid ? '' : stockPreview.message.includes('Peringatan') ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : ''}
              >
                {stockPreview.valid ? (
                  stockPreview.message.includes('Peringatan') ? (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>Preview Perubahan Stok</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sebelum:</span>
                      <Badge variant="secondary">
                        {stockPreview.before} {selectedItem.unit}
                      </Badge>
                    </div>
                    {movementType === 'IN' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : movementType === 'OUT' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sesudah:</span>
                      <Badge
                        variant={
                          stockPreview.after < selectedItem.minStock
                            ? 'destructive'
                            : stockPreview.after >= selectedItem.maxStock
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {stockPreview.after} {selectedItem.unit}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{stockPreview.message}</p>
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Reference Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as AnyFormControl}
                name="referenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Referensi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe referensi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROCUREMENT">Procurement</SelectItem>
                        <SelectItem value="PRODUCTION">Production</SelectItem>
                        <SelectItem value="DISTRIBUTION">Distribution</SelectItem>
                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                        <SelectItem value="RETURN">Return</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Kategori sumber pergerakan stok</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as AnyFormControl}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Referensi</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-2025-001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nomor dokumen terkait (PO, DO, Invoice, dll)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Batch & Expiry */}
            {selectedItem?.hasExpiry && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as AnyFormControl}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Batch</FormLabel>
                      <FormControl>
                        <Input placeholder="BATCH-2025-10-001" {...field} />
                      </FormControl>
                      <FormDescription>Nomor batch produksi atau lot</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as AnyFormControl}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Kedaluwarsa</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'dd MMMM yyyy', { locale: localeId })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Tanggal kedaluwarsa barang (jika ada)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control as AnyFormControl}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan atau keterangan tambahan..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Catatan tambahan tentang pergerakan stok ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document URL */}
            <FormField
              control={form.control as AnyFormControl}
              name="documentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Dokumen</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://drive.google.com/..."
                        {...field}
                      />
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Link ke dokumen pendukung (PO, DO, Foto, dll)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (onCancel) {
                    onCancel()
                  } else {
                    router.back()
                  }
                }}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending || !stockPreview?.valid}
                className={cn(currentConfig.color)}
              >
                {isPending ? (
                  'Menyimpan...'
                ) : (
                  <>
                    {currentConfig.icon}
                    <span className="ml-2">Simpan Pergerakan</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
