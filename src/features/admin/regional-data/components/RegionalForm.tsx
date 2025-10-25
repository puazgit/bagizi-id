/**
 * @fileoverview Regional Form Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, MapPin, Code, Tag, Globe, Clock, Building2, Home, Mail } from 'lucide-react'
import { CascadeSelect, type CascadeValue } from './CascadeSelect'
import {
  createProvinceSchema,
  updateProvinceSchema,
  createRegencySchema,
  updateRegencySchema,
  createDistrictSchema,
  updateDistrictSchema,
  createVillageSchema,
  updateVillageSchema,
} from '../schemas'
import type {
  CreateProvinceInput,
  UpdateProvinceInput,
  CreateRegencyInput,
  UpdateRegencyInput,
  CreateDistrictInput,
  UpdateDistrictInput,
  CreateVillageInput,
  UpdateVillageInput,
  District,
  Village,
  Regency,
} from '../types'
import { formatRegionalCode, getRegionTypeLabel } from '../lib'
import {
  INDONESIA_REGION_LABELS,
  TIMEZONE_LABELS,
  REGENCY_TYPE_LABELS,
  VILLAGE_TYPE_LABELS,
  type IndonesiaRegion,
  type Timezone,
} from '../types'

/**
 * Form input union type
 */
type FormInput = 
  | CreateProvinceInput 
  | UpdateProvinceInput 
  | CreateRegencyInput 
  | UpdateRegencyInput
  | CreateDistrictInput
  | UpdateDistrictInput
  | CreateVillageInput
  | UpdateVillageInput

/**
 * Component props
 */
interface RegionalFormProps {
  /**
   * Regional level
   */
  level: 'province' | 'regency' | 'district' | 'village'
  
  /**
   * Form mode
   */
  mode: 'create' | 'edit'
  
  /**
   * Initial data for edit mode
   */
  initialData?: FormInput
  
  /**
   * Submit handler
   */
  onSubmit: (data: FormInput) => void | Promise<void>
  
  /**
   * Cancel handler
   */
  onCancel?: () => void
  
  /**
   * Loading state
   */
  isLoading?: boolean
  
  /**
   * Custom class name
   */
  className?: string
}

