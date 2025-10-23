/**
 * @fileoverview School Form Component
 * @version Next.js 15.5.4 / shadcn/ui / React Hook Form
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Separator } from '@/components/ui/separator'
import { schoolMasterSchema, type SchoolMasterInput } from '@/features/sppg/school/schemas'
import { SCHOOL_TYPES } from '@/features/sppg/school/types'
// Import hooks
import { 
  usePrograms,
  useProvinces,
  useRegencies,
  useDistricts,
  useVillagesByDistrict
} from '../hooks'
import { School, Users, MapPin, Truck, Utensils, Calendar, FileText, TrendingUp } from 'lucide-react'

interface SchoolFormProps {
  defaultValues?: Partial<SchoolMasterInput>
  onSubmit: (data: SchoolMasterInput) => Promise<void>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

/**
 * School Form Component
 * 
 * Multi-section form for creating/editing school data
 * 
 * Sections:
 * 1. Basic Information
 * 2. Contact Details
 * 3. Location
 * 4. Student Information
 * 5. Feeding Schedule
 * 6. Delivery Information
 * 7. Facilities
 * 8. Special Requirements
 * 
 * @example
 * ```tsx
 * <SchoolForm
 *   defaultValues={schoolData}
 *   onSubmit={handleSubmit}
 *   isSubmitting={isLoading}
 *   mode="edit"
 * />
 * ```
 */
