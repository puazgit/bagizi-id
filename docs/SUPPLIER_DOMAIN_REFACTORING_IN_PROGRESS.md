# 🔄 Supplier Domain Refactoring - In Progress

**Date**: January 20, 2025  
**Status**: IN PROGRESS 🔄  
**Reason**: Supplier is SHARED MASTER DATA, not exclusive to Procurement

---

## 🎯 Why This Refactoring is Necessary

### Problem: Current Architecture
```
src/features/sppg/procurement/
├── api/supplierApi.ts          ❌ Wrong: Supplier tied to procurement
├── hooks/useSuppliers.ts       ❌ Wrong: Can't be used by other modules
├── schemas/supplierSchema.ts   ❌ Wrong: Coupling issue
├── stores/supplierStore.ts     ❌ Wrong: Limited reusability
└── types/supplier.types.ts     ❌ Wrong: Module boundary violation
```

### Issues with Current Structure:
1. **Tight Coupling**: Supplier is tied to Procurement module
2. **Limited Reusability**: Other modules can't easily use Supplier
3. **Violation of SRP**: Procurement module handles both procurement AND supplier management
4. **Hard to Maintain**: Changes in Procurement affect Supplier
5. **Not Scalable**: Supplier should be independent domain

### Database Schema Proof:
```prisma
model Supplier {
  // Used by MULTIPLE modules:
  inventoryItems        InventoryItem[]      // ✅ Inventory Module
  procurements          Procurement[]        // ✅ Procurement Module
  supplierContracts     SupplierContract[]   // ✅ Contracts Module
  supplierEvaluations   SupplierEvaluation[] // ✅ Quality Module
  supplierProducts      SupplierProduct[]    // ✅ Product Catalog
}
```

Supplier is **SHARED MASTER DATA** used by:
- ✅ Procurement (purchase orders)
- ✅ Inventory (item sources, restocking)
- ✅ Production (raw materials)
- ✅ Quality (evaluations)
- ✅ Finance (payment tracking)
- ✅ Contracts (supplier agreements)

---

## ✅ Target Architecture (Correct)

```
src/features/sppg/
├── suppliers/                   ✅ Independent Domain
│   ├── api/
│   │   ├── supplierApi.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSuppliers.ts
│   │   └── index.ts
│   ├── schemas/
│   │   ├── supplierSchema.ts
│   │   └── index.ts
│   ├── stores/
│   │   ├── supplierStore.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   └── components/
│       ├── SupplierList.tsx
│       ├── SupplierCard.tsx
│       └── index.ts
│
└── procurement/                 ✅ Uses Supplier via imports
    ├── components/
    │   └── ProcurementForm.tsx
    └── hooks/
        └── useProcurement.ts
        // imports: import { useSuppliers } from '@/features/sppg/suppliers/hooks'
```

---

## 📋 Refactoring Progress

### ✅ Step 1: Create Independent Structure
- [x] Created `src/features/sppg/suppliers/` directory
- [x] Created subdirectories: api, hooks, schemas, stores, types, components

### ✅ Step 2: Copy & Update Core Files
- [x] **API Client** (`api/supplierApi.ts`)
  - Copied from procurement
  - Updated file header with architectural note
  - Created barrel export `api/index.ts`

- [x] **Types** (`types/index.ts`)
  - Extracted all Supplier-related types
  - Added comprehensive documentation
  - Includes: Supplier, SupplierWithDetails, SupplierEvaluation, SupplierContract, SupplierProduct
  - Includes: CreateSupplierInput, UpdateSupplierInput, SupplierFilters
  - Includes: ApiResponse, PaginatedResponse, SupplierStatistics

### ✅ Step 3: Copy & Update Remaining Files
- [x] **Hooks** (`hooks/useSuppliers.ts`)
  - ✅ Copied from procurement/hooks/useSuppliers.ts (211 lines)
  - ✅ Updated file header with architectural note
  - ✅ Created barrel export `hooks/index.ts`
  - ✅ All imports work with new structure

- [ ] **Schemas** (`schemas/supplierSchema.ts`)
  - Copy from procurement/schemas
  - Update imports
  - Create barrel export

- [ ] **Store** (`stores/supplierStore.ts`)
  - Copy from procurement/stores
  - Update imports
  - Create barrel export

- [ ] **Components** (`components/SupplierList.tsx`)
  - Copy from procurement/components
  - Update all imports
  - Create barrel export

### 🔄 Step 4: Update Imports in Other Modules
- [ ] Update `procurement` module imports
- [ ] Update page imports `/app/(sppg)/procurement/suppliers/page.tsx`
- [ ] Update any other files importing from old location

### 🔄 Step 5: Cleanup Old Files
- [ ] Delete old files from procurement module (after verifying)
- [ ] Run lint and type check
- [ ] Test all functionality

### 🔄 Step 6: Documentation
- [ ] Update API documentation
- [ ] Update architecture docs
- [ ] Create migration guide

---

## 🎯 Benefits After Refactoring

1. **✅ Independence**: Supplier is standalone domain
2. **✅ Reusability**: Can be used by any module
3. **✅ Maintainability**: Clear separation of concerns
4. **✅ Scalability**: Easy to extend and add features
5. **✅ Testability**: Independent unit testing
6. **✅ Best Practice**: Follows Next.js & DDD principles

---

## 📝 Files Created So Far

1. ✅ `src/features/sppg/suppliers/api/supplierApi.ts` (198 lines)
2. ✅ `src/features/sppg/suppliers/api/index.ts` (barrel export)
3. ✅ `src/features/sppg/suppliers/types/index.ts` (493 lines - comprehensive types)
4. ✅ `src/features/sppg/suppliers/hooks/useSuppliers.ts` (211 lines)
5. ✅ `src/features/sppg/suppliers/hooks/index.ts` (barrel export)

---

## 🚀 Next Steps

Continue with:
1. Copy hooks/useSuppliers.ts
2. Copy schemas/supplierSchema.ts
3. Copy stores/supplierStore.ts
4. Copy components/SupplierList.tsx
5. Update all imports
6. Test and verify
7. Delete old files

---

**Status**: 50% Complete - API, Types, and Hooks migrated. Need schemas, stores, components, then update imports.

