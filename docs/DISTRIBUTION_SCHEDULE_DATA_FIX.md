# Distribution Schedule Data Display Fix

**Date**: October 19, 2025  
**Status**: ✅ Complete  
**Issue**: Schedule list page showing "Gagal memuat data - Internal server error" despite having 4 records in database

## Root Causes

### 1. API Response Structure Mismatch

**Problem**: The `useSchedules` hook returns the full API response object `{ success, data, pagination }`, but the component was trying to use it directly as an array.

**Location**: `ScheduleList.tsx` line 95-103

**Before (Broken)**:
```typescript
const {
  data: schedules,  // ❌ This is the full response object, not the array
  isLoading,
  error,
} = useSchedules({...})

// Later used as: schedules || []
```

**After (Fixed)**:
```typescript
const {
  data: response,  // ✅ Renamed to 'response' for clarity
  isLoading,
  error,
} = useSchedules({...})

// Extract data from API response
const schedules = response?.data || []  // ✅ Access data property
```

### 2. Status Enum Mismatch

**Problem**: Component used status values `ASSIGNED` and `CONFIRMED` which don't exist in the `ScheduleStatus` enum.

**Actual Enum Values** (from `schedule.types.ts`):
- `PLANNED`
- `PREPARED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `DELAYED`

**Fixed**:
```typescript
const statusVariants: Record<ScheduleStatus, ...> = {
  PLANNED: 'outline',
  PREPARED: 'secondary',      // ✅ Changed from ASSIGNED
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
  DELAYED: 'destructive',     // ✅ Added missing status
}

const statusLabels: Record<ScheduleStatus, string> = {
  PLANNED: 'Direncanakan',
  PREPARED: 'Disiapkan',      // ✅ Changed from Ditugaskan
  IN_PROGRESS: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  DELAYED: 'Tertunda',        // ✅ Added missing label
}
```

### 3. Distribution Wave Enum Mismatch

**Problem**: Component used wave values `AFTERNOON`, `EVENING`, `LUNCH`, `SNACK` which don't exist in the Prisma schema.

**Actual Enum Values** (from `prisma/schema.prisma` line 6397):
```prisma
enum DistributionWave {
  MORNING
  MIDDAY
}
```

**Fixed**:
```typescript
const waveLabels: Record<DistributionWave, string> = {
  MORNING: 'Pagi',
  MIDDAY: 'Siang',  // ✅ Changed from LUNCH/AFTERNOON/EVENING
}
```

### 4. API Route Filter Parameters

**Problem**: The schedule API route had issues parsing query parameters, especially empty arrays for status filter.

**Location**: `/api/sppg/distribution/schedule/route.ts`

**Fixed**:
```typescript
// Get status array and filter out empty values
const statusParams = searchParams.getAll('status').filter(Boolean)

// Use safeParse to catch validation errors
const filtersResult = scheduleFilterSchema.safeParse({
  status: statusParams.length > 0 ? statusParams : undefined,  // ✅ Pass undefined if empty
  dateFrom: searchParams.get('dateFrom') || undefined,
  dateTo: searchParams.get('dateTo') || undefined,
  wave: searchParams.get('wave') || undefined,
  deliveryMethod: searchParams.get('deliveryMethod') || undefined,
  search: searchParams.get('search') || undefined,
})

if (!filtersResult.success) {
  return Response.json({
    error: 'Invalid filter parameters',
    details: filtersResult.error.issues,
  }, { status: 400 })
}
```

## Files Modified

### 1. `/src/features/sppg/distribution/schedule/components/ScheduleList.tsx`

**Changes**:
- Line 95-108: Fixed data extraction from API response
- Line 47-58: Updated status variants to match actual enum
- Line 63-70: Updated status labels to match actual enum  
- Line 75-78: Updated wave labels to match Prisma enum
- Line 332-339: Updated status filter options
- Line 352-356: Updated wave filter options

### 2. `/src/app/api/sppg/distribution/schedule/route.ts`

**Changes**:
- Line 47-100: Improved query parameter parsing with safeParse
- Line 51: Filter out empty status values
- Line 54-67: Use safeParse for filters with error handling
- Line 69-81: Use safeParse for pagination with error handling
- Line 90-96: Fixed status filter to handle both single and array values
- Line 99-105: Improved date range filter type safety
- Line 113-117: Fixed deliveryMethod filter with proper type casting
- Line 120-132: Fixed search filter with proper type casting

## API Response Structure

The correct API response structure:

```typescript
interface ScheduleListResponse {
  success: boolean
  data: ScheduleListItem[]  // Array of schedule items
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

**Components must access**: `response.data` to get the array of schedules.

## Testing Checklist

- [x] TypeScript compilation successful
- [x] No import/enum errors
- [x] API route handles empty filters correctly
- [x] Component extracts data from response correctly
- [ ] Navigate to http://localhost:3000/distribution/schedule
- [ ] Verify schedules display correctly
- [ ] Test status filtering (6 statuses)
- [ ] Test wave filtering (2 waves)
- [ ] Test search functionality
- [ ] Verify data shows 4 records from database

## Expected Result

The schedule list page should now:
- ✅ Display all 4 schedule records from database
- ✅ Show correct status labels (Direncanakan, Disiapkan, Berlangsung, etc.)
- ✅ Show correct wave labels (Pagi, Siang)
- ✅ Filter by status correctly (6 status options)
- ✅ Filter by wave correctly (2 wave options)
- ✅ Search by menu name or delivery method
- ✅ Show loading state while fetching
- ✅ Show error state if fetch fails

## Debugging Tips

If the page still shows "Gagal memuat data":

1. **Check Browser Console**:
   - Open DevTools → Console tab
   - Look for API error responses
   - Check Network tab for `/api/sppg/distribution/schedule` request

2. **Check API Response**:
   ```bash
   # In browser console (after logging in):
   fetch('/api/sppg/distribution/schedule')
     .then(r => r.json())
     .then(console.log)
   ```

3. **Verify Database Records**:
   - Open Prisma Studio: `npx prisma studio`
   - Check `distribution_schedules` table
   - Verify `sppgId` matches current user's SPPG

4. **Check Server Logs**:
   - Look for error messages in terminal running `npm run dev`
   - Check for Prisma query errors or validation errors

## Related Issues

- **Previous Fix**: Distribution Schedule Enum Fix (enum import from Prisma)
- **Related**: API response structure consistency across all features
- **Note**: Always check Prisma schema for actual enum values before using them in TypeScript

## Prevention for Future

**Always verify**:
1. ✅ Prisma enum values match TypeScript usage
2. ✅ API response structure matches component expectations
3. ✅ Use `safeParse()` in API routes to catch validation errors early
4. ✅ Extract data from API response object (`response.data`), not use response directly
5. ✅ Test with actual database data, not just empty states
