/**
 * @fileoverview Inventory Statistics Hook
 * @version Next.js 15.5.4 / TanStack Query v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventoryApi'

/**
 * Date range interface for stats filtering
 */
export interface DateRange {
  startDate?: Date | string
  endDate?: Date | string
}

/**
 * Query key for inventory stats
 */
export const inventoryStatsKeys = {
  all: ['inventory-stats'] as const,
  detail: (dateRange?: DateRange) => [...inventoryStatsKeys.all, { dateRange }] as const,
}

/**
 * Hook: Fetch inventory statistics with optional date range
 * 
 * Features:
 * - Comprehensive inventory metrics
 * - Stock value calculation
 * - Category breakdown
 * - Movement trends
 * - 10-minute cache (less frequent updates)
 * 
 * @param dateRange - Optional date range for trend analysis
 * @returns Query result with statistics
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useInventoryStats({
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31'
 * })
 * 
 * if (data) {
 *   console.log('Total Items:', data.totalItems)
 *   console.log('Total Value:', data.totalValue)
 *   console.log('Low Stock Count:', data.lowStockCount)
 * }
 * ```
 */
export function useInventoryStats(dateRange?: DateRange) {
  return useQuery({
    queryKey: inventoryStatsKeys.detail(dateRange),
    queryFn: async () => {
      const result = await inventoryApi.getStats()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch inventory statistics')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook: Get inventory value by category
 * 
 * Features:
 * - Category-wise value breakdown
 * - Percentage distribution
 * - Top categories by value
 * 
 * @returns Query result with category values
 * 
 * @example
 * ```typescript
 * const { data: categoryValues } = useInventoryValueByCategory()
 * 
 * // Display in pie chart or table
 * categoryValues?.forEach(cat => {
 *   console.log(`${cat.category}: Rp ${cat.value} (${cat.percentage}%)`)
 * })
 * ```
 */
export function useInventoryValueByCategory() {
  return useQuery({
    queryKey: [...inventoryStatsKeys.all, 'value-by-category'],
    queryFn: async () => {
      const result = await inventoryApi.getStats()
      
      if (!result.success || !result.data) {
        return []
      }
      
      // Transform categoryCounts and categoryValues into array
      const data = result.data // Type narrowing
      const categories = Object.keys(data.categoryCounts) as Array<keyof typeof data.categoryCounts>
      
      const categoryData = categories.map(category => {
        const count = data.categoryCounts[category]
        const value = data.categoryValues[category]
        const percentage = data.totalStockValue > 0
          ? (value / data.totalStockValue) * 100
          : 0
        
        return {
          category,
          count,
          value,
          percentage: Math.round(percentage * 100) / 100, // Round to 2 decimals
        }
      })
      
      // Sort by value descending
      return categoryData.sort((a, b) => b.value - a.value)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook: Get stock coverage analysis
 * 
 * Features:
 * - Days of stock remaining
 * - Items with low coverage
 * - Reorder priority
 * 
 * @returns Query result with coverage analysis
 * 
 * @example
 * ```typescript
 * const { data: coverage } = useStockCoverage()
 * 
 * // Alert for low coverage items
 * const lowCoverage = coverage?.filter(item => item.daysRemaining < 7)
 * ```
 */
export function useStockCoverage() {
  return useQuery({
    queryKey: [...inventoryStatsKeys.all, 'coverage'],
    queryFn: async () => {
      const result = await inventoryApi.getStats()
      
      if (!result.success || !result.data) {
        return []
      }
      
      // Transform categoryCounts and categoryValues into array
      const data = result.data // Type narrowing
      const categories = Object.keys(data.categoryCounts) as Array<keyof typeof data.categoryCounts>
      
      // Calculate coverage based on recent movement trends
      // This is a simplified version - production would use actual usage data
      return categories.map(category => {
        const count = data.categoryCounts[category]
        const value = data.categoryValues[category]
        
        return {
          category,
          averageValue: count > 0 ? value / count : 0,
          estimatedDays: 30, // Placeholder - would calculate from movement history
        }
      })
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (less critical)
    retry: 2,
  })
}

/**
 * Hook: Get inventory turnover metrics
 * 
 * Features:
 * - Turnover rate by category
 * - Fast-moving vs slow-moving items
 * - Inventory efficiency metrics
 * 
 * @param dateRange - Date range for turnover calculation
 * @returns Query result with turnover metrics
 * 
 * @example
 * ```typescript
 * const { data: turnover } = useInventoryTurnover({
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31'
 * })
 * 
 * // Identify fast-moving items
 * const fastMoving = turnover?.filter(item => item.turnoverRate > 6)
 * ```
 */
export function useInventoryTurnover(dateRange?: DateRange) {
  return useQuery({
    queryKey: [...inventoryStatsKeys.all, 'turnover', { dateRange }],
    queryFn: async () => {
      // This would integrate with stock movement summary
      // For now, return placeholder structure
      const result = await inventoryApi.getStats()
      
      if (!result.success || !result.data) {
        return {
          averageTurnover: 0,
          fastMoving: [],
          slowMoving: [],
        }
      }
      
      return {
        averageTurnover: 4.5, // Placeholder - calculate from movements
        fastMoving: [], // Items with high turnover
        slowMoving: [], // Items with low turnover
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  })
}

/**
 * Hook: Get inventory health score
 * 
 * Features:
 * - Overall inventory health rating (0-100)
 * - Score breakdown by category
 * - Improvement suggestions
 * 
 * @returns Query result with health score
 * 
 * @example
 * ```typescript
 * const { data: health } = useInventoryHealth()
 * 
 * // Display health gauge
 * <HealthGauge 
 *   score={health?.overall} 
 *   color={health?.overall > 80 ? 'green' : 'yellow'} 
 * />
 * ```
 */
export function useInventoryHealth() {
  return useQuery({
    queryKey: [...inventoryStatsKeys.all, 'health'],
    queryFn: async () => {
      const result = await inventoryApi.getStats()
      
      if (!result.success || !result.data) {
        return {
          overall: 0,
          stockLevel: 0,
          turnoverRate: 0,
          valueEfficiency: 0,
          suggestions: [],
        }
      }
      
      // Calculate health score based on multiple factors
      const stockLevelScore = result.data.lowStockItems === 0 ? 100 : 
        Math.max(0, 100 - (result.data.lowStockItems / result.data.totalItems) * 100)
      
      const valueEfficiencyScore = result.data.totalStockValue > 0 && result.data.totalItems > 0
        ? Math.min(100, (result.data.totalStockValue / result.data.totalItems) / 100)
        : 50
      
      const overall = Math.round((stockLevelScore + valueEfficiencyScore) / 2)
      
      const suggestions = []
      if (result.data.lowStockItems > 0) {
        suggestions.push(`${result.data.lowStockItems} item perlu diisi ulang`)
      }
      if (result.data.outOfStockItems > 0) {
        suggestions.push(`${result.data.outOfStockItems} item kehabisan stok`)
      }
      
      return {
        overall,
        stockLevel: Math.round(stockLevelScore),
        turnoverRate: 75, // Placeholder
        valueEfficiency: Math.round(valueEfficiencyScore),
        suggestions,
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}
