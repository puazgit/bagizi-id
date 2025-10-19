/**
 * @fileoverview Cost Analysis Helper Functions
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Helper functions for cost calculation and analysis across distribution lifecycle:
 * - Production cost aggregation (FoodProduction)
 * - Distribution cost aggregation (FoodDistribution)
 * - Schedule cost aggregation (DistributionSchedule)
 * - Variance calculation
 * - Cost per portion analysis
 */

import type { CostBreakdown } from '../components/CostAnalysisCard'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Raw production cost data from database
 */
export interface ProductionCostData {
  estimatedCost: number
  actualCost: number | null
  costPerPortion: number | null
  plannedPortions: number
}

/**
 * Raw distribution cost data from database
 */
export interface DistributionCostData {
  transportCost: number | null
  fuelCost: number | null
  otherCosts: number | null
}

/**
 * Raw schedule cost data from database
 */
export interface ScheduleCostData {
  packagingCost: number | null
  fuelCost: number | null
  totalPortions: number
  estimatedBeneficiaries: number
}

/**
 * Combined cost data for execution (production + distribution + schedule)
 */
export interface ExecutionCostData {
  production: ProductionCostData | null
  distribution: DistributionCostData | null
  schedule: ScheduleCostData | null
}

// ============================================================================
// Cost Calculation Functions
// ============================================================================

/**
 * Calculate total production cost
 */
export function calculateProductionCost(production: ProductionCostData | null): {
  estimated: number
  actual: number | null
  costPerPortion: number | null
} {
  if (!production) {
    return {
      estimated: 0,
      actual: null,
      costPerPortion: null,
    }
  }

  return {
    estimated: production.estimatedCost,
    actual: production.actualCost,
    costPerPortion: production.costPerPortion,
  }
}

/**
 * Calculate total distribution cost from multiple sources
 */
export function calculateDistributionCost(
  distribution: DistributionCostData | null,
  schedule: ScheduleCostData | null
): {
  transport: number | null
  fuel: number | null
  packaging: number | null
  other: number | null
} {
  return {
    transport: distribution?.transportCost || null,
    fuel: 
      (distribution?.fuelCost || 0) + (schedule?.fuelCost || 0) > 0
        ? (distribution?.fuelCost || 0) + (schedule?.fuelCost || 0)
        : null,
    packaging: schedule?.packagingCost || null,
    other: distribution?.otherCosts || null,
  }
}

/**
 * Build complete cost breakdown from execution data
 */
export function buildCostBreakdown(data: ExecutionCostData): CostBreakdown {
  const production = calculateProductionCost(data.production)
  const distribution = calculateDistributionCost(data.distribution, data.schedule)

  return {
    production,
    distribution,
    schedule: data.schedule
      ? {
          totalPortions: data.schedule.totalPortions,
          estimatedBeneficiaries: data.schedule.estimatedBeneficiaries,
        }
      : undefined,
  }
}

/**
 * Calculate cost variance between estimated and actual
 */
export function calculateCostVariance(
  estimated: number,
  actual: number | null
): {
  amount: number
  percentage: number
  isOverBudget: boolean
} | null {
  if (actual === null || actual === undefined) {
    return null
  }

  const amount = actual - estimated
  const percentage = estimated > 0 ? (amount / estimated) * 100 : 0

  return {
    amount,
    percentage,
    isOverBudget: amount > 0,
  }
}

/**
 * Calculate cost per beneficiary
 */
export function calculateCostPerBeneficiary(
  totalCost: number,
  beneficiaryCount: number
): number {
  if (beneficiaryCount === 0) return 0
  return totalCost / beneficiaryCount
}

/**
 * Calculate cost efficiency metrics
 */
