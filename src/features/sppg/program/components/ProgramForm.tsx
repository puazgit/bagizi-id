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
  MapPin
} from 'lucide-react'
import { createProgramSchema, type CreateProgramInput } from '../schemas'
import type { Program } from '../types'

interface ProgramFormProps {
  initialData?: Program
  onSubmit: (data: CreateProgramInput) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

type ProgramFormData = Omit<CreateProgramInput, 'startDate' | 'endDate'> & {
  startDate?: Date
  endDate?: Date | null
}

export const ProgramForm: FC<ProgramFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}) => {
  const form = useForm<ProgramFormData>({
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description ?? '',
      programType: initialData.programType,
      targetGroup: initialData.targetGroup,
      targetRecipients: initialData.targetRecipients,
      calorieTarget: initialData.calorieTarget ?? undefined,
      proteinTarget: initialData.proteinTarget ?? undefined,
      carbTarget: initialData.carbTarget ?? undefined,
      fatTarget: initialData.fatTarget ?? undefined,
      fiberTarget: initialData.fiberTarget ?? undefined,
      startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData.endDate ? new Date(initialData.endDate) : null,
      feedingDays: initialData.feedingDays.length > 0 ? initialData.feedingDays : [1, 2, 3, 4, 5],
      mealsPerDay: initialData.mealsPerDay,
      totalBudget: initialData.totalBudget ?? undefined,
      budgetPerMeal: initialData.budgetPerMeal ?? undefined,
      implementationArea: initialData.implementationArea,
      partnerSchools: initialData.partnerSchools,
    } : {
      name: '',
      description: '',
      targetRecipients: 100,
      feedingDays: [1, 2, 3, 4, 5], // Weekdays by default
      mealsPerDay: 1,
      implementationArea: '',
      partnerSchools: [],
    },
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="programType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Program *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SUPPLEMENTARY_FEEDING">
                          Pemberian Makanan Tambahan
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Target jumlah penerima manfaat program (1 - 100,000 orang)
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
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
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
                          selected={field.value || undefined}
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
                              'pl-3 text-left font-normal',
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
                          selected={field.value || undefined}
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
                    <FormLabel>Frekuensi Makan per Hari</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
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
