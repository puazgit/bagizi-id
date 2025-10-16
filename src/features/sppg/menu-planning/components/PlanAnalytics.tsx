/**
 * @fileoverview Menu Planning Analytics Dashboard Component
 * @version Next.js 15.5.4 / Recharts 2.x / Enterprise-Grade Data Visualization
 * @description Comprehensive analytics with multiple chart types, export functionality, and interactive visualizations
 */

'use client'

import { useState } from 'react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Award,
  Download,
  FileText,
  FileSpreadsheet,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { 
  MenuPlanAnalytics,
  CostByMealType,
  CostByDay,
  NutritionByDay,
  DailyComplianceCheck
} from '@/features/sppg/menu-planning/types'

/**
 * Component Props
 */
interface PlanAnalyticsProps {
  analytics?: MenuPlanAnalytics
  isLoading?: boolean
  error?: Error | null
  onExport?: (format: 'pdf' | 'csv' | 'excel') => void
}

/**
 * Chart color palette (enterprise-grade)
 */
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
}

const MEAL_TYPE_COLORS = {
  SARAPAN: COLORS.info,
  SNACK_PAGI: COLORS.warning,
  MAKAN_SIANG: COLORS.success,
  SNACK_SORE: COLORS.primary,
  MAKAN_MALAM: COLORS.purple,
}

/**
 * Custom Tooltip Component
 */
interface CustomTooltipPayload {
  name: string
  value: number
  color: string
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: { 
  active?: boolean
  payload?: CustomTooltipPayload[]
  label?: string 
}) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  description?: string
}

