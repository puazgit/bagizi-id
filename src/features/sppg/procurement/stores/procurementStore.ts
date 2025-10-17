/**
 * @fileoverview Procurement Zustand store - SPPG procurement state management
 * @version Next.js 15.5.4 / Zustand / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { 
  ProcurementPlan,
  Procurement,
  ProcurementFilters
} from '../types'

// ================================ STATE INTERFACE ================================

interface ProcurementState {
  // Selected items
  selectedPlanId: string | null
  selectedProcurementId: string | null
  
  // Filters
  filters: Partial<ProcurementFilters>
  searchQuery: string
  
  // UI state
  isFormOpen: boolean
  isPlanFormOpen: boolean
  formMode: 'create' | 'edit'
  editingItem: ProcurementPlan | Procurement | null
  
  // View preferences
  viewMode: 'list' | 'grid' | 'table'
  sortBy: 'date' | 'amount' | 'supplier' | 'status'
  sortOrder: 'asc' | 'desc'
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // Actions - Selection
  setSelectedPlan: (planId: string | null) => void
  setSelectedProcurement: (procurementId: string | null) => void
  
  // Actions - Filters
  setFilters: (filters: Partial<ProcurementFilters>) => void
  updateFilter: (key: keyof ProcurementFilters, value: unknown) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  
  // Actions - Form
  openCreateForm: () => void
  openEditForm: (item: ProcurementPlan | Procurement) => void
  closeForm: () => void
  openCreatePlanForm: () => void
  openEditPlanForm: (plan: ProcurementPlan) => void
  closePlanForm: () => void
  
  // Actions - View
  setViewMode: (mode: 'list' | 'grid' | 'table') => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  
  // Actions - Pagination
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  
  // Actions - Utility
  reset: () => void
}

// ================================ INITIAL STATE ================================

const initialState = {
  selectedPlanId: null,
  selectedProcurementId: null,
  filters: {},
  searchQuery: '',
  isFormOpen: false,
  isPlanFormOpen: false,
  formMode: 'create' as const,
  editingItem: null,
  viewMode: 'table' as const,
  sortBy: 'date' as const,
  sortOrder: 'desc' as const,
  currentPage: 1,
  itemsPerPage: 20,
}

// ================================ STORE DEFINITION ================================

/**
 * SPPG Procurement store with enterprise patterns
 */
export const useProcurementStore = create<ProcurementState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        // Initial state
        ...initialState,

        // Selection actions
        setSelectedPlan: (planId) =>
          set((state) => {
            state.selectedPlanId = planId
          }),

        setSelectedProcurement: (procurementId) =>
          set((state) => {
            state.selectedProcurementId = procurementId
          }),

        // Filter actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = filters
            state.currentPage = 1 // Reset to first page
          }),

        updateFilter: (key, value) =>
          set((state) => {
            state.filters = { ...state.filters, [key]: value }
            state.currentPage = 1
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {}
            state.searchQuery = ''
            state.currentPage = 1
          }),

        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query
            state.currentPage = 1
          }),

        // Form actions
        openCreateForm: () =>
          set((state) => {
            state.isFormOpen = true
            state.formMode = 'create'
            state.editingItem = null
          }),

        openEditForm: (item) =>
          set((state) => {
            state.isFormOpen = true
            state.formMode = 'edit'
            state.editingItem = item
          }),

        closeForm: () =>
          set((state) => {
            state.isFormOpen = false
            state.editingItem = null
          }),

        openCreatePlanForm: () =>
          set((state) => {
            state.isPlanFormOpen = true
            state.formMode = 'create'
            state.editingItem = null
          }),

        openEditPlanForm: (plan) =>
          set((state) => {
            state.isPlanFormOpen = true
            state.formMode = 'edit'
            state.editingItem = plan
          }),

        closePlanForm: () =>
          set((state) => {
            state.isPlanFormOpen = false
            state.editingItem = null
          }),

        // View actions
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode
          }),

        setSorting: (sortBy, sortOrder) =>
          set((state) => {
            state.sortBy = sortBy as 'date' | 'amount' | 'supplier' | 'status'
            state.sortOrder = sortOrder
          }),

        // Pagination actions
        setCurrentPage: (page) =>
          set((state) => {
            state.currentPage = page
          }),

        setItemsPerPage: (count) =>
          set((state) => {
            state.itemsPerPage = count
            state.currentPage = 1
          }),

        // Reset to initial state
        reset: () =>
          set((state) => {
            Object.assign(state, initialState)
          }),
      }))
    ),
    {
      name: 'sppg-procurement-store'
    }
  )
)

// ================================ SELECTORS ================================

/**
 * Procurement selectors for optimized component updates
 */
export const procurementSelectors = {
  // Selection
  selectedPlanId: (state: ProcurementState) => state.selectedPlanId,
  selectedProcurementId: (state: ProcurementState) => state.selectedProcurementId,
  
  // Filters
  filters: (state: ProcurementState) => state.filters,
  searchQuery: (state: ProcurementState) => state.searchQuery,
  hasActiveFilters: (state: ProcurementState) => 
    Object.keys(state.filters).length > 0 || state.searchQuery.length > 0,
  
  // Form state
  isFormOpen: (state: ProcurementState) => state.isFormOpen,
  isPlanFormOpen: (state: ProcurementState) => state.isPlanFormOpen,
  formMode: (state: ProcurementState) => state.formMode,
  editingItem: (state: ProcurementState) => state.editingItem,
  
  // View preferences
  viewMode: (state: ProcurementState) => state.viewMode,
  sortBy: (state: ProcurementState) => state.sortBy,
  sortOrder: (state: ProcurementState) => state.sortOrder,
  
  // Pagination
  currentPage: (state: ProcurementState) => state.currentPage,
  itemsPerPage: (state: ProcurementState) => state.itemsPerPage,
  
  // Computed
  isCreating: (state: ProcurementState) => 
    (state.isFormOpen || state.isPlanFormOpen) && state.formMode === 'create',
  isEditing: (state: ProcurementState) => 
    (state.isFormOpen || state.isPlanFormOpen) && state.formMode === 'edit',
}

// ================================ HOOKS ================================

/**
 * Hook to use procurement store with selector
 */
export function useProcurementSelector<T>(
  selector: (state: ProcurementState) => T
): T {
  return useProcurementStore(selector)
}
