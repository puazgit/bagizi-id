/**
 * @fileoverview Inventory Store - Client-side State Management
 * @version Next.js 15.5.4 / Zustand 4.x / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { InventoryFilters } from '../types'

/**
 * View Mode Type
 */
export type ViewMode = 'list' | 'grid'

/**
 * Sort Order Type
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Inventory Store State Interface
 */
interface InventoryStoreState {
  // ==================== Filters ====================
  filters: InventoryFilters
  setFilters: (filters: Partial<InventoryFilters>) => void
  resetFilters: () => void
  
  // ==================== Selection ====================
  selectedIds: Set<string>
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  getSelectedCount: () => number
  
  // ==================== View Preferences ====================
  viewMode: ViewMode
  sortBy: string
  sortOrder: SortOrder
  setViewMode: (mode: ViewMode) => void
  setSorting: (sortBy: string, order?: SortOrder) => void
  toggleSortOrder: () => void
  
  // ==================== Pagination ====================
  currentPage: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  resetPagination: () => void
  
  // ==================== Modal/Dialog State ====================
  isCreateOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  isStockMovementOpen: boolean
  editItemId: string | null
  deleteItemId: string | null
  stockMovementItemId: string | null
  
  openCreate: () => void
  openEdit: (id: string) => void
  openDelete: (id: string) => void
  openStockMovement: (id: string) => void
  closeAllModals: () => void
  
  // ==================== UI State ====================
  isFilterPanelOpen: boolean
  toggleFilterPanel: () => void
  setFilterPanelOpen: (open: boolean) => void
  
  // ==================== Bulk Operations ====================
  isBulkActionOpen: boolean
  bulkAction: 'delete' | 'export' | 'activate' | 'deactivate' | null
  openBulkAction: (action: 'delete' | 'export' | 'activate' | 'deactivate') => void
  closeBulkAction: () => void
  
  // ==================== Reset ====================
  resetStore: () => void
}

/**
 * Default filter values
 */
const defaultFilters: InventoryFilters = {
  category: undefined,
  stockStatus: 'ALL',
  storageLocation: undefined,
  supplierId: undefined,
  isActive: true,
  search: '',
}

/**
 * Default state values
 */
const defaultState = {
  // Filters
  filters: defaultFilters,
  
  // Selection
  selectedIds: new Set<string>(),
  
  // View preferences
  viewMode: 'list' as ViewMode,
  sortBy: 'itemName',
  sortOrder: 'asc' as SortOrder,
  
  // Pagination
  currentPage: 1,
  pageSize: 20,
  
  // Modals
  isCreateOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  isStockMovementOpen: false,
  editItemId: null,
  deleteItemId: null,
  stockMovementItemId: null,
  
  // UI state
  isFilterPanelOpen: false,
  
  // Bulk actions
  isBulkActionOpen: false,
  bulkAction: null,
}

/**
 * Inventory Store Hook
 * 
 * Features:
 * - Filter management with persistence
 * - Selection state for bulk operations
 * - View preferences (list/grid, sorting)
 * - Pagination state
 * - Modal state management
 * - UI state (filter panel)
 * - Bulk action management
 * - LocalStorage persistence for user preferences
 * 
 * @example
 * ```typescript
 * // Use in components
 * const { filters, setFilters, selectedIds, toggleSelection } = useInventoryStore()
 * 
 * // Update filters
 * setFilters({ category: 'PROTEIN_HEWANI', stockStatus: 'LOW_STOCK' })
 * 
 * // Toggle selection
 * toggleSelection(itemId)
 * 
 * // Check if selected
 * const isSelected = useInventoryStore(state => state.isSelected(itemId))
 * ```
 */
