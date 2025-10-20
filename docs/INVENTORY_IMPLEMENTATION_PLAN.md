/**
 * @fileoverview Inventory Management Implementation Plan
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

# 🏗️ Inventory Management - Implementation Plan

**Date**: October 20, 2025  
**Priority**: 2 (After Supplier Management)  
**Status**: Planning Phase

---

## 📊 Database Schema Analysis

### Prisma Models Available:
```prisma
✅ InventoryItem (Main model)
   - Stock tracking
   - Supplier relationship
   - Nutrition data
   - Multi-tenant (sppgId)
   
✅ StockMovement (Stock history)
   - Movement types (IN/OUT/ADJUSTMENT)
   - Reference tracking
   - Approval workflow
   - Batch & expiry tracking

❌ InventoryCategory (Enum only)
❌ UnitOfMeasure (String field only)
❌ MinimumStock (Not in schema - use minStock field)
❌ InventoryTransaction (Covered by StockMovement)
```

### Inventory Categories (From Schema Enum):
```typescript
enum InventoryCategory {
  PROTEIN_HEWANI    // Animal protein
  PROTEIN_NABATI    // Plant protein
  KARBOHIDRAT       // Carbohydrates
  SAYURAN           // Vegetables
  BUAH              // Fruits
  BUMBU_REMPAH      // Spices
  MINYAK_LEMAK      // Oils & fats
  LAINNYA           // Others
}
```

### Movement Types:
```typescript
enum MovementType {
  IN                // Stock in (procurement, donation, etc)
  OUT               // Stock out (production, distribution, etc)
  ADJUSTMENT        // Stock adjustment (count, expired, damaged)
}
```

---

## 🎯 Implementation Scope

### Phase 1: Core Inventory Management ⚡ PRIORITY
1. **Inventory Item CRUD**
   - List with advanced filters
   - Create/Edit inventory items
   - Delete with validation
   - View item details
   
2. **Stock Tracking**
   - Current stock display
   - Low stock alerts
   - Stock movement history
   - Batch & expiry tracking

3. **Stock Movements**
   - Stock IN operations
   - Stock OUT operations
   - Stock adjustments
   - Movement approval workflow

### Phase 2: Advanced Features 📊
4. **Stock Analytics**
   - Stock value calculation
   - Usage patterns
   - Turnover rates
   - Expiry alerts

5. **Reorder Management**
   - Auto reorder suggestions
   - Reorder point calculation
   - Supplier integration

6. **Reports**
   - Stock report
   - Movement report
   - Valuation report
   - Expiry report

---

## 📁 Feature Architecture (Following Pattern 2)

### Directory Structure:
```
src/features/sppg/inventory/
├── api/
│   ├── inventoryApi.ts          # Inventory items API client
│   ├── stockMovementApi.ts      # Stock movement API client
│   └── index.ts
├── components/
│   ├── InventoryList.tsx        # Main list with filters
│   ├── InventoryCard.tsx        # Item card display
│   ├── InventoryForm.tsx        # Create/Edit form
│   ├── StockMovementForm.tsx    # Stock IN/OUT/Adjustment
│   ├── StockMovementHistory.tsx # Movement history table
│   ├── LowStockAlert.tsx        # Alert component
│   ├── StockBadge.tsx           # Stock status badge
│   └── index.ts
├── hooks/
│   ├── useInventory.ts          # Inventory queries & mutations
│   ├── useStockMovement.ts      # Stock movement operations
│   ├── useLowStockItems.ts      # Low stock monitoring
│   └── index.ts
├── types/
│   ├── inventory.types.ts       # Inventory interfaces
│   ├── stock-movement.types.ts  # Stock movement interfaces
│   └── index.ts
├── schemas/
│   ├── inventorySchema.ts       # Zod validation schemas
│   ├── stockMovementSchema.ts   # Movement validation
│   └── index.ts
├── stores/
│   ├── inventoryStore.ts        # Zustand state management
│   └── index.ts
└── lib/
    ├── inventoryUtils.ts        # Utility functions
    ├── stockCalculations.ts     # Stock calculations
    └── index.ts
```

### API Routes:
```
src/app/api/sppg/inventory/
├── route.ts                     # GET, POST /api/sppg/inventory
├── [id]/
│   └── route.ts                 # GET, PUT, DELETE /api/sppg/inventory/[id]
├── low-stock/
│   └── route.ts                 # GET /api/sppg/inventory/low-stock
├── movements/
│   ├── route.ts                 # GET, POST /api/sppg/inventory/movements
│   └── [id]/
│       └── route.ts             # GET, PUT /api/sppg/inventory/movements/[id]
└── stats/
    └── route.ts                 # GET /api/sppg/inventory/stats
```

### Pages:
```
src/app/(sppg)/inventory/
├── page.tsx                     # Inventory list
├── new/
│   └── page.tsx                 # Create new item
├── [id]/
│   ├── page.tsx                 # Item detail
│   └── edit/
│       └── page.tsx             # Edit item
└── movements/
    ├── page.tsx                 # Movement history
    └── new/
        └── page.tsx             # New stock movement
```

---

## 🔐 Permissions & Access Control

### Required Permissions:
```typescript
INVENTORY_MANAGE    // Full access (CRUD + movements)
INVENTORY_VIEW      // Read-only access
INVENTORY_APPROVE   // Approve stock movements
```

### Role-Based Access:
```typescript
SPPG_KEPALA: [
  'INVENTORY_MANAGE',
  'INVENTORY_APPROVE'
]

SPPG_ADMIN: [
  'INVENTORY_MANAGE',
  'INVENTORY_APPROVE'
]

SPPG_AKUNTAN: [
  'INVENTORY_MANAGE',
  'INVENTORY_VIEW'
]

SPPG_PRODUKSI_MANAGER: [
  'INVENTORY_MANAGE'
]

SPPG_STAFF_DAPUR: [
  'INVENTORY_VIEW'
]
```

---

## 🎨 UI Components (shadcn/ui)

### Required Components:
```typescript
✅ Already Available:
- Button, Card, Input, Select
- Badge, Table, Dialog, Sheet
- Form, Tabs, Alert, Toast

📦 May Need to Add:
- Command (for search)
- Popover (for filters)
- Calendar (for expiry dates)
- Progress (for stock levels)
```

---

## 📊 Key Features

### 1. Advanced Filtering
```typescript
Filters:
- Category (PROTEIN_HEWANI, KARBOHIDRAT, etc)
- Stock Status (In Stock, Low Stock, Out of Stock)
- Storage Location
- Supplier
- Active/Inactive status
- Search by name/code
```

### 2. Stock Level Indicators
```typescript
Stock Badges:
- 🟢 Good Stock: currentStock >= maxStock * 0.7
- 🟡 Low Stock: currentStock <= minStock
- 🔴 Out of Stock: currentStock <= 0
- ⚠️ Near Expiry: expiryDate within 7 days
```

### 3. Stock Movement Types
```typescript
IN Operations:
- Procurement (from supplier)
- Return (from production)
- Donation
- Transfer IN
- Adjustment (count correction)

OUT Operations:
- Production (to kitchen)
- Distribution (to beneficiaries)
- Waste/Expired
- Transfer OUT
- Adjustment (count correction)

ADJUSTMENT Operations:
- Physical count
- Damaged goods
- Quality rejection
- System correction
```

---

## 🔄 Business Logic

### Stock Calculation:
```typescript
// Automatic stock calculation
stockAfter = stockBefore + (IN) - (OUT) + (ADJUSTMENT)

// Cost calculation
averagePrice = totalValue / totalQuantity
totalValue = Σ(quantity * unitCost) for each movement
```

### Reorder Logic:
```typescript
// Trigger reorder when
currentStock <= minStock

// Reorder quantity
reorderQty = (maxStock - currentStock) || reorderQuantity

// Consider lead time
orderDate = today + leadTime (days)
```

### Expiry Management:
```typescript
// Alert levels
Critical: expiryDate <= 7 days
Warning: expiryDate <= 30 days
Normal: expiryDate > 30 days

// FEFO (First Expired First Out)
// Oldest expiry date used first in production
```

---

## 🧪 Testing Requirements

### Unit Tests:
- Stock calculation functions
- Reorder logic
- Expiry date calculations
- Cost averaging

### Integration Tests:
- CRUD operations
- Stock movement workflows
- Multi-tenancy isolation
- Approval workflows

### E2E Tests:
- Create inventory item
- Record stock movement
- Low stock alerts
- Report generation

---

## 📈 Performance Considerations

### Database Indexes:
```prisma
✅ Already Indexed:
- [sppgId, itemCode] (unique)
- [sppgId, category]
- [category, isActive]
- [currentStock]
- [inventoryId, movedAt] (stock movements)
- [movementType, movedAt]

🔍 Query Optimization:
- Paginate inventory lists
- Cache frequently accessed items
- Aggregate stock movements for reports
```

---

## 🚀 Implementation Steps

### Step 1: Types & Schemas (30 min) ✅ COMPLETE
- [x] Create inventory.types.ts
- [x] Create stock-movement.types.ts
- [x] Create inventorySchema.ts
- [x] Create stockMovementSchema.ts
- **Status**: ✅ Completed October 20, 2025
- **Files**: 4 files created in `src/features/sppg/inventory/schemas/` and `types/`

### Step 2: API Clients (45 min) ✅ COMPLETE
- [x] Create inventoryApi.ts
- [x] Create stockMovementApi.ts
- [x] Test with API routes
- **Status**: ✅ Completed October 20, 2025
- **Files**: `src/features/sppg/inventory/api/inventoryApi.ts`

### Step 3: API Routes (180 min) ✅ COMPLETE
- [x] Inventory CRUD endpoints (route.ts, [id]/route.ts)
- [x] Stock movement endpoints (movements/route.ts, [id]/route.ts)
- [x] Batch movement endpoint (movements/batch/route.ts)
- [x] Movement summary endpoint (movements/summary/route.ts)
- [x] Low stock endpoint (low-stock/route.ts)
- [x] Stats endpoint (stats/route.ts)
- [x] Fix ALL TypeScript errors (64 → 0 errors)
- [x] Fix ALL ESLint issues (6 → 0 issues)
- [x] Add comprehensive API documentation
- **Status**: ✅ Completed October 20, 2025, 21:00 WIB
- **Files**: 9 API route files (~1,954 lines)
- **Quality**: ✅ ZERO TypeScript errors, ✅ ZERO ESLint warnings
- **Documentation**: `docs/INVENTORY_STEP_3_COMPLETE.md`

### Step 4: TanStack Query Hooks (75 min) ✅ COMPLETE
- [x] useInventory.ts (360 lines) - ✅ COMPLETE
  - useInventoryList(filters?) - List with 5-minute cache
  - useInventoryItem(id) - Detail with 10-minute cache
  - useCreateInventory() - Optimistic create with list update
  - useUpdateInventory() - Optimistic update with cache invalidation
  - useDeleteInventory() - Optimistic delete with cache cleanup
- [x] useStockMovement.ts (450 lines) - ✅ COMPLETE
  - useStockMovements(filters?) - List with 2-minute cache
  - useStockMovement(id) - Detail with 5-minute cache
  - useStockMovementSummary(filters?) - Aggregated stats
  - useCreateStockMovement() - Smart inventory stock update
  - useApproveStockMovement() - Approval workflow
  - useBatchStockMovements() - Atomic batch operations
- [x] useLowStockItems.ts (199 lines) - ✅ COMPLETE
  - useLowStockItems() - Auto-refresh every 5 minutes
  - useHasCriticalLowStock() - Quick check for alerts
  - useLowStockCounts() - Counts by urgency level
  - Added client-side urgency calculation (CRITICAL/HIGH/MEDIUM)
- [x] useInventoryStats.ts (295 lines) - ✅ COMPLETE
  - useInventoryStats(dateRange?) - Main statistics
  - useInventoryValueByCategory() - Category breakdown
  - useStockCoverage() - Coverage analysis
  - useInventoryTurnover(dateRange?) - Turnover metrics
  - useInventoryHealth() - Health score calculation
- [x] hooks/index.ts (18 lines) - Barrel export
- [x] Fix ALL TypeScript errors (20 → 0 errors)
- [x] Extended inventoryApi.ts with 6 stock movement methods
- **Status**: ✅ Completed October 20, 2025, 23:00 WIB
- **Files**: 5 hook files (~1,322 lines)
- **Quality**: ✅ ZERO TypeScript errors (entire project)
- **Patterns**: Optimistic updates, cache invalidation, auto-refresh, type-safe query keys
- **Documentation**: `docs/INVENTORY_STEP_4_TYPE_FIXES_COMPLETE.md`

### Step 5: Zustand Store (20 min) ✅ COMPLETE
- [x] inventoryStore.ts (461 lines) - ✅ COMPLETE
  - Filter management with persistence
  - Selection state (Set for O(1) checks)
  - View preferences (list/grid, sorting)
  - Pagination state
  - Modal state management (Create, Edit, Delete, StockMovement)
  - UI state (filter panel)
  - Bulk operation management
- [x] stores/index.ts (7 lines) - Barrel export
- [x] LocalStorage persistence with partialize
- [x] Optimized selectors for performance
- [x] Smart state updates (auto-reset pagination)
- **Status**: ✅ Completed October 20, 2025, 23:15 WIB
- **Files**: 2 store files (~468 lines)
- **Quality**: ✅ ZERO TypeScript errors
- **Features**: 7 state domains, 30+ actions, optimized selectors
- **Documentation**: `docs/INVENTORY_STEP_5_STORE_COMPLETE.md`

### Step 6: Components (120 min)
- [ ] InventoryList (main table)
- [ ] InventoryForm (create/edit)
- [ ] InventoryCard (detail display)
- [ ] StockMovementForm
- [ ] StockMovementHistory
- [ ] LowStockAlert

### Step 7: Pages (60 min)
- [ ] /inventory (list page)
- [ ] /inventory/new (create page)
- [ ] /inventory/[id] (detail page)
- [ ] /inventory/[id]/edit (edit page)
- [ ] /inventory/movements (movement history)

### Step 8: Navigation (15 min)
- [ ] Add to SppgSidebar
- [ ] Add permissions
- [ ] Update middleware

### Step 9: Testing (60 min)
- [ ] Manual testing
- [ ] Permission testing
- [ ] Multi-tenancy testing

**Total Estimated Time: ~7 hours**
**Time Spent So Far: ~4.5 hours**
**Progress: 70% Complete (Steps 1-5 done)** ✅

### Completed Steps Summary:
```
✅ Step 1: Types & Schemas (30 min) - 4 files, enterprise validation
✅ Step 2: API Clients (45 min) - Full REST client with SSR support
✅ Step 3: API Routes (180 min) - 9 routes, ZERO TypeScript errors
✅ Step 4: TanStack Query Hooks (75 min) - 13 hooks, optimistic updates
✅ Step 5: Zustand Store (20 min) - 7 state domains, LocalStorage persistence
```

### Remaining Work:
```
⏳ Step 6: Components (120 min) - shadcn/ui components (6 components)
⏳ Step 7: Pages (60 min) - App routes integration (5 pages)
⏳ Step 8: Navigation (15 min) - Sidebar menu
⏳ Step 9: Testing (60 min) - Integration testing
```

### Total Code Created So Far:
```
Types & Schemas:      ~350 lines (4 files)
API Clients:          ~400 lines (1 file + extensions)
API Routes:         ~1,954 lines (9 route files)
TanStack Hooks:     ~1,344 lines (5 hook files)
Zustand Store:        ~468 lines (2 store files)
─────────────────────────────────────────
Total:              ~4,516 lines
```

---

## 🎯 Success Criteria

### Module is Complete when:
```
✅ All CRUD operations work
✅ Stock movements are tracked accurately
✅ Low stock alerts function correctly
✅ Multi-tenancy isolation verified
✅ Permissions work correctly
✅ TypeScript compilation: 0 errors
✅ Console errors: 0
✅ All tests pass
✅ Documentation complete
✅ Ready for production
```

---

## 📝 Notes

### Integration Points:
```
Inventory → Supplier: preferredSupplierId relationship
Inventory → Procurement: procurementItems relationship
Inventory → Menu: menuIngredients relationship
Inventory → Production: Stock OUT movements
Inventory → Distribution: Stock tracking
```

### Future Enhancements:
- Barcode/QR code scanning
- Mobile inventory app
- Automated reorder emails
- Supplier price comparison
- Inventory valuation methods (FIFO, LIFO, Weighted Average)
- Multi-location inventory
- Inventory forecasting with AI

---

**Next Step**: Start with Types & Schemas creation! 🚀
