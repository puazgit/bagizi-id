/**
 * @fileoverview Procurement hooks barrel export
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * 
 * NOTE: Supplier hooks moved to independent domain
 * @see {@link @/features/sppg/suppliers/hooks} for supplier functionality
 */

// Procurement Plans & Orders Hooks
export * from './useProcurement'

// Note: useProcurementPlans.ts is NOT exported to avoid naming conflicts
// It contains enhanced Plan-specific hooks used internally by components
// The main hooks are in useProcurement.ts

// Statistics & Analytics Hooks
export * from './useStatistics'
