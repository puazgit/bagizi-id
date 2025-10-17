/**
 * @fileoverview Procurement Statistics & Analytics Hooks - TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { statisticsApi } from '../api'

// ================================ TYPES ================================

export interface DateRangeFilter {
  dateFrom?: Date
  dateTo?: Date
}

// ================================ QUERY KEY FACTORY ================================

/**
 * Query key factory for statistics
 */
export const statisticsKeys = {
  all: ['procurement', 'statistics'] as const,
  overview: (filters?: DateRangeFilter) => 
    [...statisticsKeys.all, 'overview', { filters }] as const,
  status: () => 
    [...statisticsKeys.all, 'status'] as const,
  suppliers: () => 
    [...statisticsKeys.all, 'suppliers'] as const,
  trends: () => 
    [...statisticsKeys.all, 'trends'] as const,
  categories: () => 
    [...statisticsKeys.all, 'categories'] as const,
  delivery: () => 
    [...statisticsKeys.all, 'delivery'] as const,
  payment: () => 
    [...statisticsKeys.all, 'payment'] as const,
  budget: () => 
    [...statisticsKeys.all, 'budget'] as const,
}

// ================================ STATISTICS QUERY HOOKS ================================

/**
 * Hook to fetch comprehensive procurement statistics
 */
export function useStatistics(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: statisticsKeys.overview(filters),
    queryFn: () => statisticsApi.getStatistics(filters?.dateFrom, filters?.dateTo),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes - statistics are relatively static
  })
}

/**
 * Hook to fetch procurement overview
 */
export function useOverview() {
  return useQuery({
    queryKey: statisticsKeys.overview(),
    queryFn: () => statisticsApi.getOverview(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch status breakdown
 */
export function useStatusBreakdown() {
  return useQuery({
    queryKey: statisticsKeys.status(),
    queryFn: () => statisticsApi.getStatusBreakdown(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 3, // 3 minutes
  })
}

/**
 * Hook to fetch top performing suppliers
 */
export function useTopSuppliers() {
  return useQuery({
    queryKey: statisticsKeys.suppliers(),
    queryFn: () => statisticsApi.getTopSuppliers(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes - less dynamic
  })
}

/**
 * Hook to fetch monthly procurement trends
 */
export function useMonthlyTrends() {
  return useQuery({
    queryKey: statisticsKeys.trends(),
    queryFn: () => statisticsApi.getMonthlyTrends(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 15, // 15 minutes - historical data
  })
}

/**
 * Hook to fetch category breakdown
 */
export function useCategoryBreakdown() {
  return useQuery({
    queryKey: statisticsKeys.categories(),
    queryFn: () => statisticsApi.getCategoryBreakdown(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch delivery performance metrics
 */
export function useDeliveryMetrics() {
  return useQuery({
    queryKey: statisticsKeys.delivery(),
    queryFn: () => statisticsApi.getDeliveryMetrics(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch payment status metrics
 */
export function usePaymentMetrics() {
  return useQuery({
    queryKey: statisticsKeys.payment(),
    queryFn: () => statisticsApi.getPaymentMetrics(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch budget utilization
 */
export function useBudgetUtilization() {
  return useQuery({
    queryKey: statisticsKeys.budget(),
    queryFn: () => statisticsApi.getBudgetUtilization(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
