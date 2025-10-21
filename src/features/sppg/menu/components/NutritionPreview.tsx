/**
 * @fileoverview Nutrition Preview Component - Comprehensive Nutrition Display
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 */

'use client'

import { Calculator, TrendingUp, Award, AlertCircle, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNutritionReport, useCalculateNutrition } from '../hooks/useNutrition'

interface NutritionPreviewProps {
  menuId: string
}

export function NutritionPreview({ menuId }: NutritionPreviewProps) {
  const { data: report, isLoading, error } = useNutritionReport(menuId)
  const { mutate: calculate, isPending: isCalculating } = useCalculateNutrition(menuId)

  const handleCalculate = () => {
    calculate({ forceRecalculate: true })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Memuat data nutrisi...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-10">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <div className="space-y-2">
              <p className="font-semibold text-destructive">Terjadi Kesalahan</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Gagal memuat data nutrisi'}
              </p>
            </div>
            <Button onClick={handleCalculate} variant="outline" size="lg">
              <Calculator className="h-4 w-4 mr-2" />
              Hitung Ulang
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Belum Ada Data Nutrisi</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Hitung nilai gizi menu berdasarkan komposisi bahan yang sudah ditambahkan
              </p>
            </div>
            <Button onClick={handleCalculate} disabled={isCalculating} size="lg">
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Menghitung Nutrisi...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Hitung Nutrisi Sekarang
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Calculate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Informasi Nutrisi</h3>
          <p className="text-sm text-muted-foreground">
            Nilai gizi per porsi ({report.servingSize}g)
          </p>
        </div>
        <Button onClick={handleCalculate} disabled={isCalculating} variant="outline">
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Menghitung...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Hitung Ulang
            </>
          )}
        </Button>
      </div>

      {/* Compliance Score & AKG Badge */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${
                report.akgCompliant 
                  ? 'bg-green-100 dark:bg-green-950' 
                  : 'bg-amber-100 dark:bg-amber-950'
              }`}>
                <Award className={`h-6 w-6 ${
                  report.akgCompliant 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-amber-600 dark:text-amber-400'
                }`} />
              </div>
              <div>
                <p className="font-semibold">Status AKG</p>
                <Badge variant={report.akgCompliant ? 'default' : 'secondary'}>
                  {report.akgCompliant ? 'Sesuai AKG' : 'Perlu Penyesuaian'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-primary">
                  {Math.round(report.complianceScore)}
                </p>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <Progress value={report.complianceScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Macronutrients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Makronutrien
          </CardTitle>
          <CardDescription>Energi dan zat gizi makro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MacronutrientBar
            label="Kalori"
            value={report.nutrition.calories}
            unit="kkal"
            dailyValue={report.dailyValuePercentages.calories}
            color="bg-orange-500"
          />
          <MacronutrientBar
            label="Protein"
            value={report.nutrition.protein}
            unit="g"
            dailyValue={report.dailyValuePercentages.protein}
            color="bg-red-500"
          />
          <MacronutrientBar
            label="Karbohidrat"
            value={report.nutrition.carbohydrates}
            unit="g"
            dailyValue={report.dailyValuePercentages.carbohydrates}
            color="bg-blue-500"
          />
          <MacronutrientBar
            label="Lemak"
            value={report.nutrition.fat}
            unit="g"
            dailyValue={report.dailyValuePercentages.fat}
            color="bg-yellow-500"
          />
          <MacronutrientBar
            label="Serat"
            value={report.nutrition.fiber}
            unit="g"
            dailyValue={report.dailyValuePercentages.fiber}
            color="bg-green-500"
          />
        </CardContent>
      </Card>

      {/* Vitamins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vitamin</CardTitle>
          <CardDescription>Kandungan vitamin per porsi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MicronutrientCard
              label="Vitamin A"
              value={report.nutrition.vitaminA}
              unit="mcg"
              dailyValue={report.dailyValuePercentages.vitaminA}
            />
            <MicronutrientCard
              label="Vitamin C"
              value={report.nutrition.vitaminC}
              unit="mg"
              dailyValue={report.dailyValuePercentages.vitaminC}
            />
            <MicronutrientCard
              label="Vitamin D"
              value={report.nutrition.vitaminD}
              unit="mcg"
              dailyValue={report.dailyValuePercentages.vitaminD}
            />
            <MicronutrientCard
              label="Vitamin E"
              value={report.nutrition.vitaminE}
              unit="mg"
              dailyValue={report.dailyValuePercentages.vitaminE}
            />
            <MicronutrientCard
              label="Vitamin B12"
              value={report.nutrition.vitaminB12}
              unit="mcg"
              dailyValue={report.dailyValuePercentages.vitaminB12}
            />
            <MicronutrientCard
              label="Folat"
              value={report.nutrition.folate}
              unit="mcg"
              dailyValue={report.dailyValuePercentages.folate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Minerals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mineral</CardTitle>
          <CardDescription>Kandungan mineral per porsi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MicronutrientCard
              label="Kalsium"
              value={report.nutrition.calcium}
              unit="mg"
              dailyValue={report.dailyValuePercentages.calcium}
            />
            <MicronutrientCard
              label="Zat Besi"
              value={report.nutrition.iron}
              unit="mg"
              dailyValue={report.dailyValuePercentages.iron}
            />
            <MicronutrientCard
              label="Magnesium"
              value={report.nutrition.magnesium}
              unit="mg"
              dailyValue={report.dailyValuePercentages.magnesium}
            />
            <MicronutrientCard
              label="Fosfor"
              value={report.nutrition.phosphorus}
              unit="mg"
              dailyValue={report.dailyValuePercentages.phosphorus}
            />
            <MicronutrientCard
              label="Kalium"
              value={report.nutrition.potassium}
              unit="mg"
              dailyValue={report.dailyValuePercentages.potassium}
            />
            <MicronutrientCard
              label="Zinc"
              value={report.nutrition.zinc}
              unit="mg"
              dailyValue={report.dailyValuePercentages.zinc}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Breakdown */}
      {report.ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rincian Bahan</CardTitle>
            <CardDescription>
              Kontribusi nutrisi dari setiap bahan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Kalori</TableHead>
                  <TableHead className="text-right">Protein</TableHead>
                  <TableHead className="text-right">Karbo</TableHead>
                  <TableHead className="text-right">Lemak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.ingredients.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {ingredient.ingredientName}
                      {ingredient.inventoryItem && (
                        <span className="text-xs text-muted-foreground block">
                          {ingredient.inventoryItem.itemCode}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {ingredient.quantity} {ingredient.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {ingredient.calories?.toFixed(1) ?? '0.0'} kkal
                    </TableCell>
                    <TableCell className="text-right">
                      {ingredient.protein?.toFixed(1) ?? '0.0'}g
                    </TableCell>
                    <TableCell className="text-right">
                      {ingredient.carbohydrates?.toFixed(1) ?? '0.0'}g
                    </TableCell>
                    <TableCell className="text-right">
                      {ingredient.fat?.toFixed(1) ?? '0.0'}g
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Calculation Timestamp */}
      <div className="text-center text-xs text-muted-foreground">
        Dihitung pada: {new Date(report.calculatedAt).toLocaleString('id-ID')}
      </div>
    </div>
  )
}

// ============ Helper Components ============

interface MacronutrientBarProps {
  label: string
  value?: number
  unit: string
  dailyValue?: number
  color: string
}

function MacronutrientBar({ label, value, unit, dailyValue, color }: MacronutrientBarProps) {
  const safeValue = value ?? 0
  const safeDailyValue = dailyValue ?? 0
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {safeValue.toFixed(1)} {unit}
          </span>
          <Badge variant="outline" className="text-xs">
            {safeDailyValue.toFixed(0)}% DV
          </Badge>
        </div>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(safeDailyValue, 100)}%` }}
        />
      </div>
    </div>
  )
}

interface MicronutrientCardProps {
  label: string
  value?: number
  unit: string
  dailyValue?: number
}

function MicronutrientCard({ label, value, unit, dailyValue }: MicronutrientCardProps) {
  const safeValue = value ?? 0
  const safeDailyValue = dailyValue ?? 0
  
  const getStatusColor = (dv: number) => {
    if (dv >= 100) return 'text-green-600 dark:text-green-400'
    if (dv >= 50) return 'text-blue-600 dark:text-blue-400'
    if (dv >= 20) return 'text-amber-600 dark:text-amber-400'
    return 'text-muted-foreground'
  }

  return (
    <div className="p-4 border rounded-lg space-y-2 hover:shadow-sm transition-shadow">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${getStatusColor(safeDailyValue)}`}>
        {safeValue.toFixed(1)}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </p>
      <div className="flex items-center gap-2">
        <Progress value={Math.min(safeDailyValue, 100)} className="h-1 flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {safeDailyValue.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
