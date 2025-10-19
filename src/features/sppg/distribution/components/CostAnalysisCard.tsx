/**
 * @fileoverview Cost Analysis Card Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_WORKFLOW_COMPLETE.md} Distribution Workflow
 * 
 * @description
 * Displays comprehensive cost breakdown and analysis for distributions including:
 * - Production costs (estimated vs actual)
 * - Distribution costs (transport, fuel, packaging, other)
 * - Cost per portion analysis
 * - Budget variance analysis
 * - Cost trend visualization
 */

'use client'

import { useMemo, useState } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Package,
  Truck,
  Fuel,
  Calculator,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export interface CostBreakdown {
  // Production Costs
  production: {
    estimated: number
    actual: number | null
    costPerPortion: number | null
  }
  
  // Distribution Costs
  distribution: {
    transport: number | null
    fuel: number | null
    packaging: number | null
    other: number | null
  }
  
  // Schedule Info (for context)
  schedule?: {
    totalPortions: number
    estimatedBeneficiaries: number
  }
}

interface CostAnalysisCardProps {
  costs: CostBreakdown
  showVariance?: boolean
  showDetails?: boolean
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format currency in Indonesian Rupiah
 */
function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rp 0'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate total distribution costs
 */
function calculateDistributionTotal(distribution: CostBreakdown['distribution']): number {
  return (
    (distribution.transport || 0) +
    (distribution.fuel || 0) +
    (distribution.packaging || 0) +
    (distribution.other || 0)
  )
}

/**
 * Calculate variance percentage
 */
function calculateVariance(estimated: number, actual: number | null): {
  amount: number
  percentage: number
  isOver: boolean
} | null {
  if (actual === null || actual === undefined) return null
  
  const amount = actual - estimated
  const percentage = estimated > 0 ? (amount / estimated) * 100 : 0
  
  return {
    amount,
    percentage,
    isOver: amount > 0,
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function CostAnalysisCard({
  costs,
  showVariance = true,
  showDetails = true,
  className,
}: CostAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Calculate totals
  const totals = useMemo(() => {
    const distributionTotal = calculateDistributionTotal(costs.distribution)
    const productionActual = costs.production.actual || costs.production.estimated
    const grandTotal = productionActual + distributionTotal
    
    // Calculate cost per portion
    const totalPortions = costs.schedule?.totalPortions || 1
    const costPerPortion = grandTotal / totalPortions
    
    // Calculate variance
    const variance = calculateVariance(costs.production.estimated, costs.production.actual)
    
    return {
      production: productionActual,
      distribution: distributionTotal,
      grandTotal,
      costPerPortion,
      variance,
    }
  }, [costs])
  
  // Determine budget status
  const budgetStatus = useMemo(() => {
    if (!totals.variance) {
      return { label: 'Dalam Estimasi', variant: 'secondary' as const, icon: Calculator }
    }
    
    if (totals.variance.isOver) {
      if (totals.variance.percentage > 10) {
        return { label: 'Over Budget', variant: 'destructive' as const, icon: TrendingUp }
      }
      return { label: 'Mendekati Batas', variant: 'default' as const, icon: AlertCircle }
    }
    
    return { label: 'Under Budget', variant: 'outline' as const, icon: TrendingDown }
  }, [totals.variance])
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Analisis Biaya
            </CardTitle>
            <CardDescription>
              Rincian biaya produksi dan distribusi
            </CardDescription>
          </div>
          
          {showVariance && totals.variance && (
            <Badge variant={budgetStatus.variant} className="gap-1.5">
              <budgetStatus.icon className="h-3 w-3" />
              {budgetStatus.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Grand Total */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total Biaya
            </span>
            <span className="text-2xl font-bold">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>
          
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">
              Biaya per Porsi
            </span>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(totals.costPerPortion)}
            </span>
          </div>
          
          {costs.schedule && (
            <div className="text-xs text-muted-foreground">
              {costs.schedule.totalPortions.toLocaleString('id-ID')} porsi untuk{' '}
              {costs.schedule.estimatedBeneficiaries.toLocaleString('id-ID')} penerima
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Cost Breakdown Summary */}
        <div className="space-y-3">
          {/* Production Costs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Biaya Produksi</span>
            </div>
            <span className="text-sm font-semibold">
              {formatCurrency(totals.production)}
            </span>
          </div>
          
          {/* Production Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={(totals.production / totals.grandTotal) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {((totals.production / totals.grandTotal) * 100).toFixed(1)}% dari total
              </span>
              {costs.production.actual && (
                <span>
                  Estimasi: {formatCurrency(costs.production.estimated)}
                </span>
              )}
            </div>
          </div>
          
          {/* Distribution Costs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Biaya Distribusi</span>
            </div>
            <span className="text-sm font-semibold">
              {formatCurrency(totals.distribution)}
            </span>
          </div>
          
          {/* Distribution Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={(totals.distribution / totals.grandTotal) * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {((totals.distribution / totals.grandTotal) * 100).toFixed(1)}% dari total
            </div>
          </div>
        </div>
        
        {/* Variance Analysis */}
        {showVariance && totals.variance && (
          <>
            <Separator />
            
            <div className={cn(
              "rounded-lg p-4 space-y-2",
              totals.variance.isOver 
                ? "bg-destructive/10 dark:bg-destructive/5"
                : "bg-green-500/10 dark:bg-green-500/5"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Selisih Budget
                </span>
                <div className="flex items-center gap-2">
                  {totals.variance.isOver ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  <span className={cn(
                    "text-sm font-bold",
                    totals.variance.isOver 
                      ? "text-destructive" 
                      : "text-green-600 dark:text-green-400"
                  )}>
                    {totals.variance.isOver ? '+' : ''}
                    {formatCurrency(Math.abs(totals.variance.amount))}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {totals.variance.isOver ? 'Lebih tinggi' : 'Lebih rendah'} dari estimasi
                </span>
                <span className={cn(
                  "font-semibold",
                  totals.variance.isOver 
                    ? "text-destructive" 
                    : "text-green-600 dark:text-green-400"
                )}>
                  {totals.variance.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* Detailed Breakdown (Collapsible) */}
        {showDetails && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium">Rincian Detail</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-4 space-y-4">
              <Separator />
              
              {/* Production Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Detail Biaya Produksi</span>
                </div>
                
                <div className="pl-6 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimasi Awal</span>
                    <span className="font-medium">
                      {formatCurrency(costs.production.estimated)}
                    </span>
                  </div>
                  
                  {costs.production.actual && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya Aktual</span>
                      <span className="font-medium">
                        {formatCurrency(costs.production.actual)}
                      </span>
                    </div>
                  )}
                  
                  {costs.production.costPerPortion && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per Porsi</span>
                      <span className="font-medium text-primary">
                        {formatCurrency(costs.production.costPerPortion)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Distribution Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Detail Biaya Distribusi</span>
                </div>
                
                <div className="pl-6 space-y-1.5 text-sm">
                  {costs.distribution.transport !== null && costs.distribution.transport > 0 && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Transportasi</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(costs.distribution.transport)}
                      </span>
                    </div>
                  )}
                  
                  {costs.distribution.fuel !== null && costs.distribution.fuel > 0 && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Bahan Bakar</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(costs.distribution.fuel)}
                      </span>
                    </div>
                  )}
                  
                  {costs.distribution.packaging !== null && costs.distribution.packaging > 0 && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Kemasan</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(costs.distribution.packaging)}
                      </span>
                    </div>
                  )}
                  
                  {costs.distribution.other !== null && costs.distribution.other > 0 && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Lainnya</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(costs.distribution.other)}
                      </span>
                    </div>
                  )}
                  
                  {totals.distribution === 0 && (
                    <div className="text-xs text-muted-foreground italic">
                      Belum ada biaya distribusi tercatat
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
