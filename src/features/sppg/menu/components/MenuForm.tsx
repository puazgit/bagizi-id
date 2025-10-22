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
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateMenu, useUpdateMenu } from '../hooks'
import { useAllergenOptions } from '../hooks/useAllergens'
import { usePrograms } from '../hooks/usePrograms'
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

  // Fetch programs from database
  const { data: programs, isLoading: isLoadingPrograms } = usePrograms()

  // ================================ FORM SETUP ================================
  
  // Auto-generate menu code based on meal type and timestamp
  const generateMenuCode = React.useCallback((mealType: MealType) => {
    const prefix = {
      'SARAPAN': 'SAR',
      'SNACK_PAGI': 'SNP',
      'MAKAN_SIANG': 'MKS',
      'SNACK_SORE': 'SNS',
      'MAKAN_MALAM': 'MKM'
    }[mealType] || 'MNU'
    
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}-${timestamp}`
  }, [])

  const form = useForm({
    resolver: zodResolver(menuCreateSchema),
    defaultValues: isEditing ? {
      programId: menu.programId,
      menuName: menu.menuName,
      menuCode: menu.menuCode,
      description: menu.description || '',
      mealType: menu.mealType,
      servingSize: menu.servingSize,
      cookingTime: menu.cookingTime,
      preparationTime: menu.preparationTime,
      difficulty: (menu.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined) || undefined,
      cookingMethod: (menu.cookingMethod as 'STEAM' | 'BOIL' | 'FRY' | 'BAKE' | 'GRILL' | 'ROAST' | undefined) || undefined,
      batchSize: menu.batchSize,
      budgetAllocation: menu.budgetAllocation,
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
    console.log('🎯 MenuForm onSubmit called', { isEditing, data })
    
    if (isEditing && menu) {
      console.log('📝 Updating menu', menu.id)
      updateMenu(
        { id: menu.id, data: data as unknown as Partial<MenuUpdateInput> },
        {
          onSuccess: (response) => {
            console.log('✅ Update menu success', response)
            toast.success('Menu berhasil diperbarui')
            onSuccess?.(response.data!)
          },
          onError: (error) => {
            console.error('❌ Update menu error', error)
            toast.error(error.message)
          }
        }
      )
    } else {
      console.log('➕ Creating new menu', data)
      createMenu(data as unknown as MenuInput, {
        onSuccess: (response) => {
          console.log('✅ Create menu success', response)
          toast.success('Menu berhasil dibuat')
          form.reset()
          onSuccess?.(response.data!.menu)
        },
        onError: (error) => {
          console.error('❌ Create menu error', error)
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
          <form 
            onSubmit={(e) => {
              console.log('📋 Form submit event triggered')
              e.preventDefault()
              form.handleSubmit((data) => {
                console.log('🔍 Form validation passed, calling onSubmit', data)
                onSubmit(data)
              }, (errors) => {
                console.error('❌ Form validation failed', errors)
              })()
            }} 
            className="space-y-8"
          >
            
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary">
                  Informasi Dasar
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Program Gizi */}
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Gizi *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEditing || isLoadingPrograms}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih program..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
                          {programs?.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Menu Code */}
                <FormField
                  control={form.control}
                  name="menuCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Menu *</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="MN-GDG-001"
                            {...field}
                            className="font-mono"
                            readOnly={!isEditing}
                          />
                          {!isEditing && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const mealType = form.getValues('mealType')
                                const newCode = generateMenuCode(mealType)
                                form.setValue('menuCode', newCode)
                              }}
                              className="shrink-0"
                            >
                              Generate
                            </Button>
                          )}
                        </div>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meal Type & Serving Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Makanan *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih jenis makanan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
                          {MEAL_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col items-start text-left">
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
                      <FormLabel>Ukuran Porsi (gram) *</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
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
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
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
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cooking Method */}
                <FormField
                  control={form.control}
                  name="cookingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Memasak</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih metode memasak" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih tingkat kesulitan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
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
                    <FormLabel>Alokasi Anggaran per Porsi (Rupiah)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="25000"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isHalal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        Menu Halal
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        Menu Vegetarian
                      </FormLabel>
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
                    <FormLabel className="text-base cursor-pointer">
                      Status Menu Aktif
                    </FormLabel>
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