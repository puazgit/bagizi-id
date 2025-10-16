/**
 * @fileoverview MenuForm component - Create/Edit menu with comprehensive form validation
 * @version Next.js 15.5.4 / React Hook Form / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ChefHat, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateMenu, useUpdateMenu } from '../hooks'
import { useAllergenOptions } from '../hooks/useAllergens'
import { menuCreateSchema } from '../schemas'
import type { Menu, MenuUpdateInput, MenuInput } from '../types'
import type { MealType } from '@prisma/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { AddAllergenDialog } from './AddAllergenDialog'

// ================================ FORM DATA INTERFACES ================================

type MenuFormData = z.infer<typeof menuCreateSchema>

interface MenuFormProps {
  menu?: Menu // For editing existing menu
  programId?: string // Required for creating new menu
  onSuccess?: (menu: Menu) => void
  onCancel?: () => void
  className?: string
}

// ================================ CONSTANTS ================================

const MEAL_TYPE_OPTIONS: Array<{ value: MealType; label: string; description: string }> = [
  {
    value: 'SARAPAN',
    label: 'Sarapan',
    description: 'Makanan untuk pagi hari (06:00 - 10:00)'
  },
  {
    value: 'SNACK_PAGI',
    label: 'Snack Pagi',
    description: 'Kudapan sehat pagi (09:00 - 11:00)'
  },
  {
    value: 'MAKAN_SIANG',
    label: 'Makan Siang',
    description: 'Makanan utama siang hari (11:00 - 14:00)'
  },
  {
    value: 'SNACK_SORE',
    label: 'Snack Sore',
    description: 'Kudapan sehat sore (15:00 - 17:00)'
  },
  {
    value: 'MAKAN_MALAM',
    label: 'Makan Malam',
    description: 'Makanan untuk sore/malam (17:00 - 20:00)'
  }
]

const COOKING_METHODS = [
  { value: 'STEAM', label: 'Dikukus' },
  { value: 'BOIL', label: 'Direbus' },
  { value: 'FRY', label: 'Digoreng' },
  { value: 'BAKE', label: 'Dipanggang' },
  { value: 'GRILL', label: 'Dibakar' },
  { value: 'SAUTE', label: 'Ditumis' }
]

const DIFFICULTY_LEVELS = [
  { value: 'EASY', label: 'Mudah', description: 'Dapat dibuat oleh staf pemula' },
  { value: 'MEDIUM', label: 'Sedang', description: 'Memerlukan keahlian dasar memasak' },
  { value: 'HARD', label: 'Sulit', description: 'Memerlukan chef berpengalaman' }
]

// ================================ MAIN COMPONENT ================================

export function MenuForm({
  menu,
  programId,
  onSuccess,
  onCancel,
  className
}: MenuFormProps) {
  const isEditing = !!menu
  const { mutate: createMenu, isPending: isCreating } = useCreateMenu()
  const { mutate: updateMenu, isPending: isUpdating } = useUpdateMenu()
  const isPending = isCreating || isUpdating

  // Fetch allergens from database
  const { options: allergenOptions, isLoading: isLoadingAllergens } = useAllergenOptions()

  // ================================ FORM SETUP ================================
  
  const form = useForm({
    resolver: zodResolver(menuCreateSchema),
    defaultValues: isEditing ? {
      programId: menu.programId,
      menuName: menu.menuName,
      menuCode: menu.menuCode,
      description: menu.description || '',
      mealType: menu.mealType,
      servingSize: menu.servingSize,
      cookingTime: menu.cookingTime || undefined,
      preparationTime: menu.preparationTime || undefined,
      difficulty: (menu.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined) || undefined,
      cookingMethod: (menu.cookingMethod as 'STEAM' | 'BOIL' | 'FRY' | 'BAKE' | 'GRILL' | 'ROAST' | undefined) || undefined,
      batchSize: menu.batchSize || undefined,
      budgetAllocation: menu.budgetAllocation || undefined,
      allergens: menu.allergens || [],
      isHalal: menu.isHalal,
      isVegetarian: menu.isVegetarian,
      isActive: menu.isActive
    } : {
      programId: programId || '',
      menuName: '',
      menuCode: '',
      description: '',
      mealType: 'SNACK_PAGI',
      servingSize: 200,
      cookingTime: undefined,
      preparationTime: undefined,
      difficulty: undefined,
      cookingMethod: undefined,
      batchSize: undefined,
      budgetAllocation: undefined,
      allergens: [],
      isHalal: true,
      isVegetarian: false,
      isActive: true
    }
  })

  // ================================ FORM HANDLERS ================================

  const onSubmit = (data: MenuFormData) => {
    if (isEditing && menu) {
      updateMenu(
        { id: menu.id, data: data as unknown as Partial<MenuUpdateInput> },
        {
          onSuccess: (response) => {
            toast.success('Menu berhasil diperbarui')
            onSuccess?.(response.data!)
          },
          onError: (error) => {
            toast.error(error.message)
          }
        }
      )
    } else {
      createMenu(data as unknown as MenuInput, {
        onSuccess: (response) => {
          toast.success('Menu berhasil dibuat')
          form.reset()
          onSuccess?.(response.data!.menu)
        },
        onError: (error) => {
          toast.error(error.message)
        }
      })
    }
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  // ================================ UTILITY FUNCTIONS ================================

  const handleAllergenToggle = (allergen: string, checked: boolean) => {
    const currentAllergens = form.getValues('allergens') || []
    
    if (checked) {
      form.setValue('allergens', [...currentAllergens, allergen])
    } else {
      form.setValue('allergens', currentAllergens.filter(a => a !== allergen))
    }
  }

  // ================================ RENDER ================================

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          {isEditing ? 'Edit Menu' : 'Buat Menu Baru'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Perbarui informasi menu sesuai kebutuhan program gizi'
            : 'Lengkapi form berikut untuk membuat menu baru dalam program gizi'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary">
                  Informasi Dasar
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Menu Name */}
                <FormField
                  control={form.control}
                  name="menuName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Menu *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nasi Gudeg Ayam Yogya"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nama menu yang jelas dan menarik
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Menu Code */}
                <FormField
                  control={form.control}
                  name="menuCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Menu *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MN-GDG-001"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Kode unik untuk identifikasi menu
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Menu Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Menu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi menu, bahan utama, dan keunggulan gizi..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Jelaskan menu ini untuk memudahkan identifikasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meal Type & Serving Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Makanan *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis makanan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MEAL_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="servingSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Ukuran Porsi (gram) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="50"
                          max="1000"
                          placeholder="200"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Berat porsi per anak dalam gram (50-1000g)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Cooking Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Informasi Memasak
                </Badge>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cooking Time */}
                <FormField
                  control={form.control}
                  name="cookingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu Memasak (menit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="480"
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preparation Time */}
                <FormField
                  control={form.control}
                  name="preparationTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu Persiapan (menit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="240"
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Batch Size */}
                <FormField
                  control={form.control}
                  name="batchSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ukuran Batch (porsi)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="50"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Jumlah porsi per batch produksi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cooking Method */}
                <FormField
                  control={form.control}
                  name="cookingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Memasak</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih metode memasak" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COOKING_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Difficulty */}
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tingkat Kesulitan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tingkat kesulitan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex flex-col">
                                <span>{level.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {level.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Budget & Allergen Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Anggaran & Alergen
                </Badge>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Budget Allocation */}
              <FormField
                control={form.control}
                name="budgetAllocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alokasi Anggaran (Rupiah)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="25000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Anggaran maksimal per porsi untuk menu ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allergens */}
              <FormField
                control={form.control}
                name="allergens"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Alergen Potensial</FormLabel>
                      <AddAllergenDialog onSuccess={() => {
                        // Refresh allergen options after adding new custom allergen
                        toast.success('Alergen baru ditambahkan ke daftar')
                      }} />
                    </div>
                    {isLoadingAllergens ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Memuat alergen...</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {allergenOptions.map((allergen) => {
                            const isChecked = form.watch('allergens')?.includes(allergen.value) || false
                            return (
                              <div key={allergen.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={allergen.value}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handleAllergenToggle(allergen.value, checked as boolean)}
                                />
                                <label
                                  htmlFor={allergen.value}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                                >
                                  {allergen.label}
                                  {allergen.isCommon && (
                                    <Badge variant="secondary" className="text-xs ml-1">Umum</Badge>
                                  )}
                                  {!allergen.isPlatform && (
                                    <Badge variant="outline" className="text-xs ml-1">Custom</Badge>
                                  )}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                        <FormDescription>
                          Pilih alergen yang mungkin terkandung dalam menu ini ({allergenOptions.length} alergen tersedia)
                        </FormDescription>
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dietary Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isHalal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Menu Halal
                        </FormLabel>
                        <FormDescription>
                          Menu ini menggunakan bahan-bahan halal
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Menu Vegetarian
                        </FormLabel>
                        <FormDescription>
                          Menu ini tidak mengandung daging dan ikan
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Menu Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Status Menu
                      </FormLabel>
                      <FormDescription>
                        Menu aktif dapat digunakan dalam perencanaan
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Menyimpan...' : 'Membuat...'}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <ChefHat className="mr-2 h-4 w-4" />
                    )}
                    {isEditing ? 'Simpan Perubahan' : 'Buat Menu'}
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

// ================================ EXPORT ================================

export default MenuForm