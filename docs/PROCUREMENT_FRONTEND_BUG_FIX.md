# 🐛 Procurement Frontend Display Bug - Fixed

**Date**: October 18, 2025  
**Status**: ✅ Fixed  
**Severity**: Critical - No data displayed on frontend despite data existing in database  

---

## 📊 Problem Summary

**Issue**: User reported "Tidak ada data pengadaan" message on `/procurement` page despite:
- ✅ Database successfully seeded with 6 procurements
- ✅ API endpoint working correctly
- ✅ Data verified with test scripts
- ✅ All code properly configured

**User Feedback**: "hasilnya dari awal sudah saya bilang 'Tidak ada data pengadaan'"

---

## 🔍 Root Cause Analysis

### **The Bug**: Double Data Extraction

**Location**: `src/features/sppg/procurement/components/ProcurementList.tsx` line 118-123

#### ❌ **BEFORE (Buggy Code)**:
```typescript
// Fetch procurements (API returns ProcurementWithDetails with supplier, items relations)
const { data: procurementsResponse, isLoading, error } = useProcurements(filters)

// Extract array from paginated response
const procurements = useMemo(
  () => procurementsResponse?.data || [],  // ❌ BUG: Accessing .data on already-extracted array
  [procurementsResponse]
)
```

#### ✅ **AFTER (Fixed Code)**:
```typescript
// Fetch procurements (API returns ProcurementWithDetails with supplier, items relations)
// Hook already extracts data.data via select, so procurementsResponse is the array
const { data: procurementsResponse, isLoading, error } = useProcurements(filters)

// Use response directly (already an array from hook's select function)
const procurements = useMemo(
  () => procurementsResponse || [],  // ✅ FIXED: Use array directly
  [procurementsResponse]
)
```

---

## 🧩 Data Flow Analysis

### **API Endpoint Response** (`/api/sppg/procurement`):
```typescript
// File: src/app/api/sppg/procurement/route.ts
return Response.json({
  success: true,
  data: transformedProcurements,  // ← Array of 6 procurements
  pagination: {
    total: 6,
    page: 1,
    pageSize: 20,
    totalPages: 1
  }
})
```

**Response Structure**:
```json
{
  "success": true,
  "data": [
    { "id": "...", "procurementCode": "PO-...-001", "status": "COMPLETED", ... },
    { "id": "...", "procurementCode": "PO-...-002", "status": "ORDERED", ... },
    { "id": "...", "procurementCode": "PO-...-003", "status": "APPROVED", ... },
    { "id": "...", "procurementCode": "PO-...-004", "status": "DRAFT", ... },
    { "id": "...", "procurementCode": "PO-...-005", "status": "CANCELLED", ... },
    { "id": "...", "procurementCode": "PO-...-006", "status": "PARTIALLY_RECEIVED", ... }
  ],
  "pagination": { ... }
}
```

### **TanStack Query Hook** (`useProcurements`):
```typescript
// File: src/features/sppg/procurement/hooks/useProcurement.ts
export function useProcurements(filters?: Partial<ProcurementFilters>) {
  return useQuery({
    queryKey: procurementKeys.list(filters),
    queryFn: () => procurementApi.getProcurements(filters),
    select: (data) => data.data,  // ← Extracts array from response
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
```

**Hook Return Value**: `data.data` = `[...6 procurements...]` (array)

### **Component Usage** (BEFORE FIX):
```typescript
const { data: procurementsResponse } = useProcurements(filters)
// procurementsResponse = [...6 procurements...] (already an array)

const procurements = procurementsResponse?.data || []
// ❌ Tries to access .data on array
// Result: undefined
// Fallback to []
// Table shows: "Tidak ada data pengadaan"
```

### **Component Usage** (AFTER FIX):
```typescript
const { data: procurementsResponse } = useProcurements(filters)
// procurementsResponse = [...6 procurements...] (already an array)

const procurements = procurementsResponse || []
// ✅ Uses array directly
// Result: [...6 procurements...]
// Table shows: 6 rows of procurement data
```

---

## 🎯 Why This Happened

### **Confusion in Data Flow**:

1. **API returns**: 
   ```typescript
   ApiResponse<PaginatedResponse<T>> = {
     success: true,
     data: T[],
     pagination: {...}
   }
   ```

2. **Hook extracts**: 
   ```typescript
   select: (data) => data.data  // Extracts T[] from ApiResponse
   ```

3. **Component expected**: 
   ```typescript
   // Developer thought procurementsResponse was still ApiResponse
   // So tried to access .data again
   procurementsResponse?.data
   ```

4. **Actual value**: 
   ```typescript
   // But procurementsResponse was already T[] (extracted by hook)
   // So .data returned undefined
   procurementsResponse  // = T[] (no .data property)
   ```

---

## 🔧 Fix Details

### **File Modified**: 
`src/features/sppg/procurement/components/ProcurementList.tsx`

### **Lines Changed**: 
118-123

### **Changes**:
1. **Removed**: `procurementsResponse?.data` (accessing non-existent property)
2. **Added**: `procurementsResponse` (using array directly)
3. **Added Comment**: Clarify that hook already extracts array

### **Impact**:
- ✅ Procurement table now displays 6 procurement rows
- ✅ No breaking changes to other code
- ✅ Same pattern should be checked in other list components

---

## ✅ Verification Steps