const MetricCard = ({ title, value, change, icon, trend = 'neutral', description }: MetricCardProps) => {
  const trendColor = {
    up: 'text-green-600 dark:text-green-500',
    down: 'text-red-600 dark:text-red-500',
    neutral: 'text-muted-foreground'
  }[trend]

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {icon}
            </div>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span>{change > 0 ? '+' : ''}{change}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Plan Analytics Dashboard Component
 */
export function PlanAnalytics({
  analytics,
  isLoading = false,
  error = null,
  onExport
}: PlanAnalyticsProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)

  /**
   * Handle export with loading state
   */
  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!onExport) return
    
    setExportingFormat(format)
    try {
      await onExport(format)
    } finally {
      setExportingFormat(null)
    }
  }

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Gagal memuat data analytics: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  /**
   * No Data State
   */
  if (!analytics) {
    return (
      <Alert>
        <AlertDescription>
          Belum ada data analytics untuk rencana menu ini. Tambahkan assignment menu untuk melihat analytics.
        </AlertDescription>
      </Alert>
    )
  }

  /**
   * Prepare chart data
   */
  const nutritionByMealType = analytics.nutrition?.byMealType || []
  const nutritionByDay = analytics.nutrition?.byDay || []
  const costByMealType = analytics.cost?.byMealType || []
  const costByDay = analytics.cost?.byDay || []
  const complianceChecks = analytics.compliance?.dailyChecks || []
  const varietyMetrics = analytics.variety

  // Calculate metrics
  const totalCost = costByMealType.reduce((sum: number, item: CostByMealType) => sum + item.totalCost, 0)
  const avgDailyCost = costByDay.length > 0 
    ? costByDay.reduce((sum: number, item: CostByDay) => sum + item.totalCost, 0) / costByDay.length 
    : 0
  
  const totalCompliantDays = complianceChecks.filter((c: DailyComplianceCheck) => c.isCompliant).length
  const complianceRate = complianceChecks.length > 0 
    ? (totalCompliantDays / complianceChecks.length) * 100 
    : 0

  const avgNutritionScore = nutritionByDay.length > 0
    ? nutritionByDay.reduce((sum: number, item: NutritionByDay) => sum + item.totalCalories, 0) / nutritionByDay.length
    : 0

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Analitik</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis komprehensif rencana menu
          </p>
        </div>
        
        {onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!!exportingFormat}>
                {exportingFormat ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengekspor...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Ekspor
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Format Ekspor</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Ekspor sebagai PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Ekspor sebagai CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Ekspor sebagai Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Biaya"
          value={new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(totalCost)}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          description="Total biaya rencana menu"
          trend="neutral"
        />
        
        <MetricCard
          title="Rata-rata Biaya Harian"
          value={new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(avgDailyCost)}
          icon={<TrendingUp className="h-6 w-6 text-success" />}
          description="Biaya per hari"
          trend="up"
          change={5}
        />
        
        <MetricCard
          title="Tingkat Kepatuhan"
          value={`${complianceRate.toFixed(1)}%`}
          icon={<Award className="h-6 w-6 text-info" />}
          description={`${totalCompliantDays} dari ${complianceChecks.length} hari`}
          trend={complianceRate >= 80 ? 'up' : complianceRate >= 60 ? 'neutral' : 'down'}
          change={complianceRate >= 80 ? 10 : complianceRate >= 60 ? 0 : -5}
        />
        
        <MetricCard
          title="Rata-rata Kalori"
          value={`${avgNutritionScore.toFixed(0)} kal`}
          icon={<Activity className="h-6 w-6 text-warning" />}
          description="Per hari"
          trend="neutral"
        />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="nutrition" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nutrition">Nutrisi</TabsTrigger>
          <TabsTrigger value="cost">Biaya</TabsTrigger>
          <TabsTrigger value="variety">Variasi</TabsTrigger>
          <TabsTrigger value="compliance">Kepatuhan</TabsTrigger>
        </TabsList>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          {/* Nutrition by Meal Type */}
          <Card>
            <CardHeader>
              <CardTitle>Kandungan Gizi per Jenis Makanan</CardTitle>
              <CardDescription>
                Analisis nutrisi berdasarkan kategori makanan (Sarapan, Snack, Makan Siang, Makan Malam)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={nutritionByMealType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="mealType" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar 
                    dataKey="avgCalories" 
                    name="Kalori (kal)" 
                    fill={COLORS.primary}
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="avgProtein" 
                    name="Protein (g)" 
                    fill={COLORS.success}
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="avgCarbs" 
                    name="Karbohidrat (g)" 
                    fill={COLORS.warning}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Nutrition Trend by Day */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Nutrisi Harian</CardTitle>
              <CardDescription>
                Perkembangan kandungan gizi dari hari ke hari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutritionByDay.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="totalCalories" 
                    name="Kalori"
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalProtein" 
                    name="Protein"
                    stroke={COLORS.success} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.success, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Tab */}
        <TabsContent value="cost" className="space-y-4">
          {/* Cost by Meal Type */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Biaya per Jenis Makanan</CardTitle>
              <CardDescription>
                Analisis proporsi biaya berdasarkan kategori makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costByMealType.map(item => ({ ...item }))}
                      dataKey="totalCost"
                      nameKey="mealType"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {costByMealType.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={Object.values(MEAL_TYPE_COLORS)[index % Object.values(MEAL_TYPE_COLORS).length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {costByMealType.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ 
                            backgroundColor: Object.values(MEAL_TYPE_COLORS)[index % Object.values(MEAL_TYPE_COLORS).length] 
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{item.mealType}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.mealCount} menu
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(item.totalCost)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Avg: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(item.avgCostPerMeal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Trend by Day */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Biaya Harian</CardTitle>
              <CardDescription>
                Perkembangan biaya dari hari ke hari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costByDay.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="totalCost" 
                    name="Total Biaya"
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="perBeneficiaryCost" 
                    name="Biaya per Penerima"
                    stroke={COLORS.success} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.success, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variety Tab */}
        <TabsContent value="variety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metrik Variasi Menu</CardTitle>
              <CardDescription>
                Analisis keragaman dan variasi menu dalam rencana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {varietyMetrics ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <p className="text-sm text-muted-foreground">Menu Unik</p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {varietyMetrics.uniqueMenus}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        dari {varietyMetrics.totalAssignments} total assignment
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <p className="text-sm text-muted-foreground">Tingkat Variasi</p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {varietyMetrics.varietyScore.toFixed(1)}%
                      </p>
                      <Badge 
                        variant={varietyMetrics.varietyScore >= 70 ? 'default' : 'secondary'}
                        className="mt-2"
                      >
                        {varietyMetrics.varietyScore >= 70 ? 'Sangat Baik' : 'Perlu Ditingkatkan'}
                      </Badge>
                    </div>
                    
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <p className="text-sm text-muted-foreground">Keragaman Bahan</p>
                      <p className="text-lg font-semibold text-foreground mt-2">
                        {varietyMetrics.ingredientDiversity.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keragaman bahan makanan
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Rekomendasi Variasi</h4>
                    <ul className="space-y-2">
                      {varietyMetrics.varietyScore < 70 && (
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-warning">⚠️</span>
                          <span>Tingkatkan variasi menu dengan menambahkan menu baru yang berbeda</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-success">✓</span>
                        <span>Pertahankan keseimbangan antara menu favorit dan variasi baru</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-info">ℹ️</span>
                        <span>Pastikan setiap jenis makanan memiliki variasi yang cukup</span>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    Data variasi menu belum tersedia
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Kepatuhan Nutrisi Harian</CardTitle>
              <CardDescription>
                Monitoring kepatuhan standar gizi per hari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceChecks.slice(0, 10).map((check, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={check.isCompliant ? 'default' : 'destructive'}
                        className="w-20"
                      >
                        {check.isCompliant ? 'Patuh' : 'Tidak'}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{check.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {check.isCompliant ? 'Memenuhi standar gizi' : 'Perlu penyesuaian'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>{check.mealTypesCovered} jenis makanan</p>
                      <p className="text-xs text-muted-foreground">
                        {check.proteinSufficient ? 'Protein cukup' : 'Protein kurang'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {complianceChecks.length === 0 && (
                <Alert>
                  <AlertDescription>
                    Belum ada data kepatuhan. Tambahkan assignment menu untuk melihat status kepatuhan.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
