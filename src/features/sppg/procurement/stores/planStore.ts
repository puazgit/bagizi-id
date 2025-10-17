/**
 * @fileoverview Zustand store for Procurement Plan UI state
 * @version Next.js 15.5.4 / Zustand v4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProcurementPlanFilters } from '../api/planApi'

// ============================================================================
// Types
// ============================================================================

interface PlanStore {
  // Filters
  filters: ProcurementPlanFilters
  setFilters: (filters: Partial<ProcurementPlanFilters>) => void
  resetFilters: () => void
  
  // UI State
  selectedPlanId: string | null
  setSelectedPlanId: (id: string | null) => void
  
  // View preferences
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  
  // Dialog states
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  
  // Sorting
  sortBy: 'planName' | 'planMonth' | 'totalBudget' | 'approvalStatus' | 'createdAt'
  sortOrder: 'asc' | 'desc'
  setSorting: (sortBy: PlanStore['sortBy'], sortOrder: 'asc' | 'desc') => void
}

// Default filters
const defaultFilters: ProcurementPlanFilters = {
  page: 1,
  limit: 12,
}

// ============================================================================
// Store
// ============================================================================

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      
      // UI State
      selectedPlanId: null,
      setSelectedPlanId: (id) => set({ selectedPlanId: id }),
      
      // View preferences
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Dialog states
      isCreateDialogOpen: false,
      setIsCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),
      
      isDeleteDialogOpen: false,
      setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
      
      // Sorting
      sortBy: 'createdAt',
      sortOrder: 'desc',
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    }),
    {
      name: 'procurement-plan-store',
      partialize: (state) => ({
        filters: state.filters,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const usePlanFilters = () => usePlanStore((state) => state.filters)
export const useSetPlanFilters = () => usePlanStore((state) => state.setFilters)
export const useResetPlanFilters = () => usePlanStore((state) => state.resetFilters)

export const useSelectedPlanId = () => usePlanStore((state) => state.selectedPlanId)
export const useSetSelectedPlanId = () => usePlanStore((state) => state.setSelectedPlanId)

export const usePlanViewMode = () => usePlanStore((state) => state.viewMode)
export const useSetPlanViewMode = () => usePlanStore((state) => state.setViewMode)

export const usePlanSorting = () => usePlanStore((state) => ({
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
}))
export const useSetPlanSorting = () => usePlanStore((state) => state.setSorting)
