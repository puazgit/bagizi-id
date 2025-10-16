/**
 * @fileoverview Assignment Dialog Component - Add/Edit Menu Assignment
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/MENU_PLANNING_USER_GUIDE.md} Menu Planning User Guide
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, InfoIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { MealType } from '@prisma/client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { useMenus } from '@/features/sppg/menu/hooks'
import type { Menu } from '@/features/sppg/menu/types'
import { useCreateAssignment, useUpdateAssignment } from '../hooks/useAssignments'
import { createAssignmentSchema } from '../schemas'
import { z } from 'zod'

// ================================ TYPES ================================

// Create form schema that uses Date (after transformation)
const assignmentFormSchema = createAssignmentSchema.extend({
  date: z.date()
})

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

interface AssignmentWithMenu {
  id: string
  menuPlanId: string
  menuId: string
  assignedDate: Date
  mealType: MealType
  plannedPortions: number
  estimatedCost: number
  notes?: string | null
  status: string
  menu: {
    id: string
    menuName: string
    menuCode: string
    mealType: MealType
    costPerServing: number
    servingSize: number
  }
}

interface AssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  planStartDate: Date
  planEndDate: Date
  programTargetRecipients: number
  assignment?: AssignmentWithMenu | null
  selectedDate?: Date | null
}

// ================================ MEAL TYPE LABELS ================================

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  SARAPAN: 'Sarapan',
  SNACK_PAGI: 'Snack Pagi',
  MAKAN_SIANG: 'Makan Siang',
  SNACK_SORE: 'Snack Sore',
  MAKAN_MALAM: 'Makan Malam',
}

// ================================ COMPONENT ================================

export function AssignmentDialog({
  open,
  onOpenChange,
  planId,
  planStartDate,
  planEndDate,
  programTargetRecipients,
  assignment,
  selectedDate,
}: AssignmentDialogProps) {
  const isEditMode = !!assignment
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    assignment?.mealType || null
  )

  // ================================ QUERIES ================================

  const { data: menusResponse, isLoading: isLoadingMenus } = useMenus({
    isActive: true,
    mealType: selectedMealType || undefined,
  })

  const menus = menusResponse?.menus || []

  // ================================ MUTATIONS ================================

  const { mutate: createAssignment, isPending: isCreating } = useCreateAssignment()
  const { mutate: updateAssignment, isPending: isUpdating } = useUpdateAssignment()

  const isSubmitting = isCreating || isUpdating

  // ================================ FORM SETUP ================================

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      planId,
      menuId: assignment?.menuId || '',
      date: assignment?.assignedDate || selectedDate || new Date(),
      mealType: assignment?.mealType || 'SNACK_PAGI',
      plannedPortions: assignment?.plannedPortions || programTargetRecipients,
      notes: assignment?.notes || '',
    },
  })

  // ================================ EFFECTS ================================

  // Reset form when assignment or selectedDate changes
  useEffect(() => {
    if (open) {
      form.reset({
        planId,
        menuId: assignment?.menuId || '',
        date: assignment?.assignedDate || selectedDate || new Date(),
        mealType: assignment?.mealType || 'SNACK_PAGI',
        plannedPortions: assignment?.plannedPortions || programTargetRecipients,
        notes: assignment?.notes || '',
      })
      setSelectedMealType(assignment?.mealType || null)
    }
  }, [open, assignment, selectedDate, planId, programTargetRecipients, form])

  // Update selected meal type when form changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'mealType' && value.mealType) {
        setSelectedMealType(value.mealType)
        // Reset menu selection when meal type changes
        form.setValue('menuId', '')
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // ================================ COMPUTED VALUES ================================

  const selectedMenuId = form.watch('menuId')
  const plannedPortions = form.watch('plannedPortions') || 0

  const selectedMenu = menus.find((menu: Menu) => menu.id === selectedMenuId)

  const estimatedCost = selectedMenu
    ? (selectedMenu.costPerServing || 0) * plannedPortions
    : 0

  // ================================ HANDLERS ================================

  const onSubmit = (data: AssignmentFormValues) => {
    if (isEditMode && assignment) {
      // Update existing assignment
      // API client needs planId in data object to extract for URL construction
      // TypeScript: UpdateAssignmentInput omits planId, but API expects it
      // Solution: Add planId to data with proper type assertion
      const updateData = {
        ...data,
        // planId removed from data - now passed as separate parameter
      }
      
      updateAssignment(
        {
          assignmentId: assignment.id,
          planId, // Pass planId as separate parameter for API URL construction
          data: updateData as Parameters<typeof updateAssignment>[0]['data'],
        },
        {
          onSuccess: () => {
            toast.success('Assignment berhasil diperbarui')
            onOpenChange(false)
          },
          onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui assignment')
          },
        }
      )
    } else {
      // Create new assignment
      createAssignment(data, {
        onSuccess: () => {
          toast.success('Assignment berhasil ditambahkan')
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal menambahkan assignment')
        },
      })
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedMealType(null)
    onOpenChange(false)
  }

  // ================================ RENDER ================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Assignment Menu' : 'Tambah Menu Assignment'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui menu yang akan disajikan pada tanggal dan waktu tertentu'
              : 'Tambahkan menu yang akan disajikan pada tanggal dan waktu tertentu'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date & Meal Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal</FormLabel>
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
                              format(field.value, 'PPP', { locale: localeId })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date || new Date())}
                          disabled={(date) => {
                            // Disable dates outside plan range
                            return date < planStartDate || date > planEndDate
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Pilih tanggal antara {format(planStartDate, 'dd MMM yyyy', { locale: localeId })} 
                      {' - '} {format(planEndDate, 'dd MMM yyyy', { locale: localeId })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meal Type */}
              <FormField
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Makanan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis makanan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Menu akan difilter berdasarkan jenis makanan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Menu Selection */}
            <FormField
              control={form.control}
              name="menuId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedMealType || isLoadingMenus}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedMealType
                              ? 'Pilih jenis makanan terlebih dahulu'
                              : isLoadingMenus
                              ? 'Memuat menu...'
                              : menus.length === 0
                              ? 'Tidak ada menu tersedia'
                              : 'Pilih menu'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menus.map((menu: Menu) => (
                        <SelectItem key={menu.id} value={menu.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{menu.menuName}</span>
                            <span className="text-xs text-muted-foreground">
                              ({menu.menuCode})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedMealType && (
                    <Alert className="mt-2">
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription>
                        Pilih jenis makanan terlebih dahulu untuk melihat daftar menu
                      </AlertDescription>
                    </Alert>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Menu Preview */}
            {selectedMenu && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preview Menu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{selectedMenu.menuName}</h4>
                      <p className="text-sm text-muted-foreground">{selectedMenu.menuCode}</p>
                    </div>
                    <Badge variant="secondary">
                      {MEAL_TYPE_LABELS[selectedMenu.mealType]}
                    </Badge>
                  </div>

                  {selectedMenu.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedMenu.description}
                    </p>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Porsi</p>
                      <p className="font-semibold">{selectedMenu.servingSize}g</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Biaya/Porsi</p>
                      <p className="font-semibold">
                        Rp {selectedMenu.costPerServing.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kesulitan</p>
                      <p className="font-semibold capitalize">
                        {selectedMenu.difficulty?.toLowerCase() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Portions & Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Planned Portions */}
              <FormField
                control={form.control}
                name="plannedPortions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Porsi</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100000}
                        placeholder="Masukkan jumlah porsi"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseInt(value, 10) : undefined)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Target penerima: {programTargetRecipients.toLocaleString('id-ID')} orang
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Cost (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Estimasi Biaya
                </label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  <span className="font-semibold text-lg">
                    Rp {estimatedCost.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dihitung otomatis: {plannedPortions || 0} porsi × Rp{' '}
                  {(selectedMenu?.costPerServing || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan khusus untuk assignment ini..."
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Maksimal 500 karakter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Memperbarui...' : 'Menambahkan...'}
                  </>
                ) : isEditMode ? (
                  'Perbarui Assignment'
                ) : (
                  'Tambah Assignment'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
