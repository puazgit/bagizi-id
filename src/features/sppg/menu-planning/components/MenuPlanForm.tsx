/**
 * @fileoverview Menu Plan Form Component (Create/Edit)
 * @version Next.js 15.5.4 / React Hook Form + Zod / shadcn/ui
 * @see {@link /docs/copilot-instructions.md} Form patterns with shadcn/ui
 */

'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarIcon, Save, Send, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useCreateMenuPlan, useUpdateMenuPlan } from '../hooks/useMenuPlans'
import type { MenuPlanDetail } from '../types'
import { z } from 'zod'

// Form schema with planningRules as string for textarea
const formSchema = z
  .object({
    name: z.string().min(3, 'Nama rencana minimal 3 karakter'),
    programId: z.string().min(1, 'Silakan pilih program'),
    startDate: z.date(),
    endDate: z.date(),
    description: z.string().optional(),
    planningRules: z.string().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'Tanggal akhir harus setelah tanggal mulai',
    path: ['endDate'],
  })

type FormInput = z.infer<typeof formSchema>

interface MenuPlanFormProps {
  plan?: MenuPlanDetail
  programs?: Array<{
    id: string
    name: string
    programCode: string
    targetRecipients: number
  }>
  onSuccess?: (planId: string) => void
  onCancel?: () => void
}

export const MenuPlanForm: FC<MenuPlanFormProps> = ({
  plan,
  programs = [],
  onSuccess,
  onCancel,
}) => {
  const router = useRouter()
  const isEditMode = !!plan

  // Mutations
  const { mutate: createPlan, isPending: isCreating } = useCreateMenuPlan()
  const { mutate: updatePlan, isPending: isUpdating } = useUpdateMenuPlan()
  const isPending = isCreating || isUpdating

  // Form setup
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan?.name || '',
      programId: plan?.programId || '',
      startDate: plan?.startDate ? new Date(plan.startDate) : undefined,
      endDate: plan?.endDate ? new Date(plan.endDate) : undefined,
      planningRules: plan?.planningRules 
        ? JSON.stringify(plan.planningRules, null, 2)
        : '{\n  "mealTypes": ["SARAPAN", "SNACK_PAGI", "MAKAN_SIANG"],\n  "maxRepeatsPerWeek": 2\n}',
      description: plan?.description || '',
    },
  })

  // Get selected program info for display
  const selectedProgramId = form.watch('programId')
  const selectedProgram = programs.find((p) => p.id === selectedProgramId)

  // Submit handlers
  const handleSubmit = (data: FormInput, submitForReview: boolean = false) => {
    // Parse planning rules JSON
    let planningRules: Record<string, unknown> | undefined
    if (data.planningRules) {
      try {
        planningRules = JSON.parse(data.planningRules)
      } catch {
        form.setError('planningRules', {
          type: 'manual',
          message: 'Invalid JSON format',
        })
        return
      }
    }

    // Map form data to API schema format
    // Note: API will generate planCode automatically from name
    const payload = {
      name: data.name,
      programId: data.programId,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      planningRules,
    }

    if (isEditMode && plan) {
      updatePlan(
        { planId: plan.id, data: payload },
        {
          onSuccess: (response) => {
            const planId = response.data?.id || plan.id
            
            // If submit for review, redirect to detail page with action
            if (submitForReview) {
              router.push(`/menu-planning/${planId}?action=submit`)
            } else {
              onSuccess?.(planId)
              router.push(`/menu-planning/${planId}`)
            }
          },
        }
      )
    } else {
      createPlan(payload, {
        onSuccess: (response) => {
          const planId = response.data?.id
          if (planId) {
            if (submitForReview) {
              router.push(`/menu-planning/${planId}?action=submit`)
            } else {
              onSuccess?.(planId)
              router.push(`/menu-planning/${planId}`)
            }
          }
        },
      })
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (isEditMode && plan) {
      router.push(`/menu-planning/${plan.id}`)
    } else {
      router.push('/menu-planning')
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditMode ? 'Edit Rencana Menu' : 'Buat Rencana Menu Baru'}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Perbarui detail rencana menu Anda'
            : 'Buat periode perencanaan menu baru dengan rentang tanggal dan target penerima'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => handleSubmit(data, false))} className="space-y-6">
            {/* Alert for edit mode */}
            {isEditMode && plan?.status !== 'DRAFT' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Rencana ini memiliki status <strong>{plan?.status}</strong>. 
                  Perubahan mungkin memerlukan persetujuan ulang.
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Dasar</h3>

              {/* Plan Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Rencana *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contoh: Rencana Menu Januari 2025"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Berikan nama deskriptif untuk rencana Anda
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      disabled={isEditMode} // Can't change program in edit mode
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name} ({program.programCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih program gizi untuk rencana ini
                      {selectedProgram && (
                        <span className="block mt-1 text-foreground font-medium">
                          Target: {selectedProgram.targetRecipients} penerima
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Periode Perencanaan</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
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
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Hari pertama periode perencanaan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Akhir *</FormLabel>
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
                            disabled={(date) => {
                              const startDate = form.getValues('startDate')
                              return startDate ? date <= startDate : false
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Hari terakhir periode perencanaan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Planning Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Aturan Perencanaan (Opsional)</h3>

              <FormField
                control={form.control}
                name="planningRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aturan JSON</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"mealTypes": ["SARAPAN", "MAKAN_SIANG"], "maxRepeatsPerWeek": 2}'
                        className="font-mono text-sm min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Definisikan batasan perencanaan dalam format JSON (misalnya jenis makanan, batas pengulangan)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Deskripsi</h3>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Rencana</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tambahkan deskripsi atau catatan tentang rencana ini..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Deskripsi opsional untuk rencana menu ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
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
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan sebagai Draf
                  </>
                )}
              </Button>

              {!isEditMode && (
                <Button
                  type="button"
                  onClick={form.handleSubmit((data) => handleSubmit(data, true))}
                  disabled={isPending}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Simpan & Kirim untuk Review
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
