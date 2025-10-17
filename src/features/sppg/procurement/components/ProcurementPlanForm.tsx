/**
 * @fileoverview Procurement Plan Form Component
 * @version Next.js 15.5.4 / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines  
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users, Utensils, Calculator, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateProcurementPlan, useUpdateProcurementPlan } from '../hooks/useProcurementPlans'
import type { ProcurementPlan } from '@prisma/client'

// ============================================================================
// Validation Schema
// ============================================================================

const planFormSchema = z.object({
  planName: z.string().min(3, 'Nama rencana minimal 3 karakter').max(100),
  planMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Format bulan harus YYYY-MM'),
  planYear: z.number().min(2020).max(2100),
  planQuarter: z.number().min(1).max(4).optional(),
  programId: z.string().cuid('Program ID tidak valid').optional(),
  
  // Budget fields
  totalBudget: z.number().min(1, 'Total budget harus lebih dari 0'),
  proteinBudget: z.number().min(0).optional(),
  carbBudget: z.number().min(0).optional(),
  vegetableBudget: z.number().min(0).optional(),
  fruitBudget: z.number().min(0).optional(),
  otherBudget: z.number().min(0).optional(),
  
  // Target fields
  targetRecipients: z.number().min(1, 'Target penerima harus lebih dari 0'),
  targetMeals: z.number().min(1, 'Target makanan harus lebih dari 0'),
  costPerMeal: z.number().min(0).optional(),
  
  // Additional fields
  emergencyBuffer: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => {
    const categorySum = (data.proteinBudget || 0) +
      (data.carbBudget || 0) +
      (data.vegetableBudget || 0) +
      (data.fruitBudget || 0) +
      (data.otherBudget || 0)
    return categorySum <= data.totalBudget
  },
  {
    message: 'Total budget kategori tidak boleh melebihi total budget',
    path: ['totalBudget'],
  }
)

type PlanFormValues = z.infer<typeof planFormSchema>

// ============================================================================
// Types
// ============================================================================

interface ProcurementPlanFormProps {
  plan?: ProcurementPlan
  className?: string
  onSuccess?: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Component: Procurement Plan Form
 */
