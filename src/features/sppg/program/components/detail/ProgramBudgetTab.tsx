'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/features/sppg/program/lib/programUtils'
import type { Program } from '@/features/sppg/program/types/program.types'

interface ProgramBudgetTabProps {
  program: Program
}

export function ProgramBudgetTab({ program }: ProgramBudgetTabProps) {
  const monthlyProjection = 
    program.budgetPerMeal && program.feedingDays && program.feedingDays.length > 0
      ? program.budgetPerMeal * program.mealsPerDay * program.feedingDays.length * 4 * program.currentRecipients
      : null

  const weeklyBudget = 
    program.budgetPerMeal && program.feedingDays && program.feedingDays.length > 0
      ? program.budgetPerMeal * program.mealsPerDay * program.feedingDays.length * program.targetRecipients
      : null

  const totalProjection = 
    program.endDate && program.budgetPerMeal && program.feedingDays && program.feedingDays.length > 0
      ? program.budgetPerMeal * 
        program.mealsPerDay * 
        program.feedingDays.length * 
        Math.ceil((new Date(program.endDate).getTime() - new Date(program.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) *
        program.targetRecipients
      : null

  const isBudgetInsufficient = 
    program.totalBudget && monthlyProjection
      ? program.totalBudget < (monthlyProjection * (program.targetRecipients / program.currentRecipients))
      : false

  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Total Anggaran
            </CardTitle>
            <CardDescription>
              Anggaran keseluruhan program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {program.totalBudget ? formatCurrency(program.totalBudget) : 'Belum ditetapkan'}
            </p>
            {program.totalBudget && program.targetRecipients > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {formatCurrency(program.totalBudget / program.targetRecipients)} per penerima
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Biaya per Porsi
            </CardTitle>
            <CardDescription>
              Anggaran untuk setiap porsi makan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {program.budgetPerMeal ? formatCurrency(program.budgetPerMeal) : 'Belum ditetapkan'}
            </p>
            {program.budgetPerMeal && program.mealsPerDay > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {formatCurrency(program.budgetPerMeal * program.mealsPerDay)} per hari per penerima
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Proyeksi Bulanan
            </CardTitle>
            <CardDescription>
              Estimasi biaya per bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyProjection ? (
              <>
                <p className="text-3xl font-bold">
                  {formatCurrency(monthlyProjection)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Untuk {program.currentRecipients} penerima saat ini
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Data tidak lengkap untuk kalkulasi
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {program.totalBudget && program.budgetPerMeal && program.feedingDays && program.feedingDays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rincian Alokasi Anggaran</CardTitle>
            <CardDescription>
              Breakdown penggunaan anggaran program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Biaya Makanan per Hari</span>
                <span className="font-semibold">
                  {formatCurrency(program.budgetPerMeal * program.mealsPerDay * program.targetRecipients)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Biaya per Minggu</span>
                <span className="font-semibold">
                  {weeklyBudget ? formatCurrency(weeklyBudget) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Biaya per Bulan (estimasi)</span>
                <span className="font-semibold">
                  {monthlyProjection 
                    ? formatCurrency(monthlyProjection * (program.targetRecipients / program.currentRecipients))
                    : '-'}
                </span>
              </div>
              
              {program.endDate && totalProjection && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold">Total Proyeksi</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(totalProjection)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {isBudgetInsufficient && (
              <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Peringatan: Total anggaran mungkin tidak mencukupi untuk target penerima dan durasi program yang direncanakan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
