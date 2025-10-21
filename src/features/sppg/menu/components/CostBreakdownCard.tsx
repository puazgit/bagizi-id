/**
 * @fileoverview Cost Breakdown Card Component - Comprehensive Cost Analysis
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 */

'use client'

import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Package,
  Users,
  Zap,
  Settings,
  Target,
  PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCostReport, useCalculateCost } from '../hooks/useCost'

interface CostBreakdownCardProps {
  menuId: string
}

export function CostBreakdownCard({ menuId }: CostBreakdownCardProps) {
  const { data: report, isLoading, error } = useCostReport(menuId)
  const { mutate: calculate, isPending: isCalculating } = useCalculateCost(menuId)

  const handleCalculate = () => {
    calculate({ forceRecalculate: true })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Memuat data biaya...</p>
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
                {error instanceof Error ? error.message : 'Gagal memuat data biaya'}
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
              <h3 className="text-lg font-semibold">Belum Ada Data Biaya</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Hitung biaya produksi menu berdasarkan bahan yang sudah ditambahkan, 
                tenaga kerja, dan biaya operasional
              </p>
            </div>
            <Button onClick={handleCalculate} disabled={isCalculating} size="lg">
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Menghitung Biaya...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Hitung Biaya Sekarang
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
          <h3 className="text-lg font-semibold">Analisis Biaya</h3>
          <p className="text-sm text-muted-foreground">
            Breakdown biaya produksi menu
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

      {/* Total Cost Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Biaya Produksi</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(report.costBreakdown.totalCost)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Per Porsi</p>
              <p className="text-2xl font-bold">
                {formatCurrency(report.costPerServing)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(report.costPerGram)}/gram
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Rincian Biaya
          </CardTitle>
          <CardDescription>Breakdown biaya per kategori</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CostBreakdownBar
            label="Bahan Baku"
            value={report.costBreakdown.ingredientsCost}
            total={report.costBreakdown.totalCost}
            icon={<Package className="h-4 w-4" />}
            color="bg-blue-500"
          />
          <CostBreakdownBar
            label="Tenaga Kerja"
            value={report.costBreakdown.laborCost}
            total={report.costBreakdown.totalCost}
            icon={<Users className="h-4 w-4" />}
            color="bg-green-500"
          />
          <CostBreakdownBar
            label="Utilitas"
            value={report.costBreakdown.utilitiesCost}
            total={report.costBreakdown.totalCost}
            icon={<Zap className="h-4 w-4" />}
            color="bg-yellow-500"
          />
          <CostBreakdownBar
            label="Operasional"
            value={report.costBreakdown.operationalCost}
            total={report.costBreakdown.totalCost}
            icon={<Settings className="h-4 w-4" />}
            color="bg-purple-500"
          />
          <CostBreakdownBar
            label="Overhead"
            value={report.costBreakdown.overheadCost}
            total={report.costBreakdown.totalCost}
            icon={<TrendingUp className="h-4 w-4" />}
            color="bg-orange-500"
          />
        </CardContent>
      </Card>

      {/* Labor Cost Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            Biaya Tenaga Kerja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Persiapan</p>
              <p className="text-lg font-semibold">
                {report.laborCost.preparationHours}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Memasak</p>
              <p className="text-lg font-semibold">
                {report.laborCost.cookingHours}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Jam</p>
              <p className="text-lg font-semibold">
                {report.laborCost.totalHours}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tarif/Jam</p>
              <p className="text-lg font-semibold">
                {formatCurrency(report.laborCost.laborCostPerHour)}
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Biaya Tenaga Kerja</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(report.laborCost.totalLaborCost)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Utilities & Operational */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Utilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Biaya Utilitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gas</span>
              <span className="font-semibold">
                {formatCurrency(report.utilitiesCost.gasCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Listrik</span>
              <span className="font-semibold">
                {formatCurrency(report.utilitiesCost.electricityCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Air</span>
              <span className="font-semibold">
                {formatCurrency(report.utilitiesCost.waterCost)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Total</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(report.utilitiesCost.totalUtilitiesCost)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Operational */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Biaya Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Kemasan</span>
              <span className="font-semibold">
                {formatCurrency(report.operationalCost.packagingCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Perawatan Alat</span>
              <span className="font-semibold">
                {formatCurrency(report.operationalCost.equipmentMaintenanceCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Kebersihan</span>
              <span className="font-semibold">
                {formatCurrency(report.operationalCost.cleaningSuppliesCost)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Total</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(report.operationalCost.totalOperationalCost)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rasio Biaya</CardTitle>
          <CardDescription>Persentase setiap kategori biaya</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bahan Baku</span>
              <Badge variant="outline">
                {(report.costRatios.ingredientCostRatio * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={report.costRatios.ingredientCostRatio * 100} 
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tenaga Kerja</span>
              <Badge variant="outline">
                {(report.costRatios.laborCostRatio * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={report.costRatios.laborCostRatio * 100} 
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overhead</span>
              <Badge variant="outline">
                {(report.costRatios.overheadCostRatio * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={report.costRatios.overheadCostRatio * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget Planning (if available) */}
      {report.budgetPlanning && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Perencanaan Anggaran
            </CardTitle>
            <CardDescription>Alokasi anggaran dan penggunaan untuk menu ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Alokasi Anggaran</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(report.budgetPlanning.budgetAllocation ?? 0)}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">Penggunaan Anggaran</p>
                <p className="text-2xl font-bold text-primary">
                  {(report.budgetPlanning.budgetUtilization ?? 0).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Sisa Anggaran</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(report.budgetPlanning.budgetRemaining ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredients Cost Breakdown */}
      {report.ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rincian Biaya Bahan</CardTitle>
            <CardDescription>
              Biaya per bahan ({report.ingredients.length} item)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
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
                          {ingredient.inventoryItem.preferredSupplier && (
                            <> • {ingredient.inventoryItem.preferredSupplier.supplierName}</>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {ingredient.quantity} {ingredient.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(ingredient.costPerUnit)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(ingredient.totalCost)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={3}>Total Biaya Bahan</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(report.costBreakdown.ingredientsCost)}
                  </TableCell>
                </TableRow>
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

interface CostBreakdownBarProps {
  label: string
  value: number
  total: number
  icon: React.ReactNode
  color: string
}

function CostBreakdownBar({ label, value, total, icon, color }: CostBreakdownBarProps) {
  const percentage = (value / total) * 100

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${color.replace('bg-', 'bg-')}/10`}>
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {formatCurrency(value)}
          </span>
          <Badge variant="secondary" className="text-xs">
            {percentage.toFixed(1)}%
          </Badge>
        </div>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
