/**
 * @fileoverview SPPG Form Component - Enterprise Grade
 * 
 * Reusable form component for creating and editing SPPG entities.
 * Supports dual-mode operation (create/edit) with complete field coverage
 * for all 35 active fields from Prisma SPPG model.
 * 
 * @version Next.js 15.5.4 / React Hook Form 7.54.2 / Zod 3.24.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/SPPG_FORM_COMPONENT_DESIGN_SPEC.md} Design Specification
 * @see {@link /docs/copilot-instructions.md} Feature-Based Architecture
 * 
 * @example
 * // Create mode
 * <SppgForm mode="create" />
 * 
 * @example
 * // Edit mode
 * <SppgForm 
 *   mode="edit" 
 *   sppgId={id}
 *   initialData={sppgData}
 *   isLoading={isLoadingData}
 * />
 */

'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateSppg, useUpdateSppg } from '../hooks'
import { createSppgSchema, type CreateSppgInput } from '../schemas'
import { type SppgDetail } from '../types'
import { 
  useProvinceOptions, 
  useRegenciesByProvince, 
  useDistrictsByRegency, 
  useVillagesByDistrict 
} from '@/features/admin/regional-data/hooks'
import {
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { PhoneInput } from '@/components/ui/phone-input'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Phone, 
  UserCircle, 
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  TestTube,
  CalendarIcon
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

/**
 * Props for SppgForm component
 */
interface SppgFormProps {
  /** Form mode: 'create' for new SPPG, 'edit' for existing SPPG */
  mode: 'create' | 'edit'
  
  /** SPPG ID (required for edit mode) */
  sppgId?: string
  
  /** Initial data for edit mode */
  initialData?: SppgDetail
  
  /** Loading state for data fetching (edit mode) */
  isLoading?: boolean
}

/**
 * SppgForm Component
 * 
 * Enterprise-grade form for SPPG creation and editing with:
 * - Complete field validation using Zod schema
 * - Regional cascading (Province → Regency → District → Village)
 * - Conditional logic for demo account settings
 * - Responsive layout with shadcn/ui components
 * - Proper loading states and error handling
 */
/**
 * Helper function to validate and clean phone number for E.164 format
 * Returns empty string if phone is not in valid E.164 format (starts with +)
 * This prevents react-phone-number-input from throwing errors with invalid data
 */
function sanitizePhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Check if phone starts with + (E.164 format)
  const trimmed = phone.trim()
  if (trimmed.startsWith('+')) {
    return trimmed
  }
  
  // Invalid format - return empty string to let user input new valid number
  console.warn(`Invalid phone format detected: "${phone}". Expected E.164 format (e.g., +628123456789)`)
  return ''
}

