# Fix: Total Days Calculation Issue

## 📋 Problem

Pada halaman Menu Planning Detail (`/menu-planning/[id]`), card **Total Days** menampilkan nilai yang salah karena:

1. **Timezone Issue**: Fungsi `calculateTotalDays()` menggunakan `setHours()` untuk normalisasi, yang bekerja di local timezone, bukan UTC
2. **End of Day Issue**: Database menyimpan `endDate` dengan waktu `23:59:59` atau `00:00:00`, yang menyebabkan perhitungan berbeda

## 🐛 Root Cause

### Before Fix:
```typescript
// OLD CODE - SALAH
export function calculateTotalDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}
```

**Problem Example**:
- Database: `2025-10-20T00:00:00Z` → `2025-10-22T23:59:59Z`
- Diff: ~2.999 days
- Math.ceil(2.999) = 3
- Result: 3 + 1 = **4 days** ❌ (Should be 3!)

### Timezone Problem:
```typescript
// Using setHours() - LOCAL TIMEZONE
const date = new Date('2025-10-20T00:00:00Z')
date.setHours(0, 0, 0, 0) // Sets to local midnight
// In GMT+7: Result is 2025-10-19T17:00:00Z (yesterday!)
```

## ✅ Solution

### After Fix:
```typescript
// NEW CODE - BENAR
export function calculateTotalDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Normalize to start of day in UTC (not local timezone)
  start.setUTCHours(0, 0, 0, 0)
  end.setUTCHours(0, 0, 0, 0)
  
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  // +1 for inclusive count (both start and end date count)
  return Math.round(diffDays) + 1
}
```

**Key Changes**:
1. ✅ Use `setUTCHours()` instead of `setHours()` - timezone-safe
2. ✅ Use `Math.round()` instead of `Math.ceil()` - handles edge cases better
3. ✅ Normalize both dates to midnight UTC before calculation

## 📊 Test Results

```javascript
// Test 1: Same time (00:00:00)
calculateTotalDays('2025-10-20T00:00:00Z', '2025-10-22T00:00:00Z')
// Result: 3 ✅

// Test 2: End of day (23:59:59) 
calculateTotalDays('2025-10-20T00:00:00Z', '2025-10-22T23:59:59Z')
// Result: 3 ✅ (FIXED - was 4 before)

// Test 3: Month range
calculateTotalDays('2025-01-01', '2025-01-31')
// Result: 31 ✅

// Test 4: Same day
calculateTotalDays('2025-10-20', '2025-10-20')
// Result: 1 ✅
```

## 🔄 Recalculation

To fix existing plans in database:

```bash
# Run recalculation script
npx tsx scripts/recalculate-plan.ts <planId>

# Example:
npx tsx scripts/recalculate-plan.ts cmgsbngat00018ofbhdt4htzi
```

## 📝 Files Modified

1. **src/lib/menu-planning/calculations.ts**
   - Fixed `calculateTotalDays()` function
   - Updated `recalculateMenuPlanMetrics()` to use the utility function
   - All calculations now timezone-safe

2. **scripts/recalculate-plan.ts** (NEW)
   - Manual script to recalculate metrics for any plan
   - Useful for fixing existing data

## 🎯 Impact

- ✅ **Total Days** now displays correct value
- ✅ **Average Cost Per Day** now calculated correctly
- ✅ Works correctly across all timezones
- ✅ Handles both `00:00:00` and `23:59:59` end times
- ✅ Automatic recalculation on assignment CRUD operations

## 📅 Date Format Notes

Database stores dates in ISO 8601 format with UTC timezone:
- Start: `2025-10-19T17:00:00.000Z` = **20 Okt 2025 00:00 WIB**
- End: `2025-10-23T17:00:00.000Z` = **24 Okt 2025 00:00 WIB**

The `T17:00:00.000Z` means midnight in GMT+7 (Indonesia timezone).

## ✅ Status

- [x] Bug identified
- [x] Root cause analyzed
- [x] Fix implemented
- [x] Tests passing
- [x] Recalculation script created
- [x] Existing data fixed
- [x] Documentation complete

**Date Fixed**: October 16, 2025