export const useInventoryStore = create<InventoryStoreState>()(
  persist(
    (set, get) => ({
      // ==================== Initial State ====================
      ...defaultState,
      
      // ==================== Filter Actions ====================
      setFilters: (newFilters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
          // Reset pagination when filters change
          currentPage: 1,
        }))
      },
      
      resetFilters: () => {
        set({
          filters: defaultFilters,
          currentPage: 1,
        })
      },
      
      // ==================== Selection Actions ====================
      toggleSelection: (id) => {
        set((state) => {
          const newSelectedIds = new Set(state.selectedIds)
          if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id)
          } else {
            newSelectedIds.add(id)
          }
          return { selectedIds: newSelectedIds }
        })
      },
      
      selectAll: (ids) => {
        set({ selectedIds: new Set(ids) })
      },
      
      clearSelection: () => {
        set({ selectedIds: new Set() })
      },
      
      isSelected: (id) => {
        return get().selectedIds.has(id)
      },
      
      getSelectedCount: () => {
        return get().selectedIds.size
      },
      
      // ==================== View Preference Actions ====================
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },
      
      setSorting: (sortBy, order) => {
        set({
          sortBy,
          sortOrder: order || get().sortOrder,
        })
      },
      
      toggleSortOrder: () => {
        set((state) => ({
          sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
        }))
      },
      
      // ==================== Pagination Actions ====================
      setPage: (page) => {
        set({ currentPage: page })
      },
      
      setPageSize: (size) => {
        set({
          pageSize: size,
          currentPage: 1, // Reset to first page when page size changes
        })
      },
      
      resetPagination: () => {
        set({
          currentPage: 1,
          pageSize: 20,
        })
      },
      
      // ==================== Modal Actions ====================
      openCreate: () => {
        set({
          isCreateOpen: true,
          isEditOpen: false,
          isDeleteOpen: false,
          isStockMovementOpen: false,
          editItemId: null,
          deleteItemId: null,
          stockMovementItemId: null,
        })
      },
      
      openEdit: (id) => {
        set({
          isEditOpen: true,
          editItemId: id,
          isCreateOpen: false,
          isDeleteOpen: false,
          isStockMovementOpen: false,
          deleteItemId: null,
          stockMovementItemId: null,
        })
      },
      
      openDelete: (id) => {
        set({
          isDeleteOpen: true,
          deleteItemId: id,
          isCreateOpen: false,
          isEditOpen: false,
          isStockMovementOpen: false,
          editItemId: null,
          stockMovementItemId: null,
        })
      },
      
      openStockMovement: (id) => {
        set({
          isStockMovementOpen: true,
          stockMovementItemId: id,
          isCreateOpen: false,
          isEditOpen: false,
          isDeleteOpen: false,
          editItemId: null,
          deleteItemId: null,
        })
      },
      
      closeAllModals: () => {
        set({
          isCreateOpen: false,
          isEditOpen: false,
          isDeleteOpen: false,
          isStockMovementOpen: false,
          editItemId: null,
          deleteItemId: null,
          stockMovementItemId: null,
        })
      },
      
      // ==================== UI State Actions ====================
      toggleFilterPanel: () => {
        set((state) => ({
          isFilterPanelOpen: !state.isFilterPanelOpen,
        }))
      },
      
      setFilterPanelOpen: (open) => {
        set({ isFilterPanelOpen: open })
      },
      
      // ==================== Bulk Action Actions ====================
      openBulkAction: (action) => {
        set({
          isBulkActionOpen: true,
          bulkAction: action,
        })
      },
      
      closeBulkAction: () => {
        set({
          isBulkActionOpen: false,
          bulkAction: null,
        })
      },
      
      // ==================== Reset ====================
      resetStore: () => {
        set({
          ...defaultState,
          selectedIds: new Set(), // Reset Set properly
        })
      },
    }),
    {
      name: 'inventory-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      
      // Only persist user preferences (not modals, not selection, not pagination)
      partialize: (state) => ({
        filters: state.filters,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        pageSize: state.pageSize,
        isFilterPanelOpen: state.isFilterPanelOpen,
      }),
    }
  )
)

/**
 * Selectors for optimized component rendering
 * Use these in components to prevent unnecessary re-renders
 */
export const inventorySelectors = {
  // Filter selectors
  filters: (state: InventoryStoreState) => state.filters,
  hasActiveFilters: (state: InventoryStoreState) => {
    const { filters } = state
    return !!(
      filters.category ||
      filters.stockStatus !== 'ALL' ||
      filters.storageLocation ||
      filters.supplierId ||
      filters.search
    )
  },
  
  // Selection selectors
  selectedIds: (state: InventoryStoreState) => state.selectedIds,
  selectedCount: (state: InventoryStoreState) => state.selectedIds.size,
  hasSelection: (state: InventoryStoreState) => state.selectedIds.size > 0,
  
  // View selectors
  viewMode: (state: InventoryStoreState) => state.viewMode,
  sorting: (state: InventoryStoreState) => ({
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  }),
  
  // Pagination selectors
  pagination: (state: InventoryStoreState) => ({
    currentPage: state.currentPage,
    pageSize: state.pageSize,
  }),
  
  // Modal selectors
  isAnyModalOpen: (state: InventoryStoreState) =>
    state.isCreateOpen ||
    state.isEditOpen ||
    state.isDeleteOpen ||
    state.isStockMovementOpen,
  
  createModal: (state: InventoryStoreState) => ({
    isOpen: state.isCreateOpen,
    open: state.openCreate,
    close: state.closeAllModals,
  }),
  
  editModal: (state: InventoryStoreState) => ({
    isOpen: state.isEditOpen,
    itemId: state.editItemId,
    open: state.openEdit,
    close: state.closeAllModals,
  }),
  
  deleteModal: (state: InventoryStoreState) => ({
    isOpen: state.isDeleteOpen,
    itemId: state.deleteItemId,
    open: state.openDelete,
    close: state.closeAllModals,
  }),
  
  stockMovementModal: (state: InventoryStoreState) => ({
    isOpen: state.isStockMovementOpen,
    itemId: state.stockMovementItemId,
    open: state.openStockMovement,
    close: state.closeAllModals,
  }),
  
  // Bulk action selectors
  bulkAction: (state: InventoryStoreState) => ({
    isOpen: state.isBulkActionOpen,
    action: state.bulkAction,
    selectedCount: state.selectedIds.size,
    open: state.openBulkAction,
    close: state.closeBulkAction,
  }),
}

/**
 * Hook: Use specific selector for optimized rendering
 * 
 * @example
 * ```typescript
 * // Only re-render when filters change
 * const filters = useInventoryStore(inventorySelectors.filters)
 * 
 * // Only re-render when selection count changes
 * const selectedCount = useInventoryStore(inventorySelectors.selectedCount)
 * ```
 */
export const useInventorySelector = <T,>(
  selector: (state: InventoryStoreState) => T
): T => {
  return useInventoryStore(selector)
}