export function ProcurementPlanForm({ plan, className, onSuccess }: ProcurementPlanFormProps) {
  const router = useRouter()
  const isEdit = Boolean(plan)

  const { mutate: createPlan, isPending: isCreating } = useCreateProcurementPlan()
  const { mutate: updatePlan, isPending: isUpdating } = useUpdateProcurementPlan()
  const isPending = isCreating || isUpdating

  // Initialize form
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: plan ? {
      planName: plan.planName,
      planMonth: plan.planMonth,
      planYear: plan.planYear,
      planQuarter: plan.planQuarter || undefined,
      programId: plan.programId || undefined,
      totalBudget: plan.totalBudget,
      proteinBudget: plan.proteinBudget || undefined,
      carbBudget: plan.carbBudget || undefined,
      vegetableBudget: plan.vegetableBudget || undefined,
      fruitBudget: plan.fruitBudget || undefined,
      otherBudget: plan.otherBudget || undefined,
      targetRecipients: plan.targetRecipients || 0,
      targetMeals: plan.targetMeals || 0,
      costPerMeal: plan.costPerMeal || undefined,
      emergencyBuffer: plan.emergencyBuffer || undefined,
      notes: plan.notes || undefined,
    } : {
      planName: '',
      planMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      planYear: new Date().getFullYear(),
      totalBudget: 0,
      targetRecipients: 0,
      targetMeals: 0,
    },
  })

  // Watch for budget and target changes to calculate cost per meal
  const totalBudget = form.watch('totalBudget')
  const targetMeals = form.watch('targetMeals')
  const proteinBudget = form.watch('proteinBudget') || 0
  const carbBudget = form.watch('carbBudget') || 0
  const vegetableBudget = form.watch('vegetableBudget') || 0
  const fruitBudget = form.watch('fruitBudget') || 0
  const otherBudget = form.watch('otherBudget') || 0

  // Calculate cost per meal
  useEffect(() => {
    if (totalBudget > 0 && targetMeals > 0) {
      const costPerMeal = totalBudget / targetMeals
      form.setValue('costPerMeal', Math.round(costPerMeal))
    }
  }, [totalBudget, targetMeals, form])

  // Calculate category budget sum
  const categorySum = proteinBudget + carbBudget + vegetableBudget + fruitBudget + otherBudget
  const categoryPercentage = totalBudget > 0 ? (categorySum / totalBudget) * 100 : 0
  const isOverBudget = categorySum > totalBudget

  // Handle form submission
  const onSubmit = (data: PlanFormValues) => {
    const planData = {
      ...data,
      allocatedBudget: 0,
      usedBudget: 0,
      remainingBudget: data.totalBudget,
    }

    if (isEdit && plan) {
      updatePlan(
        { id: plan.id, data: planData },
        {
          onSuccess: () => {
            onSuccess?.()
            router.push(`/procurement/plans/${plan.id}`)
          },
        }
      )
    } else {
      createPlan(planData, {
        onSuccess: (response) => {
          onSuccess?.()
          if (response.data?.id) {
            router.push(`/procurement/plans/${response.data.id}`)
          } else {
            router.push('/procurement/plans')
          }
        },
      })
    }
  }

  // Generate month options
  const currentYear = new Date().getFullYear()
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    return {
      value: `${currentYear}-${month}`,
      label: new Date(currentYear, i).toLocaleDateString('id-ID', { month: 'long' }),
    }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Informasi Dasar</CardTitle>
          </div>
          <CardDescription>Periode dan nama rencana pengadaan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="planName">Nama Rencana *</Label>
            <Input
              id="planName"
              {...form.register('planName')}
              placeholder="Contoh: Rencana Pengadaan November 2024"
            />
            {form.formState.errors.planName && (
              <p className="text-sm text-red-600">{form.formState.errors.planName.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Plan Month */}
            <div className="space-y-2">
              <Label htmlFor="planMonth">Bulan *</Label>
              <Select
                value={form.watch('planMonth')}
                onValueChange={(value) => form.setValue('planMonth', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Year */}
            <div className="space-y-2">
              <Label htmlFor="planYear">Tahun *</Label>
              <Input
                id="planYear"
                type="number"
                {...form.register('planYear', { valueAsNumber: true })}
              />
            </div>

            {/* Plan Quarter */}
            <div className="space-y-2">
              <Label htmlFor="planQuarter">Kuartal (Opsional)</Label>
              <Select
                value={form.watch('planQuarter')?.toString() || ''}
                onValueChange={(value) => form.setValue('planQuarter', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kuartal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="4">Q4 (Okt-Des)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Planning */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Perencanaan Anggaran</CardTitle>
          </div>
          <CardDescription>Alokasi budget total dan per kategori</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Budget */}
          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Anggaran *</Label>
            <Input
              id="totalBudget"
              type="number"
              {...form.register('totalBudget', { valueAsNumber: true })}
              placeholder="0"
            />
            {totalBudget > 0 && (
              <p className="text-sm text-muted-foreground">{formatCurrency(totalBudget)}</p>
            )}
            {form.formState.errors.totalBudget && (
              <p className="text-sm text-red-600">{form.formState.errors.totalBudget.message}</p>
            )}
          </div>

          <Separator />

          {/* Category Budgets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alokasi per Kategori (Opsional)</Label>
              <Badge variant={isOverBudget ? 'destructive' : 'secondary'}>
                {categoryPercentage.toFixed(1)}% dari total
              </Badge>
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-900 dark:text-red-400">
                  Total budget kategori melebihi total anggaran
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="proteinBudget">Budget Protein 🥩</Label>
                <Input
                  id="proteinBudget"
                  type="number"
                  {...form.register('proteinBudget', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbBudget">Budget Karbohidrat 🍚</Label>
                <Input
                  id="carbBudget"
                  type="number"
                  {...form.register('carbBudget', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vegetableBudget">Budget Sayuran 🥬</Label>
                <Input
                  id="vegetableBudget"
                  type="number"
                  {...form.register('vegetableBudget', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fruitBudget">Budget Buah 🍎</Label>
                <Input
                  id="fruitBudget"
                  type="number"
                  {...form.register('fruitBudget', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherBudget">Budget Lainnya 📦</Label>
                <Input
                  id="otherBudget"
                  type="number"
                  {...form.register('otherBudget', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            {categorySum > 0 && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total Alokasi Kategori:</span>
                  <span className="font-bold">{formatCurrency(categorySum)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Planning */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Target & Kalkulasi</CardTitle>
          </div>
          <CardDescription>Target penerima dan jumlah makanan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Target Recipients */}
            <div className="space-y-2">
              <Label htmlFor="targetRecipients">
                <Users className="h-4 w-4 inline mr-1" />
                Target Penerima *
              </Label>
              <Input
                id="targetRecipients"
                type="number"
                {...form.register('targetRecipients', { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.targetRecipients && (
                <p className="text-sm text-red-600">{form.formState.errors.targetRecipients.message}</p>
              )}
            </div>

            {/* Target Meals */}
            <div className="space-y-2">
              <Label htmlFor="targetMeals">
                <Utensils className="h-4 w-4 inline mr-1" />
                Target Makanan *
              </Label>
              <Input
                id="targetMeals"
                type="number"
                {...form.register('targetMeals', { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.targetMeals && (
                <p className="text-sm text-red-600">{form.formState.errors.targetMeals.message}</p>
              )}
            </div>
          </div>

          {/* Calculated Cost per Meal */}
          {form.watch('costPerMeal') && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="font-medium">Biaya per Porsi (Terhitung)</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(form.watch('costPerMeal')!)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Dihitung otomatis: Total Anggaran ÷ Target Makanan
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Tambahkan catatan atau keterangan tambahan..."
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending || isOverBudget}
          size="lg"
          className="min-w-32"
        >
          {isPending ? 'Menyimpan...' : isEdit ? 'Perbarui Rencana' : 'Buat Rencana'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          size="lg"
        >
          Batal
        </Button>
      </div>
    </form>
  )
}