/**
 * Regional Form Component
 * 
 * Create/Edit form for regional data
 * 
 * @example
 * ```tsx
 * <RegionalForm
 *   level="province"
 *   mode="create"
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function RegionalForm({
  level,
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: RegionalFormProps) {
  // Get appropriate schema based on level and mode
  const getSchema = () => {
    if (mode === 'create') {
      switch (level) {
        case 'province': return createProvinceSchema
        case 'regency': return createRegencySchema
        case 'district': return createDistrictSchema
        case 'village': return createVillageSchema
      }
    } else {
      switch (level) {
        case 'province': return updateProvinceSchema
        case 'regency': return updateRegencySchema
        case 'district': return updateDistrictSchema
        case 'village': return updateVillageSchema
      }
    }
  }

  // Get default values based on level
  const getDefaultValues = () => {
    if (initialData) {
      return initialData
    }

    // Base fields semua level punya
    const baseDefaults = {
      code: '',
      name: '',
    }

    // Tambahkan parent fields berdasarkan level
    switch (level) {
      case 'province':
        return {
          ...baseDefaults,
          region: undefined as IndonesiaRegion | undefined,
          timezone: undefined as Timezone | undefined,
        }
      case 'regency':
        return {
          ...baseDefaults,
          provinceId: '', // Required field
        }
      case 'district':
        return {
          ...baseDefaults,
          regencyId: '', // Required field
        }
      case 'village':
        return {
          ...baseDefaults,
          districtId: '', // Required field
        }
      default:
        return baseDefaults
    }
  }

  // Initialize form
  const form = useForm<FormInput>({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  })

  // Local state untuk cascade values (untuk memastikan re-render)
  const [cascadeState, setCascadeState] = useState<CascadeValue>(() => {
    // Initialize cascade state dari initialData jika edit mode
    if (!initialData || mode !== 'edit') return {}
    
    switch (level) {
      case 'regency':
        const regencyData = initialData as Regency
        return { provinceId: regencyData.provinceId }
      case 'district':
        const districtData = initialData as District
        return { 
          provinceId: districtData.regency?.provinceId, // Extract from nested regency
          regencyId: districtData.regencyId 
        }
      case 'village':
        const villageData = initialData as Village
        return { 
          provinceId: villageData.district?.regency?.provinceId, // Extract from nested district.regency
          regencyId: villageData.district?.regencyId, // Extract from nested district
          districtId: villageData.districtId 
        }
      default:
        return {}
    }
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      console.log('[RegionalForm] Resetting form with initialData:', initialData)
      
      // Reset form dengan data
      form.reset(initialData)
      
      // Update cascade state untuk edit mode
      switch (level) {
        case 'regency':
          const regencyData = initialData as Regency
          console.log('[RegionalForm] Setting regency cascade:', { provinceId: regencyData.provinceId })
          setCascadeState({ provinceId: regencyData.provinceId })
          break
        case 'district':
          const districtData = initialData as District
          console.log('[RegionalForm] Setting district cascade:', { 
            regencyId: districtData.regencyId,
            provinceId: districtData.regency?.provinceId 
          })
          // Set regencyId untuk cascade dropdown
          setCascadeState({ 
            provinceId: districtData.regency?.provinceId, // Get from nested regency
            regencyId: districtData.regencyId 
          })
          break
        case 'village':
          const villageData = initialData as Village
          console.log('[RegionalForm] Setting village cascade:', { 
            districtId: villageData.districtId,
            regencyId: villageData.district?.regencyId,
            provinceId: villageData.district?.regency?.provinceId
          })
          setCascadeState({ 
            provinceId: villageData.district?.regency?.provinceId, // Get from nested district.regency
            regencyId: villageData.district?.regencyId, // Get from nested district
            districtId: villageData.districtId 
          })
          break
        default:
          console.log('[RegionalForm] Province level, no cascade needed')
      }
    }
  }, [initialData, form, level, mode])

  // Debug: Watch form values for province field
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      console.log('[RegionalForm] Form value changed:', { 
        name, 
        level,
        value 
      })
    })
    return () => subscription.unsubscribe()
  }, [form, level])

  // Handle form submission
  const handleSubmit = async (data: FormInput) => {
    await onSubmit(data)
  }

  // Get parent field name based on level
  const getParentField = () => {
    switch (level) {
      case 'regency': return 'provinceId'
      case 'district': return 'regencyId'
      case 'village': return 'districtId'
      default: return null
    }
  }

  const parentField = getParentField()

  // Get cascade value for parent selector
  const getCascadeValue = (): CascadeValue => {
    // Return cascade state yang di-maintain di local state
    console.log('[RegionalForm] getCascadeValue - level:', level, 'cascadeState:', cascadeState)
    return cascadeState
  }

  // Handle cascade change
  const handleCascadeChange = (cascade: CascadeValue) => {
    console.log('[RegionalForm] handleCascadeChange - level:', level, 'cascade:', cascade)
    
    // Update local cascade state untuk trigger re-render
    setCascadeState(cascade)
    
    switch (level) {
      case 'regency':
        // Set provinceId (required field for regency)
        if (cascade.provinceId) {
          form.setValue('provinceId' as keyof FormInput, cascade.provinceId as never, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          })
        }
        break
      case 'district': {
        // For district, we need to store both provinceId (for UI) and regencyId (required field)
        if (cascade.regencyId) {
          form.setValue('regencyId' as keyof FormInput, cascade.regencyId as never, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          })
        }
        break
      }
      case 'village': {
        // For village, we need to store districtId (required field)
        if (cascade.districtId) {
          form.setValue('districtId' as keyof FormInput, cascade.districtId as never, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          })
        }
        break
      }
    }
  }

  // Get cascade max level based on current level
  const getCascadeMaxLevel = () => {
    switch (level) {
      case 'regency': return 'province' as const
      case 'district': return 'regency' as const
      case 'village': return 'district' as const
      default: return undefined
    }
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Parent Selector (for regency, district, village) */}
          {parentField && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Wilayah Induk</span>
                </div>
                
                <CascadeSelect
                  value={getCascadeValue()}
                  onChange={handleCascadeChange}
                  maxLevel={getCascadeMaxLevel()}
                  layout="vertical"
                  showLabels
                  showCounts
                  required={{
                    province: level === 'regency',
                    regency: level === 'district',
                    district: level === 'village',
                  }}
                />
              </div>

              <Separator className="my-6" />
            </>
          )}

          {/* Code and Name Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>Data {getRegionTypeLabel(level)}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {/* Code Field */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Kode {getRegionTypeLabel(level)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            level === 'province' ? '32' :
                            level === 'regency' ? '3201' :
                            level === 'district' ? '320101' :
                            '3201010001'
                          }
                          maxLength={
                            level === 'province' ? 2 :
                            level === 'regency' ? 4 :
                            level === 'district' ? 6 :
                            10
                          }
                          disabled={mode === 'edit'}
                        />
                      </FormControl>
                      <FormDescription>
                        {level === 'province' && 'Kode 2 digit (contoh: 32 untuk Jawa Barat)'}
                        {level === 'regency' && 'Kode 4 digit (contoh: 3201 untuk Kab. Bogor)'}
                        {level === 'district' && 'Kode 6 digit (contoh: 320101 untuk Kec. Cibinong)'}
                        {level === 'village' && 'Kode 10 digit (contoh: 3201010001)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama {getRegionTypeLabel(level)}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            level === 'province' ? 'Jawa Barat' :
                            level === 'regency' ? 'Kabupaten Bogor' :
                            level === 'district' ? 'Cibinong' :
                            'Ciriung'
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Nama lengkap {getRegionTypeLabel(level).toLowerCase()}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Province-specific fields: Region & Timezone */}
              {level === 'province' && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>Informasi Tambahan</span>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Region
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(INDONESIA_REGION_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Kawasan geografis Indonesia
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Zona Waktu
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih zona waktu" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TIMEZONE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Zona waktu wilayah
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Regency-specific field: Type */}
              {level === 'regency' && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>Informasi Tambahan</span>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Tipe Wilayah
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih tipe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(REGENCY_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Kabupaten atau Kota
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Village-specific fields: Type & Postal Code */}
              {level === 'village' && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>Informasi Tambahan</span>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              Tipe Wilayah
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(VILLAGE_TYPE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Kelurahan atau Desa
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Kode Pos (Opsional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="40111"
                                maxLength={5}
                              />
                            </FormControl>
                            <FormDescription>
                              Kode pos 5 digit
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Code Preview */}
              {form.watch('code') && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground mb-1">Preview Kode:</p>
                  <code className="text-lg font-mono font-bold">
                    {formatRegionalCode(form.watch('code') || '')}
                  </code>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Tambah' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
    </div>
  )
}
