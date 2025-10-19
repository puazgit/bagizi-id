/**
 * @fileoverview DistributionSchedule Form Component
 * @version Next.js 15.5.4 / React Hook Form + Zod / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import { useCreateSchedule, useUpdateSchedule, useSchedule } from '../hooks'
import { createScheduleSchema, type CreateScheduleInput } from '../schemas'
import { cn } from '@/lib/utils'

interface ScheduleFormProps {
  scheduleId?: string
  onSuccess?: (id: string) => void
  onCancel?: () => void
}

/**
 * ScheduleForm Component
 * Comprehensive form for creating/editing distribution schedules
 */
export function ScheduleForm({ scheduleId, onSuccess, onCancel }: ScheduleFormProps) {
  const isEditMode = Boolean(scheduleId)

  // Fetch existing schedule data if editing
  const { data: scheduleResponse, isLoading: isLoadingSchedule } = useSchedule(scheduleId || '')
  const existingSchedule = scheduleResponse?.data

  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule()
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule()

  const isPending = isCreating || isUpdating

  // Initialize form - use any to bypass complex Zod date coercion type issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createScheduleSchema) as any,
    defaultValues: {
      productionId: '', // ✅ REQUIRED: Link to completed production
      distributionDate: new Date(),
      wave: 'MORNING',
      targetCategories: [],
      estimatedBeneficiaries: 0,
      // ✅ Removed: menuName, menuDescription, portionSize, totalPortions
      // These come from selected production.menu!
      packagingType: 'BOX',
      packagingCost: 0,
      deliveryMethod: 'SCHOOL_DELIVERY',
      distributionTeam: [],
      estimatedTravelTime: 0,
      fuelCost: 0,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (existingSchedule && isEditMode) {
      form.reset({
        productionId: existingSchedule.productionId, // ✅ Production link
        distributionDate: new Date(existingSchedule.distributionDate),
        wave: existingSchedule.wave,
        targetCategories: existingSchedule.targetCategories,
        estimatedBeneficiaries: existingSchedule.estimatedBeneficiaries,
        // ✅ Removed: menuName, menuDescription, portionSize, totalPortions
        // These come from production.menu now!
        packagingType: existingSchedule.packagingType,
        packagingCost: existingSchedule.packagingCost || 0,
        deliveryMethod: existingSchedule.deliveryMethod,
        distributionTeam: existingSchedule.distributionTeam,
        estimatedTravelTime: existingSchedule.estimatedTravelTime || 0,
        fuelCost: existingSchedule.fuelCost || 0,
      })
    }
  }, [existingSchedule, isEditMode, form])

  /**
   * Handle form submission
   */
  const onSubmit = (data: CreateScheduleInput) => {
    if (isEditMode && scheduleId) {
      updateSchedule(
        { id: scheduleId, data },
        {
          onSuccess: () => {
            onSuccess?.(scheduleId)
          },
        }
      )
    } else {
      createSchedule(data, {
        onSuccess: (response) => {
          if (response.data?.id) {
            onSuccess?.(response.data.id)
          }
        },
      })
    }
  }

  /**
   * Loading state
   */
  if (isEditMode && isLoadingSchedule) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Memuat data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <span className="text-sm font-medium">Informasi Dasar</span>
          </div>
          <div className="h-px flex-1 bg-border mx-4" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
              2
            </div>
            <span className="text-sm font-medium text-muted-foreground">Menu</span>
          </div>
          <div className="h-px flex-1 bg-border mx-4" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
              3
            </div>
            <span className="text-sm font-medium text-muted-foreground">Logistik</span>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                Informasi Dasar
              </CardTitle>
              <Badge variant="destructive" className="text-xs">
                Wajib Diisi
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Distribution Date */}
            <FormField
              control={form.control}
              name="distributionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Distribusi</FormLabel>
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
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Tanggal pelaksanaan distribusi makanan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wave */}
            <FormField
              control={form.control}
              name="wave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gelombang</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih gelombang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MORNING">Pagi (06:00 - 10:00)</SelectItem>
                      <SelectItem value="AFTERNOON">Siang (10:00 - 14:00)</SelectItem>
                      <SelectItem value="EVENING">Sore (14:00 - 18:00)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Waktu distribusi dalam sehari
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Method */}
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Pengiriman</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SCHOOL_DELIVERY">Antar ke Sekolah</SelectItem>
                      <SelectItem value="PICKUP">Diambil di Lokasi</SelectItem>
                      <SelectItem value="POSYANDU">Distribusi Posyandu</SelectItem>
                      <SelectItem value="PKK">Distribusi PKK</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Menu Information */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                    <path d="M7 2v20" />
                    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                  </svg>
                </div>
                Sumber Produksi
              </CardTitle>
              <Badge variant="destructive" className="text-xs">
                Wajib Diisi
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Production Selection */}
            <FormField
              control={form.control}
              name="productionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Produksi</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">-- Pilih Batch Produksi --</option>
                      {/* TODO: Fetch completed productions with menu data */}
                      {/* Example: productions.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.menu.menuName} - {prod.actualPortions} porsi (Batch: {prod.batchNumber})
                        </option>
                      )) */}
                    </select>
                  </FormControl>
                  <FormDescription>
                    Pilih batch produksi yang sudah selesai (COMPLETED)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TODO: Display selected production details */}
            {/* When production is selected, show:
            - Menu name
            - Portion size
            - Available portions (production.actualPortions)
            - Estimated cost (production.actualCost)
            - Nutrition data (from production.menu)
            */}

            {/* Estimated Beneficiaries */}
            <FormField
              control={form.control}
              name="estimatedBeneficiaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimasi Penerima Manfaat</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah penerima manfaat yang diperkirakan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Packaging & Logistics */}
        <Card>
          <CardHeader>
            <CardTitle>Kemasan & Logistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Packaging Type */}
            <FormField
              control={form.control}
              name="packagingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kemasan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kemasan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OMPRENG">Ompreng (Kertas/Daun)</SelectItem>
                      <SelectItem value="BOX">Box/Kotak</SelectItem>
                      <SelectItem value="CONTAINER">Container/Wadah</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Packaging Cost */}
            <FormField
              control={form.control}
              name="packagingCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biaya Kemasan (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Total biaya kemasan dalam Rupiah</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Travel Time & Fuel Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedTravelTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimasi Waktu Tempuh (menit)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya BBM (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Perbarui Jadwal' : 'Buat Jadwal'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