export function SchoolForm({ 
  defaultValues, 
  onSubmit, 
  isSubmitting = false,
  mode = 'create'
}: SchoolFormProps) {
  const [activeSection, setActiveSection] = useState('basic')

  // Fetch programs for dropdown
  const { data: programs = [], isLoading: isLoadingPrograms } = usePrograms()

  // Regional cascade data - provinces loaded immediately
  const { data: provinces = [], isLoading: isLoadingProvinces } = useProvinces()

  // Initialize form first
  const form = useForm<SchoolMasterInput>({
    // Type incompatibility between react-hook-form versions in node_modules
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schoolMasterSchema) as any,
    defaultValues: {
      programId: defaultValues?.programId || '',
      schoolName: defaultValues?.schoolName || '',
      schoolCode: defaultValues?.schoolCode || null,
      schoolType: defaultValues?.schoolType || 'SD',
      schoolStatus: defaultValues?.schoolStatus || 'NEGERI', // Fixed: Match SchoolStatus enum
      principalName: defaultValues?.principalName || '',
      contactPhone: defaultValues?.contactPhone || '',
      contactEmail: defaultValues?.contactEmail || null,
      schoolAddress: defaultValues?.schoolAddress || '',
      villageId: defaultValues?.villageId || '',
      provinceId: defaultValues?.provinceId || '',
      regencyId: defaultValues?.regencyId || '',
      districtId: defaultValues?.districtId || '',
      postalCode: defaultValues?.postalCode || null,
      coordinates: defaultValues?.coordinates || null,
      totalStudents: defaultValues?.totalStudents ?? 0,
      targetStudents: defaultValues?.targetStudents ?? 0,
      activeStudents: defaultValues?.activeStudents ?? 0,
      students4to6Years: defaultValues?.students4to6Years ?? 0,
      students7to12Years: defaultValues?.students7to12Years ?? 0,
      students13to15Years: defaultValues?.students13to15Years ?? 0,
      students16to18Years: defaultValues?.students16to18Years ?? 0,
      feedingDays: defaultValues?.feedingDays ?? [1, 2, 3, 4, 5],
      mealsPerDay: defaultValues?.mealsPerDay ?? 1,
      feedingTime: defaultValues?.feedingTime || null,
      deliveryAddress: defaultValues?.deliveryAddress || '',
      deliveryContact: defaultValues?.deliveryContact || '',
      deliveryInstructions: defaultValues?.deliveryInstructions || null,
      storageCapacity: defaultValues?.storageCapacity || null,
      servingMethod: defaultValues?.servingMethod || 'CAFETERIA',
      hasKitchen: defaultValues?.hasKitchen ?? false,
      hasStorage: defaultValues?.hasStorage ?? false,
      hasCleanWater: defaultValues?.hasCleanWater ?? true,
      hasElectricity: defaultValues?.hasElectricity ?? true,
      isActive: defaultValues?.isActive ?? true,
      suspendedAt: defaultValues?.suspendedAt || null,
      suspensionReason: defaultValues?.suspensionReason || null,
      beneficiaryType: defaultValues?.beneficiaryType || 'CHILD',
      specialDietary: defaultValues?.specialDietary ?? [],
      allergyAlerts: defaultValues?.allergyAlerts ?? [],
      culturalReqs: defaultValues?.culturalReqs ?? [],
    }
  })
  
  // Watch form values for conditional regional data loading
  const selectedProvinceId = form.watch('provinceId')
  const selectedRegencyId = form.watch('regencyId')
  const selectedDistrictId = form.watch('districtId')

  // Conditional regional data loading based on selected values
  const { data: regencies = [], isLoading: isLoadingRegencies } = useRegencies(selectedProvinceId, {
    enabled: !!selectedProvinceId
  })

  const { data: districts = [], isLoading: isLoadingDistricts } = useDistricts(selectedRegencyId, {
    enabled: !!selectedRegencyId
  })

  const { data: villages = [], isLoading: isLoadingVillages } = useVillagesByDistrict(selectedDistrictId, {
    enabled: !!selectedDistrictId
  })

  const sections = [
    { id: 'basic', title: 'Informasi Dasar', icon: School },
    { id: 'contact', title: 'Lokasi & Kontak', icon: MapPin },
    { id: 'students', title: 'Data Siswa', icon: Users },
    { id: 'schedule', title: 'Jadwal Makan', icon: Calendar },
    { id: 'delivery', title: 'Pengiriman', icon: Truck },
    { id: 'facilities', title: 'Fasilitas', icon: Utensils },
    { id: 'contract', title: 'Kontrak & Anggaran', icon: FileText },
    { id: 'performance', title: 'Metrik Kinerja', icon: TrendingUp },
  ]

  // Auto-calculate activeStudents from totalStudents
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only auto-fill if totalStudents changes and activeStudents is 0
      if (name === 'totalStudents' && value.totalStudents) {
        const currentActive = form.getValues('activeStudents')
        
        // Auto-fill activeStudents if it's 0 (not manually set)
        if (currentActive === 0 && value.totalStudents > 0) {
          form.setValue('activeStudents', value.totalStudents)
        }
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form])

  const handleSubmit = async (data: SchoolMasterInput) => {
    console.log('🔍 Form submitted with data:', data)
    console.log('📊 Age breakdown:', {
      total: data.totalStudents,
      age4to6: data.students4to6Years,
      age7to12: data.students7to12Years,
      age13to15: data.students13to15Years,
      age16to18: data.students16to18Years,
      sum: data.students4to6Years + data.students7to12Years + data.students13to15Years + data.students16to18Years
    })
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        console.log('❌ Form validation errors:', errors)
        console.log('📋 Current form values:', form.getValues())
      })} className="space-y-4 md:space-y-6">
        
        {/* Tabbed Navigation - 8 Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-1">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="text-xs md:text-sm">
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab 1: Basic Information */}
          <TabsContent value="basic" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Informasi Dasar
              </CardTitle>
              <CardDescription>
                Data dasar sekolah dan informasi identitas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Program Selection */}
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Gizi *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingPrograms}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={isLoadingPrograms ? "Memuat program..." : "Pilih program gizi"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs.map(program => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name} ({program.programCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Program gizi tempat sekolah ini terdaftar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Province Selection */}
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={isLoadingProvinces ? "Memuat provinsi..." : "Pilih provinsi"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {provinces.map(province => (
                            <SelectItem key={province.id} value={province.id}>
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pilih provinsi lokasi sekolah
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Regency Selection */}
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
                        disabled={!selectedProvinceId || isLoadingRegencies}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={
                              !selectedProvinceId 
                                ? "Pilih provinsi terlebih dahulu" 
                                : isLoadingRegencies 
                                ? "Memuat kabupaten/kota..." 
                                : "Pilih kabupaten/kota"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {regencies.map(regency => (
                            <SelectItem key={regency.id} value={regency.id}>
                              {regency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pilih kabupaten/kota lokasi sekolah
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* District Selection */}
                <FormField
                  control={form.control}
                  name="districtId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kecamatan *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Reset village when district changes
                          form.setValue('villageId', '')
                        }}
                        value={field.value}
                        disabled={!selectedRegencyId || isLoadingDistricts}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={
                              !selectedRegencyId 
                                ? "Pilih kabupaten/kota terlebih dahulu" 
                                : isLoadingDistricts 
                                ? "Memuat kecamatan..." 
                                : "Pilih kecamatan"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {districts.map(district => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pilih kecamatan lokasi sekolah
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Village Selection */}
                <FormField
                  control={form.control}
                  name="villageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desa/Kelurahan *</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedDistrictId || isLoadingVillages}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={
                              !selectedDistrictId 
                                ? "Pilih kecamatan terlebih dahulu" 
                                : isLoadingVillages 
                                ? "Memuat desa/kelurahan..." 
                                : "Pilih desa/kelurahan"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {villages.map(village => (
                            <SelectItem key={village.id} value={village.id}>
                              {village.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Lokasi administratif sekolah (desa/kelurahan)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Name */}
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nama Sekolah *</FormLabel>
                      <FormControl>
                        <Input placeholder="SD Negeri 1 Jakarta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Code */}
                <FormField
                  control={form.control}
                  name="schoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Sekolah</FormLabel>
                      <FormControl>
                        <Input placeholder="SDN001JKT" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Kode unik sekolah (NPSN atau kode internal)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Type */}
                <FormField
                  control={form.control}
                  name="schoolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Sekolah *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih jenis sekolah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SCHOOL_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NPSN - Nomor Pokok Sekolah Nasional */}
                <FormField
                  control={form.control}
                  name="npsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPSN</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345678" 
                          {...field} 
                          value={field.value || ''} 
                          maxLength={8}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor Pokok Sekolah Nasional (8 digit)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dapodik ID */}
                <FormField
                  control={form.control}
                  name="dapodikId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Dapodik</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="A1B2C3D4-E5F6-7890" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        ID dari sistem Dapodik Kemendikbud
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Kemendikbud ID */}
                <FormField
                  control={form.control}
                  name="kemendikbudId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Kemendikbud</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="KMD-12345678" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        ID integrasi dengan sistem Kemendikbud
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Accreditation Grade */}
                <FormField
                  control={form.control}
                  name="accreditationGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai Akreditasi</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih nilai akreditasi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A">A - Sangat Baik</SelectItem>
                          <SelectItem value="B">B - Baik</SelectItem>
                          <SelectItem value="C">C - Cukup</SelectItem>
                          <SelectItem value="D">D - Kurang</SelectItem>
                          <SelectItem value="BELUM_TERAKREDITASI">Belum Terakreditasi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Nilai akreditasi dari BAN-S/M
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Accreditation Year */}
                <FormField
                  control={form.control}
                  name="accreditationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Akreditasi</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="2024" 
                          {...field} 
                          value={field.value || ''} 
                          min={2000}
                          max={new Date().getFullYear()}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Tahun terakhir akreditasi diberikan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Urban/Rural Classification */}
                <FormField
                  control={form.control}
                  name="urbanRural"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Klasifikasi Lokasi</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih klasifikasi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="URBAN">Perkotaan (Urban)</SelectItem>
                          <SelectItem value="RURAL">Pedesaan (Rural)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Klasifikasi lokasi sekolah
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Lifecycle Dates */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Tanggal Penting</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Enrollment Date */}
                  <FormField
                    control={form.control}
                    name="enrollmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Pendaftaran</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Tanggal sekolah terdaftar di program
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reactivation Date */}
                  <FormField
                    control={form.control}
                    name="reactivationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Reaktivasi</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Tanggal reaktivasi jika pernah ditangguhkan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Documentation & Notes */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Catatan & Dokumentasi</h4>
                
                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Internal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Catatan tambahan tentang sekolah..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Catatan internal untuk tim (tidak terlihat oleh sekolah)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Special Instructions */}
                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruksi Khusus</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instruksi khusus untuk operasional..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Instruksi khusus yang perlu diperhatikan tim
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Documents (JSON field for file metadata) */}
                <FormField
                  control={form.control}
                  name="documents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dokumen Pendukung</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"files": [{"name": "surat_kontrak.pdf", "url": "https://..."}]}'
                          className="min-h-[80px] font-mono text-xs"
                          {...field}
                          value={field.value ? JSON.stringify(field.value, null, 2) : ''}
                          onChange={(e) => {
                            try {
                              const parsed = e.target.value ? JSON.parse(e.target.value) : null
                              field.onChange(parsed)
                            } catch {
                              // Keep as string if invalid JSON, will be validated by schema
                              field.onChange(e.target.value || null)
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON metadata untuk file uploads (opsional, untuk advanced use)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Integration Fields */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Integrasi Sistem</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* External System ID */}
                  <FormField
                    control={form.control}
                    name="externalSystemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Sistem Eksternal</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="EXT-12345"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          ID untuk integrasi dengan sistem eksternal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Sync Date */}
                  <FormField
                    control={form.control}
                    name="syncedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terakhir Sinkronisasi</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            disabled
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>
                          Waktu terakhir data disinkronkan (otomatis)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Tab 2: Location */}
          <TabsContent value="location" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Lokasi & Kontak
              </CardTitle>
              <CardDescription>
                Informasi lokasi dan cara menghubungi sekolah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Principal Name */}
                <FormField
                  control={form.control}
                  name="principalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kepala Sekolah *</FormLabel>
                      <FormControl>
                        <Input placeholder="Budi Santoso, S.Pd" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="schoolStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Sekolah *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Aktif</SelectItem>
                          <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                          <SelectItem value="CLOSED">Ditutup</SelectItem>
                          <SelectItem value="PLANNING">Perencanaan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Tab 2: Location & Contact */}
          <TabsContent value="contact" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Lokasi & Kontak
              </CardTitle>
              <CardDescription>
                Informasi lokasi dan cara menghubungi sekolah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Phone */}
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon *</FormLabel>
                      <FormControl>
                        <Input placeholder="021-12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Email */}
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="sekolah@example.com" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Principal NIP */}
                <FormField
                  control={form.control}
                  name="principalNip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP Kepala Sekolah</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="19850515 201403 1 002" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor Induk Pegawai Kepala Sekolah
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alternate Phone */}
                <FormField
                  control={form.control}
                  name="alternatePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon Alternatif</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0812-3456-7890" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor kontak cadangan (opsional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WhatsApp Number */}
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0812-3456-7890" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor WhatsApp untuk komunikasi cepat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="schoolAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Alamat Lengkap *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Postal Code */}
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Pos</FormLabel>
                      <FormControl>
                        <Input placeholder="10110" {...field} value={field.value || ''} />
                      </FormControl>
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
                      <FormLabel>Koordinat GPS</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="-6.2088, 106.8456" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Format: latitude, longitude
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Tab 3: Student Information */}
          <TabsContent value="students" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Data Siswa
              </CardTitle>
              <CardDescription>
                Informasi jumlah dan distribusi siswa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Students */}
                <FormField
                  control={form.control}
                  name="totalStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Siswa *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Students */}
                <FormField
                  control={form.control}
                  name="targetStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Penerima *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="250"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Target siswa untuk perencanaan ke depan (boleh lebih besar dari total siswa saat ini)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Active Students */}
                <FormField
                  control={form.control}
                  name="activeStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Siswa Aktif *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="480"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Gender Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Distribusi Siswa Berdasarkan Jenis Kelamin</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Male Students */}
                  <FormField
                    control={form.control}
                    name="maleStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Siswa Laki-laki</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="250"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Jumlah siswa laki-laki aktif
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Female Students */}
                  <FormField
                    control={form.control}
                    name="femaleStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Siswa Perempuan</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="230"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Jumlah siswa perempuan aktif
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Distribusi Usia Siswa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Students 4-6 years */}
                  <FormField
                    control={form.control}
                    name="students4to6Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 4-6 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Students 7-12 years */}
                  <FormField
                    control={form.control}
                    name="students7to12Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 7-12 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="250"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Students 13-15 years */}
                  <FormField
                    control={form.control}
                    name="students13to15Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 13-15 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Students 16-18 years */}
                  <FormField
                    control={form.control}
                    name="students16to18Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 16-18 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
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
            </CardContent>
          </Card>
          </TabsContent>

          {/* Tab 4: Feeding Schedule */}
          <TabsContent value="schedule" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Pemberian Makanan
              </CardTitle>
              <CardDescription>
                Informasi jadwal dan waktu pemberian makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Feeding Days */}
                <FormField
                  control={form.control}
                  name="feedingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hari Pemberian Makanan *</FormLabel>
                      <FormDescription>
                        Pilih hari-hari pemberian makanan (1=Senin, 7=Minggu)
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="1,2,3,4,5"
                          value={field.value?.join(',') || ''}
                          onChange={(e) => {
                            const days = e.target.value
                              .split(',')
                              .map(d => Number(d.trim()))
                              .filter(d => !isNaN(d) && d >= 1 && d <= 7)
                            field.onChange(days)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Meals Per Day */}
                  <FormField
                    control={form.control}
                    name="mealsPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Makan per Hari *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih jumlah" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1x sehari</SelectItem>
                            <SelectItem value="2">2x sehari</SelectItem>
                            <SelectItem value="3">3x sehari</SelectItem>
                            <SelectItem value="4">4x sehari</SelectItem>
                            <SelectItem value="5">5x sehari</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Feeding Time */}
                  <FormField
                    control={form.control}
                    name="feedingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waktu Pemberian</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Waktu pemberian makanan (opsional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Specific Feeding Times */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Jadwal Waktu Makan Spesifik</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Breakfast Time */}
                    <FormField
                      control={form.control}
                      name="breakfastTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Sarapan</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ''}
                              placeholder="07:00"
                            />
                          </FormControl>
                          <FormDescription>
                            Jam sarapan pagi (opsional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Lunch Time */}
                    <FormField
                      control={form.control}
                      name="lunchTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Makan Siang</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ''}
                              placeholder="12:00"
                            />
                          </FormControl>
                          <FormDescription>
                            Jam makan siang (opsional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Snack Time */}
                    <FormField
                      control={form.control}
                      name="snackTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Snack</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ''}
                              placeholder="15:00"
                            />
                          </FormControl>
                          <FormDescription>
                            Jam makanan tambahan (opsional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Dietary Requirements */}
                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="religiousReqs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kebutuhan Keagamaan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contoh: Halal, vegetarian, tidak mengandung babi, dll..."
                            className="min-h-[80px]"
                            {...field}
                            value={field.value?.join(', ') || ''}
                            onChange={(e) => {
                              const values = e.target.value
                                .split(',')
                                .map(v => v.trim())
                                .filter(v => v.length > 0)
                              field.onChange(values.length > 0 ? values : null)
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Pisahkan dengan koma untuk multiple requirements (contoh: Halal, No Pork)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Tab 5: Delivery Information */}
          <TabsContent value="delivery" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Informasi Pengiriman
              </CardTitle>
              <CardDescription>
                Detail alamat dan kontak untuk pengiriman makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Delivery Address */}
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Pengiriman *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jl. Contoh No. 123, Kelurahan ABC..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Alamat lengkap untuk pengiriman makanan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Contact */}
                <FormField
                  control={form.control}
                  name="deliveryContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontak Pengiriman *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="081234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor yang dapat dihubungi saat pengiriman
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Instructions */}
                <FormField
                  control={form.control}
                  name="deliveryInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruksi Pengiriman</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Masuk dari pintu samping, parkir di area loading dock..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Petunjuk khusus untuk kurir (opsional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Extensions */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Informasi Pengiriman Tambahan</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery Phone */}
                    <FormField
                      control={form.control}
                      name="deliveryPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon Pengiriman</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="0812-3456-7890"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Nomor khusus untuk koordinasi pengiriman
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Preferred Delivery Time */}
                    <FormField
                      control={form.control}
                      name="preferredDeliveryTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Pengiriman Disukai</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ''}
                              placeholder="08:00"
                            />
                          </FormControl>
                          <FormDescription>
                            Waktu ideal untuk menerima pengiriman
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Distance from SPPG */}
                    <FormField
                      control={form.control}
                      name="distanceFromSppg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jarak dari SPPG</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="15"
                                step="0.1"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">km</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Jarak dalam kilometer (opsional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Estimated Travel Time */}
                    <FormField
                      control={form.control}
                      name="estimatedTravelTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimasi Waktu Tempuh</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="30"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">menit</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Waktu perjalanan dalam menit
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Access Road Condition */}
                    <FormField
                      control={form.control}
                      name="accessRoadCondition"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Kondisi Jalan Akses</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kondisi jalan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BAIK">Baik - Jalan aspal mulus</SelectItem>
                              <SelectItem value="SEDANG">Sedang - Jalan aspal rusak/berbatu</SelectItem>
                              <SelectItem value="BURUK">Buruk - Jalan tanah/sulit dilalui</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Kondisi jalan menuju sekolah untuk perencanaan pengiriman
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Tab 6: Facilities */}
          <TabsContent value="facilities" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Fasilitas Sekolah
              </CardTitle>
              <CardDescription>
                Informasi fasilitas pendukung pemberian makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Storage Capacity */}
                  <FormField
                    control={form.control}
                    name="storageCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapasitas Penyimpanan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: 500 porsi, 100kg, dll"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Kapasitas penyimpanan makanan (opsional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Serving Method */}
                  <FormField
                    control={form.control}
                    name="servingMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metode Penyajian *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih metode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CAFETERIA">Kafetaria</SelectItem>
                            <SelectItem value="CLASSROOM">Di Kelas</SelectItem>
                            <SelectItem value="TAKEAWAY">Bawa Pulang</SelectItem>
                            <SelectItem value="OTHER">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Facilities Checkboxes */}
                <div className="space-y-4">
                  <div className="text-sm font-medium">Fasilitas Tersedia</div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Has Kitchen */}
                    <FormField
                      control={form.control}
                      name="hasKitchen"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Dapur</FormLabel>
                            <FormDescription>
                              Memiliki fasilitas dapur
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Storage */}
                    <FormField
                      control={form.control}
                      name="hasStorage"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Penyimpanan</FormLabel>
                            <FormDescription>
                              Memiliki ruang penyimpanan
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Clean Water */}
                    <FormField
                      control={form.control}
                      name="hasCleanWater"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Air Bersih</FormLabel>
                            <FormDescription>
                              Akses air bersih memadai
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Electricity */}
                    <FormField
                      control={form.control}
                      name="hasElectricity"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Listrik</FormLabel>
                            <FormDescription>
                              Akses listrik memadai
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Refrigerator */}
                    <FormField
                      control={form.control}
                      name="hasRefrigerator"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Kulkas/Pendingin</FormLabel>
                            <FormDescription>
                              Memiliki lemari es untuk penyimpanan
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Dining Area */}
                    <FormField
                      control={form.control}
                      name="hasDiningArea"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Ruang Makan</FormLabel>
                            <FormDescription>
                              Memiliki ruang makan khusus
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Handwashing */}
                    <FormField
                      control={form.control}
                      name="hasHandwashing"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Tempat Cuci Tangan</FormLabel>
                            <FormDescription>
                              Fasilitas cuci tangan yang memadai
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Dining Capacity */}
                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="diningCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapasitas Ruang Makan</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Jumlah siswa yang dapat makan bersamaan (opsional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
          
          {/* Tab 7: Budget & Contracts */}
          <TabsContent value="contract" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Kontrak & Anggaran
              </CardTitle>
              <CardDescription>
                Informasi kontrak dan alokasi anggaran sekolah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contract Number */}
                  <FormField
                    control={form.control}
                    name="contractNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Kontrak</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="KTR/2024/001"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Nomor kontrak kerjasama (opsional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contract Value */}
                  <FormField
                    control={form.control}
                    name="contractValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nilai Kontrak</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Rp</span>
                            <Input
                              type="number"
                              placeholder="50000000"
                              step="1000"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              className="flex-1"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Total nilai kontrak dalam Rupiah
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contract Start Date */}
                  <FormField
                    control={form.control}
                    name="contractStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Mulai Kontrak</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Tanggal mulai berlaku kontrak
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contract End Date */}
                  <FormField
                    control={form.control}
                    name="contractEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Berakhir Kontrak</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Tanggal berakhir kontrak
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Budget Allocation */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Alokasi Anggaran</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Monthly Budget Allocation */}
                    <FormField
                      control={form.control}
                      name="monthlyBudgetAllocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anggaran Bulanan</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Rp</span>
                              <Input
                                type="number"
                                placeholder="5000000"
                                step="1000"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Alokasi anggaran per bulan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Budget Per Student */}
                    <FormField
                      control={form.control}
                      name="budgetPerStudent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anggaran per Siswa</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Rp</span>
                              <Input
                                type="number"
                                placeholder="10000"
                                step="100"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Anggaran per siswa per hari/bulan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Tab 8: Performance Metrics */}
          <TabsContent value="performance" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Metrik Kinerja
              </CardTitle>
              <CardDescription>
                Data kinerja dan statistik operasional sekolah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Rates */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Tingkat Partisipasi</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Attendance Rate */}
                    <FormField
                      control={form.control}
                      name="attendanceRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tingkat Kehadiran</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="95"
                                step="0.1"
                                min="0"
                                max="100"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Persentase kehadiran siswa
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Participation Rate */}
                    <FormField
                      control={form.control}
                      name="participationRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tingkat Partisipasi</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="90"
                                step="0.1"
                                min="0"
                                max="100"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Persentase siswa yang makan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Satisfaction Score */}
                    <FormField
                      control={form.control}
                      name="satisfactionScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skor Kepuasan</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="8.5"
                                step="0.1"
                                min="0"
                                max="10"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">/10</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Skor kepuasan (0-10)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Activity Dates */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Aktivitas Terakhir</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Last Distribution Date */}
                    <FormField
                      control={form.control}
                      name="lastDistributionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Distribusi Terakhir</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>
                            Tanggal terakhir menerima distribusi
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Last Report Date */}
                    <FormField
                      control={form.control}
                      name="lastReportDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Laporan Terakhir</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>
                            Tanggal laporan terakhir dikirim
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Statistics (Read-Only) */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Statistik (Read-Only)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Total Distributions */}
                    <FormField
                      control={form.control}
                      name="totalDistributions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Distribusi</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              value={field.value || 0}
                              disabled
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormDescription>
                            Jumlah total distribusi yang diterima (otomatis)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Total Meals Served */}
                    <FormField
                      control={form.control}
                      name="totalMealsServed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Makanan Disajikan</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              value={field.value?.toString() || '0'}
                              disabled
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormDescription>
                            Total porsi yang telah disajikan (otomatis)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

        </Tabs>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                * Field wajib diisi
              </div>
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
                  {isSubmitting ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Sekolah'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