export function calculateCostEfficiency(costs: CostBreakdown): {
  costPerPortion: number
  costPerBeneficiary: number
  productionEfficiency: number // % of total
  distributionEfficiency: number // % of total
} {
  const totalProduction = costs.production.actual || costs.production.estimated
  const totalDistribution =
    (costs.distribution.transport || 0) +
    (costs.distribution.fuel || 0) +
    (costs.distribution.packaging || 0) +
    (costs.distribution.other || 0)

  const grandTotal = totalProduction + totalDistribution
  const totalPortions = costs.schedule?.totalPortions || 1
  const totalBeneficiaries = costs.schedule?.estimatedBeneficiaries || 1

  return {
    costPerPortion: grandTotal / totalPortions,
    costPerBeneficiary: grandTotal / totalBeneficiaries,
    productionEfficiency: grandTotal > 0 ? (totalProduction / grandTotal) * 100 : 0,
    distributionEfficiency: grandTotal > 0 ? (totalDistribution / grandTotal) * 100 : 0,
  }
}

/**
 * Format currency in Indonesian Rupiah
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rp 0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Get budget status label and color
 */
export function getBudgetStatus(variance: number): {
  label: string
  color: 'success' | 'warning' | 'error'
} {
  if (variance === 0) {
    return { label: 'Sesuai Budget', color: 'success' }
  }

  if (variance > 0) {
    if (variance > 10) {
      return { label: 'Jauh Over Budget', color: 'error' }
    }
    return { label: 'Sedikit Over Budget', color: 'warning' }
  }

  return { label: 'Under Budget', color: 'success' }
}

// ============================================================================
// Cost Comparison Functions
// ============================================================================

/**
 * Compare costs between two periods
 */
export function compareCosts(
  current: CostBreakdown,
  previous: CostBreakdown
): {
  productionChange: number
  distributionChange: number
  totalChange: number
  changePercentage: number
} {
  const currentProduction = current.production.actual || current.production.estimated
  const previousProduction = previous.production.actual || previous.production.estimated

  const currentDistribution =
    (current.distribution.transport || 0) +
    (current.distribution.fuel || 0) +
    (current.distribution.packaging || 0) +
    (current.distribution.other || 0)

  const previousDistribution =
    (previous.distribution.transport || 0) +
    (previous.distribution.fuel || 0) +
    (previous.distribution.packaging || 0) +
    (previous.distribution.other || 0)

  const currentTotal = currentProduction + currentDistribution
  const previousTotal = previousProduction + previousDistribution

  const totalChange = currentTotal - previousTotal
  const changePercentage = previousTotal > 0 ? (totalChange / previousTotal) * 100 : 0

  return {
    productionChange: currentProduction - previousProduction,
    distributionChange: currentDistribution - previousDistribution,
    totalChange,
    changePercentage,
  }
}

/**
 * Calculate cost trends over multiple periods
 */
export function calculateCostTrends(
  costHistory: CostBreakdown[]
): {
  trend: 'increasing' | 'decreasing' | 'stable'
  averageCost: number
  highestCost: number
  lowestCost: number
} {
  if (costHistory.length === 0) {
    return {
      trend: 'stable',
      averageCost: 0,
      highestCost: 0,
      lowestCost: 0,
    }
  }

  const totals = costHistory.map((cost) => {
    const production = cost.production.actual || cost.production.estimated
    const distribution =
      (cost.distribution.transport || 0) +
      (cost.distribution.fuel || 0) +
      (cost.distribution.packaging || 0) +
      (cost.distribution.other || 0)
    return production + distribution
  })

  const averageCost = totals.reduce((sum, val) => sum + val, 0) / totals.length
  const highestCost = Math.max(...totals)
  const lowestCost = Math.min(...totals)

  // Determine trend (simple linear regression)
  const firstHalf = totals.slice(0, Math.floor(totals.length / 2))
  const secondHalf = totals.slice(Math.floor(totals.length / 2))

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  const diff = secondAvg - firstAvg
  const threshold = firstAvg * 0.05 // 5% threshold

  if (diff > threshold) {
    trend = 'increasing'
  } else if (diff < -threshold) {
    trend = 'decreasing'
  }

  return {
    trend,
    averageCost,
    highestCost,
    lowestCost,
  }
}
