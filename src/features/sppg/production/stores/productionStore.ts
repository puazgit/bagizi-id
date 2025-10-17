/**
 * @fileoverview Production Zustand store - SPPG production state management
 * @version Next.js 15.5.4 / Zustand / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { ProductionStatus } from '../types'

// ================================ STATE INTERFACE ================================

interface ProductionState {
  // Selected items
  selectedProductionId: string | null
  
  // Filters
  filterState: {
    search?: string
    status?: ProductionStatus
    menuId?: string
    programId?: string
    startDate?: Date
    endDate?: Date
  }
  
  // UI state
  viewMode: 'list' | 'grid'
  sortBy: 'date' | 'status' | 'portions' | 'cost'
  sortOrder: 'asc' | 'desc'
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // Actions - Selection
  setSelectedProduction: (productionId: string | null) => void
  clearSelectedProduction: () => void
  
  // Actions - Filters
  updateFilters: (filters: Partial<ProductionState['filterState']>) => void
  clearFilters: () => void
  setSearch: (search: string) => void
  
  // Actions - View
  setViewMode: (mode: 'list' | 'grid') => void
  setSorting: (sortBy: ProductionState['sortBy'], sortOrder: 'asc' | 'desc') => void
  
  // Actions - Pagination
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  
  // Actions - Utility
  resetStore: () => void
}

// ================================ INITIAL STATE ================================

const initialState = {
  selectedProductionId: null,
  filterState: {},
  viewMode: 'list' as const,
  sortBy: 'date' as const,
  sortOrder: 'desc' as const,
  currentPage: 1,
  itemsPerPage: 20,
}

// ================================ STORE DEFINITION ================================

/**
 * SPPG Production store with enterprise patterns
 * Persists filterState and viewMode to localStorage
 */
export const useProductionStore = create<ProductionState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          // Initial state
          ...initialState,

          // Selection actions
          setSelectedProduction: (productionId) =>
            set((state) => {
              state.selectedProductionId = productionId
            }, false, 'setSelectedProduction'),

          clearSelectedProduction: () =>
            set((state) => {
              state.selectedProductionId = null
            }, false, 'clearSelectedProduction'),

          // Filter actions
          updateFilters: (filters) =>
            set((state) => {
              state.filterState = { ...state.filterState, ...filters }
              state.currentPage = 1 // Reset to first page when filters change
            }, false, 'updateFilters'),

          clearFilters: () =>
            set((state) => {
              state.filterState = {}
              state.currentPage = 1
            }, false, 'clearFilters'),

          setSearch: (search) =>
            set((state) => {
              state.filterState.search = search
              state.currentPage = 1
            }, false, 'setSearch'),

          // View actions
          setViewMode: (mode) =>
            set((state) => {
              state.viewMode = mode
            }, false, 'setViewMode'),

          setSorting: (sortBy, sortOrder) =>
            set((state) => {
              state.sortBy = sortBy
              state.sortOrder = sortOrder
            }, false, 'setSorting'),

          // Pagination actions
          setCurrentPage: (page) =>
            set((state) => {
              state.currentPage = page
            }, false, 'setCurrentPage'),

          setItemsPerPage: (count) =>
            set((state) => {
              state.itemsPerPage = count
              state.currentPage = 1 // Reset to first page
            }, false, 'setItemsPerPage'),

          // Utility actions
          resetStore: () =>
            set({ ...initialState }, false, 'resetStore'),
        }))
      ),
      {
        name: 'bagizi-production-store', // localStorage key
        // Only persist these keys
        partialize: (state) => ({
          filterState: state.filterState,
          viewMode: state.viewMode,
        }),
      }
    ),
    {
      name: 'ProductionStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// ================================ STORE SELECTORS ================================

/**
 * Selector hooks for optimized re-renders
 */

/**
 * Get selected production ID
 */
export const useSelectedProductionId = () =>
  useProductionStore((state) => state.selectedProductionId)

/**
 * Get current filters
 */
export const useProductionFilters = () =>
  useProductionStore((state) => state.filterState)

/**
 * Get search query
 */
export const useProductionSearch = () =>
  useProductionStore((state) => state.filterState.search || '')

/**
 * Get view mode
 */
export const useProductionViewMode = () =>
  useProductionStore((state) => state.viewMode)

/**
 * Get sorting configuration
 */
export const useProductionSorting = () =>
  useProductionStore((state) => ({
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  }))

/**
 * Get pagination configuration
 */
export const useProductionPagination = () =>
  useProductionStore((state) => ({
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
  }))

/**
 * Get filter actions
 */
export const useProductionFilterActions = () =>
  useProductionStore((state) => ({
    updateFilters: state.updateFilters,
    clearFilters: state.clearFilters,
    setSearch: state.setSearch,
  }))

/**
 * Get view actions
 */
export const useProductionViewActions = () =>
  useProductionStore((state) => ({
    setViewMode: state.setViewMode,
    setSorting: state.setSorting,
  }))

/**
 * Get pagination actions
 */
export const useProductionPaginationActions = () =>
  useProductionStore((state) => ({
    setCurrentPage: state.setCurrentPage,
    setItemsPerPage: state.setItemsPerPage,
  }))

/**
 * Check if any filters are active
 */
export const useHasActiveFilters = () =>
  useProductionStore((state) => {
    const { search, status, menuId, programId, startDate, endDate } = state.filterState
    return !!(search || status || menuId || programId || startDate || endDate)
  })
