# School Data Structure Fix - Runtime Error Resolution

**Date**: October 23, 2025  
**Status**: ✅ **RESOLVED**  
**Error Type**: Runtime TypeError

---

## 🐛 Original Error

```
TypeError: schools.filter is not a function
    at SchoolStats (src/features/sppg/school/components/SchoolStats.tsx:43:21)
    at SchoolsPage (src/app/(sppg)/schools/page.tsx:99:9)
```

---

## 🔍 Root Cause Analysis

The `useSchools` hook from `/features/sppg/school/hooks/useSchools.ts` returns data in this structure:

```typescript
{
  schools: SchoolMaster[],
  pagination?: PaginationMeta
}
```

**However**, components were treating the response data directly as an array:

```typescript
// ❌ WRONG - Trying to use wrapped object as array
const { data: schools } = useSchools()
schools.filter(...)  // TypeError: schools.filter is not a function
```

The actual data structure is:
```typescript
data = {
  schools: [...],  // The actual array is here
  pagination: {...}
}
```

---

## ✅ Solution Applied

### 1. **SchoolStats.tsx** - Statistics Display Component

**Before:**
```typescript
const { data: schools, isLoading } = useSchools({
  mode: 'standard',
  programId,
})

const stats = schools ? {
  total: schools.length,  // ❌ schools is object, not array
  active: schools.filter(s => s.isActive).length,
  // ...
} : null
```

**After:**
```typescript
const { data, isLoading } = useSchools({
  mode: 'standard',
  programId,
})

// Extract schools from response data
const schools = data?.schools || []

const stats = schools.length > 0 ? {
  total: schools.length,  // ✅ Now schools is array
  active: schools.filter(s => s.isActive).length,
  // ...
} : null
```

**Changes:**
- ✅ Renamed `data: schools` → `data`
- ✅ Extracted schools: `data?.schools || []`
- ✅ Updated condition: `schools ? ...` → `schools.length > 0 ? ...`

---

### 2. **SchoolList.tsx** - Main List Component

**Before:**
```typescript
const { data: schools, isLoading, error } = useSchools({
  mode: 'standard',
  programId,
  schoolType: schoolType === 'all' ? undefined : schoolType,  // Type error
})

const filteredSchools = schools?.filter(school => {...})  // Runtime error
```

**After:**
```typescript
const { data, isLoading, error } = useSchools({
  mode: 'standard',
  programId,
  schoolType: schoolType === 'all' ? undefined : (schoolType as SchoolType),  // ✅ Type cast
})

// Extract schools from response data
const schools = data?.schools || []

const filteredSchools = schools.filter(school => {...})  // ✅ Works correctly
```

**Changes:**
- ✅ Renamed `data: schools` → `data`
- ✅ Extracted schools: `data?.schools || []`
- ✅ Added type cast: `schoolType as SchoolType`
- ✅ Fixed deleteSchool call: `mutateAsync(deleteId)` → `mutateAsync({ id: deleteId })`
- ✅ Removed optional chaining: `schools?.filter` → `schools.filter` (safe with default `[]`)

---

### 3. **ProgramForm.tsx** - Form Component

**Issue**: The `useSchools` hook in `/features/sppg/program/hooks/useSchools.ts` is DIFFERENT from the school feature hooks.

**Hook Signature (Program Folder):**
```typescript
// src/features/sppg/program/hooks/useSchools.ts
export function useSchools() {
  return useQuery({
    queryFn: async () => {
      const result = await schoolApi.getAll({ mode: 'standard', isActive: true })
      return result.data as School[]  // ✅ Returns array directly
    },
  })
}
```

**Usage:**
```typescript
// ✅ CORRECT - Already returns array directly
const { data: schools, isLoading: isLoadingSchools } = useSchools()

// No extraction needed - schools is already School[]
```

**No changes needed** - This hook already returns the array directly, not wrapped in `{ schools, pagination }`.

---

## 📊 Comparison: Two Different Hooks

### **School Feature Hook** (Full CRUD)
**Location**: `/features/sppg/school/hooks/useSchools.ts`

```typescript
// Returns wrapped object
return {
  schools: result.data,
  pagination: result.pagination
}
```

**Usage Pattern:**
```typescript
const { data } = useSchools()
const schools = data?.schools || []
```

---

### **Program Hook** (Autocomplete)
**Location**: `/features/sppg/program/hooks/useSchools.ts`

```typescript
// Returns array directly
return result.data as School[]
```

**Usage Pattern:**
```typescript
const { data: schools } = useSchools()
// schools is already School[]
```

---

## 🎯 Files Modified

| File | Lines Changed | Status |
|------|--------------|--------|
| `SchoolStats.tsx` | ~10 lines | ✅ Fixed |
| `SchoolList.tsx` | ~15 lines | ✅ Fixed |
| `ProgramForm.tsx` | No changes | ✅ Already correct |

---

## ✅ Verification

All TypeScript errors resolved:

```bash
✅ SchoolStats.tsx - No errors found
✅ SchoolList.tsx - No errors found  
✅ ProgramForm.tsx - No errors found
```

**Runtime Test Results:**
- ✅ `/schools` page loads without errors
- ✅ Statistics cards display correctly
- ✅ School list renders with data
- ✅ Filtering works as expected
- ✅ CRUD operations functional

---

## 📝 Lessons Learned

### 1. **API Response Structure Consistency**
Different hooks return data in different structures:
- School feature hooks: `{ schools, pagination }`
- Program autocomplete hooks: `School[]` directly

**Best Practice**: Document return types clearly in hook JSDoc.

### 2. **Type Safety with useQuery**
```typescript
// ❌ Implicit typing can hide structure issues
const { data: schools } = useSchools()

// ✅ Explicit typing reveals actual structure
const { data }: { data?: { schools: School[], pagination?: PaginationMeta } } = useSchools()
```

### 3. **Default Values for Arrays**
```typescript
// ❌ Can cause runtime errors
const schools = data?.schools
schools.filter(...)  // Error if undefined

// ✅ Safe with default empty array
const schools = data?.schools || []
schools.filter(...)  // Always works
```

---

## 🚀 Next Steps

1. **Add Type Exports**: Export return types from hooks
   ```typescript
   export type UseSchoolsReturn = {
     schools: SchoolMaster[]
     pagination?: PaginationMeta
   }
   ```

2. **Update Documentation**: Document hook return structures
3. **Add Integration Tests**: Test component data flow
4. **Consider Standardization**: Evaluate if all hooks should return consistent structure

---

## 🔗 Related Documentation

- [School UI Components Complete](./SCHOOL_UI_COMPONENTS_COMPLETE.md)
- [School Page Integration](./SCHOOL_PAGE_INTEGRATION_COMPLETE.md)
- [Enterprise API Client Pattern](../copilot-instructions.md#api-client-pattern)

---

**Resolution Time**: ~20 minutes  
**Impact**: High (Blocking runtime errors)  
**Complexity**: Low (Data structure extraction)  
**Prevention**: Type exports + better documentation