export function SppgForm({ mode, sppgId, initialData, isLoading: dataLoading }: SppgFormProps) {
  const router = useRouter()
  
  // CRUD hooks
  const { mutate: createSppg, isPending: isCreating } = useCreateSppg()
  const { mutate: updateSppg, isPending: isUpdating } = useUpdateSppg()

  const isSubmitting = isCreating || isUpdating

  // Form data type from Zod schema
  type FormData = z.infer<typeof createSppgSchema>

  // React Hook Form setup with Zod resolver
  // Use z.infer to get exact type from schema
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSppgSchema) as any, // Type assertion for RHF version mismatch
    // Always provide default values (even for edit mode) to prevent controlled/uncontrolled switch
    defaultValues: {
      // Default values - same for both create and edit mode
      // Use empty strings for text inputs to ensure controlled behavior
      code: '',
      name: '',
      description: '',
      organizationType: 'PEMERINTAH',
      establishedYear: undefined,
      targetRecipients: 100,
      addressDetail: '',
      provinceId: '',
      regencyId: '',
      districtId: '',
      villageId: '',
      postalCode: '',
      coordinates: '',
      timezone: 'WIB',
      phone: '',
      email: '',
      picName: '',
      picPosition: '',
      picEmail: '',
      picPhone: '',
      picWhatsapp: '',
      maxRadius: 50,
      maxTravelTime: 120,
      operationStartDate: new Date(),
      operationEndDate: undefined,
      monthlyBudget: undefined,
      yearlyBudget: undefined,
      budgetCurrency: 'IDR',
      budgetStartDate: undefined,
      budgetEndDate: undefined,
      isDemoAccount: false,
      demoExpiresAt: undefined,
      demoMaxBeneficiaries: undefined,
      demoAllowedFeatures: [],
      status: 'ACTIVE',
    },
  })

  // For edit mode, set values when initialData is available
  // Use useEffect to prevent "setState during render" error
  useEffect(() => {
    if (mode === 'edit' && initialData && !form.formState.isDirty) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description ?? '', // Empty string for controlled input
        organizationType: initialData.organizationType,
        establishedYear: initialData.establishedYear ?? undefined,
        targetRecipients: initialData.targetRecipients,
        addressDetail: initialData.addressDetail,
        provinceId: initialData.province.id,
        regencyId: initialData.regency.id,
        districtId: initialData.district.id,
        villageId: initialData.village.id,
        postalCode: initialData.postalCode ?? '', // Empty string for controlled input
        coordinates: initialData.coordinates ?? '', // Empty string for controlled input
        timezone: initialData.timezone,
        phone: sanitizePhoneNumber(initialData.phone), // Returns empty string if invalid
        email: initialData.email,
        picName: initialData.picName,
        picPosition: initialData.picPosition,
        picEmail: initialData.picEmail,
        picPhone: sanitizePhoneNumber(initialData.picPhone), // Returns empty string if invalid
        picWhatsapp: sanitizePhoneNumber(initialData.picWhatsapp), // Returns empty string if invalid
        maxRadius: initialData.maxRadius,
        maxTravelTime: initialData.maxTravelTime,
        operationStartDate: initialData.operationStartDate,
        operationEndDate: initialData.operationEndDate ?? undefined,
        monthlyBudget: initialData.monthlyBudget ?? undefined,
        yearlyBudget: initialData.yearlyBudget ?? undefined,
        budgetCurrency: initialData.budgetCurrency,
        budgetStartDate: initialData.budgetStartDate ?? undefined,
        budgetEndDate: initialData.budgetEndDate ?? undefined,
        isDemoAccount: initialData.isDemoAccount,
        demoExpiresAt: initialData.demoExpiresAt ?? undefined,
        demoMaxBeneficiaries: initialData.demoMaxBeneficiaries ?? undefined,
        demoAllowedFeatures: initialData.demoAllowedFeatures,
        status: initialData.status,
      })
    }
  }, [mode, initialData, form])

  // Regional data hooks (after form declaration)
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinceOptions()
  
  // Debug provinces
  console.log('[SppgForm] Provinces data:', provinces)
  console.log('[SppgForm] Loading provinces:', isLoadingProvinces)
  
  // Watch form values for cascading dropdowns
  const watchProvinceId = form.watch('provinceId')
  const watchRegencyId = form.watch('regencyId')
  const watchDistrictId = form.watch('districtId')
  const watchIsDemoAccount = form.watch('isDemoAccount')

  const { data: regencies, isLoading: isLoadingRegencies } = useRegenciesByProvince(
    watchProvinceId,
    !!watchProvinceId
  )
  
  const { data: districts, isLoading: isLoadingDistricts } = useDistrictsByRegency(
    watchRegencyId,
    !!watchRegencyId
  )
  
  const { data: villages, isLoading: isLoadingVillages } = useVillagesByDistrict(
    watchDistrictId,
    !!watchDistrictId
  )

  /**
   * Transform form data to API input format
   * Converts nullable fields from Zod schema to undefined for API compatibility
   */
  const transformFormData = (formData: FormData) => {
    // Helper to convert null to undefined
    const nullToUndefined = <T,>(value: T | null | undefined): T | undefined => 
      value === null ? undefined : value

    const result: CreateSppgInput = {
      code: formData.code,
      name: formData.name,
      description: nullToUndefined(formData.description),
      organizationType: formData.organizationType,
      establishedYear: nullToUndefined(formData.establishedYear),
      targetRecipients: formData.targetRecipients,
      addressDetail: formData.addressDetail,
      provinceId: formData.provinceId,
      regencyId: formData.regencyId,
      districtId: formData.districtId,
      villageId: formData.villageId,
      postalCode: nullToUndefined(formData.postalCode),
      coordinates: nullToUndefined(formData.coordinates),
      timezone: formData.timezone,
      phone: formData.phone,
      email: formData.email,
      picName: formData.picName,
      picPosition: formData.picPosition,
      picEmail: formData.picEmail,
      picPhone: formData.picPhone,
      picWhatsapp: nullToUndefined(formData.picWhatsapp),
      maxRadius: formData.maxRadius,
      maxTravelTime: formData.maxTravelTime,
      operationStartDate: formData.operationStartDate,
      operationEndDate: nullToUndefined(formData.operationEndDate),
      monthlyBudget: nullToUndefined(formData.monthlyBudget),
      yearlyBudget: nullToUndefined(formData.yearlyBudget),
      budgetCurrency: formData.budgetCurrency,
      budgetStartDate: nullToUndefined(formData.budgetStartDate),
      budgetEndDate: nullToUndefined(formData.budgetEndDate),
      isDemoAccount: formData.isDemoAccount,
      demoExpiresAt: nullToUndefined(formData.demoExpiresAt),
      demoMaxBeneficiaries: nullToUndefined(formData.demoMaxBeneficiaries),
      demoAllowedFeatures: formData.demoAllowedFeatures,
      status: formData.status,
    }
    return result
  }

  /**
   * Form submission handler
   * Handles both create and edit modes with proper API integration
   */
  const onSubmit = (formData: FormData) => {
    const data = transformFormData(formData)
    
    if (mode === 'create') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createSppg(data as any, {
        onSuccess: (response) => {
          toast.success('SPPG berhasil dibuat', {
            description: `${data.name} telah ditambahkan ke sistem`
          })
          router.push(`/admin/sppg/${response.id}`)
        },
        onError: (error: Error) => {
          toast.error('Gagal membuat SPPG', {
            description: error.message
          })
        }
      })
    } else {
      if (!sppgId) {
        toast.error('SPPG ID tidak ditemukan')
        return
      }
      
      updateSppg(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: sppgId, data: data as any },
        {
          onSuccess: () => {
            toast.success('SPPG berhasil diperbarui', {
              description: `Perubahan pada ${data.name} telah disimpan`
            })
            router.push(`/admin/sppg/${sppgId}`)
          },
          onError: (error: Error) => {
            toast.error('Gagal memperbarui SPPG', {
              description: error.message
            })
          }
        }
      )
    }
  }

  // Loading skeleton for edit mode while fetching data
  if (mode === 'edit' && dataLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informasi Dasar
            </CardTitle>
            <CardDescription>
              Informasi umum tentang SPPG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode SPPG *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="SPPG-JKT-001" 
                        {...field}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormDescription>
                      Kode unik (huruf besar, angka, strip)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organization Type */}
              <FormField
                control={form.control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Organisasi *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe organisasi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PEMERINTAH">Pemerintah</SelectItem>
                        <SelectItem value="SWASTA">Swasta</SelectItem>
                        <SelectItem value="YAYASAN">Yayasan</SelectItem>
                        <SelectItem value="KOMUNITAS">Komunitas</SelectItem>
                        <SelectItem value="LAINNYA">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama SPPG *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SPPG Jakarta Pusat" 
                      {...field}
                      aria-label="Nama SPPG"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormDescription>
                    Nama lengkap Satuan Pelayanan Pemenuhan Gizi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Deskripsi singkat tentang SPPG..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Opsional - informasi tambahan tentang SPPG
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Established Year */}
              <FormField
                control={form.control}
                name="establishedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Berdiri</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="2020"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? null : Number(val))
                        }}
                        aria-label="Tahun berdiri SPPG"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </FormControl>
                    <FormDescription>
                      Tahun didirikannya SPPG (1900 - {new Date().getFullYear()})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Recipients */}
              <FormField
                control={form.control}
                name="targetRecipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Penerima *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        aria-label="Target jumlah penerima"
                        aria-required="true"
                        min="1"
                      />
                    </FormControl>
                    <FormDescription>
                      Jumlah target penerima manfaat yang akan dilayani
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Informasi Kontak
            </CardTitle>
            <CardDescription>
              Kontak resmi SPPG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon *</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        defaultCountry="ID"
                        placeholder="Masukkan nomor telepon"
                        aria-label="Nomor telepon SPPG"
                        aria-required="true"
                      />
                    </FormControl>
                    <FormDescription>
                      Nomor telepon kantor/sekretariat SPPG (dengan kode negara)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="sppg@example.com"
                        {...field}
                        aria-label="Email SPPG"
                        aria-required="true"
                      />
                    </FormControl>
                    <FormDescription>
                      Alamat email resmi untuk korespondensi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: PIC (Person In Charge) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Penanggung Jawab
            </CardTitle>
            <CardDescription>
              Informasi kontak person in charge (PIC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PIC Name */}
              <FormField
                control={form.control}
                name="picName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama PIC *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Budi Santoso"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIC Position */}
              <FormField
                control={form.control}
                name="picPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan PIC *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Kepala SPPG"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PIC Email */}
              <FormField
                control={form.control}
                name="picEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email PIC *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="budi@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIC Phone */}
              <FormField
                control={form.control}
                name="picPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon PIC *</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        defaultCountry="ID"
                        placeholder="Masukkan nomor telepon"
                        aria-label="Nomor telepon PIC"
                        aria-required="true"
                      />
                    </FormControl>
                    <FormDescription>
                      Format: +62 812 3456 7890
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIC WhatsApp */}
              <FormField
                control={form.control}
                name="picWhatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp PIC</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={(value: string | undefined) => field.onChange(value || '')}
                        defaultCountry="ID"
                        placeholder="Masukkan nomor WhatsApp"
                      />
                    </FormControl>
                    <FormDescription>
                      Nomor WhatsApp untuk komunikasi cepat (opsional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Status
            </CardTitle>
            <CardDescription>
              Status operasional SPPG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status SPPG</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Status saat ini dari SPPG
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 5: Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Informasi Lokasi
            </CardTitle>
            <CardDescription>
              Alamat lengkap dan wilayah administratif SPPG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address Detail */}
            <FormField
              control={form.control}
              name="addressDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Jl. Merdeka No. 10, RT 01/RW 02"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Alamat detail termasuk nama jalan, nomor, RT/RW
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Province */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provinceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provinsi *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Reset dependent fields when province changes
                        form.setValue('regencyId', '')
                        form.setValue('districtId', '')
                        form.setValue('villageId', '')
                      }}
                      value={field.value}
                      disabled={isLoadingProvinces}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            isLoadingProvinces 
                              ? "Memuat provinsi..." 
                              : "Pilih provinsi"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces?.map((province) => (
                          <SelectItem key={province.value} value={province.value}>
                            {province.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Regency */}
              <FormField
                control={form.control}
                name="regencyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kabupaten/Kota *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Reset dependent fields when regency changes
                        form.setValue('districtId', '')
                        form.setValue('villageId', '')
                      }}
                      value={field.value}
                      disabled={!watchProvinceId || isLoadingRegencies}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !watchProvinceId
                              ? "Pilih provinsi dulu"
                              : isLoadingRegencies
                              ? "Memuat kabupaten/kota..."
                              : "Pilih kabupaten/kota"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regencies?.map((regency) => (
                          <SelectItem key={regency.value} value={regency.value}>
                            {regency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* District */}
              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Reset dependent fields when district changes
                        form.setValue('villageId', '')
                      }}
                      value={field.value}
                      disabled={!watchRegencyId || isLoadingDistricts}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !watchRegencyId
                              ? "Pilih kabupaten/kota dulu"
                              : isLoadingDistricts
                              ? "Memuat kecamatan..."
                              : "Pilih kecamatan"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts?.map((district) => (
                          <SelectItem key={district.value} value={district.value}>
                            {district.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Village */}
              <FormField
                control={form.control}
                name="villageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelurahan/Desa *</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchDistrictId || isLoadingVillages}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !watchDistrictId
                              ? "Pilih kecamatan dulu"
                              : isLoadingVillages
                              ? "Memuat kelurahan/desa..."
                              : "Pilih kelurahan/desa"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {villages?.map((village) => (
                          <SelectItem key={village.value} value={village.value}>
                            {village.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Postal Code */}
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="10110"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        aria-label="Kode pos"
                        maxLength={5}
                        pattern="[0-9]*"
                      />
                    </FormControl>
                    <FormDescription>
                      Kode pos lokasi SPPG (5 digit)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coordinates */}
              <FormField
                control={form.control}
                name="coordinates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Koordinat GPS (Opsional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="-6.2088,106.8456"
                        {...field}
                        value={field.value ?? ''}
                        aria-label="Koordinat GPS"
                      />
                    </FormControl>
                    <FormDescription>
                      Format: <strong>latitude,longitude</strong> (tanpa spasi). Contoh: -6.2088,106.8456 untuk Jakarta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timezone */}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona Waktu *</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih zona waktu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WIB">WIB (UTC+7)</SelectItem>
                        <SelectItem value="WITA">WITA (UTC+8)</SelectItem>
                        <SelectItem value="WIT">WIT (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 6: Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Operasional
            </CardTitle>
            <CardDescription>
              Informasi operasional dan jangkauan layanan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Operation Start Date */}
              <FormField
                control={form.control}
                name="operationStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Mulai Operasi *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", { locale: idLocale })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Operation End Date */}
              <FormField
                control={form.control}
                name="operationEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Akhir Operasi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", { locale: idLocale })
                            ) : (
                              <span>Pilih tanggal (opsional)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Opsional - kosongkan jika masih beroperasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Radius */}
              <FormField
                control={form.control}
                name="maxRadius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Radius Maksimal (km) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="50"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        aria-label="Radius maksimal dalam kilometer"
                        aria-required="true"
                        min="1"
                        max="500"
                      />
                    </FormControl>
                    <FormDescription>
                      Jangkauan maksimal layanan dalam kilometer (1-500 km)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Travel Time */}
              <FormField
                control={form.control}
                name="maxTravelTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Tempuh Maksimal (menit) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="120"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        aria-label="Waktu tempuh maksimal dalam menit"
                        aria-required="true"
                        min="1"
                        max="480"
                      />
                    </FormControl>
                    <FormDescription>
                      Waktu perjalanan maksimal dalam menit (1-480 menit/8 jam)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 7: Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Anggaran
            </CardTitle>
            <CardDescription>
              Informasi anggaran dan periode anggaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Monthly Budget */}
              <FormField
                control={form.control}
                name="monthlyBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran Bulanan</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="50000000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? null : Number(val))
                        }}
                        aria-label="Anggaran bulanan"
                        min="0"
                      />
                    </FormControl>
                    <FormDescription>
                      Anggaran operasional bulanan dalam Rupiah
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Yearly Budget */}
              <FormField
                control={form.control}
                name="yearlyBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran Tahunan</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="600000000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? null : Number(val))
                        }}
                        aria-label="Anggaran tahunan"
                        min="0"
                      />
                    </FormControl>
                    <FormDescription>
                      Total anggaran operasional tahunan dalam Rupiah
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget Currency */}
              <FormField
                control={form.control}
                name="budgetCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Uang</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata uang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                        <SelectItem value="USD">USD (Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Mata uang yang digunakan untuk anggaran
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget Start Date */}
              <FormField
                control={form.control}
                name="budgetStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Mulai Anggaran</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", { locale: idLocale })
                            ) : (
                              <span>Pilih tanggal (opsional)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Tanggal mulai periode anggaran (opsional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget End Date */}
              <FormField
                control={form.control}
                name="budgetEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Akhir Anggaran</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", { locale: idLocale })
                            ) : (
                              <span>Pilih tanggal (opsional)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Tanggal akhir periode anggaran (opsional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 8: Demo Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Pengaturan Demo
            </CardTitle>
            <CardDescription>
              Konfigurasi untuk akun demo/trial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Is Demo Account */}
            <FormField
              control={form.control}
              name="isDemoAccount"
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
                      Akun Demo
                    </FormLabel>
                    <FormDescription>
                      Centang jika ini adalah akun demo/trial dengan fitur terbatas
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Conditional fields - only show if isDemoAccount is true */}
            {watchIsDemoAccount && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Demo Expires At */}
                  <FormField
                    control={form.control}
                    name="demoExpiresAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Kadaluarsa Demo</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP", { locale: idLocale })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Tanggal berakhirnya masa demo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Demo Max Beneficiaries */}
                  <FormField
                    control={form.control}
                    name="demoMaxBeneficiaries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batas Penerima Demo</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="100"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              field.onChange(val === '' ? null : Number(val))
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Maksimal jumlah penerima untuk akun demo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Demo Allowed Features */}
                <FormField
                  control={form.control}
                  name="demoAllowedFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitur yang Diizinkan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan daftar fitur yang diizinkan, pisahkan dengan koma. Contoh: MENU_MANAGEMENT, PROCUREMENT, REPORTING"
                          className="resize-none"
                          rows={3}
                          value={field.value?.join(', ') || ''}
                          onChange={(e) => {
                            const features = e.target.value
                              .split(',')
                              .map(f => f.trim())
                              .filter(f => f.length > 0)
                            field.onChange(features)
                          }}
                          aria-label="Fitur yang diizinkan untuk demo"
                        />
                      </FormControl>
                      <FormDescription>
                        Daftar fitur yang dapat diakses oleh akun demo (pisahkan dengan koma). 
                        Contoh: MENU_MANAGEMENT, PROCUREMENT, REPORTING
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/sppg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting 
                ? (mode === 'create' ? 'Membuat...' : 'Menyimpan...') 
                : (mode === 'create' ? 'Buat SPPG' : 'Simpan Perubahan')
              }
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
