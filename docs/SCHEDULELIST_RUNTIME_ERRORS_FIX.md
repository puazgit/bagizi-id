# ScheduleList Runtime Errors - Fixed

## Issue
After schema migration to production-based schedules, ScheduleList component had runtime errors:

### Error 1: Column Not Found
```
[Table] Column with id 'menuName' does not exist.
at DataTable (src/components/ui/data-table.tsx:78:27)
```

### Error 2: Cannot Read Properties
```
Cannot read properties of undefined (reading 'menu')
at cell (src/features/sppg/distribution/schedule/components/ScheduleList.tsx:197:74)
```

## Root Cause

1. **DataTable searchKey** still referenced old `menuName` field
2. **Column cell** directly accessed `row.original.production.menu.menuName` without checking if production exists
3. Data might have old records without production relation

## Solution Applied

### Fix 1: Update searchKey
```tsx
// BEFORE (Wrong):
<DataTable
  columns={columns}
  data={schedules || []}
  searchKey="menuName"  // ❌ Field doesn't exist
  searchPlaceholder="Cari menu..."
/>

// AFTER (Fixed):
<DataTable
  columns={columns}
  data={schedules || []}
  searchKey="distributionDate"  // ✅ Valid field
  searchPlaceholder="Cari jadwal..."
/>
```

### Fix 2: Add Optional Chaining
```tsx
// BEFORE (Wrong):
{
  id: 'menu',
  header: 'Menu',
  cell: ({ row }) => (
    <div className="max-w-[200px]">
      <div className="font-medium truncate">
        {row.original.production.menu.menuName}  // ❌ Crashes if production is undefined
      </div>
      <div className="text-sm text-muted-foreground">
        {row.original.production.actualPortions || 0} porsi
      </div>
    </div>
  ),
}

// AFTER (Fixed):
{
  id: 'menu',
  header: 'Menu',
  cell: ({ row }) => {
    const production = row.original.production
    return (
      <div className="max-w-[200px]">
        <div className="font-medium truncate">
          {production?.menu?.menuName || 'N/A'}  // ✅ Safe access
        </div>
        <div className="text-sm text-muted-foreground">
          {production?.actualPortions || 0} porsi
        </div>
      </div>
    )
  },
}
```

### Fix 3: Update AlertDialog
```tsx
// BEFORE:
<strong>&quot;{scheduleToDelete.production.menu.menuName}&quot;</strong>

// AFTER:
<strong>&quot;{scheduleToDelete.production?.menu?.menuName || 'N/A'}&quot;</strong>
```

## Files Changed

- `src/features/sppg/distribution/schedule/components/ScheduleList.tsx`
  - Line 392: Changed searchKey from 'menuName' to 'distributionDate'
  - Line 193-203: Added optional chaining for production access
  - Line 408: Added optional chaining in AlertDialog

## Verification

✅ Build passes with 0 errors
✅ TypeScript compilation successful
✅ Runtime errors resolved

## Prevention

For future schema changes:
1. Always use optional chaining (`?.`) when accessing nested relations
2. Update DataTable searchKey to reference existing fields
3. Test with both new and old data structures
4. Add fallback values (`|| 'N/A'`) for better UX

## Related

- Commit: c0955e9
- Related to: Schema migration 20251019150022_add_production_to_distribution_schedule
- Previous fix: 8d38daf (Main schema migration)