### **1. Check Database** (Already Done):
```bash
npx tsx scripts/test-procurement-api.ts
```
**Result**: ✅ 6 procurements found in database

### **2. Check API Endpoint** (Already Done):
```bash
curl http://localhost:3000/api/sppg/procurement \
  -H "Cookie: ..."
```
**Expected**: JSON with `data` array containing 6 procurements  
**Status**: ✅ API returns correct data

### **3. Check Frontend** (TO BE TESTED BY USER):
```bash
# 1. Open browser
# 2. Navigate to http://localhost:3000/procurement
# 3. Check table
```
**Expected**: 6 procurement rows displayed  
**Status**: ⏳ Awaiting user confirmation

---

## 📋 Expected Result After Fix

### **Procurement List Table** (`/procurement`):
| # | Code | Supplier | Method | Status | Amount | Items |
|---|------|----------|--------|--------|--------|-------|
| 1 | PO-...-001 | CV Berkah Protein | Langsung | ✅ COMPLETED | Rp 9.435.000 | 1 |
| 2 | PO-...-002 | UD Sayur Segar | Langsung | 📦 ORDERED | Rp 450.000 | 3 |
| 3 | PO-...-003 | PT Mitra Pangan | Tender | ⏱️ APPROVED | Rp 1.500.000 | 1 |
| 4 | PO-...-004 | CV Sumber Susu | Langsung | 📝 DRAFT | Rp 840.000 | 1 |
| 5 | PO-...-005 | Toko Bumbu | Langsung | ❌ CANCELLED | Rp 250.000 | 0 |
| 6 | PO-...-006 | CV Berkah Protein | Langsung | 📥 PARTIALLY_RECEIVED | Rp 3.200.000 | 1 |

**Total**: 6 procurement orders  
**Total Amount**: Rp 15.675.000

---

## 🚨 Similar Bugs Found & Fixed

This same pattern existed in other list components. Here are the fixes:

### **1. ✅ Supplier List - FIXED**:
```typescript
// File: src/features/sppg/procurement/components/SupplierList.tsx
// BEFORE:
const { data: suppliersResponse } = useSuppliers(filters)
const suppliers = suppliersResponse?.data || []  // ❌ Wrong

// AFTER:
const { data: suppliersResponse } = useSuppliers(filters)
const suppliers = suppliersResponse || []  // ✅ Fixed
```

### **2. ✅ Procurement Plans List - ALREADY CORRECT**:
```typescript
// File: src/features/sppg/procurement/components/ProcurementPlanList.tsx
const plansQuery = useProcurementPlans(filters)
const plans = plansQuery.data || []  // ✅ Already correct
```

### **3. Other Domain Lists - TO BE CHECKED**:
These components should be audited for the same pattern:
- [ ] Menu List (`src/features/sppg/menu/components/MenuList.tsx`)
- [ ] Inventory List (`src/features/sppg/inventory/components/InventoryList.tsx`)
- [ ] Production List (`src/features/sppg/production/components/ProductionList.tsx`)
- [ ] Distribution List (`src/features/sppg/distribution/components/DistributionList.tsx`)

**Search Command**:
```bash
# Find all list components with potential bug
grep -r "\.data \|\|" src/features/sppg/*/components/*List.tsx
```

---

## 📖 Lessons Learned

### **1. Data Extraction in TanStack Query**:
When using `select` in `useQuery`, the returned `data` is already the selected value:
```typescript
// Hook definition
useQuery({
  queryFn: () => api.get(),  // Returns: { success: true, data: [...] }
  select: (response) => response.data  // ← Extract array
})

// Component usage
const { data } = useQuery(...)
// data is ALREADY the extracted array, NOT the full response
```

### **2. Type Safety**:
TypeScript didn't catch this because:
- `procurementsResponse` was typed as `any` or generic
- Optional chaining `?.data` doesn't error on undefined
- Fallback `|| []` masked the issue

**Solution**: Use stricter TypeScript types:
```typescript
const { data: procurements = [] } = useProcurements(filters)
// No need for useMemo or optional chaining
```

### **3. Documentation**:
Always document data transformations in comments:
```typescript
// API returns: { success: true, data: T[], pagination: {...} }
// Hook extracts: T[] (via select)
// Component uses: T[] directly
```

---

## 🎯 Success Criteria

- [x] Bug identified and root cause found
- [x] Fix implemented in ProcurementList.tsx
- [x] Fix implemented in SupplierList.tsx
- [x] ProcurementPlanList.tsx verified (already correct)
- [ ] User confirms 6 procurements displayed on `/procurement`
- [ ] User confirms 5 suppliers displayed on `/procurement/suppliers`
- [ ] Similar bugs checked in other domains (menu, inventory, etc.)
- [x] Documentation created

---

## 📞 Next Steps

**For User**:
1. ✅ Save all files (Cmd+S / Ctrl+S)
2. ✅ Refresh browser (Hard refresh: Cmd+Shift+R / Ctrl+F5)
3. ✅ Navigate to: http://localhost:3000/procurement
4. ✅ Check if 6 procurement rows now appear
5. ✅ Report back: "Berhasil!" or "Masih tidak ada data"

**If Still Not Working**:
1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for `/api/sppg/procurement` response
4. Verify logged in with: `gizi@sppg-purwakarta.com`
5. Check if `sppgId` matches: `cmgv4nz2o00088optndkkdvem`

---

**Status**: ✅ Bug Fixed - Awaiting User Verification
