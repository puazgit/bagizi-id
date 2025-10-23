/**
 * @fileoverview ProgramForm Component - Create/Edit Program Form
 * @version Next.js 15.5.4 / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { 
  CalendarIcon, 
  Info,
  Users,
  Target,
  DollarSign,
  MapPin,
  School,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProgramSchema, type CreateProgramInput } from '../schemas'
import type { Program } from '../types'
import { useSchools } from '../hooks/useSchools'
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox'
import { ProgramStatus, ProgramType, TargetGroup } from '@prisma/client'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface ProgramFormProps {
  initialData?: Program
  onSubmit: (data: CreateProgramInput) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export const ProgramForm: FC<ProgramFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}) => {
  // Fetch schools for autocomplete
  const { data: schools, isLoading: isLoadingSchools } = useSchools()
  
  const form = useForm({
    resolver: zodResolver(createProgramSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description ?? '',
      programCode: initialData.programCode,
      programType: initialData.programType,
      targetGroup: initialData.targetGroup,
      targetRecipients: initialData.targetRecipients,
      currentRecipients: initialData.currentRecipients ?? 0,
      calorieTarget: initialData.calorieTarget ?? undefined,
      proteinTarget: initialData.proteinTarget ?? undefined,
      fatTarget: initialData.fatTarget ?? undefined,
      carbTarget: initialData.carbTarget ?? undefined,
      fiberTarget: initialData.fiberTarget ?? undefined,
      mealsPerDay: initialData.mealsPerDay,
      feedingDays: initialData.feedingDays ?? [],
      startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
      totalBudget: initialData.totalBudget ?? undefined,
      budgetPerMeal: initialData.budgetPerMeal ?? undefined,
      status: initialData.status as ProgramStatus,
      implementationArea: initialData.implementationArea ?? '',
      partnerSchools: initialData.partnerSchools ?? [],
    } : {
      name: '',
      description: '',
      programCode: '',
      programType: 'FREE_NUTRITIOUS_MEAL' as ProgramType,
      targetGroup: 'CHILDREN_UNDER_5' as TargetGroup,
      targetRecipients: 1,
      currentRecipients: 0,
      mealsPerDay: 1,
      feedingDays: [],
      budgetPerMeal: 0,
      status: ProgramStatus.DRAFT,
      implementationArea: '',
      partnerSchools: [],
    }
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    // Validate with Zod schema before submitting
    const validated = createProgramSchema.safeParse(data)
    if (!validated.success) {
      console.error('Validation error:', validated.error)
      return
    }
    await onSubmit(validated.data)
  })

  // Watch for form changes (used in Generate button)
  const watchName = form.watch('name')
  const watchType = form.watch('programType')
  const watchPartnerSchools = form.watch('partnerSchools')

  // Auto-calculate currentRecipients based on selected schools
  useEffect(() => {
    if (!schools || !watchPartnerSchools || watchPartnerSchools.length === 0) {
      form.setValue('currentRecipients', 0, { shouldValidate: false })
      return
    }

    // Calculate total students from selected schools
    const totalStudents = schools
      .filter(school => watchPartnerSchools.includes(school.schoolName))
      .reduce((sum, school) => sum + (school.totalStudents || 0), 0)

    form.setValue('currentRecipients', totalStudents, { shouldValidate: false })
  }, [watchPartnerSchools, schools, form])

  // Days of week for feeding schedule
  const daysOfWeek = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
    { value: 7, label: 'Minggu' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Program *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Program Gizi Balita 2025" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nama yang jelas dan deskriptif untuk program
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Program *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="PWK-MBG-2025" 
                          {...field}
                          className="font-mono"
                        />
                        {mode === 'create' && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const name = watchName || ''
                              const type = watchType || 'FREE_NUTRITIOUS_MEAL'
                              
                              if (!name.trim()) {
                                toast.error('Isi nama program terlebih dahulu')
                                return
                              }
                              
                              // Generate code from name and type
                              const typeCodeMap: Record<ProgramType, string> = {
                                'FREE_NUTRITIOUS_MEAL': 'MBG',
                                'NUTRITIONAL_RECOVERY': 'PG',
                                'NUTRITIONAL_EDUCATION': 'EG',
                                'EMERGENCY_NUTRITION': 'GD',
                                'STUNTING_INTERVENTION': 'IS'
                              }
                              
                              // Extract location from program name (first word)
                              const words = name.trim().split(/\s+/)
                              const location = words[0]?.substring(0, 3).toUpperCase() || 'PWK'
                              
                              // Get type code
                              const typeCode = typeCodeMap[type] || 'MBG'
                              
                              // Get current year
                              const year = new Date().getFullYear()
                              
                              // Generate: LOCATION-TYPE-YEAR
                              const newCode = `${location}-${typeCode}-${year}`
                              
                              form.setValue('programCode', newCode)
                              toast.success('Kode program berhasil dibuat')
                            }}
                            className="shrink-0"
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {mode === 'create' 
                        ? 'Klik "Generate" untuk membuat kode otomatis dari nama & jenis program'
                        : 'Kode unik untuk identifikasi program'
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Jelaskan tujuan dan detail program..."
                      rows={4}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="programType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Program *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih jenis program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FREE_NUTRITIOUS_MEAL">
                          Makan Bergizi Gratis
                        </SelectItem>
                        <SelectItem value="NUTRITIONAL_RECOVERY">
                          Pemulihan Gizi
                        </SelectItem>
                        <SelectItem value="NUTRITIONAL_EDUCATION">
                          Edukasi Gizi
                        </SelectItem>
                        <SelectItem value="EMERGENCY_NUTRITION">
                          Gizi Darurat
                        </SelectItem>
                        <SelectItem value="STUNTING_INTERVENTION">
                          Intervensi Stunting
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Kelompok *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih target kelompok" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TODDLER">
                          Balita
                        </SelectItem>
                        <SelectItem value="SCHOOL_CHILDREN">
                          Anak Sekolah
                        </SelectItem>
                        <SelectItem value="TEENAGE_GIRL">
                          Remaja Putri
                        </SelectItem>
                        <SelectItem value="PREGNANT_WOMAN">
                          Ibu Hamil
                        </SelectItem>
                        <SelectItem value="BREASTFEEDING_MOTHER">
                          Ibu Menyusui
                        </SelectItem>
                        <SelectItem value="ELDERLY">
                          Lansia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Program</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ProgramStatus.DRAFT}>
                          Draft
                        </SelectItem>
                        <SelectItem value={ProgramStatus.ACTIVE}>
                          Aktif
                        </SelectItem>
                        <SelectItem value={ProgramStatus.PAUSED}>
                          Ditunda
                        </SelectItem>
                        <SelectItem value={ProgramStatus.COMPLETED}>
                          Selesai
                        </SelectItem>
                        <SelectItem value={ProgramStatus.CANCELLED}>
                          Dibatalkan
                        </SelectItem>
                        <SelectItem value={ProgramStatus.ARCHIVED}>
                          Arsip
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target & Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Target Penerima
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="targetRecipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Target Penerima *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="500"
                      min={1}
                      max={100000}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        // Convert to number, default to 1 if empty
                        const numValue = value === '' || value === '0' ? 1 : Number(value)
                        field.onChange(numValue)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Target jumlah penerima manfaat program (minimal 1 orang)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Recipients (Auto-calculated) */}
            <FormField
              control={form.control}
              name="currentRecipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Jumlah Penerima Saat Ini (Otomatis)
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        {...field}
                        value={field.value || 0}
                        readOnly
                        disabled
                        className="bg-muted/50 cursor-not-allowed"
                      />
                      {(field.value ?? 0) > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          {watchPartnerSchools?.length || 0} sekolah
                        </Badge>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="flex items-center gap-2">
                    Jumlah ini dihitung otomatis dari total siswa di sekolah mitra yang dipilih
                    {(field.value ?? 0) > 0 && (
                      <span className="text-primary font-medium">
                        ({(((field.value ?? 0) / form.watch('targetRecipients')) * 100).toFixed(1)}% dari target)
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="implementationArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Area Implementasi
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Kecamatan Menteng, Jakarta Pusat" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partnerSchools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    Sekolah Mitra
                  </FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      options={
                        schools?.map((school) => ({
                          label: school.schoolCode 
                            ? `${school.schoolName} (${school.schoolCode})`
                            : school.schoolName,
                          value: school.schoolName,
                        })) || []
                      }
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Pilih sekolah mitra..."
                      searchPlaceholder="Cari nama sekolah..."
                      emptyMessage={
                        isLoadingSchools 
                          ? "Memuat data sekolah..." 
                          : "Tidak ada sekolah ditemukan"
                      }
                      disabled={isLoadingSchools || isSubmitting}
                      allowCustom={true}
                    />
                  </FormControl>
                  <FormDescription>
                    Pilih sekolah yang sudah terdaftar atau tambahkan manual sekolah baru
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Nutrition Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Target Gizi Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="calorieTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kalori (kkal)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proteinTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carbTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Karbohidrat (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="75"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lemak (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fiberTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serat (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Jadwal & Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Mulai *</FormLabel>
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
                              format(field.value as Date, 'PPP', { locale: localeId })
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
                          selected={(field.value as Date) || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Selesai</FormLabel>
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
                              format(field.value as Date, 'PPP', { locale: localeId })
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
                          selected={(field.value as Date) || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mealsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frekuensi Makan per Hari *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih frekuensi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1x sehari</SelectItem>
                        <SelectItem value="2">2x sehari</SelectItem>
                        <SelectItem value="3">3x sehari</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hari Pemberian Makan</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {daysOfWeek.map((day) => {
                        const isSelected = field.value?.includes(day.value)
                        return (
                          <Badge
                            key={day.value}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = field.value || []
                              if (isSelected) {
                                field.onChange(current.filter((d) => d !== day.value))
                              } else {
                                field.onChange([...current, day.value].sort())
                              }
                            }}
                          >
                            {day.label}
                          </Badge>
                        )
                      })}
                    </div>
                    <FormDescription>
                      Klik untuk memilih/membatalkan hari
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Anggaran (Rp)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total anggaran untuk seluruh program
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetPerMeal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran per Makan (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Anggaran per porsi makan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Buat Program' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
